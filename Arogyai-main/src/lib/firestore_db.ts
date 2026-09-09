import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  addDoc,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "./firebase";
import { HealthProfile, DetectedCondition, Reminder, HealthMetric } from "../components/EnhancedSkinHealthApp";
import { ChatMessage, ActivePlan } from "../components/SkincareApp";

// Base collection for user isolation
const USERS_COLLECTION = "users";

// Subcollection name constants
export const SUBCOLLECTIONS = {
  PROFILE: "profile",
  SKIN_ANALYSES: "skinAnalyses",
  SKINCARE_PLANS: "skincarePlans",
  DIET_PLANS: "dietPlans",
  PROGRESS: "progress",
  REMINDERS: "reminders",
  ACTIVITY: "activity",
  CHATS: "chats"
} as const;

// ---------------------------------------------------------------------------
// DATA MODEL INTERFACES
// ---------------------------------------------------------------------------

export interface UserProfileData extends HealthProfile {
  email?: string;
  gender?: string;
  preferences?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface SkinAnalysisRecord {
  id: string;
  condition: string;
  confidence: number;
  status: 'normal' | 'low_confidence' | 'severe' | 'moderate' | 'mild';
  mode: string;
  imageUrl?: string;
  medicalNotice?: string;
  metadata?: Record<string, any>;
  treatments?: string[];
  dietRecommendations?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface SkincarePlanRecord {
  id: string;
  title: string;
  source?: string;
  mode: 'generic' | 'ayurvedic';
  condition?: string;
  products: string[];
  routine: string[];
  plan?: string[];
  preventionTips?: string[];
  tips?: string[];
  analysisId?: string;
  startDate?: any;
  completedDates?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface DietPlanRecord {
  id: string;
  title?: string;
  source?: string;
  mode?: string;
  condition?: string;
  dietPlan: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
  };
  recommendations?: string[];
  analysisId?: string;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface ProgressRecord {
  id: string;
  date: string;
  condition?: string;
  symptoms?: string[];
  severity?: number;
  notes?: string;
  imageUrl?: string;
  dietProgress?: string[];
  reminderProgress?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface ReminderRecord {
  id: string;
  title: string;
  description?: string;
  type: 'medication' | 'treatment' | 'checkup' | 'photo' | 'diet' | 'routine' | 'product';
  time: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  completed?: boolean;
  isActive?: boolean;
  nextDue?: any;
  sourceId?: string;
  sourceType?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface ActivityRecord {
  id: string;
  type: 'skin_analysis' | 'plan_saved' | 'diet_plan_saved' | 'progress_recorded' | 'reminder_completed' | 'profile_updated';
  title: string;
  description: string;
  referenceId?: string;
  metadata?: Record<string, any>;
  createdAt: any;
}

// ---------------------------------------------------------------------------
// 1. AUTHENTICATION HELPER
// ---------------------------------------------------------------------------

export const getCurrentUser = () => {
  return auth.currentUser;
};

// ---------------------------------------------------------------------------
// IN-MEMORY PUBSUB FOR INSTANT CROSS-COMPONENT REACTIVITY
// ---------------------------------------------------------------------------
type ListenerCallback<T = any> = (data: T) => void;
const memoryListeners: Record<string, Set<ListenerCallback>> = {};

const getListenerKey = (userId: string, key: string) => `${userId}__${key}`;

export const notifySubscribers = (userId: string, key: string, data: any) => {
  const lKey = getListenerKey(userId, key);
  const listeners = memoryListeners[lKey];
  if (listeners) {
    listeners.forEach(cb => {
      try { cb(data); } catch (err) { console.warn(`[PubSub] Listener error:`, err); }
    });
  }
};

export const registerSubscriber = <T>(userId: string, key: string, callback: ListenerCallback<T>): (() => void) => {
  const lKey = getListenerKey(userId, key);
  if (!memoryListeners[lKey]) {
    memoryListeners[lKey] = new Set();
  }
  memoryListeners[lKey].add(callback);
  return () => {
    memoryListeners[lKey]?.delete(callback);
    if (memoryListeners[lKey]?.size === 0) {
      delete memoryListeners[lKey];
    }
  };
};

// User-scoped persistent storage helper (isolated strictly by userId)
const getUserStorageKey = (userId: string, key: string) => `arogyai_usr_${userId}_${key}`;

const LEGACY_KEY_MAP: Record<string, string[]> = {
  profile: ['arogyai_user_profile', 'healthProfile', 'userProfile'],
  activities: ['arogyai_activity_log', 'recentActivities', 'userActivities'],
  conditions: ['arogyai_skin_analyses', 'detectedConditions', 'skinAnalyses'],
  plans: ['arogyai_skincare_plans', 'activePlans', 'skincarePlans'],
  reminders: ['arogyai_reminders', 'reminders'],
  diet: ['arogyai_diet_plan', 'activeDietPlan', 'dietPlan'],
  progress: ['arogyai_progress', 'dietProgress', 'reminderProgress']
};

export const localUserStore = {
  get: <T>(userId: string, key: string, defaultValue: T): T => {
    if (!userId) return defaultValue;
    try {
      // 1. Primary: user-scoped key
      const scopedRaw = localStorage.getItem(getUserStorageKey(userId, key));
      if (scopedRaw) {
        return JSON.parse(scopedRaw) as T;
      }
      // 2. Migration fallback: check legacy global keys and migrate
      const fallbacks = LEGACY_KEY_MAP[key] || [];
      for (const fKey of fallbacks) {
        const legacyRaw = localStorage.getItem(fKey);
        if (legacyRaw) {
          try {
            const parsed = JSON.parse(legacyRaw) as T;
            // Migrate to user-scoped key so it's permanently isolated and preserved
            localStorage.setItem(getUserStorageKey(userId, key), legacyRaw);
            return parsed;
          } catch {
            // continue
          }
        }
      }
      return defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(userId: string, key: string, value: T): void => {
    if (!userId) return;
    try {
      localStorage.setItem(getUserStorageKey(userId, key), JSON.stringify(value));
      // Notify in-memory subscribers immediately for real-time reactivity
      notifySubscribers(userId, key, value);
    } catch (err) {
      console.warn(`[Store] Could not persist key ${key} for user ${userId}:`, err);
    }
  }
};

// ---------------------------------------------------------------------------
// 2. USER PROFILE (users/{uid}/profile or users/{uid})
// ---------------------------------------------------------------------------

export const getUserProfile = async (userId: string): Promise<UserProfileData | null> => {
  if (!userId) return null;
  const cached = localUserStore.get<UserProfileData | null>(userId, 'profile', null);
  try {
    // 1. Primary path: users/{userId}/profile/profile
    const profileDocRef = doc(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.PROFILE, "profile");
    const profileSnap = await getDoc(profileDocRef);
    if (profileSnap.exists()) {
      const p = profileSnap.data() as UserProfileData;
      localUserStore.set(userId, 'profile', p);
      return p;
    }

    // 2. Backward compatibility: users/{userId}/profile/main
    const profileMainRef = doc(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.PROFILE, "main");
    const mainSnap = await getDoc(profileMainRef);
    if (mainSnap.exists()) {
      const p = mainSnap.data() as UserProfileData;
      localUserStore.set(userId, 'profile', p);
      return p;
    }

    // 3. Fallback: users/{userId} root doc
    const userRef = doc(db, USERS_COLLECTION, userId);
    const snap = await getDoc(userRef);
    if (snap.exists() && snap.data().profile) {
      const p = snap.data().profile as UserProfileData;
      localUserStore.set(userId, 'profile', p);
      return p;
    }
  } catch (error) {
    console.warn(`[Firebase] Firestore getUserProfile notice:`, error);
  }
  return cached;
};

export const saveUserProfile = async (userId: string, profile: Partial<UserProfileData>): Promise<void> => {
  if (!userId) {
    console.warn("[Firebase] Attempted to save profile with no authenticated userId.");
    return;
  }

  const cleanData: Record<string, any> = {
    name: profile.name?.trim() || '',
    email: profile.email || auth.currentUser?.email || '',
    age: profile.age ? Number(profile.age) : 25,
    skinType: profile.skinType || '',
    concerns: Array.isArray(profile.concerns) ? profile.concerns : [],
    medicalHistory: Array.isArray(profile.medicalHistory) ? profile.medicalHistory : [],
    allergies: Array.isArray(profile.allergies) ? profile.allergies : [],
    lifestyle: profile.lifestyle || '',
    currentMedications: Array.isArray(profile.currentMedications) ? profile.currentMedications : [],
    gender: profile.gender || '',
    preferences: profile.preferences || '',
    updatedAt: new Date().toISOString()
  };

  // 1. Immediately persist to user-scoped persistent storage (triggers in-memory notify)
  localUserStore.set(userId, 'profile', cleanData);

  // 2. Automatically record a user activity event
  saveActivity(userId, {
    type: 'profile_updated',
    title: 'Profile Updated',
    description: `Skin profile configured: ${cleanData.skinType || 'custom skin'} with ${cleanData.concerns.length} concern(s).`,
    metadata: { skinType: cleanData.skinType, concernsCount: cleanData.concerns.length }
  });

  // 3. Attempt Firestore cloud write
  try {
    const profileDocRef = doc(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.PROFILE, "profile");
    const profileMainRef = doc(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.PROFILE, "main");
    const userRef = doc(db, USERS_COLLECTION, userId);

    const firestoreData = {
      ...cleanData,
      createdAt: profile.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await Promise.allSettled([
      setDoc(profileDocRef, firestoreData, { merge: true }),
      setDoc(profileMainRef, firestoreData, { merge: true }),
      setDoc(userRef, {
        profile: firestoreData,
        name: cleanData.name,
        displayName: cleanData.name,
        email: cleanData.email,
        skinType: cleanData.skinType,
        updatedAt: serverTimestamp()
      }, { merge: true })
    ]);
  } catch (error: any) {
    console.warn(`[Firebase] Firestore saveUserProfile remote notice:`, error?.message);
  }
};

export const subscribeToUserProfile = (userId: string, callback: (profile: HealthProfile | null) => void) => {
  if (!userId) {
    callback(null);
    return () => {};
  }

  // 1. Immediately deliver user's persistent profile for zero-delay display (always call!)
  const cached = localUserStore.get<UserProfileData | null>(userId, 'profile', null);
  callback(cached);

  // 2. In-memory subscriber for instant cross-component updates
  const unsubMemory = registerSubscriber<UserProfileData | null>(userId, 'profile', (p) => {
    callback(p);
  });

  // 3. Also listen to Firestore
  let unsubFirestore = () => {};
  try {
    const profileDocRef = doc(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.PROFILE, "profile");
    unsubFirestore = onSnapshot(profileDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const p = docSnap.data();
        const loaded: HealthProfile = {
          name: p.name || '',
          age: p.age ? Number(p.age) : 25,
          skinType: p.skinType || '',
          concerns: Array.isArray(p.concerns) ? p.concerns : [],
          medicalHistory: Array.isArray(p.medicalHistory) ? p.medicalHistory : [],
          allergies: Array.isArray(p.allergies) ? p.allergies : [],
          lifestyle: p.lifestyle || '',
          currentMedications: Array.isArray(p.currentMedications) ? p.currentMedications : [],
          gender: p.gender || '',
          preferences: p.preferences || '',
          email: p.email || auth.currentUser?.email || '',
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        };
        localUserStore.set(userId, 'profile', loaded);
      }
    }, (err) => {
      console.warn(`[Firebase] subscribeToUserProfile remote listener notice:`, err?.message);
    });
  } catch {
    // ignore
  }

  return () => {
    unsubMemory();
    unsubFirestore();
  };
};

// ---------------------------------------------------------------------------
// 3. SKIN ANALYSIS (users/{uid}/skinAnalyses/{analysisId})
// ---------------------------------------------------------------------------

export const saveSkinAnalysis = async (userId: string, condition: DetectedCondition): Promise<void> => {
  if (!userId || !condition) return;
  const conditionName = condition.condition || condition.name || "Unknown";
  const mode = condition.mode || (condition.skincareType === 'ayurvedic' ? 'Ayurveda' : 'Dermatology');
  const analysisId = condition.id || Date.now().toString();

  const analysisData: DetectedCondition = {
    ...condition,
    id: analysisId,
    condition: conditionName,
    name: conditionName,
    formattedName: condition.formattedName || conditionName,
    confidence: condition.confidence,
    severity: condition.severity || 'mild',
    description: condition.description || '',
    treatments: condition.treatments || [],
    dietRecommendations: condition.dietRecommendations || [],
    imageUrl: condition.imageUrl || '',
    medicalNotice: condition.medicalNotice || '',
    mode,
    skincareType: condition.skincareType || 'generic',
    dateTime: condition.dateTime || (condition.detectedAt instanceof Date ? condition.detectedAt.toISOString() : new Date().toISOString())
  };

  // 1. Immediately persist to user store
  const conds = localUserStore.get<DetectedCondition[]>(userId, 'conditions', []);
  const updated = [analysisData, ...conds.filter(c => c.id !== analysisId)];
  localUserStore.set(userId, 'conditions', updated);

  // 2. Automatically record user activity
  saveActivity(userId, {
    type: 'skin_analysis',
    title: `Skin Analysis: ${conditionName}`,
    description: `${Math.round(condition.confidence || 90)}% confidence • ${condition.severity || 'mild'} severity`,
    referenceId: analysisId
  });

  // 3. Attempt Firestore cloud write
  try {
    const analysisRef = doc(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.SKIN_ANALYSES, analysisId);
    await setDoc(analysisRef, {
      ...analysisData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const userRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userRef, {
      lastAnalysis: {
        condition: conditionName,
        confidence: condition.confidence,
        dateTime: analysisData.dateTime,
        mode
      },
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.warn(`[Firebase] Firestore saveSkinAnalysis notice:`, error);
  }
};

export const getSkinAnalyses = async (userId: string): Promise<DetectedCondition[]> => {
  if (!userId) return [];
  const cached = localUserStore.get<DetectedCondition[]>(userId, 'conditions', []);
  try {
    const collRef = collection(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.SKIN_ANALYSES);
    const q = query(collRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items = snap.docs.map(d => d.data() as DetectedCondition);
      localUserStore.set(userId, 'conditions', items);
      return items;
    }
  } catch (error) {
    console.warn(`[Firebase] getSkinAnalyses notice:`, error);
  }
  return cached;
};

export const subscribeToSkinAnalyses = (userId: string, callback: (conditions: DetectedCondition[]) => void) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  // Immediately deliver user's saved analyses
  const cached = localUserStore.get<DetectedCondition[]>(userId, 'conditions', []);
  callback(cached);

  const unsubMemory = registerSubscriber<DetectedCondition[]>(userId, 'conditions', callback);

  let unsubFirestore = () => {};
  try {
    const collRef = collection(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.SKIN_ANALYSES);
    const q = query(collRef, orderBy("createdAt", "desc"));
    unsubFirestore = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const conditions = snapshot.docs.map(d => d.data() as DetectedCondition);
        localUserStore.set(userId, 'conditions', conditions);
      }
    }, (err) => {
      console.warn(`[Firebase] subscribeToSkinAnalyses notice:`, err?.message);
    });
  } catch {
    // ignore
  }

  return () => {
    unsubMemory();
    unsubFirestore();
  };
};

// ---------------------------------------------------------------------------
// 4. SKINCARE PLANS (users/{uid}/skincarePlans/{planId})
// ---------------------------------------------------------------------------

export const saveSkincarePlan = async (userId: string, plan: ActivePlan): Promise<void> => {
  if (!userId || !plan) return;
  const planId = plan.id || Date.now().toString();
  const planData: SkincarePlanRecord = {
    id: planId,
    title: plan.title || "Skincare Routine",
    mode: plan.type || 'generic',
    source: 'chatbot',
    routine: plan.routine || [],
    products: plan.products || [],
    tips: plan.tips || [],
    startDate: plan.startDate instanceof Date ? plan.startDate.toISOString() : (plan.startDate || new Date().toISOString()),
    completedDates: plan.completedDates || []
  };

  // 1. Immediately persist to user store (triggers in-memory notify)
  const plans = localUserStore.get<ActivePlan[]>(userId, 'plans', []);
  const updated = [plan as ActivePlan, ...plans.filter(p => p.id !== planId)];
  localUserStore.set(userId, 'plans', updated);

  // 2. Automatically record user activity
  saveActivity(userId, {
    type: 'plan_saved',
    title: `Saved Plan: ${plan.title}`,
    description: `${plan.type === 'ayurvedic' ? 'Ayurvedic' : 'Dermatology'} treatment regimen`,
    referenceId: planId
  });

  // 3. Attempt Firestore cloud write
  try {
    const planRef = doc(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.SKINCARE_PLANS, planId);
    await setDoc(planRef, {
      ...planData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.warn(`[Firebase] Firestore saveSkincarePlan notice:`, error);
  }
};

export const getSkincarePlans = async (userId: string): Promise<ActivePlan[]> => {
  if (!userId) return [];
  const cached = localUserStore.get<ActivePlan[]>(userId, 'plans', []);
  try {
    const collRef = collection(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.SKINCARE_PLANS);
    const snap = await getDocs(query(collRef, orderBy("createdAt", "desc")));
    if (!snap.empty) {
      const items = snap.docs.map(d => d.data() as ActivePlan);
      localUserStore.set(userId, 'plans', items);
      return items;
    }
  } catch (error) {
    console.warn(`[Firebase] getSkincarePlans notice:`, error);
  }
  return cached;
};

export const subscribeToSkincarePlans = (userId: string, callback: (plans: ActivePlan[]) => void) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  const cached = localUserStore.get<ActivePlan[]>(userId, 'plans', []);
  callback(cached);

  const unsubMemory = registerSubscriber<ActivePlan[]>(userId, 'plans', callback);

  let unsubFirestore = () => {};
  try {
    const collRef = collection(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.SKINCARE_PLANS);
    const q = query(collRef, orderBy("createdAt", "desc"));
    unsubFirestore = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const plans = snapshot.docs.map(d => d.data() as ActivePlan);
        localUserStore.set(userId, 'plans', plans);
      }
    }, (err) => {
      console.warn(`[Firebase] subscribeToSkincarePlans notice:`, err?.message);
    });
  } catch {
    // ignore
  }

  return () => {
    unsubMemory();
    unsubFirestore();
  };
};

// ---------------------------------------------------------------------------
// 5. DIET PLANS (users/{uid}/dietPlans/{dietPlanId})
// ---------------------------------------------------------------------------

export const saveDietPlan = async (userId: string, dietPlan: any): Promise<void> => {
  if (!userId || !dietPlan) return;
  const dietPlanId = dietPlan.id || 'active_diet_plan';

  // 1. Persist to user store (triggers in-memory notify)
  localUserStore.set(userId, 'diet', dietPlan);

  // 2. Record activity
  saveActivity(userId, {
    type: 'diet_plan_saved',
    title: 'Diet Plan Updated',
    description: 'Personalized nutrition guidelines saved',
    referenceId: dietPlanId
  });

  // 3. Attempt Firestore
  try {
    const dietRef = doc(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.DIET_PLANS, dietPlanId);
    await setDoc(dietRef, {
      ...dietPlan,
      id: dietPlanId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    const userRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userRef, { activeDietPlan: dietPlan, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.warn(`[Firebase] Firestore saveDietPlan notice:`, error);
  }
};

export const getDietPlans = async (userId: string): Promise<DietPlanRecord[]> => {
  if (!userId) return [];
  const cached = localUserStore.get<any>(userId, 'diet', null);
  if (cached) return [cached];
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.DIET_PLANS));
    return snap.docs.map(d => d.data() as DietPlanRecord);
  } catch {
    return [];
  }
};

export const subscribeToDietPlan = (userId: string, callback: (plan: any) => void) => {
  if (!userId) {
    callback(undefined);
    return () => {};
  }
  const cached = localUserStore.get<any>(userId, 'diet', undefined);
  callback(cached);

  const unsubMemory = registerSubscriber<any>(userId, 'diet', callback);

  let unsubFirestore = () => {};
  try {
    const dietDocRef = doc(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.DIET_PLANS, "active_diet_plan");
    unsubFirestore = onSnapshot(dietDocRef, (snap) => {
      if (snap.exists()) {
        const plan = snap.data();
        localUserStore.set(userId, 'diet', plan);
      }
    }, () => {});
  } catch {
    // ignore
  }

  return () => {
    unsubMemory();
    unsubFirestore();
  };
};

// ---------------------------------------------------------------------------
// 6. PROGRESS (users/{uid}/progress/{progressId})
// ---------------------------------------------------------------------------

export const saveProgress = async (
  userId: string,
  dietProgress?: Record<string, string[]>,
  reminderProgress?: Record<string, string[]>,
  _metric?: Partial<HealthMetric>
): Promise<void> => {
  if (!userId) return;
  const existing = localUserStore.get<any>(userId, 'progress', { dietProgress: {}, reminderProgress: {} });
  const updated = {
    dietProgress: dietProgress || existing.dietProgress || {},
    reminderProgress: reminderProgress || existing.reminderProgress || {}
  };
  localUserStore.set(userId, 'progress', updated);

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userRef, { ...updated, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.warn(`[Firebase] Firestore saveProgress notice:`, error);
  }
};

export const getProgress = async (userId: string): Promise<Record<string, any>> => {
  if (!userId) return { dietProgress: {}, reminderProgress: {} };
  return localUserStore.get<any>(userId, 'progress', { dietProgress: {}, reminderProgress: {} });
};

export const subscribeToProgress = (userId: string, callback: (progress: any) => void) => {
  if (!userId) {
    callback({ dietProgress: {}, reminderProgress: {} });
    return () => {};
  }
  callback(localUserStore.get<any>(userId, 'progress', { dietProgress: {}, reminderProgress: {} }));

  const unsubMemory = registerSubscriber<any>(userId, 'progress', callback);

  let unsubFirestore = () => {};
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    unsubFirestore = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const p = {
          dietProgress: data.dietProgress || {},
          reminderProgress: data.reminderProgress || {}
        };
        localUserStore.set(userId, 'progress', p);
      }
    }, () => {});
  } catch {
    // ignore
  }

  return () => {
    unsubMemory();
    unsubFirestore();
  };
};

// ---------------------------------------------------------------------------
// 7. REMINDERS (users/{uid}/reminders/{reminderId})
// ---------------------------------------------------------------------------

export const saveReminder = async (userId: string, reminder: Reminder): Promise<void> => {
  if (!userId || !reminder) return;
  const rems = localUserStore.get<Reminder[]>(userId, 'reminders', []);
  const updated = [reminder, ...rems.filter(r => r.id !== reminder.id)];
  localUserStore.set(userId, 'reminders', updated);

  try {
    const reminderRef = doc(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.REMINDERS, reminder.id);
    await setDoc(reminderRef, { ...reminder, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.warn(`[Firebase] Firestore saveReminder notice:`, error);
  }
};

export const deleteReminder = async (userId: string, reminderId: string): Promise<void> => {
  if (!userId || !reminderId) return;
  const rems = localUserStore.get<Reminder[]>(userId, 'reminders', []);
  localUserStore.set(userId, 'reminders', rems.filter(r => r.id !== reminderId));

  try {
    const reminderRef = doc(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.REMINDERS, reminderId);
    await deleteDoc(reminderRef);
  } catch (error) {
    console.warn(`[Firebase] Firestore deleteReminder notice:`, error);
  }
};

export const saveAllReminders = async (userId: string, reminders: Reminder[]): Promise<void> => {
  if (!userId) return;
  localUserStore.set(userId, 'reminders', reminders);

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userRef, { reminders, updatedAt: serverTimestamp() }, { merge: true });

    // Also sync to users/{userId}/reminders subcollection
    const colRef = collection(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.REMINDERS);
    for (const rem of reminders) {
      if (rem && rem.id) {
        const reminderRef = doc(colRef, rem.id);
        await setDoc(reminderRef, { ...rem, updatedAt: serverTimestamp() }, { merge: true });
      }
    }
  } catch (error) {
    console.warn(`[Firebase] Firestore saveAllReminders notice:`, error);
  }
};

export const getReminders = async (userId: string): Promise<Reminder[]> => {
  if (!userId) return [];
  const local = localUserStore.get<Reminder[]>(userId, 'reminders', []);
  if (local.length > 0) return local;

  try {
    // Try users/{uid}/reminders subcollection
    const colRef = collection(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.REMINDERS);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const rems = snap.docs.map(d => ({ ...d.data(), id: d.id } as Reminder));
      localUserStore.set(userId, 'reminders', rems);
      return rems;
    }

    // Fallback to users/{uid} document
    const userRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists() && Array.isArray(docSnap.data().reminders)) {
      const rems = docSnap.data().reminders;
      localUserStore.set(userId, 'reminders', rems);
      return rems;
    }
  } catch (e) {
    console.warn('[Firebase] getReminders notice:', e);
  }
  return [];
};

export const subscribeToReminders = (userId: string, callback: (reminders: Reminder[]) => void) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  callback(localUserStore.get<Reminder[]>(userId, 'reminders', []));

  const unsubMemory = registerSubscriber<Reminder[]>(userId, 'reminders', callback);

  let unsubDoc = () => {};
  let unsubSub = () => {};
  let docReminders: Reminder[] = [];
  let subReminders: Reminder[] = [];

  const updateMerged = () => {
    const map = new Map<string, Reminder>();
    docReminders.forEach(r => { if (r && r.id) map.set(r.id, r); });
    subReminders.forEach(r => { if (r && r.id) map.set(r.id, r); });
    const merged = Array.from(map.values());
    localUserStore.set(userId, 'reminders', merged);
  };

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    unsubDoc = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists() && Array.isArray(docSnap.data().reminders)) {
        docReminders = docSnap.data().reminders;
        updateMerged();
      }
    }, () => {});

    const colRef = collection(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.REMINDERS);
    unsubSub = onSnapshot(colRef, (snap) => {
      if (!snap.empty) {
        subReminders = snap.docs.map(d => ({ ...d.data(), id: d.id } as Reminder));
        updateMerged();
      }
    }, () => {});
  } catch {
    // ignore
  }

  return () => {
    unsubMemory();
    unsubDoc();
    unsubSub();
  };
};

// ---------------------------------------------------------------------------
// 8. ACTIVITY (users/{uid}/activity/{activityId})
// ---------------------------------------------------------------------------

export const saveActivity = async (
  userId: string,
  activity: Omit<ActivityRecord, 'id' | 'createdAt'>
): Promise<void> => {
  if (!userId) return;
  const newAct: ActivityRecord = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type: activity.type,
    title: activity.title,
    description: activity.description,
    referenceId: activity.referenceId,
    metadata: activity.metadata,
    createdAt: new Date().toISOString()
  };

  // 1. Immediately persist to user's activity log (triggers in-memory notify)
  const existing = localUserStore.get<ActivityRecord[]>(userId, 'activities', []);
  const updated = [newAct, ...existing.filter(a => a.id !== newAct.id)].slice(0, 50);
  localUserStore.set(userId, 'activities', updated);

  // 2. Also try Firestore
  try {
    const collRef = collection(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.ACTIVITY);
    await addDoc(collRef, {
      ...activity,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.warn(`[Firebase] Firestore saveActivity remote notice:`, error);
  }
};

export const getActivity = async (userId: string, limitCount = 10): Promise<ActivityRecord[]> => {
  if (!userId) return [];
  const cached = localUserStore.get<ActivityRecord[]>(userId, 'activities', []);
  return cached.slice(0, limitCount);
};

export const subscribeToActivity = (
  userId: string,
  callback: (activities: ActivityRecord[]) => void,
  limitCount = 10
) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  // 1. Get cached activities
  let cached = localUserStore.get<ActivityRecord[]>(userId, 'activities', []);

  // If cached is empty, auto-reconstruct from existing user data or initialize baseline
  if (!cached || cached.length === 0) {
    const profile = localUserStore.get<UserProfileData | null>(userId, 'profile', null);
    const conditions = localUserStore.get<DetectedCondition[]>(userId, 'conditions', []);
    const plans = localUserStore.get<ActivePlan[]>(userId, 'plans', []);
    
    const reconstructed: ActivityRecord[] = [];

    // Conditions
    (conditions || []).forEach(c => {
      reconstructed.push({
        id: `act_cond_${c.id}`,
        type: 'skin_analysis',
        title: `AI Skin Analysis: ${c.formattedName || c.condition || c.name}`,
        description: `${Math.round(c.confidence || 90)}% confidence • ${c.severity || 'mild'} severity`,
        referenceId: c.id,
        createdAt: c.dateTime || new Date().toISOString()
      });
    });

    // Plans
    (plans || []).forEach(p => {
      reconstructed.push({
        id: `act_plan_${p.id}`,
        type: 'plan_saved',
        title: `Saved Plan: ${p.title}`,
        description: `${p.type === 'ayurvedic' ? 'Ayurvedic' : 'Clinical'} routine`,
        referenceId: p.id,
        createdAt: p.startDate || new Date().toISOString()
      });
    });

    // Profile
    if (profile && profile.skinType) {
      reconstructed.push({
        id: `act_prof_${userId.slice(0, 8)}`,
        type: 'profile_updated',
        title: 'Profile Configured',
        description: `Skin profile set: ${profile.skinType} skin • ${(profile.concerns || []).length} concern(s)`,
        createdAt: new Date().toISOString()
      });
    }

    // Always ensure at least a welcome/session activity so activity feed is NEVER empty
    reconstructed.push({
      id: `act_welcome_${userId.slice(0, 8)}`,
      type: 'profile_updated',
      title: 'ArogyAI Dashboard Active',
      description: 'Account active • Holistic clinical & Ayurvedic dermatology modules ready',
      createdAt: new Date().toISOString()
    });

    cached = reconstructed;
    localUserStore.set(userId, 'activities', cached);
  }

  // Immediately deliver user's saved activities!
  callback(cached.slice(0, limitCount));

  // In-memory subscriber for instant cross-component updates
  const unsubMemory = registerSubscriber<ActivityRecord[]>(userId, 'activities', (acts) => {
    callback(acts.slice(0, limitCount));
  });

  // Also listen to Firestore
  let unsubFirestore = () => {};
  try {
    const collRef = collection(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.ACTIVITY);
    const q = query(collRef, orderBy("createdAt", "desc"), limit(limitCount));
    unsubFirestore = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const acts = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt instanceof Timestamp ? d.data().createdAt.toDate() : (d.data().createdAt ? new Date(d.data().createdAt) : new Date())
        } as ActivityRecord));
        localUserStore.set(userId, 'activities', acts);
      }
    }, (err) => {
      console.warn(`[Firebase] subscribeToActivity notice:`, err?.message);
    });
  } catch {
    // ignore
  }

  return () => {
    unsubMemory();
    unsubFirestore();
  };
};

// ---------------------------------------------------------------------------
// 9. CHAT MESSAGES (users/{uid}/chats/{skincareType})
// ---------------------------------------------------------------------------

export const saveChatMessages = async (userId: string, skincareType: string, messages: ChatMessage[]): Promise<void> => {
  if (!userId) return;
  try {
    const docRef = doc(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.CHATS, skincareType);
    await setDoc(docRef, { messages, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error(`[Firebase] Error saving chat for ${userId}:`, error);
  }
};

export const subscribeToChatMessages = (userId: string, skincareType: string, callback: (messages: ChatMessage[]) => void) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  const docRef = doc(db, USERS_COLLECTION, userId, SUBCOLLECTIONS.CHATS, skincareType);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().messages || []);
    } else {
      callback([]);
    }
  }, (err) => {
    console.warn(`[Firebase] subscribeToChatMessages error:`, err);
    callback([]);
  });
};

// ---------------------------------------------------------------------------
// 10. FIREBASE STORAGE HELPER
// ---------------------------------------------------------------------------

export const uploadUserSkinImage = async (
  userId: string,
  fileOrBlob: File | Blob,
  customName?: string
): Promise<string> => {
  if (!userId) throw new Error("Authentication required for image upload.");
  const filename = customName || `${Date.now()}_analysis.jpg`;
  const storageRef = ref(storage, `users/${userId}/skinAnalyses/${filename}`);
  const uploadResult = await uploadBytes(storageRef, fileOrBlob);
  const downloadUrl = await getDownloadURL(uploadResult.ref);
  return downloadUrl;
};

// ---------------------------------------------------------------------------
// BACKWARD-COMPATIBILITY EXPORTS (UserService & CollectionsService)
// ---------------------------------------------------------------------------

export const UserService = {
  saveHealthProfile: (userId: string, profile: HealthProfile) => saveUserProfile(userId, profile),
  subscribeToHealthProfile: (userId: string, callback: (profile: HealthProfile | null) => void) => subscribeToUserProfile(userId, callback),
  saveProgress: (userId: string, dietProgress?: Record<string, string[]>, reminderProgress?: Record<string, string[]>) => saveProgress(userId, dietProgress, reminderProgress),
  subscribeToProgresses: (userId: string, callback: (progress: any) => void) => subscribeToProgress(userId, callback)
};

export const CollectionsService = {
  saveDetectedCondition: (userId: string, condition: DetectedCondition) => saveSkinAnalysis(userId, condition),
  subscribeToDetectedConditions: (userId: string, callback: (conditions: DetectedCondition[]) => void) => subscribeToSkinAnalyses(userId, callback),
  saveActivePlan: (userId: string, plan: ActivePlan) => saveSkincarePlan(userId, plan),
  subscribeToActivePlans: (userId: string, callback: (plans: ActivePlan[]) => void) => subscribeToSkincarePlans(userId, callback),
  saveDietPlan: (userId: string, dietPlan: any) => saveDietPlan(userId, dietPlan),
  subscribeToActiveDietPlan: (userId: string, callback: (plan: any) => void) => subscribeToDietPlan(userId, callback),
  saveReminders: (userId: string, reminders: Reminder[]) => saveAllReminders(userId, reminders),
  subscribeToReminders: (userId: string, callback: (reminders: Reminder[]) => void) => subscribeToReminders(userId, callback),
  saveChatMessages: (userId: string, skincareType: string, messages: ChatMessage[]) => saveChatMessages(userId, skincareType, messages),
  subscribeToChatMessages: (userId: string, skincareType: string, callback: (messages: ChatMessage[]) => void) => subscribeToChatMessages(userId, skincareType, callback)
};

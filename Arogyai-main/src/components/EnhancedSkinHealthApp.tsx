import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { UserService, CollectionsService, ActivityRecord, subscribeToActivity } from '../lib/firestore_db';
import { WelcomeScreen } from './WelcomeScreen';
import { HealthProfileCreation } from './HealthProfileCreation';
import { HealthDashboard } from './HealthDashboard';
import { DiseaseDetection } from './DiseaseDetection';
import { ChatInterface } from './ChatInterface';
import { DietPlan } from './DietPlan';
import { RemindersManager } from './RemindersManager';
import { HealthAnalytics } from './HealthAnalytics';
import { ChatMessage, ActivePlan } from './SkincareApp';
import { generateActiveDietPlan } from '../utils/dietPlanGenerator';
import { ErrorBoundary } from './ErrorBoundary';

export type Screen = 'welcome' | 'profile' | 'dashboard' | 'detection' | 'chat' | 'diet' | 'reminders' | 'analytics';
export type SkincareType = 'generic' | 'ayurvedic';

export interface HealthProfile {
  name: string;
  age: number;
  skinType: string;
  concerns: string[];
  medicalHistory: string[];
  allergies: string[];
  lifestyle: string;
  currentMedications: string[];
  gender?: string;
  preferences?: string;
  email?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface DetectedCondition {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  confidence: number;
  description: string;
  imageUrl: string;
  detectedAt: Date;
  treatments: string[];
  dietRecommendations: string[];
  medicalNotice?: string;
  condition?: string;
  formattedName?: string;
  dateTime?: string;
  mode?: string;
  skincareType?: SkincareType;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  type: 'medication' | 'treatment' | 'checkup' | 'photo' | 'diet';
  time: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  nextDue: Date;
}

export interface HealthMetric {
  date: string;
  skinHealthScore: number;
  treatmentAdherence: number;
  symptomSeverity: number;
  overallWellness: number;
}

export function EnhancedSkinHealthApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>(() => {
    return auth.currentUser?.displayName || (auth.currentUser?.email ? auth.currentUser.email.split('@')[0] : '');
  });
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);

  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    // Check if we have an initial screen passed via navigation state (e.g. 'profile' after signup)
    return (location.state as { initialScreen?: Screen })?.initialScreen || 'welcome';
  });

  // Sync currentScreen whenever location.state changes (e.g. navigating from /login or /signup)
  useEffect(() => {
    const stateScreen = (location.state as { initialScreen?: Screen })?.initialScreen;
    if (stateScreen) {
      setCurrentScreen(stateScreen);
    }
  }, [location.state]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        const resolved = user.displayName || (user.email ? user.email.split('@')[0] : '');
        if (resolved) {
          setUserName(resolved);
        }
        // Do not retain stale profile or insert dummy data; load fresh from Firestore
        setHealthProfile(null);
        setProfileLoading(true);

        // If the user is logged in, ensure we land on dashboard unless specifically directed to profile (after signup)
        setCurrentScreen((prev) => {
          const requested = (location.state as { initialScreen?: Screen })?.initialScreen;
          if (requested) return requested;
          if (prev === 'welcome') return 'dashboard';
          return prev;
        });
      } else {
        // Complete state cleanup on logout
        setUserId(null);
        setUserName('');
        setHealthProfile(null);
        setActivePlans([]);
        setDetectedConditions([]);
        setReminders([]);
        setDietProgress({});
        setReminderProgress({});
        setUserActivities([]);
        setActiveDietPlan(undefined);
        setProfileLoading(false);
        setCurrentScreen('welcome');
      }
    });
    return () => unsubscribe();
  }, [location.state]);

  const [currentSkincareType, setCurrentSkincareType] = useState<SkincareType>('generic');

  // Chat History State - Dictionary keyed by SkincareType
  const [chatHistories, setChatHistories] = useState<Record<SkincareType, ChatMessage[]>>({
    generic: [],
    ayurvedic: []
  });

  const [activePlans, setActivePlans] = useState<ActivePlan[]>([]);
  const [detectedConditions, setDetectedConditions] = useState<DetectedCondition[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [healthMetrics] = useState<HealthMetric[]>([]);
  const [dietProgress, setDietProgress] = useState<Record<string, string[]>>({}); // date -> mealIds
  const [reminderProgress, setReminderProgress] = useState<Record<string, string[]>>({}); // date -> reminderIds
  const [userActivities, setUserActivities] = useState<ActivityRecord[]>([]);
  const [activeDietPlan, setActiveDietPlan] = useState<{
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
  } | undefined>(undefined);

  useEffect(() => {
    if (!userId) {
      setProfileLoading(false);
      return;
    }

    const unsubs: any[] = [];
    
    unsubs.push(UserService.subscribeToHealthProfile(userId, (profile) => {
      setProfileLoading(false);
      if (profile) {
        setHealthProfile({
          ...profile,
          name: profile.name || auth.currentUser?.displayName || (auth.currentUser?.email ? auth.currentUser.email.split('@')[0] : '') || ''
        });
        if (profile.name) {
          setUserName(profile.name);
        }
      } else {
        setHealthProfile(null);
      }
    }));

    unsubs.push(UserService.subscribeToProgresses(userId, (progress) => {
      setDietProgress(progress.dietProgress || {});
      setReminderProgress(progress.reminderProgress || {});
    }));

    unsubs.push(CollectionsService.subscribeToDetectedConditions(userId, (conditions) => {
      setDetectedConditions(conditions);
    }));

    unsubs.push(CollectionsService.subscribeToActivePlans(userId, (plans) => {
      setActivePlans(plans);
    }));

    unsubs.push(CollectionsService.subscribeToActiveDietPlan(userId, (plan) => {
      setActiveDietPlan(plan);
    }));

    unsubs.push(CollectionsService.subscribeToReminders(userId, (rems) => {
      setReminders(Array.isArray(rems) ? rems : []);
    }));

    unsubs.push(subscribeToActivity(userId, (acts) => {
      setUserActivities(acts);
    }));

    return () => unsubs.forEach(unsub => unsub());
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const unsub = CollectionsService.subscribeToChatMessages(userId, currentSkincareType, (messages) => {
      setChatHistories(prev => ({
        ...prev,
        [currentSkincareType]: messages
      }));
    });
    return () => unsub();
  }, [userId, currentSkincareType]);

  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  // Helper to update chat messages for the current mode
  const updateCurrentChatMessages = (newMessages: ChatMessage[]) => {
    setChatHistories(prev => ({
      ...prev,
      [currentSkincareType]: newMessages
    }));
    if (userId) CollectionsService.saveChatMessages(userId, currentSkincareType, newMessages);
  };

  const saveActivePlan = (plan: ActivePlan) => {
    setActivePlans(prev => [plan, ...prev]);
    if (userId) CollectionsService.saveActivePlan(userId, plan);
    navigateToScreen('dashboard');
  };

  const addDetectedCondition = (condition: DetectedCondition) => {
    // Guard: Do not save low-confidence results where condition is null or empty
    const conditionName = condition?.condition || condition?.name;
    if (!condition || !conditionName || conditionName === 'null') return;

    const selectedMode = condition.mode || (currentSkincareType === 'ayurvedic' ? 'Ayurveda' : 'Dermatology');
    const enrichedCondition: DetectedCondition = {
      ...condition,
      condition: conditionName,
      name: conditionName,
      confidence: condition.confidence,
      dateTime: condition.dateTime || (condition.detectedAt instanceof Date ? condition.detectedAt.toISOString() : new Date().toISOString()),
      mode: selectedMode,
      skincareType: condition.skincareType || currentSkincareType
    };

    setDetectedConditions(prev => [enrichedCondition, ...prev]);
    const currentUid = userId || auth.currentUser?.uid;
    if (currentUid) {
      CollectionsService.saveDetectedCondition(currentUid, enrichedCondition);
    }
    generateRemindersForCondition(enrichedCondition);
    generateDietPlanForCondition(enrichedCondition);
    navigateToScreen('diet');
  };

  const generateDietPlanForCondition = (condition: DetectedCondition) => {
    const conditionName = condition.condition || condition.name || 'General Skin Health';
    const dietPlan = generateActiveDietPlan(conditionName);
    setActiveDietPlan(dietPlan);
    const currentUid = userId || auth.currentUser?.uid;
    if (currentUid) CollectionsService.saveDietPlan(currentUid, dietPlan);
  };


  const handleSaveDietPlan = (plan: any) => {
    setActiveDietPlan(plan);
    if (userId) CollectionsService.saveDietPlan(userId, plan);
    navigateToScreen('diet');
  };

  const toggleDietMeal = (date: string, mealId: string) => {
    setDietProgress(prev => {
      const dayProgress = prev[date] || [];
      const newProgress = dayProgress.includes(mealId)
        ? dayProgress.filter(id => id !== mealId)
        : [...dayProgress, mealId];
      const updated = { ...prev, [date]: newProgress };
      if (userId) UserService.saveProgress(userId, updated, reminderProgress);
      return updated;
    });
  };

  const toggleReminderCompletion = (date: string, reminderId: string) => {
    setReminderProgress(prev => {
      const dayProgress = prev[date] || [];
      const newProgress = dayProgress.includes(reminderId)
        ? dayProgress.filter(id => id !== reminderId)
        : [...dayProgress, reminderId];
      const updated = { ...prev, [date]: newProgress };
      if (userId) UserService.saveProgress(userId, dietProgress, updated);
      return updated;
    });
  };
  const generateRemindersForCondition = (condition: DetectedCondition) => {
    const newReminders: Reminder[] = [
      {
        id: `med-${condition.id}`,
        title: `Apply treatment for ${condition.name}`,
        description: 'Apply prescribed topical treatment',
        type: 'treatment',
        time: '09:00',
        frequency: 'daily',
        isActive: true,
        nextDue: new Date()
      },
      {
        id: `photo-${condition.id}`,
        title: `Progress photo for ${condition.name}`,
        description: 'Take progress photo to track healing',
        type: 'photo',
        time: '19:00',
        frequency: 'weekly',
        isActive: true,
        nextDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ];

    setReminders(prev => {
      const updated = [...prev, ...newReminders];
      if (userId) CollectionsService.saveReminders(userId, updated);
      return updated;
    });
  };

  const handleUpdateReminders = (newRems: Reminder[]) => {
    setReminders(newRems);
    if (userId) CollectionsService.saveReminders(userId, newRems);
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <WelcomeScreen
            onSignup={() => navigate('/signup')}
            onLogin={() => navigate('/login')}
            hasProfile={!!healthProfile}
          />
        );
      case 'profile':
        return (
          <HealthProfileCreation
            onProfileCreated={async (profile) => {
              const activeUid = userId || auth.currentUser?.uid;
              if (activeUid) {
                await UserService.saveHealthProfile(activeUid, profile);
              }
              setHealthProfile(profile);
              navigateToScreen('dashboard');
            }}
            existingProfile={healthProfile}
            isLoading={profileLoading}
            onBack={() => navigateToScreen('dashboard')}
          />
        );
      case 'dashboard':
        return (
          <HealthDashboard
            healthProfile={healthProfile}
            userName={userName}
            detectedConditions={detectedConditions}
            reminders={reminders}
            healthMetrics={healthMetrics}
            activePlans={activePlans}
            dietProgress={dietProgress}
            reminderProgress={reminderProgress}
            userActivities={userActivities}
            onToggleReminder={toggleReminderCompletion}
            onNavigate={navigateToScreen}
            onSelectSkincareType={setCurrentSkincareType}
            onLogout={() => {
              signOut(auth);
              navigate('/login');
            }}
          />
        );
      case 'detection':
        return (
          <DiseaseDetection
            onConditionDetected={addDetectedCondition}
            onBack={() => navigateToScreen('dashboard')}
            healthProfile={healthProfile}
            skincareType={currentSkincareType}
          />
        );
      case 'chat':
        return (
          <ChatInterface
            skincareType={currentSkincareType}
            messages={chatHistories[currentSkincareType]}
            onMessagesUpdate={updateCurrentChatMessages}
            onSaveChat={() => { }}
            onSavePlan={saveActivePlan}
            onSaveDietPlan={handleSaveDietPlan}
            onBackToDashboard={() => navigateToScreen('dashboard')}
            userProfile={healthProfile}
          />
        );
      case 'diet':
        return (
          <DietPlan
            healthProfile={healthProfile}
            detectedConditions={detectedConditions}
            activeDietPlan={activeDietPlan}
            dietProgress={dietProgress}
            onToggleMeal={toggleDietMeal}
            onBack={() => navigateToScreen('dashboard')}
          />
        );
      case 'reminders':
        return (
          <ErrorBoundary fallbackTitle="Smart Reminders" onReset={() => navigateToScreen('dashboard')}>
            <RemindersManager
              reminders={reminders}
              reminderProgress={reminderProgress}
              onToggleReminder={toggleReminderCompletion}
              onUpdateReminders={handleUpdateReminders}
              onBack={() => navigateToScreen('dashboard')}
            />
          </ErrorBoundary>
        );
      case 'analytics':
        return (
          <HealthAnalytics
            healthMetrics={healthMetrics}
            detectedConditions={detectedConditions}
            activePlans={activePlans}
            dietProgress={dietProgress}
            reminderProgress={reminderProgress}
            onBack={() => navigateToScreen('dashboard')}
          />
        );
      default:
        return (
          <WelcomeScreen
            onSignup={() => navigate('/signup')}
            onLogin={() => navigate('/login')}
            hasProfile={false}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {renderCurrentScreen()}
    </div>
  );
}
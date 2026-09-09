import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from './supabase/info';
import type { HealthProfile, DetectedCondition, Reminder, HealthMetric } from '../components/EnhancedSkinHealthApp';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-b7d46fd5`;

// Auth state management
export class AuthManager {
  private static instance: AuthManager;
  private session: any = null;
  private user: any = null;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  async initialize() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session) {
        this.session = session;
        this.user = session.user;
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  }

  async signUp(email: string, password: string, name: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Now sign in the user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        throw new Error('Account created but login failed: ' + signInError.message);
      }

      this.session = signInData.session;
      this.user = signInData.user;

      return { user: this.user, session: this.session };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error('Sign in failed: ' + error.message);
      }

      this.session = session;
      this.user = session?.user;

      return { user: this.user, session: this.session };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      this.session = null;
      this.user = null;
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  getAccessToken(): string | null {
    return this.session?.access_token || null;
  }

  getUser() {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.session && !!this.user;
  }
}

// API helper function
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const auth = AuthManager.getInstance();
  const accessToken = auth.getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken || publicAnonKey}`,
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Health Profile API
export const ProfileAPI = {
  async get(): Promise<HealthProfile | null> {
    try {
      const data = await apiRequest('/profile');
      return data.profile;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  },

  async create(profile: Omit<HealthProfile, 'userId'>): Promise<HealthProfile> {
    const data = await apiRequest('/profile', {
      method: 'POST',
      body: JSON.stringify(profile)
    });
    return data.profile;
  }
};

// Disease Detection API
export const DetectionAPI = {
  async analyzeImage(imageFile: File, analysisType: 'generic' | 'ayurvedic' = 'generic'): Promise<DetectedCondition> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('analysisType', analysisType);

    const auth = AuthManager.getInstance();
    const accessToken = auth.getAccessToken();

    const response = await fetch(`${API_BASE_URL}/detect-condition`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken || publicAnonKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || 'Analysis failed');
    }

    const data = await response.json();
    return data.condition;
  },

  async getConditions(): Promise<DetectedCondition[]> {
    try {
      const data = await apiRequest('/conditions');
      return data.conditions || [];
    } catch (error) {
      console.error('Get conditions error:', error);
      return [];
    }
  }
};

// Reminders API
export const RemindersAPI = {
  async get(): Promise<Reminder[]> {
    try {
      const data = await apiRequest('/reminders');
      return data.reminders || [];
    } catch (error) {
      console.error('Get reminders error:', error);
      return [];
    }
  },

  async create(reminder: Omit<Reminder, 'id'>): Promise<Reminder> {
    const data = await apiRequest('/reminders', {
      method: 'POST',
      body: JSON.stringify(reminder)
    });
    return data.reminder;
  },

  async updateAll(reminders: Reminder[]): Promise<Reminder[]> {
    const data = await apiRequest('/reminders', {
      method: 'PUT',
      body: JSON.stringify(reminders)
    });
    return data.reminders;
  }
};

// AI Chat API
export const ChatAPI = {
  async sendMessage(message: string, chatHistory: any[], skincareType: 'generic' | 'ayurvedic', userProfile: HealthProfile | null) {
    const data = await apiRequest('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        chatHistory,
        skincareType,
        userProfile
      })
    });
    return data;
  },

  async getChatHistory(): Promise<any[]> {
    try {
      const data = await apiRequest('/chat-history');
      return data.chatHistory || [];
    } catch (error) {
      console.error('Get chat history error:', error);
      return [];
    }
  }
};

// Diet Plan API
export const DietAPI = {
  async generate(healthProfile: HealthProfile, detectedConditions: DetectedCondition[], analysisType: 'generic' | 'ayurvedic' = 'generic') {
    const data = await apiRequest('/diet-plan', {
      method: 'POST',
      body: JSON.stringify({
        healthProfile,
        detectedConditions,
        analysisType
      })
    });
    return data.dietPlan;
  },

  async get() {
    try {
      const data = await apiRequest('/diet-plan');
      return data.dietPlan;
    } catch (error) {
      console.error('Get diet plan error:', error);
      return null;
    }
  }
};

// Health Analytics API
export const AnalyticsAPI = {
  async getMetrics(): Promise<HealthMetric[]> {
    try {
      const data = await apiRequest('/health-metrics');
      return data.metrics || [];
    } catch (error) {
      console.error('Get health metrics error:', error);
      return [];
    }
  },

  async saveMetric(metric: Omit<HealthMetric, 'date'>): Promise<HealthMetric[]> {
    const data = await apiRequest('/health-metrics', {
      method: 'POST',
      body: JSON.stringify(metric)
    });
    return data.metrics;
  }
};

// Initialize auth on app load
AuthManager.getInstance().initialize();
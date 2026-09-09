import { useState } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { ProfileCreation } from './ProfileCreation';
import { Dashboard } from './Dashboard';
import { ChatInterface } from './ChatInterface';
import { ChatHistory } from './ChatHistory';

export type Screen = 'welcome' | 'profile' | 'dashboard' | 'chat' | 'history';
export type SkincareType = 'generic' | 'ayurvedic';

export interface UserProfile {
  name: string;
  skinType: string;
  concerns: string[];
  preferences: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
  structuredResponse?: {
    info: string;
    products: string[];
    precautions: string[];
    plans: string[];
    tips: string[];
  };
}

export interface ActivePlan {
  id: string;
  title: string;
  type: SkincareType;
  routine: string[];
  products: string[];
  tips: string[];
  startDate: Date;
  completedDates: string[]; // ISO date strings
}

export interface SavedChat {
  id: string;
  title: string;
  skincareType: SkincareType;
  messages: ChatMessage[];
  lastUpdated: Date;
}

export function SkincareApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentSkincareType, setCurrentSkincareType] = useState<SkincareType>('generic');
  const [currentChat, setCurrentChat] = useState<ChatMessage[]>([]);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);

  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const startChat = (type: SkincareType) => {
    setCurrentSkincareType(type);
    setCurrentChat([]);
    setCurrentScreen('chat');
  };

  const saveCurrentChat = () => {
    if (currentChat.length > 0) {
      const newChat: SavedChat = {
        id: Date.now().toString(),
        title: `${currentSkincareType} Chat - ${new Date().toLocaleDateString()}`,
        skincareType: currentSkincareType,
        messages: currentChat,
        lastUpdated: new Date()
      };
      setSavedChats(prev => [newChat, ...prev]);
    }
  };

  const loadSavedChat = (chat: SavedChat) => {
    setCurrentChat(chat.messages);
    setCurrentSkincareType(chat.skincareType);
    setCurrentScreen('chat');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <WelcomeScreen
            onSignup={() => navigateToScreen('profile')}
            onLogin={() => navigateToScreen('dashboard')}
            hasProfile={!!userProfile}
          />
        );
      case 'profile':
        return (
          <ProfileCreation
            onProfileCreated={(profile) => {
              setUserProfile(profile);
              navigateToScreen('dashboard');
            }}
            existingProfile={userProfile}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            userProfile={userProfile}
            onStartChat={startChat}
            onViewHistory={() => navigateToScreen('history')}
            onEditProfile={() => navigateToScreen('profile')}
          />
        );
      case 'chat':
        return (
          <ChatInterface
            skincareType={currentSkincareType}
            messages={currentChat}
            onMessagesUpdate={setCurrentChat}
            onSaveChat={saveCurrentChat}
            onSavePlan={() => { }}
            onBackToDashboard={() => navigateToScreen('dashboard')}
            userProfile={userProfile}
          />
        );
      case 'history':
        return (
          <ChatHistory
            savedChats={savedChats}
            onLoadChat={loadSavedChat}
            onBackToDashboard={() => navigateToScreen('dashboard')}
            onDeleteChat={(chatId) => setSavedChats(prev => prev.filter(chat => chat.id !== chatId))}
          />
        );
      default:
        return (
          <WelcomeScreen
            onSignup={() => navigateToScreen('profile')}
            onLogin={() => navigateToScreen('dashboard')}
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
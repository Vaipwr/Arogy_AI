import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ChatMessage, SkincareType } from './SkincareApp';
import { Send, ArrowLeft, Save, Sparkles, Leaf, Bot, User, Loader2, Utensils } from 'lucide-react';
import { StructuredResponse } from '../utils/mockAiService';
import { generateRealResponse } from '../utils/llmService';

export interface ChatUserProfile {
  name?: string;
  skinType: string;
  concerns: string[];
  [key: string]: any;
}

interface ChatInterfaceProps {
  skincareType: SkincareType;
  messages: ChatMessage[];
  onMessagesUpdate: (messages: ChatMessage[]) => void;
  onSaveChat: () => void;
  onSavePlan: (plan: any) => void;
  onSaveDietPlan?: (dietPlan: any) => void;
  onBackToDashboard: () => void;
  userProfile: ChatUserProfile | null;
}

const toDateObj = (val: any) => {
  if (!val) return null;
  if (typeof val.toDate === 'function') return val.toDate();
  return new Date(val);
};

export function ChatInterface({
  skincareType,
  messages,
  onMessagesUpdate,
  onSaveChat,
  onSavePlan,
  onSaveDietPlan,
  onBackToDashboard,
  userProfile: _userProfile
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputValue,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    onMessagesUpdate(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      // Small timeout for user experience to show typing indicator
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const formattedResponse = await generateRealResponse(
        userMessage.message,
        skincareType
      );

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: formattedResponse.info,
        timestamp: new Date(),
        structuredResponse: formattedResponse
      };

      onMessagesUpdate([...updatedMessages, aiResponse]);
    } catch (error: any) {
      console.error("Error generating AI response:", error);
      
      const errorMessage = `AI Error Details: ${error.message || "Unknown Error"}`;
        
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: errorMessage,
        timestamp: new Date()
      };
      onMessagesUpdate([...updatedMessages, errorResponse]);
    } finally {
      setIsTyping(false);
    }

  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSaveAndReturn = () => {
    if (messages.length > 0) {
      onSaveChat();
    }
    onBackToDashboard();
  };

  // Structured Response Component
  const safeArray = (arr: any) => Array.isArray(arr) ? arr : [];

  const StructuredResponseCard = ({ data }: { data: StructuredResponse }) => (
    <Card className="mt-3 p-4 bg-white/50 border border-gray-100 shadow-sm w-full">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Recommended Products</Badge>
          </h4>
          <ul className="space-y-1 mb-4">
            {safeArray(data.products).map((item, i) => (
              <li key={i} className="text-sm flex items-start gap-2 text-gray-700">
                <span className="text-green-500 mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Precautions</Badge>
          </h4>
          <ul className="space-y-1 mb-4">
            {safeArray(data.precautions).map((item, i) => (
              <li key={i} className="text-sm flex items-start gap-2 text-gray-700">
                <span className="text-red-400 mt-1">!</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 mt-2">
        <h4 className="font-medium mb-2 text-xs uppercase tracking-wide text-gray-500">Daily Routine</h4>
        <div className="space-y-2 bg-gray-50 p-3 rounded text-sm text-gray-700">
          {safeArray(data.plans).map((plan, i) => (
            <div key={i} className="flex gap-2">
              <span className="font-bold text-gray-400">{i + 1}.</span>
              <span>{plan}</span>
            </div>
          ))}
        </div>
      </div>

      {data.dietPlan && typeof data.dietPlan === 'object' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-xs uppercase tracking-wide text-gray-500 flex items-center gap-2">
              <Utensils className="w-3.5 h-3.5 text-orange-500" />
              Recommended Diet
            </h4>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-[10px] py-0 px-2 border-orange-200 text-orange-700 hover:bg-orange-50"
              onClick={() => onSaveDietPlan && onSaveDietPlan(data.dietPlan)}
            >
              <Save className="w-3 h-3 mr-1" />
              Save Diet Plan
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Breakfast', value: data.dietPlan.breakfast },
              { label: 'Lunch', value: data.dietPlan.lunch },
              { label: 'Dinner', value: data.dietPlan.dinner },
              { label: 'Snack', value: data.dietPlan.snack }
            ].map((meal, idx) => (
              <div key={idx} className="bg-orange-50/50 p-2 rounded border border-orange-100/50">
                <div className="text-[10px] font-bold text-orange-600 uppercase mb-0.5">{meal.label}</div>
                <div className="text-xs text-gray-700 leading-tight">{meal.value || 'None recommended'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {safeArray(data.tips).slice(0, 3).map((tip, i) => (
            <span key={i} className="text-[10px] bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded border border-yellow-100">
              {tip}
            </span>
          ))}
        </div>

        <Button
          size="sm"
          className={skincareType === 'ayurvedic' ? "bg-green-600 hover:bg-green-700 h-8 text-xs" : "bg-blue-600 hover:bg-blue-700 h-8 text-xs"}
          onClick={() => {
            const newPlan = {
              id: Date.now().toString(),
              title: `${skincareType === 'ayurvedic' ? 'Ayurvedic' : 'Dermatologist'} Skincare Plan`,
              type: skincareType,
              routine: safeArray(data.plans),
              products: safeArray(data.products),
              tips: safeArray(data.tips),
              startDate: new Date(),
              completedDates: []
            };
            onSavePlan(newPlan);
          }}
        >
          <Leaf className="w-3 h-3 mr-1" />
          Start Plan
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onBackToDashboard}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${skincareType === 'ayurvedic'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}>
                {skincareType === 'ayurvedic' ? (
                  <Leaf className="w-5 h-5 text-white" />
                ) : (
                  <Sparkles className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h2 className="capitalize">{skincareType} Skincare AI</h2>
                <p className="text-sm text-muted-foreground">
                  {skincareType === 'ayurvedic' ? 'Natural & Traditional' : 'Science & Modern'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveAndReturn}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save & Return
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-3xl space-y-4">

          {messages.length === 0 && (
            <Card className="p-6 text-center bg-white/60 backdrop-blur-sm border-0">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${skincareType === 'ayurvedic'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}>
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-2">Welcome to {skincareType} Skincare AI!</h3>
              <p className="text-muted-foreground">
                {skincareType === 'ayurvedic'
                  ? 'Ask me about natural remedies, for example: "I have acne" or "Dry skin care".'
                  : 'Ask me about modern skin treatments, for example: "Anti-aging routine" or "Oily skin products".'
                }
              </p>
            </Card>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'user'
                  ? 'bg-gray-600'
                  : skincareType === 'ayurvedic'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex flex-col w-full">
                  <Card className={`p-4 ${message.type === 'user'
                    ? 'bg-gray-600 text-white border-0'
                    : 'bg-white/80 backdrop-blur-sm border-0'
                    }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                    <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-gray-300' : 'text-muted-foreground'
                      }`}>
                      {toDateObj(message.timestamp)?.toLocaleTimeString() || ''}
                    </p>
                  </Card>

                  {/* Render Structured Response if available */}
                  {message.structuredResponse && (
                    <StructuredResponseCard data={message.structuredResponse} />
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${skincareType === 'ayurvedic'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  }`}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <Card className="p-4 bg-white/80 backdrop-blur-sm border-0">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Consulting {skincareType} knowledge base...
                  </div>
                </Card>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
        <div className="container mx-auto max-w-3xl">
          <div className="flex gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask about acne, dry skin, oily skin, aging...`}
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className={skincareType === 'ayurvedic'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
              }
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
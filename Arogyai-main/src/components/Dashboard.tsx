import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { UserProfile, SkincareType } from './SkincareApp';
import { Sparkles, Leaf, MessageCircle, History, User, Edit } from 'lucide-react';

interface DashboardProps {
  userProfile: UserProfile | null;
  onStartChat: (type: SkincareType) => void;
  onViewHistory: () => void;
  onEditProfile: () => void;
}

export function Dashboard({ userProfile, onStartChat, onViewHistory, onEditProfile }: DashboardProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="mb-2">Welcome back, {userProfile?.name}</h1>
            <p className="text-muted-foreground">Choose your skincare approach to get started</p>
          </div>
          <Button 
            variant="outline" 
            onClick={onEditProfile}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Summary */}
        <Card className="p-4 bg-white/60 backdrop-blur-sm border-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">Skin Type:</span>
                <Badge variant="secondary" className="capitalize">{userProfile?.skinType}</Badge>
              </div>
              {userProfile?.concerns && userProfile.concerns.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Concerns:</span>
                  {userProfile.concerns.map((concern) => (
                    <Badge key={concern} variant="outline" className="text-xs">
                      {concern}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Skincare Options */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Generic Skincare */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="mb-3 text-blue-800">Generic Skincare AI</h2>
            <p className="text-blue-700 mb-4">
              Get science-based recommendations using modern dermatology research. Perfect for evidence-based skincare routines.
            </p>
            <div className="space-y-2 text-sm text-blue-600">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Modern product recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Scientific ingredient analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Dermatologist-approved advice</span>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => onStartChat('generic')}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Start Generic Chat
          </Button>
        </Card>

        {/* Ayurvedic Skincare */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h2 className="mb-3 text-green-800">Ayurvedic Skincare AI</h2>
            <p className="text-green-700 mb-4">
              Discover natural remedies and holistic approaches based on ancient Ayurvedic wisdom and traditional practices.
            </p>
            <div className="space-y-2 text-sm text-green-600">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Natural ingredient recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Holistic lifestyle guidance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Traditional remedy suggestions</span>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => onStartChat('ayurvedic')}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Start Ayurvedic Chat
          </Button>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-0">
        <h3 className="mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={onViewHistory}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            View Chat History
          </Button>
          <Button 
            variant="outline" 
            onClick={onEditProfile}
            className="flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Update Profile
          </Button>
        </div>
      </Card>
    </div>
  );
}
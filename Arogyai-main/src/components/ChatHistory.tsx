import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { SavedChat } from './SkincareApp';
import { ArrowLeft, MessageCircle, Trash2, Sparkles, Leaf } from 'lucide-react';

interface ChatHistoryProps {
  savedChats: SavedChat[];
  onLoadChat: (chat: SavedChat) => void;
  onBackToDashboard: () => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatHistory({ savedChats, onLoadChat, onBackToDashboard, onDeleteChat }: ChatHistoryProps) {
  const formatDate = (date: any) => {
    const d = date && date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessagePreview = (messages: any[]) => {
    const lastUserMessage = messages.filter(m => m.type === 'user').pop();
    return lastUserMessage?.message || 'No messages yet';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={onBackToDashboard}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="mb-1">Chat History</h1>
          <p className="text-muted-foreground">View and resume your saved conversations</p>
        </div>
      </div>

      {/* Chat List */}
      {savedChats.length === 0 ? (
        <Card className="p-12 text-center bg-white/60 backdrop-blur-sm border-0">
          <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="mb-2">No Saved Chats</h3>
          <p className="text-muted-foreground mb-6">
            Start a conversation and save it to see your chat history here.
          </p>
          <Button onClick={onBackToDashboard}>
            Go to Dashboard
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedChats.map((chat) => (
            <Card key={chat.id} className="p-6 bg-white/60 backdrop-blur-sm border-0 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      chat.skincareType === 'ayurvedic' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}>
                      {chat.skincareType === 'ayurvedic' ? (
                        <Leaf className="w-5 h-5 text-white" />
                      ) : (
                        <Sparkles className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="mb-1">{chat.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`capitalize ${
                            chat.skincareType === 'ayurvedic' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {chat.skincareType}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {chat.messages.length} messages
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    Last message: "{getMessagePreview(chat.messages)}"
                  </p>
                  
                  <p className="text-xs text-muted-foreground">
                    Last updated: {formatDate(chat.lastUpdated)}
                  </p>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    onClick={() => onLoadChat(chat)}
                    size="sm"
                    className={chat.skincareType === 'ayurvedic' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                    }
                  >
                    Resume Chat
                  </Button>
                  <Button
                    onClick={() => onDeleteChat(chat.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
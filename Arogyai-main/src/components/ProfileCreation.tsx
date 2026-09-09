import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { UserProfile } from './SkincareApp';
import { User } from 'lucide-react';

interface ProfileCreationProps {
  onProfileCreated: (profile: UserProfile) => void;
  existingProfile?: UserProfile | null;
}

export function ProfileCreation({ onProfileCreated, existingProfile }: ProfileCreationProps) {
  const [name, setName] = useState(existingProfile?.name || '');
  const [skinType, setSkinType] = useState(existingProfile?.skinType || '');
  const [concerns, setConcerns] = useState<string[]>(existingProfile?.concerns || []);
  const [preferences, setPreferences] = useState(existingProfile?.preferences || '');

  const handleConcernChange = (concern: string, checked: boolean) => {
    if (checked) {
      setConcerns(prev => [...prev, concern]);
    } else {
      setConcerns(prev => prev.filter(c => c !== concern));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && skinType) {
      onProfileCreated({
        name,
        skinType,
        concerns,
        preferences
      });
    }
  };

  const skinConcerns = [
    'Acne',
    'Dryness',
    'Oiliness',
    'Dark Spots',
    'Fine Lines',
    'Redness',
    'Sensitivity',
    'Large Pores',
    'Dullness',
    'Uneven Tone'
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center mr-4">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="mb-1">Create Your Profile</h1>
            <p className="text-muted-foreground">Tell us about your skin to get personalized recommendations</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <Label htmlFor="skin-type">Skin Type</Label>
            <Select value={skinType} onValueChange={setSkinType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select your skin type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="oily">Oily</SelectItem>
                <SelectItem value="dry">Dry</SelectItem>
                <SelectItem value="combination">Combination</SelectItem>
                <SelectItem value="sensitive">Sensitive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Skin Concerns (Select all that apply)</Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {skinConcerns.map((concern) => (
                <div key={concern} className="flex items-center space-x-2">
                  <Checkbox
                    id={concern}
                    checked={concerns.includes(concern)}
                    onCheckedChange={(checked) => handleConcernChange(concern, checked as boolean)}
                  />
                  <Label htmlFor={concern} className="text-sm">{concern}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="preferences">Additional Preferences (Optional)</Label>
            <Textarea
              id="preferences"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="Any specific preferences, allergies, or additional information..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            disabled={!name || !skinType}
          >
            {existingProfile ? 'Update Profile' : 'Create Profile'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
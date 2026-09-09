import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { HealthProfile } from './EnhancedSkinHealthApp';
import { auth } from '../lib/firebase';
import { Heart, ArrowLeft, User, Calendar, Stethoscope, Shield } from 'lucide-react';

interface HealthProfileCreationProps {
  onProfileCreated: (profile: HealthProfile) => Promise<void> | void;
  existingProfile?: HealthProfile | null;
  isLoading?: boolean;
  onBack?: () => void;
}

export function HealthProfileCreation({ onProfileCreated, existingProfile, isLoading = false, onBack }: HealthProfileCreationProps) {
  const [name, setName] = useState(
    existingProfile?.name ||
    auth.currentUser?.displayName ||
    (auth.currentUser?.email ? auth.currentUser.email.split('@')[0] : '') ||
    ''
  );
  const [age, setAge] = useState<number | ''>(
    existingProfile?.age !== undefined && existingProfile?.age !== null ? existingProfile.age : ''
  );
  const [skinType, setSkinType] = useState(existingProfile?.skinType || '');
  const [concerns, setConcerns] = useState<string[]>(existingProfile?.concerns || []);
  const [medicalHistory, setMedicalHistory] = useState<string[]>(existingProfile?.medicalHistory || []);
  const [allergies, setAllergies] = useState<string[]>(existingProfile?.allergies || []);
  const [lifestyle, setLifestyle] = useState(existingProfile?.lifestyle || '');
  const [currentMedications, setCurrentMedications] = useState<string[]>(existingProfile?.currentMedications || []);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamically update fields if existingProfile arrives after mount
  useEffect(() => {
    if (existingProfile) {
      if (existingProfile.name) setName(existingProfile.name);
      if (existingProfile.age !== undefined && existingProfile.age !== null) setAge(existingProfile.age);
      if (existingProfile.skinType) setSkinType(existingProfile.skinType);
      if (existingProfile.concerns) setConcerns(existingProfile.concerns);
      if (existingProfile.medicalHistory) setMedicalHistory(existingProfile.medicalHistory);
      if (existingProfile.allergies) setAllergies(existingProfile.allergies);
      if (existingProfile.lifestyle) setLifestyle(existingProfile.lifestyle);
      if (existingProfile.currentMedications) setCurrentMedications(existingProfile.currentMedications);
    }
  }, [existingProfile]);

  const handleConcernChange = (concern: string, checked: boolean) => {
    if (checked) {
      setConcerns(prev => [...prev, concern]);
    } else {
      setConcerns(prev => prev.filter(c => c !== concern));
    }
  };

  const handleMedicalHistoryChange = (condition: string, checked: boolean) => {
    if (checked) {
      setMedicalHistory(prev => [...prev, condition]);
    } else {
      setMedicalHistory(prev => prev.filter(c => c !== condition));
    }
  };

  const handleAllergyChange = (allergy: string, checked: boolean) => {
    if (checked) {
      setAllergies(prev => [...prev, allergy]);
    } else {
      setAllergies(prev => prev.filter(a => a !== allergy));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Explicit validation with clear user feedback
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (age === '' || Number(age) < 13 || Number(age) > 120) {
      setErrorMessage('Please enter a valid age (13-120).');
      return;
    }
    if (!skinType) {
      setErrorMessage('Please select your primary skin type.');
      return;
    }

    setIsSaving(true);
    try {
      await onProfileCreated({
        name: name.trim(),
        age: Number(age),
        skinType,
        concerns,
        medicalHistory,
        allergies,
        lifestyle,
        currentMedications
      });
    } catch (err: any) {
      console.error("Error saving health profile:", err);
      setErrorMessage(err?.message || "Failed to save health profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const skinConcerns = [
    'Acne', 'Eczema', 'Psoriasis', 'Rosacea', 'Melasma', 'Dark Spots', 
    'Fine Lines', 'Wrinkles', 'Dryness', 'Oiliness', 'Sensitivity', 
    'Large Pores', 'Blackheads', 'Redness', 'Dullness', 'Uneven Tone'
  ];

  const medicalConditions = [
    'Diabetes', 'Hypertension', 'Thyroid Disorders', 'Autoimmune Conditions',
    'Hormonal Imbalances', 'Previous Skin Cancer', 'Chronic Inflammation',
    'Digestive Issues', 'Stress/Anxiety', 'Sleep Disorders'
  ];

  const commonAllergies = [
    'Fragrances', 'Preservatives', 'Sulfates', 'Parabens', 'Nickel',
    'Latex', 'Certain Foods', 'Pollen', 'Dust Mites', 'Pet Dander'
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-4xl flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl border-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        )}
        <div className="flex items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center mr-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="mb-1">{existingProfile ? 'Edit Health Profile' : 'Complete Health Profile'}</h1>
            <p className="text-muted-foreground">Comprehensive information for personalized skin health care</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-blue-700">Basic Information</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age === '' ? '' : age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Enter your age"
                  min="13"
                  max="120"
                  required
                />
              </div>
            </div>
          </div>

          {/* Skin Information */}
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-green-700">Skin Information</h3>
            </div>
            
            <div className="mb-6">
              <Label htmlFor="skin-type">Primary Skin Type</Label>
              <Select value={skinType} onValueChange={setSkinType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your primary skin type" />
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
              <Label>Current Skin Concerns</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
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
          </div>

          {/* Medical History */}
          <div className="bg-red-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Stethoscope className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="text-red-700">Medical History</h3>
            </div>
            
            <div className="mb-6">
              <Label>Relevant Medical Conditions</Label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {medicalConditions.map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition}
                      checked={medicalHistory.includes(condition)}
                      onCheckedChange={(checked) => handleMedicalHistoryChange(condition, checked as boolean)}
                    />
                    <Label htmlFor={condition} className="text-sm">{condition}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Known Allergies</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {commonAllergies.map((allergy) => (
                  <div key={allergy} className="flex items-center space-x-2">
                    <Checkbox
                      id={allergy}
                      checked={allergies.includes(allergy)}
                      onCheckedChange={(checked) => handleAllergyChange(allergy, checked as boolean)}
                    />
                    <Label htmlFor={allergy} className="text-sm">{allergy}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lifestyle & Additional Info */}
          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-purple-700">Lifestyle & Additional Information</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="lifestyle">Lifestyle Factors</Label>
                <Textarea
                  id="lifestyle"
                  value={lifestyle}
                  onChange={(e) => setLifestyle(e.target.value)}
                  placeholder="Diet habits, exercise routine, stress levels, sleep patterns, sun exposure, smoking/drinking habits..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="medications">Current Medications/Supplements</Label>
                <Textarea
                  id="medications"
                  value={currentMedications.join(', ')}
                  onChange={(e) => setCurrentMedications(e.target.value.split(',').map(m => m.trim()).filter(m => m))}
                  placeholder="List any current medications, supplements, or treatments you're using..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Privacy Notice:</strong> All health information is encrypted and stored securely. 
              This information will only be used to provide personalized skin health recommendations and will never be shared with third parties.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white py-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSaving}
          >
            {isSaving 
              ? (existingProfile ? 'Updating Health Profile...' : 'Creating Health Profile...') 
              : (existingProfile ? 'Update Health Profile' : 'Create Health Profile')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
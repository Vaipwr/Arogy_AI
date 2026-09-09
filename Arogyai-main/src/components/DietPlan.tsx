import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { HealthProfile, DetectedCondition } from './EnhancedSkinHealthApp';
import { 
  ArrowLeft, Utensils, Apple, Coffee, Droplets, 
  CheckCircle, X, Calendar, Clock, Info, Sparkles
} from 'lucide-react';
import { 
  generateWeeklyMealPlans, 
  generateAvoidFoods, 
  generateSkinBenefits, 
  generateActiveDietPlan 
} from '../utils/dietPlanGenerator';

interface DietPlanProps {
  healthProfile: HealthProfile | null;
  detectedConditions: DetectedCondition[];
  activeDietPlan?: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
  };
  dietProgress: Record<string, string[]>;
  onToggleMeal: (date: string, mealId: string) => void;
  onBack: () => void;
}

interface NutritionTip {
  title: string;
  description: string;
  icon: React.ReactNode;
  foods: string[];
}

export function DietPlan({ 
  healthProfile, 
  detectedConditions, 
  activeDietPlan,
  dietProgress, 
  onToggleMeal, 
  onBack 
}: DietPlanProps) {
  const [selectedDay, setSelectedDay] = useState('monday');

  const primaryCondition = detectedConditions && detectedConditions.length > 0 ? detectedConditions[0] : null;
  const conditionName = primaryCondition?.condition || primaryCondition?.name || healthProfile?.concerns?.[0] || 'General Skin Health';

  const mealPlans = useMemo(() => generateWeeklyMealPlans(conditionName), [conditionName]);
  const avoidFoods = useMemo(() => generateAvoidFoods(conditionName), [conditionName]);
  const skinBenefits = useMemo(() => generateSkinBenefits(conditionName), [conditionName]);
  const currentPlan = activeDietPlan || (primaryCondition ? generateActiveDietPlan(conditionName) : null);

  const nutritionTips: NutritionTip[] = [
    {
      title: 'Anti-Inflammatory Foods',
      description: 'Reduce inflammation and promote healing',
      icon: <Apple className="w-5 h-5 text-green-600" />,
      foods: ['Salmon', 'Blueberries', 'Spinach', 'Walnuts', 'Turmeric', 'Green tea']
    },
    {
      title: 'Hydration Focus',
      description: 'Maintain skin moisture from within',
      icon: <Droplets className="w-5 h-5 text-blue-600" />,
      foods: ['Water', 'Cucumber', 'Watermelon', 'Coconut water', 'Herbal teas']
    },
    {
      title: 'Antioxidant Rich',
      description: 'Protect against free radical damage',
      icon: <Coffee className="w-5 h-5 text-purple-600" />,
      foods: ['Dark chocolate', 'Berries', 'Green tea', 'Pomegranate', 'Artichokes']
    }
  ];

  const weekDays = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'breakfast': return '🌅';
      case 'lunch': return '🌞';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={onBack} size="sm">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="mb-1">Personalized Diet Plan</h1>
          <p className="text-muted-foreground">
            Nutrition plan tailored for {healthProfile?.name || 'your'} skin health goals {primaryCondition ? `• ${conditionName}` : ''}
          </p>
        </div>
      </div>

      <Tabs defaultValue="meal-plan" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="meal-plan">Meal Plan</TabsTrigger>
          <TabsTrigger value="nutrition-tips">Nutrition Tips</TabsTrigger>
          <TabsTrigger value="avoid-foods">Foods to Avoid</TabsTrigger>
        </TabsList>

        {/* Meal Plan Tab */}
        <TabsContent value="meal-plan" className="space-y-6">
          
          {/* Active AI Diet Plan */}
          {currentPlan ? (
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 border-2 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-orange-600" />
                  <h2 className="text-orange-900">AI-Powered Nutrition Plan</h2>
                </div>
                <Badge className="bg-orange-100 text-orange-700">Personalized</Badge>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'ai-breakfast', label: 'Breakfast', value: currentPlan.breakfast, icon: '🌅' },
                  { id: 'ai-lunch', label: 'Lunch', value: currentPlan.lunch, icon: '🌞' },
                  { id: 'ai-dinner', label: 'Dinner', value: currentPlan.dinner, icon: '🌙' },
                  { id: 'ai-snack', label: 'Snack', value: currentPlan.snack, icon: '🍎' }
                ].map((meal) => {
                  const today = new Date().toISOString().split('T')[0];
                  const isCompleted = dietProgress[today]?.includes(meal.id);
                  return (
                    <div key={meal.id} className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-2xl">{meal.icon}</span>
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={() => onToggleMeal(today, meal.id)}
                          className="w-5 h-5 rounded border-orange-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                        />
                      </div>
                      <h4 className="font-bold text-orange-800 text-sm mb-1">{meal.label}</h4>
                      <p className="text-xs text-gray-700 leading-relaxed">{meal.value}</p>
                      {isCompleted && (
                        <div className="absolute inset-0 bg-green-500/10 pointer-events-none flex items-center justify-center">
                          <CheckCircle className="w-12 h-12 text-green-500/20" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center bg-white/70 border-dashed border-2 border-slate-200 rounded-2xl">
              <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 text-base mb-1">No Active Diet Plan Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Perform an AI skin analysis or request a custom nutrition routine in AI chat to generate your tailored meal plan.
              </p>
            </Card>
          )}
          
          {/* Condition-Based Recommendations */}
          {detectedConditions.length > 0 && (
            <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <Utensils className="w-6 h-6 text-green-600" />
                <h2 className="text-green-800">Condition-Specific Nutrition</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {detectedConditions.slice(0, 2).map((condition) => (
                  <div key={condition.id} className="p-4 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{condition.name}</h4>
                      <Badge variant="secondary">{condition.severity}</Badge>
                    </div>
                    <div className="space-y-2">
                      {condition.dietRecommendations.slice(0, 2).map((rec, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Weekly Calendar */}
          <Card className="p-6">
            <h3 className="mb-4">Weekly Meal Schedule</h3>
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {weekDays.map((day) => (
                <Button
                  key={day.key}
                  variant={selectedDay === day.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDay(day.key)}
                  className="min-w-[60px]"
                >
                  {day.label}
                </Button>
              ))}
            </div>

            {/* Daily Meals */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                const meal = mealPlans[selectedDay]?.find(m => m.category === mealType);
                const isCompleted = meal && dietProgress[selectedDay]?.includes(meal.id);
                
                return (
                  <Card key={mealType} className={`p-4 transition-all ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(mealType)}</span>
                        <h4 className="capitalize font-medium">{mealType}</h4>
                      </div>
                      {meal && (
                        <input
                          type="checkbox"
                          checked={!!isCompleted}
                          onChange={() => onToggleMeal(selectedDay, meal.id)}
                          className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                        />
                      )}
                    </div>
                    
                    {meal ? (
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium">{meal.name}</h5>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {meal.calories} cal
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {meal.prepTime} min
                          </span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
                            {meal.skinBenefit}
                          </p>
                          <div className="text-xs">
                            <strong>Ingredients:</strong>
                            <p className="mt-1">{meal.ingredients.slice(0, 3).join(', ')}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Meal plan coming soon...
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Daily Totals */}
            {mealPlans[selectedDay] && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="mb-2">Daily Nutritional Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {mealPlans[selectedDay].reduce((sum, meal) => sum + meal.calories, 0)}
                    </div>
                    <div className="text-muted-foreground">Total Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {mealPlans[selectedDay].length}
                    </div>
                    <div className="text-muted-foreground">Planned Meals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {Math.round(mealPlans[selectedDay].reduce((sum, meal) => sum + meal.prepTime, 0) / mealPlans[selectedDay].length)}
                    </div>
                    <div className="text-muted-foreground">Avg Prep Time</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Nutrition Tips Tab */}
        <TabsContent value="nutrition-tips" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {nutritionTips.map((tip, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  {tip.icon}
                  <h3>{tip.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{tip.description}</p>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recommended Foods:</h4>
                  <div className="flex flex-wrap gap-1">
                    {tip.foods.map((food, foodIndex) => (
                      <Badge key={foodIndex} variant="secondary" className="text-xs">
                        {food}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Skin-Specific Benefits */}
          <Card className="p-6 bg-gradient-to-r from-orange-50 to-pink-50 border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-6 h-6 text-orange-600" />
              <h3 className="text-orange-800">Skin Health Benefits</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="mb-3 font-semibold text-gray-900">{skinBenefits.conditionTitle}</h4>
                <ul className="space-y-2 text-sm">
                  {skinBenefits.conditionPoints.map((pt, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-3 font-semibold text-gray-900">{skinBenefits.generalTitle}</h4>
                <ul className="space-y-2 text-sm">
                  {skinBenefits.generalPoints.map((pt, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Foods to Avoid Tab */}
        <TabsContent value="avoid-foods" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <X className="w-6 h-6 text-red-600" />
              <h3 className="text-red-800">Foods That May Worsen Skin Conditions</h3>
            </div>
            
            <div className="space-y-4">
              {avoidFoods.map((food, index) => (
                <div key={index} className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800 mb-1">{food.name}</h4>
                      <p className="text-sm text-red-700">{food.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Important Note</span>
              </div>
              <p className="text-sm text-blue-700">
                Food sensitivities vary by individual. Keep a food diary to identify your personal triggers. 
                Consult with a healthcare provider or nutritionist for personalized dietary advice.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
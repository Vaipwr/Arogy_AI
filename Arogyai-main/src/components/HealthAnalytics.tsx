import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { HealthMetric, DetectedCondition } from './EnhancedSkinHealthApp';
import { ActivePlan } from './SkincareApp';
import { 
  ArrowLeft, TrendingUp, TrendingDown, BarChart3, 
  Award, Activity, Heart,
  Camera, Clock, CheckCircle, Sparkles, Utensils, Bell,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface HealthAnalyticsProps {
  healthMetrics: HealthMetric[];
  detectedConditions: DetectedCondition[];
  activePlans: ActivePlan[];
  dietProgress: Record<string, string[]>;
  reminderProgress: Record<string, string[]>;
  onBack: () => void;
}

const toDateObj = (val: any) => {
  if (!val) return null;
  if (typeof val.toDate === 'function') return val.toDate();
  return new Date(val);
};

export function HealthAnalytics({ 
  healthMetrics = [], 
  detectedConditions = [], 
  activePlans = [], 
  dietProgress = {}, 
  reminderProgress = {}, 
  onBack 
}: HealthAnalyticsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  // Use real metrics from props, sorted by date
  const sortedMetrics = [...healthMetrics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Minimal data needed for charts, or fallback to empty if nothing logged
  const hasDietProgress = Object.keys(dietProgress).some(date => dietProgress[date].length > 0);
  const hasReminderProgress = Object.keys(reminderProgress).some(date => reminderProgress[date].length > 0);
  const hasMetrics = sortedMetrics.length > 0 || hasDietProgress || hasReminderProgress || detectedConditions.length > 0 || activePlans.length > 0;
  
  const displayData = hasMetrics ? sortedMetrics : [];

  // Dynamic Condition Distribution
  const conditionCounts = detectedConditions.reduce((acc, curr) => {
    const key = curr.condition || curr.name;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
  const conditionDistribution = Object.entries(conditionCounts).map(([name, count], index) => ({
    name,
    value: count,
    color: COLORS[index % COLORS.length]
  }));

  // Dynamic Treatment Progress
  const treatmentProgress = activePlans.map(plan => {
    // Assuming a 30-day target for now if no specific goal is set
    const progress = Math.min(Math.round((plan.completedDates?.length || 0) / 30 * 100), 100);
    return {
      treatment: plan.title,
      progress: progress || 5, // Show a tiny bit of progress if just started
      trend: (plan.completedDates?.length || 0) > 0 ? 'up' : 'stable'
    };
  });

  // Dynamic Milestones based on real activity
  const milestones = [
    {
      id: 'first-scan',
      title: 'First Scan',
      description: 'Used AI detection for the first time',
      achieved: detectedConditions.length > 0,
      date: detectedConditions.length > 0 ? toDateObj(detectedConditions[0].detectedAt)?.toISOString().split('T')[0] : null,
      icon: Camera,
      color: 'text-blue-600'
    },
    {
      id: 'plan-starter',
      title: 'Plan Starter',
      description: 'Saved a personalized treatment plan',
      achieved: activePlans.length > 0,
      date: activePlans.length > 0 ? toDateObj(activePlans[0].startDate)?.toISOString().split('T')[0] : null,
      icon: Sparkles,
      color: 'text-purple-600'
    },
    {
      id: 'consistent-logger',
      title: 'Health Logger',
      description: 'Recorded your first health metric',
      achieved: healthMetrics.length > 0,
      date: healthMetrics[0]?.date || null,
      icon: Activity,
      color: 'text-green-600'
    }
  ];

  const hasScores = sortedMetrics.length > 0;
  const currentScore = hasScores ? sortedMetrics[sortedMetrics.length - 1]?.skinHealthScore : null;
  const previousScore = sortedMetrics.length >= 2 ? sortedMetrics[sortedMetrics.length - 2]?.skinHealthScore : (currentScore || 0);
  const scoreChange = (currentScore || 0) - previousScore;
  const scoreChangePercent = previousScore !== 0 ? ((scoreChange / previousScore) * 100).toFixed(1) : '0';

  const timeframes = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="mb-1">Health Analytics</h1>
            <p className="text-muted-foreground">Track your skin health journey and progress</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {timeframes.map((timeframe) => (
            <Button
              key={timeframe.value}
              variant={selectedTimeframe === timeframe.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe.value)}
            >
              {timeframe.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold mb-1">{currentScore !== null ? currentScore : '--'}</div>
          <div className="text-sm text-muted-foreground mb-2">Skin Health Score</div>
          {currentScore !== null ? (
            <div className={`flex items-center justify-center gap-1 text-sm ${scoreChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {scoreChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {scoreChangePercent}% from last week
            </div>
          ) : (
            <div className="text-xs text-slate-400">No score recorded yet</div>
          )}
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-3xl font-bold mb-1">
            {sortedMetrics[sortedMetrics.length - 1]?.treatmentAdherence || 0}%
          </div>
          <div className="text-sm text-muted-foreground mb-2">Treatment Adherence</div>
          <div className="text-sm text-green-600">Active tracking</div>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Activity className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-3xl font-bold mb-1">{detectedConditions.length}</div>
          <div className="text-sm text-muted-foreground mb-2">Tracked Conditions</div>
          <div className="text-sm text-gray-600">Active monitoring</div>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-3xl font-bold mb-1">{milestones.filter(m => m.achieved).length}</div>
          <div className="text-sm text-muted-foreground mb-2">Milestones Achieved</div>
          <div className="text-sm text-purple-600">Great progress!</div>
        </Card>
      </div>

      {!hasMetrics ? (
        <Card className="p-12 text-center bg-white/50 border-dashed border-2">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Tracking Data Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Your health analytics will appear here once you start logging your daily status or complete items in your diet and reminders plan.
          </p>
          <Button onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Dashboard to Log
          </Button>
        </Card>
      ) : (
        <Tabs 
          defaultValue={
            sortedMetrics.length > 0 ? "trends" : 
            (detectedConditions.length > 0 ? "conditions" : 
            (hasDietProgress || hasReminderProgress ? "adherence" : "trends"))
          } 
          className="space-y-6"
        >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Health Trends</TabsTrigger>
          <TabsTrigger value="adherence">Adherence</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        {/* Health Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Skin Health Score Trends</h3>
            {sortedMetrics.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sortedMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="skinHealthScore" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Skin Health Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="treatmentAdherence" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Treatment Adherence"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="symptomSeverity" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Symptom Severity"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-muted-foreground bg-gray-50 rounded-lg border border-dashed text-center p-8">
                <Activity className="w-12 h-12 mb-4 opacity-20" />
                <p className="max-w-xs">Log your first health metric from the dashboard to see your skin health trend charts.</p>
              </div>
            )}
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="mb-4">Weekly Progress</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayData.slice(-4)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="skinHealthScore" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4">Improvement Areas</h3>
              <div className="space-y-4">
                {healthMetrics.length > 1 ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-green-800">Tracking Consistency</h4>
                        <p className="text-sm text-green-600">You are building a great habit</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-blue-800">Skin Analysis</h4>
                        <p className="text-sm text-blue-600">Active monitoring in progress</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    More data needed to identify improvement areas. Keep logging!
                  </p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Adherence Tab */}
        <TabsContent value="adherence" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Utensils className="w-5 h-5 text-orange-600" />
                <h3>Diet Plan Adherence</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Today', value: ((dietProgress[new Date().toISOString().split('T')[0]]?.length || 0) / 4) * 100 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value: number) => [`${Math.round(value)}%`, 'Adherence']} />
                    <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-center text-muted-foreground mt-4">
                Completed {dietProgress[new Date().toISOString().split('T')[0]]?.length || 0} of 4 planned meals today
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3>Reminder Completion</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Done', value: reminderProgress[new Date().toISOString().split('T')[0]]?.length || 0 },
                        { name: 'Pending', value: Math.max(0, 3 - (reminderProgress[new Date().toISOString().split('T')[0]]?.length || 0)) }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#e2e8f0" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-center text-muted-foreground mt-4">
                {reminderProgress[new Date().toISOString().split('T')[0]]?.length || 0} reminders completed today
              </p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="mb-6">Weekly Adherence Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">Total Consistency</h4>
                    <p className="text-sm text-blue-700">Combined routine performance</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    (((dietProgress[new Date().toISOString().split('T')[0]]?.length || 0) / 4) * 100 +
                    ((reminderProgress[new Date().toISOString().split('T')[0]]?.length || 0) / 3) * 100) / 2
                  ) || 0}%
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Conditions Tab */}
        <TabsContent value="conditions" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="mb-4">Condition Distribution</h3>
              <div className="h-64">
                {conditionDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={conditionDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {conditionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-4">
                    <AlertTriangle className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">No conditions detected yet. Use AI Analysis to get started.</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4">Recent Detections</h3>
              <div className="space-y-4">
                {detectedConditions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No conditions detected yet
                  </p>
                ) : (
                  detectedConditions.slice(0, 3).map((condition) => (
                    <div key={condition.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{condition.condition || condition.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={condition.severity === 'severe' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {condition.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {toDateObj(condition.detectedAt)?.toLocaleDateString() || ''}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {Math.round(condition.confidence)}% confidence
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Treatments Tab */}
        <TabsContent value="treatments" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Treatment Progress</h3>
            <div className="space-y-6">
              {treatmentProgress.map((treatment, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{treatment.treatment}</h4>
                      {getTrendIcon(treatment.trend)}
                    </div>
                    <span className="text-sm font-medium">{treatment.progress}%</span>
                  </div>
                  <Progress value={treatment.progress} className="h-2" />
                </div>
              ))}
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="mb-4">Treatment Adherence</h3>
              <div className="text-center">
                {activePlans.length > 0 ? (
                  <>
                    <div className="text-4xl font-bold text-green-600 mb-2">
                       {Math.round(((activePlans[0].completedDates?.length || 0) / 7) * 100)}%
                    </div>
                    <p className="text-muted-foreground mb-4">Past 7 days</p>
                    <div className="flex justify-center gap-1">
                      {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (6 - dayOffset));
                        const dateStr = date.toISOString().split('T')[0];
                        const isCompleted = activePlans[0].completedDates?.includes(dateStr);
                        return (
                          <div 
                            key={dayOffset}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                              isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}
                            title={dateStr}
                          >
                            {isCompleted ? <CheckCircle className="w-4 h-4" /> : date.getDate()}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Daily routine completion</p>
                  </>
                ) : (
                   <p className="text-sm text-muted-foreground py-8">No active plans to track adherence.</p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4">Upcoming Goals</h3>
              <div className="space-y-3">
                {activePlans.length > 0 ? (
                   <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                     <Clock className="w-4 h-4 text-blue-600" />
                     <div>
                       <p className="text-sm font-medium">Next Routine: {activePlans[0].title}</p>
                       <p className="text-xs text-muted-foreground">Keep it up!</p>
                     </div>
                   </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-8 text-center">Save a plan from the chatbot to see goals here.</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="mb-6">Achieved Milestones</h3>
              <div className="space-y-4">
                {milestones.filter(m => m.achieved).map((milestone) => {
                  const IconComponent = milestone.icon;
                  return (
                    <div key={milestone.id} className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center ${milestone.color}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800">{milestone.title}</h4>
                        <p className="text-sm text-green-600">{milestone.description}</p>
                        <p className="text-xs text-green-500 mt-1">
                          Achieved on {milestone.date && new Date(milestone.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-6">Upcoming Goals</h3>
              <div className="space-y-4">
                {milestones.filter(m => !m.achieved).map((milestone) => {
                  const IconComponent = milestone.icon;
                  return (
                    <div key={milestone.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center ${milestone.color}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-medium">{milestone.title}</h4>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        <p className="text-xs text-blue-600 mt-1">In progress...</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="mb-4">Progress Overview</h3>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {milestones.filter(m => m.achieved).length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {milestones.filter(m => !m.achieved).length}
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {Math.round((milestones.filter(m => m.achieved).length / milestones.length) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}
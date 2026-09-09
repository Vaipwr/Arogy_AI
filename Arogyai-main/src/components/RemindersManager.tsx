import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Reminder } from './EnhancedSkinHealthApp';
import { 
  ArrowLeft, Bell, Plus, Clock, Calendar, Pill, Camera,
  Utensils, Activity, Edit, Trash2, CheckCircle2, AlertCircle,
  Filter
} from 'lucide-react';

interface RemindersManagerProps {
  reminders?: Reminder[];
  reminderProgress?: Record<string, string[]>;
  onToggleReminder: (date: string, reminderId: string) => void;
  onUpdateReminders: (reminders: Reminder[]) => void;
  onBack: () => void;
}

// Robust date normalization helper
export const toDateObj = (val: any): Date | null => {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val.toDate === 'function') {
    try {
      const d = val.toDate();
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }
  if (typeof val.seconds === 'number') return new Date(val.seconds * 1000);
  if (typeof val._seconds === 'number') return new Date(val._seconds * 1000);
  if (typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

export function RemindersManager({ 
  reminders = [], 
  reminderProgress = {}, 
  onToggleReminder, 
  onUpdateReminders, 
  onBack 
}: RemindersManagerProps) {
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'overdue' | 'completed'>('all');

  const [formState, setFormState] = useState<Partial<Reminder>>({
    title: '',
    description: '',
    type: 'medication',
    time: '09:00',
    frequency: 'daily',
    isActive: true
  });

  const reminderTypes = [
    { value: 'medication', label: 'Medication', icon: Pill, color: 'bg-rose-100 text-rose-700 border-rose-200' },
    { value: 'treatment', label: 'Treatment', icon: Activity, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'checkup', label: 'Check-up', icon: Calendar, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { value: 'photo', label: 'Progress Photo', icon: Camera, color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { value: 'diet', label: 'Diet/Meal', icon: Utensils, color: 'bg-amber-100 text-amber-700 border-amber-200' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const safeReminders = Array.isArray(reminders) ? reminders : [];
  const todayKey = new Date().toISOString().split('T')[0];

  const calculateNextDue = (time: string, frequency: Reminder['frequency']): Date => {
    const now = new Date();
    const parts = (time || '09:00').split(':').map(Number);
    const hours = isNaN(parts[0]) ? 9 : parts[0];
    const minutes = isNaN(parts[1]) ? 0 : parts[1];

    const nextDue = new Date();
    nextDue.setHours(hours, minutes, 0, 0);

    if (nextDue.getTime() <= now.getTime()) {
      switch (frequency) {
        case 'daily':
          nextDue.setDate(nextDue.getDate() + 1);
          break;
        case 'weekly':
          nextDue.setDate(nextDue.getDate() + 7);
          break;
        case 'monthly':
          nextDue.setMonth(nextDue.getMonth() + 1);
          break;
        default:
          nextDue.setDate(nextDue.getDate() + 1);
          break;
      }
    }

    return nextDue;
  };

  const isOverdue = (reminder: Reminder): boolean => {
    if (!reminder.isActive) return false;
    const due = toDateObj(reminder.nextDue);
    if (!due) return false;
    return due.getTime() < Date.now();
  };

  const isDueToday = (reminder: Reminder): boolean => {
    const due = toDateObj(reminder.nextDue);
    if (!due) return false;
    const today = new Date();
    return (
      due.getDate() === today.getDate() &&
      due.getMonth() === today.getMonth() &&
      due.getFullYear() === today.getFullYear()
    );
  };

  const isCompletedToday = (reminderId: string): boolean => {
    const todayList = reminderProgress?.[todayKey] || [];
    return todayList.includes(reminderId);
  };

  const formatDueDateTime = (val: any): string => {
    const d = toDateObj(val);
    if (!d) return 'Not scheduled';
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDueDate = (val: any): string => {
    const d = toDateObj(val);
    if (!d) return 'Not scheduled';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleOpenAddDialog = () => {
    setEditingReminder(null);
    setFormState({
      title: '',
      description: '',
      type: 'medication',
      time: '09:00',
      frequency: 'daily',
      isActive: true
    });
    setIsAddingReminder(true);
  };

  const handleOpenEditDialog = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormState({
      title: reminder.title,
      description: reminder.description,
      type: reminder.type,
      time: reminder.time,
      frequency: reminder.frequency,
      isActive: reminder.isActive
    });
    setIsAddingReminder(true);
  };

  const handleSaveReminder = () => {
    if (!formState.title || !formState.time || !formState.frequency || !formState.type) {
      return;
    }

    const nextDue = calculateNextDue(formState.time, formState.frequency as Reminder['frequency']);

    if (editingReminder) {
      const updated = safeReminders.map(r => {
        if (r.id === editingReminder.id) {
          return {
            ...r,
            title: formState.title!,
            description: formState.description || '',
            type: formState.type as Reminder['type'],
            time: formState.time!,
            frequency: formState.frequency as Reminder['frequency'],
            isActive: formState.isActive ?? true,
            nextDue: nextDue
          };
        }
        return r;
      });
      onUpdateReminders(updated);
    } else {
      const newReminder: Reminder = {
        id: `rem-${Date.now()}`,
        title: formState.title,
        description: formState.description || '',
        type: formState.type as Reminder['type'],
        time: formState.time,
        frequency: formState.frequency as Reminder['frequency'],
        isActive: formState.isActive ?? true,
        nextDue: nextDue
      };
      onUpdateReminders([...safeReminders, newReminder]);
    }

    setIsAddingReminder(false);
    setEditingReminder(null);
  };

  const handleDeleteReminder = (reminderId: string) => {
    const filtered = safeReminders.filter(r => r.id !== reminderId);
    onUpdateReminders(filtered);
  };

  const toggleReminderStatus = (reminderId: string) => {
    const updated = safeReminders.map(r => 
      r.id === reminderId ? { ...r, isActive: !r.isActive } : r
    );
    onUpdateReminders(updated);
  };

  const getTypeIcon = (type: string) => {
    const found = reminderTypes.find(t => t.value === type);
    return found ? found.icon : Bell;
  };

  const getTypeColor = (type: string) => {
    const found = reminderTypes.find(t => t.value === type);
    return found ? found.color : 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const activeReminders = safeReminders.filter(r => r.isActive);
  const overdueReminders = activeReminders.filter(isOverdue);
  const todayReminders = activeReminders.filter(isDueToday);
  const completedTodayReminders = safeReminders.filter(r => isCompletedToday(r.id));

  const filteredReminders = safeReminders.filter(r => {
    if (activeTab === 'today') return isDueToday(r);
    if (activeTab === 'overdue') return isOverdue(r);
    if (activeTab === 'completed') return isCompletedToday(r.id);
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} size="sm" className="rounded-xl border-slate-200 hover:bg-slate-100">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Dashboard
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Smart Reminders</h1>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold text-xs">
                ArogyAI
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Keep your skin wellness routines, medications, and treatments on schedule
            </p>
          </div>
        </div>
        
        <Dialog open={isAddingReminder} onOpenChange={setIsAddingReminder}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleOpenAddDialog}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium shadow-sm rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">
                {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="reminder-title" className="text-xs font-semibold text-slate-700">Reminder Title</Label>
                <Input
                  id="reminder-title"
                  value={formState.title || ''}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="e.g., Apply Neem & Turmeric paste"
                  className="mt-1.5 rounded-xl border-slate-200"
                />
              </div>
              
              <div>
                <Label htmlFor="reminder-type" className="text-xs font-semibold text-slate-700">Type</Label>
                <Select 
                  value={formState.type || 'medication'} 
                  onValueChange={(value) => setFormState({ ...formState, type: value as Reminder['type'] })}
                >
                  <SelectTrigger className="mt-1.5 rounded-xl border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {reminderTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="reminder-time" className="text-xs font-semibold text-slate-700">Time</Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={formState.time || '09:00'}
                    onChange={(e) => setFormState({ ...formState, time: e.target.value })}
                    className="mt-1.5 rounded-xl border-slate-200"
                  />
                </div>
                <div>
                  <Label htmlFor="reminder-frequency" className="text-xs font-semibold text-slate-700">Frequency</Label>
                  <Select 
                    value={formState.frequency || 'daily'} 
                    onValueChange={(value) => setFormState({ ...formState, frequency: value as Reminder['frequency'] })}
                  >
                    <SelectTrigger className="mt-1.5 rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {frequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value} className="rounded-lg">
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="reminder-description" className="text-xs font-semibold text-slate-700">Description (Optional)</Label>
                <Textarea
                  id="reminder-description"
                  value={formState.description || ''}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Instructions or dosage details..."
                  rows={3}
                  className="mt-1.5 rounded-xl border-slate-200"
                />
              </div>
              
              <Button 
                onClick={handleSaveReminder} 
                disabled={!formState.title?.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl py-2.5 mt-2 shadow-xs cursor-pointer"
              >
                {editingReminder ? 'Save Changes' : 'Create Reminder'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 bg-white/90 border-slate-200/80 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{activeReminders.length}</div>
              <div className="text-xs text-slate-500 font-medium">Active Reminders</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-white/90 border-slate-200/80 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-amber-600">{todayReminders.length}</div>
              <div className="text-xs text-slate-500 font-medium">Due Today</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-white/90 border-slate-200/80 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-rose-600">{overdueReminders.length}</div>
              <div className="text-xs text-slate-500 font-medium">Overdue</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/90 border-slate-200/80 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-emerald-600">{completedTodayReminders.length}</div>
              <div className="text-xs text-slate-500 font-medium">Completed Today</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Urgent / Overdue Card */}
      {overdueReminders.length > 0 && (
        <Card className="p-5 mb-6 bg-rose-50/70 border-rose-200 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-rose-900 text-sm">Action Needed: Overdue Reminders</h3>
            </div>
            <Badge variant="destructive" className="rounded-full px-2.5 py-0.5 text-xs">
              {overdueReminders.length} Pending
            </Badge>
          </div>
          <div className="space-y-2.5">
            {overdueReminders.map((reminder) => {
              const IconComponent = getTypeIcon(reminder.type);
              const isDone = isCompletedToday(reminder.id);
              return (
                <div key={reminder.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-rose-100 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${getTypeColor(reminder.type)} shrink-0`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm truncate">{reminder.title}</h4>
                      <p className="text-xs text-slate-400">
                        Due: {formatDueDateTime(reminder.nextDue)} • {reminder.frequency}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant={isDone ? "default" : "outline"} 
                    className={isDone ? "bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs" : "border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs cursor-pointer"}
                    onClick={() => onToggleReminder(todayKey, reminder.id)}
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : null}
                    {isDone ? "Done" : "Mark Done"}
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Main Reminders Card with Filter Tabs */}
      <Card className="p-6 bg-white border-slate-200/80 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Routine Schedule</h2>
            <p className="text-xs text-slate-500 mt-0.5">Filter by due date or status to stay aligned with your regimen</p>
          </div>
          
          {/* Tab Filters */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'all' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({safeReminders.length})
            </button>
            <button
              onClick={() => setActiveTab('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'today' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today ({todayReminders.length})
            </button>
            <button
              onClick={() => setActiveTab('overdue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overdue' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overdue ({overdueReminders.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'completed' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({completedTodayReminders.length})
            </button>
          </div>
        </div>
        
        {filteredReminders.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {activeTab === 'all' ? 'No reminders created yet' : `No ${activeTab} reminders`}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              {activeTab === 'all' 
                ? 'Create your first reminder to easily manage your daily ayurvedic or dermatological routines.'
                : `You have no reminders matching the "${activeTab}" filter right now.`}
            </p>
            {activeTab === 'all' ? (
              <Button 
                onClick={handleOpenAddDialog} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Reminder
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('all')} 
                className="rounded-xl border-slate-200"
              >
                <Filter className="w-4 h-4 mr-2" />
                View All Reminders
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReminders.map((reminder) => {
              const IconComponent = getTypeIcon(reminder.type);
              const isOverdueReminder = isOverdue(reminder);
              const isTodayReminder = isDueToday(reminder);
              const isDone = isCompletedToday(reminder.id);
              
              return (
                <div 
                  key={reminder.id} 
                  className={`p-4 rounded-xl border transition-all duration-150 ${
                    isDone 
                      ? 'bg-slate-50/80 border-slate-200/60 opacity-80' 
                      : isOverdueReminder 
                        ? 'bg-rose-50/40 border-rose-200/80 hover:border-rose-300' 
                        : isTodayReminder 
                          ? 'bg-amber-50/30 border-amber-200/80 hover:border-amber-300' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      {/* Completion Checkbox */}
                      <button
                        type="button"
                        onClick={() => onToggleReminder(todayKey, reminder.id)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5 sm:mt-0 ${
                          isDone 
                            ? 'bg-emerald-600 border-emerald-600 text-white' 
                            : 'border-slate-300 hover:border-emerald-500 bg-white'
                        }`}
                        title={isDone ? "Mark as not done" : "Mark as completed today"}
                      >
                        {isDone && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${getTypeColor(reminder.type)} shrink-0`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className={`font-semibold text-sm ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {reminder.title}
                          </h4>
                          <Badge variant="outline" className="text-[11px] uppercase tracking-wide border-slate-200 bg-slate-50 text-slate-600">
                            {reminder.frequency}
                          </Badge>
                          {isOverdueReminder && !isDone && (
                            <Badge variant="destructive" className="text-[11px]">Overdue</Badge>
                          )}
                          {isTodayReminder && !isDone && (
                            <Badge className="text-[11px] bg-amber-100 text-amber-800 border-amber-200 font-medium">Due Today</Badge>
                          )}
                          {isDone && (
                            <Badge className="text-[11px] bg-emerald-100 text-emerald-800 border-emerald-200 font-medium">Completed</Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {reminder.time}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Calendar className="w-3.5 h-3.5" />
                            Next: {formatDueDate(reminder.nextDue)}
                          </span>
                        </div>
                        
                        {reminder.description && (
                          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{reminder.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <div className="flex items-center gap-1.5 mr-2">
                        <span className="text-xs text-slate-400 font-medium">
                          {reminder.isActive ? 'Active' : 'Paused'}
                        </span>
                        <Switch
                          checked={reminder.isActive}
                          onCheckedChange={() => toggleReminderStatus(reminder.id)}
                          aria-label="Toggle reminder active status"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8 rounded-lg border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                        onClick={() => handleOpenEditDialog(reminder)}
                        title="Edit Reminder"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8 rounded-lg border-slate-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                        onClick={() => handleDeleteReminder(reminder.id)}
                        title="Delete Reminder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
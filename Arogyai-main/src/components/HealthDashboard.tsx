import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import {
  HealthProfile,
  DetectedCondition,
  Reminder,
  HealthMetric,
  Screen,
  SkincareType,
} from './EnhancedSkinHealthApp';
import { ActivePlan } from './SkincareApp';
import { ActivityRecord } from '../lib/firestore_db';
import { auth } from '../lib/firebase';
import {
  LayoutDashboard,
  Camera,
  Utensils,
  Bell,
  BarChart3,
  User,
  Sparkles,
  Leaf,
  ArrowRight,
  ShieldCheck,
  Menu,
  ChevronRight,
  TrendingUp,
  HeartPulse,
  Info,
  Activity,
  LogOut,
} from 'lucide-react';

export interface HealthDashboardProps {
  healthProfile: HealthProfile | null;
  userName?: string;
  detectedConditions: DetectedCondition[];
  reminders: Reminder[];
  healthMetrics: HealthMetric[];
  onNavigate: (screen: Screen) => void;
  onSelectSkincareType: (type: SkincareType) => void;
  activePlans?: ActivePlan[];
  dietProgress?: Record<string, string[]>;
  reminderProgress?: Record<string, string[]>;
  userActivities?: ActivityRecord[];
  onToggleReminder?: (date: string, reminderId: string) => void;
  onLogout?: () => void;
}

import { NotificationBell } from './NotificationBell';

const toDateObj = (val: any): Date | null => {
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
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

export function HealthDashboard({
  healthProfile,
  userName,
  detectedConditions = [],
  reminders = [],
  healthMetrics = [],
  onNavigate,
  onSelectSkincareType,
  activePlans = [],
  dietProgress: _dietProgress = {},
  reminderProgress: _reminderProgress = {},
  userActivities = [],
  onToggleReminder,
  onLogout,
}: HealthDashboardProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Real reminder calculations (no fake stats)
  const safeReminders = Array.isArray(reminders) ? reminders : [];
  const activeReminders = safeReminders.filter((r) => r.isActive);
  const todayDateStr = new Date().toDateString();
  const todayReminders = activeReminders.filter((r) => {
    const due = toDateObj(r.nextDue);
    return due ? due.toDateString() === todayDateStr : false;
  });

  // Latest skin detection (if any)
  const latestCondition = detectedConditions.length > 0 ? detectedConditions[0] : null;

  // Real user activity aggregation from actual prop data and Firestore activity stream
  const realActivities: Array<{
    id: string;
    type: 'scan' | 'plan';
    title: string;
    subtitle: string;
    date: Date;
  }> = [];

  // 1. From Firestore / persistent activity collection
  (userActivities || []).forEach((act) => {
    const date = toDateObj(act.createdAt) || new Date();
    realActivities.push({
      id: act.id,
      type: act.type === 'skin_analysis' ? 'scan' : 'plan',
      title: act.title,
      subtitle: act.description,
      date,
    });
  });

  // 2. From detected conditions
  detectedConditions.forEach((c) => {
    const date = toDateObj(c.detectedAt || c.dateTime) || new Date();
    realActivities.push({
      id: `scan-${c.id}`,
      type: 'scan',
      title: `AI Analysis: ${c.formattedName || c.condition || c.name}`,
      subtitle: `${Math.round(c.confidence || 90)}% confidence • ${c.severity || 'mild'} severity`,
      date,
    });
  });

  // 3. From active plans
  activePlans.forEach((p) => {
    const date = toDateObj(p.startDate) || new Date();
    realActivities.push({
      id: `plan-${p.id}`,
      type: 'plan',
      title: `Saved Regimen: ${p.title}`,
      subtitle: `${p.type === 'ayurvedic' ? 'Ayurvedic' : 'Dermatology'} Routine`,
      date,
    });
  });

  // Deduplicate and sort activities newest first
  const seenIds = new Set<string>();
  const uniqueActivities = realActivities.filter((a) => {
    if (seenIds.has(a.id)) return false;
    seenIds.add(a.id);
    return true;
  });

  uniqueActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
  const displayedActivities = uniqueActivities.slice(0, 4);

  // User name resolution with multi-layer fallback:
  // 1. healthProfile.name
  // 2. userName prop
  // 3. auth.currentUser.displayName
  // 4. auth.currentUser.email prefix
  // 5. 'User'
  const resolvedDisplayName =
    healthProfile?.name?.trim() ||
    userName?.trim() ||
    auth.currentUser?.displayName?.trim() ||
    (auth.currentUser?.email ? auth.currentUser.email.split('@')[0] : '') ||
    'User';

  // Helper for user initials
  const userInitials = resolvedDisplayName !== 'User'
    ? resolvedDisplayName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  // Navigation items definition
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: true,
      onClick: () => onNavigate('dashboard'),
    },
    {
      id: 'detection',
      label: 'Skin Analysis',
      icon: Camera,
      active: false,
      onClick: () => onNavigate('detection'),
    },
    {
      id: 'chat-generic',
      label: 'Dermatology AI',
      icon: Sparkles,
      active: false,
      onClick: () => {
        onSelectSkincareType('generic');
        onNavigate('chat');
      },
    },
    {
      id: 'chat-ayurvedic',
      label: 'Ayurvedic AI',
      icon: Leaf,
      active: false,
      onClick: () => {
        onSelectSkincareType('ayurvedic');
        onNavigate('chat');
      },
    },
    {
      id: 'diet',
      label: 'Diet & Nutrition',
      icon: Utensils,
      active: false,
      onClick: () => onNavigate('diet'),
    },
    {
      id: 'analytics',
      label: 'Health Analytics',
      icon: BarChart3,
      active: false,
      onClick: () => onNavigate('analytics'),
    },
    {
      id: 'reminders',
      label: 'Daily Reminders',
      icon: Bell,
      active: false,
      badge: todayReminders.length > 0 ? String(todayReminders.length) : undefined,
      onClick: () => onNavigate('reminders'),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col lg:flex-row">
      {/* ================================================================= */}
      {/* DESKTOP SIDEBAR                                                   */}
      {/* ================================================================= */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900 block leading-tight">
              ArogyAI
            </span>
            <span className="text-[11px] font-medium text-emerald-600 tracking-wide uppercase">
              Clinical & Ayurveda
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-5 flex-1 space-y-1">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Main Navigation
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-3 border-emerald-600 pl-[9px]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      item.active ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-800 text-[11px] px-1.5 py-0 h-5"
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
          <div
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-xs transition cursor-pointer border border-transparent hover:border-slate-200/60"
          >
            <Avatar className="w-9 h-9 border border-emerald-200">
              <AvatarFallback className="bg-emerald-100 text-emerald-800 font-semibold text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {resolvedDisplayName !== 'User' ? resolvedDisplayName : (healthProfile?.name || 'Guest User')}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {healthProfile?.skinType ? `${healthProfile.skinType} Skin` : 'Set Skin Type'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* ================================================================= */}
      {/* MOBILE TOPBAR & DRAWER                                            */}
      {/* ================================================================= */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-600">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 flex flex-col bg-white">
              <SheetHeader className="p-5 border-b border-slate-100 flex flex-row items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <SheetTitle className="text-base font-bold text-slate-900 leading-tight">
                    ArogyAI
                  </SheetTitle>
                  <span className="text-[10px] font-medium text-emerald-600 tracking-wide uppercase">
                    Clinical & Ayurveda
                  </span>
                </div>
              </SheetHeader>

              <div className="p-3 flex-1 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        item.onClick();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                        item.active
                          ? 'bg-emerald-50 text-emerald-800 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-800 text-[11px]"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-4 border-t border-slate-100 space-y-2">
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('profile');
                  }}
                  variant="outline"
                  className="w-full text-xs"
                >
                  <User className="w-3.5 h-3.5 mr-2" />
                  Edit Profile
                </Button>
                {onLogout && (
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    variant="ghost"
                    className="w-full text-xs text-red-600 hover:bg-red-50 hover:text-red-700 justify-center"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    Sign Out
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <HeartPulse className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-base">ArogyAI</span>
          </div>
        </div>

        {/* Mobile Topbar Right: Notification Bell + Avatar */}
        <div className="flex items-center gap-2">
          <NotificationBell
            reminders={reminders}
            detectedConditions={detectedConditions}
            reminderProgress={_reminderProgress}
            onToggleReminder={onToggleReminder}
            onNavigate={onNavigate}
            variant="ghost"
            size="icon"
            className="rounded-full text-slate-600 hover:text-slate-900"
          />

          <Avatar
            onClick={() => onNavigate('profile')}
            className="w-8 h-8 cursor-pointer border border-slate-200"
          >
            <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* ================================================================= */}
      {/* MAIN DASHBOARD CONTENT AREA                                       */}
      {/* ================================================================= */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* =============================================================== */}
        {/* 1. HEADER SECTION (Greeting, Subtitle, Bell, Profile)           */}
        {/* =============================================================== */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Welcome back, {resolvedDisplayName}
              </h1>
              {healthProfile?.skinType && (
                <Badge
                  variant="outline"
                  className="hidden md:inline-flex bg-emerald-50 text-emerald-800 border-emerald-200 font-medium text-xs capitalize"
                >
                  {healthProfile.skinType} Skin
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Your holistic skin wellness and clinical AI dermatology companion
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {/* Desktop Notification Bell */}
            <NotificationBell
              id="dashboard-reminder-bell"
              reminders={reminders}
              detectedConditions={detectedConditions}
              reminderProgress={_reminderProgress}
              onToggleReminder={onToggleReminder}
              onNavigate={onNavigate}
              variant="outline"
              size="icon"
              className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 bg-white shadow-2xs cursor-pointer"
            />

            {/* Profile Action */}
            <Button
              variant="outline"
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 rounded-xl border-slate-200 bg-white hover:bg-slate-50 shadow-2xs text-slate-700 text-xs font-medium px-3.5"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              Edit Profile
            </Button>

            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="flex items-center gap-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs px-2.5 rounded-xl transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            )}
          </div>
        </section>

        {/* =============================================================== */}
        {/* 2. KEY OVERVIEW CARDS (Compact 4-Card Grid - Zero Fake Stats)   */}
        {/* =============================================================== */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Latest Skin Analysis */}
          <Card
            onClick={() => onNavigate('detection')}
            className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                Latest Analysis
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-bold text-slate-900 truncate">
              {latestCondition
                ? latestCondition.formattedName || latestCondition.condition || latestCondition.name
                : 'No Scans Yet'}
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate">
              {latestCondition
                ? `${Math.round(latestCondition.confidence)}% confidence`
                : 'Start your first scan'}
            </p>
          </Card>

          {/* Card 2: Saved Plans */}
          <Card
            onClick={() => onNavigate('diet')}
            className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                Saved Regimens
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-bold text-slate-900">
              {activePlans.length} Active {activePlans.length === 1 ? 'Plan' : 'Plans'}
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate">
              {activePlans.length > 0 ? 'Clinical & Ayurvedic care' : 'No active plans saved'}
            </p>
          </Card>

          {/* Card 3: Today's Tasks & Reminders */}
          <Card
            onClick={() => onNavigate('reminders')}
            className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                Today's Tasks
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Bell className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-bold text-slate-900">
              {todayReminders.length} Scheduled
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate">
              {todayReminders.length > 0
                ? `${activeReminders.length} total active reminders`
                : 'All caught up today'}
            </p>
          </Card>

          {/* Card 4: Tracked Skin Concerns */}
          <Card
            onClick={() => onNavigate('profile')}
            className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                Skin Concerns
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-bold text-slate-900">
              {healthProfile?.concerns?.length || 0} Tracked
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate">
              {healthProfile?.concerns && healthProfile.concerns.length > 0
                ? healthProfile.concerns.slice(0, 2).join(', ')
                : 'Configure in profile'}
            </p>
          </Card>
        </section>

        {/* =============================================================== */}
        {/* 3. LATEST SKIN ANALYSIS + CURRENT PLAN (Primary Row)            */}
        {/* =============================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Latest Skin Analysis (7 Cols) */}
          <Card className="lg:col-span-7 p-6 bg-white border border-slate-200/80 rounded-2xl shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">
                      Latest Skin Analysis
                    </h2>
                    <p className="text-xs text-slate-400">
                      AI-assisted dermatological evaluation
                    </p>
                  </div>
                </div>

                {latestCondition && (
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize font-medium ${
                      latestCondition.severity === 'severe'
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : latestCondition.severity === 'moderate'
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {latestCondition.severity} Severity
                  </Badge>
                )}
              </div>

              {latestCondition ? (
                /* Has real analysis data */
                <div className="space-y-4 pt-1">
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Detected Condition
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                        {latestCondition.formattedName ||
                          latestCondition.condition ||
                          latestCondition.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Recorded on{' '}
                        {toDateObj(latestCondition.detectedAt || latestCondition.dateTime)?.toLocaleDateString() ||
                          'Recent scan'}
                      </p>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className="text-xs text-slate-400 block font-medium">Confidence</span>
                      <span className="text-2xl font-black text-emerald-700">
                        {Math.round(latestCondition.confidence)}%
                      </span>
                    </div>
                  </div>

                  {/* Confidence meter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Model Confidence Index</span>
                      <span className="font-semibold text-slate-700">
                        {Math.round(latestCondition.confidence)}%
                      </span>
                    </div>
                    <Progress
                      value={latestCondition.confidence}
                      className="h-2 bg-slate-100"
                    />
                  </div>

                  {/* Description / Notice */}
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                    {latestCondition.description ||
                      latestCondition.medicalNotice ||
                      'AI diagnostic assessment generated across dermatological classification models. Follow recommended regimens or consult a physician for clinical confirmation.'}
                  </p>
                </div>
              ) : (
                /* Empty state - zero scans */
                <div className="py-10 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      No skin analysis yet
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      Upload a high-resolution photo of your skin concern. Our AI model classifies conditions across 22 categories and provides both modern and Ayurvedic advice.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {latestCondition
                  ? `${detectedConditions.length} total ${
                      detectedConditions.length === 1 ? 'record' : 'records'
                    } saved`
                  : 'FastAPI AI engine ready'}
              </span>
              <Button
                onClick={() => onNavigate('detection')}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium px-4"
              >
                <Camera className="w-3.5 h-3.5 mr-1.5" />
                {latestCondition ? 'New Analysis' : 'Start First Analysis'}
              </Button>
            </div>
          </Card>

          {/* Right: Current Plan (5 Cols) */}
          <Card className="lg:col-span-5 p-6 bg-white border border-slate-200/80 rounded-2xl shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">
                      Your Regimens & Plans
                    </h2>
                    <p className="text-xs text-slate-400">
                      Active skincare routines & diet plans
                    </p>
                  </div>
                </div>
              </div>

              {activePlans.length > 0 ? (
                /* Has saved plans */
                <div className="space-y-3">
                  {activePlans.slice(0, 2).map((plan) => (
                    <div
                      key={plan.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className={
                            plan.type === 'ayurvedic'
                              ? 'bg-emerald-100 text-emerald-800 text-[10px]'
                              : 'bg-blue-100 text-blue-800 text-[10px]'
                          }
                        >
                          {plan.type === 'ayurvedic' ? 'Ayurvedic Regimen' : 'Clinical Regimen'}
                        </Badge>
                        <span className="text-[11px] text-slate-400">
                          {toDateObj(plan.startDate)?.toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800">{plan.title}</h4>
                      {plan.routine && plan.routine.length > 0 && (
                        <div className="text-xs text-slate-500 space-y-1 pt-1">
                          {plan.routine.slice(0, 2).map((step, idx) => (
                            <p key={idx} className="flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              {step}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty state - zero plans */
                <div className="py-10 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      No saved plans yet
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                      Consult our AI assistants or complete an analysis to generate customized skincare regimens and personalized diet plans.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
              <Button
                onClick={() => {
                  onSelectSkincareType('ayurvedic');
                  onNavigate('chat');
                }}
                variant="outline"
                size="sm"
                className="flex-1 text-xs border-emerald-200 text-emerald-800 hover:bg-emerald-50"
              >
                <Leaf className="w-3 h-3 mr-1" />
                Ayurvedic
              </Button>
              <Button
                onClick={() => {
                  onSelectSkincareType('generic');
                  onNavigate('chat');
                }}
                variant="outline"
                size="sm"
                className="flex-1 text-xs border-blue-200 text-blue-800 hover:bg-blue-50"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Dermatology
              </Button>
            </div>
          </Card>
        </section>

        {/* =============================================================== */}
        {/* 4. SKIN PROGRESS SECTION (Clean UI Structure - No Fake Stats)    */}
        {/* =============================================================== */}
        <section>
          <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Skin Progress & Recovery Pathway
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Longitudinal tracking of routine adherence, treatment milestones, and symptom management
                </p>
              </div>

              <Button
                onClick={() => onNavigate('analytics')}
                variant="outline"
                size="sm"
                className="text-xs rounded-lg self-start sm:self-auto border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                View Full Analytics
              </Button>
            </div>

            {healthMetrics && healthMetrics.length > 0 ? (
              /* Real metrics exist */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 block mb-1">
                    Treatment Adherence
                  </span>
                  <div className="text-2xl font-bold text-slate-900 mb-2">
                    {healthMetrics[healthMetrics.length - 1].treatmentAdherence}%
                  </div>
                  <Progress
                    value={healthMetrics[healthMetrics.length - 1].treatmentAdherence}
                    className="h-2"
                  />
                </div>
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 block mb-1">
                    Overall Wellness
                  </span>
                  <div className="text-2xl font-bold text-slate-900 mb-2">
                    {healthMetrics[healthMetrics.length - 1].overallWellness}%
                  </div>
                  <Progress
                    value={healthMetrics[healthMetrics.length - 1].overallWellness}
                    className="h-2"
                  />
                </div>
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 block mb-1">
                    Health Records Logged
                  </span>
                  <div className="text-2xl font-bold text-slate-900 mb-2">
                    {healthMetrics.length}
                  </div>
                  <p className="text-xs text-slate-400">Total historical logs recorded</p>
                </div>
              </div>
            ) : (
              /* Clean Empty State with Structured Guidance */
              <div className="py-6 px-4 bg-slate-50/60 rounded-xl border border-slate-100">
                <div className="text-center max-w-md mx-auto mb-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-100/60 text-emerald-700 flex items-center justify-center mx-auto mb-2.5">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    No progress metrics recorded yet
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Your health score and adherence charts will automatically appear here once you log treatment check-ins and follow-up scans.
                  </p>
                </div>

                {/* 3 Step Roadmap */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white rounded-lg border border-slate-100 text-xs space-y-1">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <h4 className="font-semibold text-slate-800 pt-1">Baseline Assessment</h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Complete an initial AI photo scan to register your condition benchmark.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-lg border border-slate-100 text-xs space-y-1">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <h4 className="font-semibold text-slate-800 pt-1">Adherence & Routine</h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Follow daily treatment applications and your customized diet plan.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-lg border border-slate-100 text-xs space-y-1">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <h4 className="font-semibold text-slate-800 pt-1">Milestone Logs</h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Record symptoms in Health Analytics to track improvement over time.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </section>

        {/* =============================================================== */}
        {/* 5. RECENT DETECTIONS + RECENT ACTIVITY (Secondary Row)          */}
        {/* =============================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Detections */}
          <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Recent Detections
                  </h3>
                </div>

                {detectedConditions.length > 0 && (
                  <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
                    {detectedConditions.length} Total
                  </Badge>
                )}
              </div>

              {detectedConditions.length > 0 ? (
                <div className="space-y-2.5">
                  {detectedConditions.slice(0, 3).map((condition) => (
                    <div
                      key={condition.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {condition.imageUrl ? (
                          <img
                            src={condition.imageUrl}
                            alt={condition.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-emerald-100/60 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-sm">
                            {condition.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {condition.formattedName || condition.condition || condition.name}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {toDateObj(condition.detectedAt || condition.dateTime)?.toLocaleDateString() || 'Recent'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-emerald-700 block">
                          {Math.round(condition.confidence)}%
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] capitalize px-1.5 py-0 ${
                            condition.severity === 'severe'
                              ? 'bg-red-100 text-red-700'
                              : condition.severity === 'moderate'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {condition.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  <Info className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                  <p className="font-medium text-slate-700">No detection history yet</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Completed analyses will be listed here with severity and confidence tags.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <Button
                onClick={() => onNavigate('detection')}
                variant="ghost"
                size="sm"
                className="w-full text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              >
                <span>Upload image for evaluation</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Recent Activity
                  </h3>
                </div>
              </div>

              {displayedActivities.length > 0 ? (
                <div className="space-y-3">
                  {displayedActivities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-start gap-3 text-xs p-2.5 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                        {act.type === 'scan' ? (
                          <Camera className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-semibold text-slate-800 truncate">{act.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {act.date.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{act.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  <Activity className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                  <p className="font-medium text-slate-700">No recent activity</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Your scans, regimen changes, and reminder updates will appear in this feed.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <Button
                onClick={() => onNavigate('analytics')}
                variant="ghost"
                size="sm"
                className="w-full text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              >
                <span>View health timeline</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </Card>
        </section>

        {/* =============================================================== */}
        {/* 6. QUICK ACTIONS                                                */}
        {/* =============================================================== */}
        <section className="pt-2">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigate('detection')}
              className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-xs text-left transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Camera className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Analyze Skin</p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">AI Photo Scan</p>
            </button>

            <button
              onClick={() => {
                onSelectSkincareType('generic');
                onNavigate('chat');
              }}
              className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-xs text-left transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Clinical AI</p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">Dermatology Chat</p>
            </button>

            <button
              onClick={() => {
                onSelectSkincareType('ayurvedic');
                onNavigate('chat');
              }}
              className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-xs text-left transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Leaf className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Ayurvedic AI</p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">Herbal & Dosha</p>
            </button>

            <button
              onClick={() => onNavigate('diet')}
              className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-xs text-left transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Utensils className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Diet Plans</p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">Personalized Food</p>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
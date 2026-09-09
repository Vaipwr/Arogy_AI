import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Reminder, DetectedCondition } from './EnhancedSkinHealthApp';
import { toDateObj } from './RemindersManager';
import { toast } from 'sonner';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { CollectionsService } from '../lib/firestore_db';
import {
  Bell, CheckCircle2, AlertCircle, Camera, Pill,
  Activity, Utensils, Calendar, Volume2,
  CheckCheck, BellRing, ChevronRight, Loader2, BellOff
} from 'lucide-react';

interface NotificationBellProps {
  reminders?: Reminder[];
  detectedConditions?: DetectedCondition[];
  reminderProgress?: Record<string, string[]>;
  onToggleReminder?: (date: string, reminderId: string) => void;
  onNavigate: (screen: any) => void;
  id?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'outline' | 'ghost';
  className?: string;
}

// Gentle audio chime using Web Audio API
const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Two pleasant tones
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio blocked by browser policy until user gesture
  }
};

export function NotificationBell({
  reminders = [],
  detectedConditions = [],
  reminderProgress = {},
  onToggleReminder,
  onNavigate,
  id,
  size = 'icon',
  variant = 'outline',
  className = ''
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'reminders' | 'scans'>('all');
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  const [currentUser, setCurrentUser] = useState<User | null>(() => auth.currentUser);
  const [firebaseReminders, setFirebaseReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Per-user isolated read IDs
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return new Set<string>();
      const stored = localStorage.getItem(`arogyai_read_notifications_${uid}`);
      return stored ? new Set(JSON.parse(stored)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const todayKey = new Date().toISOString().split('T')[0];

  // Track Firebase auth state and ensure strict user isolation
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const stored = localStorage.getItem(`arogyai_read_notifications_${user.uid}`);
          setReadIds(stored ? new Set(JSON.parse(stored)) : new Set<string>());
        } catch {
          setReadIds(new Set());
        }
      } else {
        setFirebaseReminders([]);
        setReadIds(new Set());
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to real-time Firestore reminders for current user
  useEffect(() => {
    if (!currentUser?.uid) return;
    setIsLoading(true);
    setHasError(false);

    try {
      const unsub = CollectionsService.subscribeToReminders(currentUser.uid, (rems) => {
        setFirebaseReminders(rems || []);
        setIsLoading(false);
      });
      return () => unsub();
    } catch (err) {
      console.warn('[NotificationBell] Firestore subscription notice:', err);
      setHasError(true);
      setIsLoading(false);
    }
  }, [currentUser?.uid]);

  // Click outside and ESC listener to close dropdown panel
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Initialize browser notification permission state
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  // Effective reminders: prioritize prop reminders if supplied, fallback to live Firestore reminders
  const activeReminders = useMemo(() => {
    if (Array.isArray(reminders) && reminders.length > 0) {
      return reminders;
    }
    return firebaseReminders;
  }, [reminders, firebaseReminders]);

  // Check reminders on a periodic ticker to fire browser notifications & toasts when due
  useEffect(() => {
    const checkDueReminders = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      (activeReminders || []).forEach((r) => {
        if (!r.isActive) return;
        const isDone = reminderProgress?.[todayKey]?.includes(r.id);
        if (isDone) return;

        // Check if reminder is scheduled for current minute
        if (r.time === currentTimeStr) {
          const reminderKey = `alerted_${r.id}_${todayKey}_${currentTimeStr}`;
          if (sessionStorage.getItem(reminderKey)) return;
          sessionStorage.setItem(reminderKey, 'true');

          // Trigger toast
          toast.info(`Reminder: ${r.title}`, {
            description: r.description || 'Time for your daily skin health routine.',
            action: onToggleReminder ? {
              label: 'Mark Done',
              onClick: () => onToggleReminder(todayKey, r.id)
            } : undefined
          });

          playNotificationChime();

          // Trigger native browser notification if granted
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`ArogyAI: ${r.title}`, {
                body: r.description || `It's time for your ${r.type} routine.`,
                icon: '/favicon.ico'
              });
            } catch {
              // Notification failed or blocked
            }
          }
        }
      });
    };

    checkDueReminders();
    const interval = setInterval(checkDueReminders, 45000);
    return () => clearInterval(interval);
  }, [activeReminders, reminderProgress, todayKey, onToggleReminder]);

  const isCompletedToday = (reminderId: string) => {
    return !!reminderProgress?.[todayKey]?.includes(reminderId);
  };

  const isDueToday = (reminder: Reminder) => {
    const due = toDateObj(reminder.nextDue);
    if (!due) return false;
    const today = new Date();
    return (
      due.getDate() === today.getDate() &&
      due.getMonth() === today.getMonth() &&
      due.getFullYear() === today.getFullYear()
    );
  };

  const isOverdue = (reminder: Reminder) => {
    if (!reminder.isActive) return false;
    const due = toDateObj(reminder.nextDue);
    if (!due) return false;
    return due.getTime() < Date.now();
  };

  // Compile Reminder Notifications
  const reminderNotifications = useMemo(() => {
    return (activeReminders || [])
      .filter((r) => r.isActive)
      .map((r) => {
        const isDone = isCompletedToday(r.id);
        const overdue = isOverdue(r);
        const dueToday = isDueToday(r);
        const isRead = readIds.has(`reminder-${r.id}`);

        let priority = 2; // normal
        if (overdue && !isDone) priority = 0; // urgent
        else if (dueToday && !isDone) priority = 1; // due today
        else if (isDone) priority = 3; // done

        return {
          id: `reminder-${r.id}`,
          rawId: r.id,
          category: 'reminder' as const,
          title: r.title,
          description: r.description || '',
          subtitle: `${r.time} • ${r.frequency}${r.description ? ` • ${r.description}` : ''}`,
          type: r.type,
          priority,
          isDone,
          overdue,
          dueToday,
          isRead,
          nextDue: r.nextDue
        };
      })
      .sort((a, b) => a.priority - b.priority);
  }, [activeReminders, reminderProgress, readIds]);

  // Compile Scan Results Notifications
  const scanNotifications = useMemo(() => {
    return (detectedConditions || []).slice(0, 5).map((c, idx) => {
      const conditionName = c.name || (c as any).condition || 'Skin Condition';
      const confPercent = c.confidence
        ? Math.round(c.confidence <= 1 ? c.confidence * 100 : c.confidence)
        : null;
      const date = toDateObj((c as any).dateTime || (c as any).detectedAt) || new Date();
      const notifId = `scan-${c.id || idx}`;
      const isRead = readIds.has(notifId);

      return {
        id: notifId,
        rawId: c.id || String(idx),
        category: 'scan' as const,
        title: `Analysis: ${conditionName}`,
        description: c.description || `${confPercent ? `${confPercent}% confidence` : 'Detected'} • ${c.severity || 'Mild'} severity`,
        subtitle: `${confPercent ? `${confPercent}% confidence` : 'Detected'} • ${c.severity || 'Mild'} severity`,
        date,
        severity: c.severity,
        condition: c,
        isRead
      };
    });
  }, [detectedConditions, readIds]);

  // All notifications combined
  const allNotifications = useMemo(() => {
    return [...reminderNotifications, ...scanNotifications];
  }, [reminderNotifications, scanNotifications]);

  // Total pending actionable items
  const pendingCount = useMemo(() => {
    const pendingReminders = reminderNotifications.filter(
      (r) => !r.isDone && (r.overdue || r.dueToday || !r.isRead)
    ).length;

    const unreadScans = scanNotifications.filter(
      (s) => !s.isRead
    ).length;

    return pendingReminders + unreadScans;
  }, [reminderNotifications, scanNotifications]);

  // Mark all notifications as read for current user
  const handleMarkAllAsRead = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newSet = new Set(readIds);
    allNotifications.forEach((item) => newSet.add(item.id));
    setReadIds(newSet);
    if (currentUser?.uid) {
      try {
        localStorage.setItem(`arogyai_read_notifications_${currentUser.uid}`, JSON.stringify(Array.from(newSet)));
      } catch {
        // ignore
      }
    }
    toast.success('All notifications marked as read');
  };

  // Mark single item as read
  const markItemAsRead = (itemId: string) => {
    if (readIds.has(itemId)) return;
    const newSet = new Set(readIds);
    newSet.add(itemId);
    setReadIds(newSet);
    if (currentUser?.uid) {
      try {
        localStorage.setItem(`arogyai_read_notifications_${currentUser.uid}`, JSON.stringify(Array.from(newSet)));
      } catch {
        // ignore
      }
    }
  };

  // Bell button click handler: toggles dropdown panel and plays chime
  const handleBellClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playNotificationChime();
    setIsOpen((prev) => !prev);
  };

  // Request browser notification permission
  const handleEnableBrowserNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Browser Notifications not supported on this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);

      if (permission === 'granted') {
        playNotificationChime();
        toast.success('Desktop notifications enabled!', {
          description: 'You will receive alerts for your skincare routines and treatments.'
        });

        new Notification('ArogyAI Notifications Active', {
          body: 'You will now receive timely alerts for your skin health and treatments.',
          icon: '/favicon.ico'
        });
      } else if (permission === 'denied') {
        toast.error('Notifications blocked by browser settings.', {
          description: 'Please enable notifications for this site in your browser settings.'
        });
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };

  const handleSendTestAlert = () => {
    playNotificationChime();
    toast.info('Test Alert: Daily Neem & Turmeric Treatment', {
      description: 'Scheduled for 09:00 AM • Morning Skincare Regimen'
    });

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('ArogyAI Test Reminder', {
        body: 'This is how your skin health routine alerts will appear on your screen.',
        icon: '/favicon.ico'
      });
    }
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'medication': return Pill;
      case 'treatment': return Activity;
      case 'photo': return Camera;
      case 'diet': return Utensils;
      case 'checkup': return Calendar;
      default: return Bell;
    }
  };

  const getReminderColor = (type: string) => {
    switch (type) {
      case 'medication': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'treatment': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'photo': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'diet': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {/* Bell Button */}
      <Button
        id={id}
        variant={variant}
        size={size}
        className={`relative rounded-xl transition-all cursor-pointer ${className}`}
        aria-label="View Notifications"
        aria-expanded={isOpen}
        onClick={handleBellClick}
      >
        <Bell className="w-4 h-4 text-slate-700" />
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}
      </Button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div
          role="region"
          aria-label="Notifications panel"
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-emerald-50/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">Notifications</h3>
                <p className="text-[11px] text-slate-500">
                  {pendingCount > 0 ? `${pendingCount} actionable items` : 'All caught up!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {pendingCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] text-slate-500 hover:text-emerald-700 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/80 transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Browser Alert Status Banner */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {browserPermission === 'granted'
                  ? 'Desktop alerts active'
                  : 'Desktop alerts paused'}
              </span>
            </div>
            {browserPermission !== 'granted' ? (
              <button
                type="button"
                onClick={handleEnableBrowserNotifications}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
              >
                Enable
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendTestAlert}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Test Alert
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 bg-white">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center ${
                activeTab === 'all'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({allNotifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reminders')}
              className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center ${
                activeTab === 'reminders'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Reminders ({reminderNotifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('scans')}
              className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center ${
                activeTab === 'scans'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Scans ({scanNotifications.length})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto p-3 space-y-2 divide-y-0">
            {/* Loading State */}
            {isLoading && allNotifications.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">
                <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
                <p className="font-semibold">Loading notifications...</p>
              </div>
            )}

            {/* Error State */}
            {hasError && (
              <div className="py-6 text-center text-xs text-amber-700 bg-amber-50/60 rounded-xl p-3 border border-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
                <p className="font-semibold">Unable to load notifications.</p>
                <p className="text-[11px] text-amber-600 mt-0.5">Please check your connection.</p>
              </div>
            )}

            {/* Empty State: All */}
            {!isLoading && activeTab === 'all' && allNotifications.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                <BellOff className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No new notifications</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  You have no pending notifications or reminders.
                </p>
              </div>
            )}

            {/* Empty State: Reminders */}
            {!isLoading && activeTab === 'reminders' && reminderNotifications.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-slate-700">No new notifications</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Create routine reminders in your schedule
                </p>
              </div>
            )}

            {/* Empty State: Scans */}
            {!isLoading && activeTab === 'scans' && scanNotifications.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No new notifications</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Run an AI skin analysis to view findings here
                </p>
              </div>
            )}

            {/* Render Reminders in list */}
            {(activeTab === 'all' || activeTab === 'reminders') &&
              reminderNotifications.map((r) => {
                const Icon = getReminderIcon(r.type);
                const isOverdueItem = r.overdue && !r.isDone;
                const isDueTodayItem = r.dueToday && !r.isDone;
                const isUnread = !r.isRead && !r.isDone;

                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      markItemAsRead(r.id);
                      setIsOpen(false);
                      onNavigate('reminders');
                    }}
                    className={`p-3 rounded-xl border transition-all text-xs flex items-start gap-3 cursor-pointer ${
                      r.isDone
                        ? 'bg-slate-50/70 border-slate-200/60 opacity-70'
                        : isOverdueItem
                          ? 'bg-rose-50/60 border-rose-200'
                          : isDueTodayItem
                            ? 'bg-amber-50/50 border-amber-200'
                            : isUnread
                              ? 'bg-emerald-50/30 border-emerald-200/80 shadow-2xs'
                              : 'bg-white border-slate-200/80 shadow-2xs hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {isUnread && (
                      <span
                        className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2"
                        title="Unread notification"
                      />
                    )}

                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 mt-0.5 ${getReminderColor(
                        r.type
                      )}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p
                          className={`font-semibold ${
                            r.isDone ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {r.title}
                        </p>
                        {isOverdueItem && (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                            Overdue
                          </Badge>
                        )}
                        {isDueTodayItem && (
                          <Badge className="text-[9px] px-1 py-0 h-4 bg-amber-100 text-amber-800 border-amber-200">
                            Due Today
                          </Badge>
                        )}
                        {r.isDone && (
                          <Badge className="text-[9px] px-1 py-0 h-4 bg-emerald-100 text-emerald-800 border-emerald-200">
                            Done
                          </Badge>
                        )}
                      </div>
                      {r.description ? (
                        <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-1">{r.description}</p>
                      ) : null}
                      <p className="text-slate-400 text-[10px] mt-0.5">{r.subtitle}</p>
                    </div>

                    {/* Action button */}
                    {onToggleReminder && (
                      <Button
                        size="sm"
                        variant={r.isDone ? 'outline' : 'default'}
                        className={`h-7 px-2.5 text-[11px] rounded-lg shrink-0 cursor-pointer ${
                          r.isDone
                            ? 'border-slate-200 text-slate-500 hover:bg-slate-100'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-2xs'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          markItemAsRead(r.id);
                          onToggleReminder(todayKey, r.rawId);
                          playNotificationChime();
                          toast.success(
                            r.isDone
                              ? `Marked "${r.title}" as pending`
                              : `Completed "${r.title}" for today!`
                          );
                        }}
                      >
                        {r.isDone ? 'Undo' : 'Done'}
                      </Button>
                    )}
                  </div>
                );
              })}

            {/* Render Scans in list */}
            {(activeTab === 'all' || activeTab === 'scans') &&
              scanNotifications.map((s) => {
                const isUnread = !s.isRead;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      markItemAsRead(s.id);
                      setIsOpen(false);
                      onNavigate('detection');
                    }}
                    className={`p-3 rounded-xl border transition-colors text-xs flex items-start gap-3 cursor-pointer shadow-2xs group ${
                      isUnread
                        ? 'bg-emerald-50/30 border-emerald-200/80 hover:bg-emerald-50/50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {isUnread && (
                      <span
                        className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2"
                        title="Unread scan"
                      />
                    )}
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Camera className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {s.title}
                        </p>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-slate-200">
                          Scan
                        </Badge>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5 truncate">{s.subtitle}</p>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Footer: View all reminders */}
          <div className="p-2.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <Button
              onClick={() => {
                setIsOpen(false);
                onNavigate('reminders');
              }}
              variant="ghost"
              size="sm"
              className="w-full text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/80 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View all reminders</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

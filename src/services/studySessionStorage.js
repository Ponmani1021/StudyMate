import { getTodayDateString, getWeekDays } from '../utils/dateUtils';

const SESSIONS_STORAGE_KEY = 'studymate_study_sessions';
const TIMER_SETTINGS_KEY = 'studymate_timer_settings';

/**
 * Default timer configuration
 */
export const DEFAULT_TIMER_SETTINGS = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  dailyGoalMinutes: 120, // Default 2 hours daily study goal
};

const DAILY_GOAL_STORAGE_KEY = 'studymate_daily_goal_minutes';

/**
 * Retrieve daily study goal in minutes from localStorage
 */
export const getDailyStudyGoal = () => {
  try {
    const raw = localStorage.getItem(DAILY_GOAL_STORAGE_KEY);
    if (raw) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    const timerSettings = getTimerSettings();
    if (timerSettings?.dailyGoalMinutes && timerSettings.dailyGoalMinutes > 0) {
      return timerSettings.dailyGoalMinutes;
    }
    return DEFAULT_TIMER_SETTINGS.dailyGoalMinutes;
  } catch (err) {
    console.error('Error reading daily study goal:', err);
    return DEFAULT_TIMER_SETTINGS.dailyGoalMinutes;
  }
};

/**
 * Save daily study goal in minutes to localStorage
 */
export const saveDailyStudyGoal = (minutes) => {
  try {
    const safeMinutes = Math.max(1, Math.min(1440, Number(minutes) || 120));
    localStorage.setItem(DAILY_GOAL_STORAGE_KEY, String(safeMinutes));
    // Keep timer settings in sync
    saveTimerSettings({ dailyGoalMinutes: safeMinutes });
    return safeMinutes;
  } catch (err) {
    console.error('Error saving daily study goal:', err);
    return DEFAULT_TIMER_SETTINGS.dailyGoalMinutes;
  }
};

/**
 * Generate a unique ID for a study session
 */
export const generateSessionRecordId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
};

/**
 * Retrieve all recorded study sessions from localStorage
 */
export const getStoredStudySessions = () => {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Sort latest first
      return parsed.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    }
    return [];
  } catch (err) {
    console.error('Error reading study sessions from localStorage:', err);
    return [];
  }
};

/**
 * Save array of study sessions to localStorage
 */
export const saveStudySessionsToStorage = (sessions) => {
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    window.dispatchEvent(new Event('studymate_data_updated'));
    return true;
  } catch (err) {
    console.error('Error saving study sessions to localStorage:', err);
    return false;
  }
};

/**
 * Add a new study session record
 */
export const addStudySession = (sessionData) => {
  const sessions = getStoredStudySessions();
  const today = getTodayDateString();

  const newSession = {
    id: generateSessionRecordId(),
    subjectId: sessionData.subjectId || null,
    subjectName: sessionData.subjectName || 'General Study',
    subjectColor: sessionData.subjectColor || '#8FA28A',
    durationMinutes: Number(sessionData.durationMinutes) || 25,
    completedAt: sessionData.completedAt || new Date().toISOString(),
    date: sessionData.date || today,
    notes: (sessionData.notes || '').trim(),
    mode: sessionData.mode || 'focus', // 'focus' | 'custom'
  };

  const updated = [newSession, ...sessions];
  saveStudySessionsToStorage(updated);
  return newSession;
};

/**
 * Delete a study session by ID
 */
export const deleteStudySession = (sessionId) => {
  const sessions = getStoredStudySessions();
  const updated = sessions.filter((s) => s.id !== sessionId);
  saveStudySessionsToStorage(updated);
  return updated;
};

/**
 * Clear all study sessions
 */
export const clearAllStudySessions = () => {
  saveStudySessionsToStorage([]);
  return [];
};

/**
 * Retrieve timer user settings
 */
export const getTimerSettings = () => {
  try {
    const raw = localStorage.getItem(TIMER_SETTINGS_KEY);
    if (!raw) {
      return { ...DEFAULT_TIMER_SETTINGS };
    }
    return { ...DEFAULT_TIMER_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error reading timer settings:', err);
    return { ...DEFAULT_TIMER_SETTINGS };
  }
};

/**
 * Save timer user settings
 */
export const saveTimerSettings = (settings) => {
  try {
    const current = getTimerSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(TIMER_SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving timer settings:', err);
    return DEFAULT_TIMER_SETTINGS;
  }
};

/**
 * Calculate study time and statistics from recorded sessions
 * @param {Array} sessions - Array of study sessions
 * @param {Array} subjects - Array of existing subjects (for up-to-date names/colors)
 * @param {string} targetDateStr - Current date YYYY-MM-DD
 * @param {number} dailyGoalMinutes - Goal in minutes
 */
export const calculateStudyStats = (
  sessions = [],
  subjects = [],
  targetDateStr = getTodayDateString(),
  dailyGoalMinutes = 120
) => {
  const weekDays = new Set(getWeekDays(targetDateStr));

  let todayMinutes = 0;
  let weekMinutes = 0;
  let totalMinutes = 0;

  let todaySessionsCount = 0;

  // Map of subjectId -> { minutes, count, name, color }
  const subjectAggregates = new Map();

  // Create lookup for known subjects
  const subjectMetaMap = new Map();
  subjects.forEach((s) => {
    subjectMetaMap.set(s.id, { name: s.name, color: s.color });
  });

  sessions.forEach((s) => {
    const mins = Number(s.durationMinutes) || 0;
    totalMinutes += mins;

    // Check if recorded today
    if (s.date === targetDateStr) {
      todayMinutes += mins;
      todaySessionsCount++;
    }

    // Check if recorded this week
    if (weekDays.has(s.date)) {
      weekMinutes += mins;
    }

    // Aggregate by subject
    const subjKey = s.subjectId || 'unassigned';
    const knownMeta = s.subjectId ? subjectMetaMap.get(s.subjectId) : null;
    const subjName = knownMeta?.name || s.subjectName || 'General Study';
    const subjColor = knownMeta?.color || s.subjectColor || '#8FA28A';

    if (!subjectAggregates.has(subjKey)) {
      subjectAggregates.set(subjKey, {
        subjectId: s.subjectId,
        subjectName: subjName,
        subjectColor: subjColor,
        minutes: 0,
        count: 0,
      });
    }

    const item = subjectAggregates.get(subjKey);
    item.minutes += mins;
    item.count += 1;
  });

  // Calculate percentage of total for each subject
  const subjectBreakdown = Array.from(subjectAggregates.values())
    .map((item) => ({
      ...item,
      percentage: totalMinutes > 0 ? Math.round((item.minutes / totalMinutes) * 100) : 0,
    }))
    .sort((a, b) => b.minutes - a.minutes);

  // Goal progress
  const safeGoal = Math.max(1, dailyGoalMinutes);
  const goalProgressPercent = Math.min(100, Math.round((todayMinutes / safeGoal) * 100));

  return {
    todayMinutes,
    weekMinutes,
    totalMinutes,
    totalSessionsCount: sessions.length,
    todaySessionsCount,
    goalProgressPercent,
    dailyGoalMinutes: safeGoal,
    subjectBreakdown,
  };
};

/**
 * Play pleasant synthesizer bell chime when a session or break ends
 * Uses Web Audio API without requiring any external audio files
 */
export const playTimerAlertChime = (type = 'focusComplete') => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Define harmonic chord notes (in Hz)
    const notes =
      type === 'focusComplete'
        ? [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6 (celebratory major chord)
        : [440.0, 554.37, 659.25]; // A4, C#5, E5 (gentle transition chord)

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      // Envelope: gentle attack and smooth decay
      const startTime = now + idx * 0.12;
      const duration = 1.2;

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (err) {
    console.warn('Audio alert unavailable:', err);
  }
};

const STORAGE_KEY = 'studymate_timetable';

/**
 * Generate a unique, stable ID for study timetable sessions
 */
export const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
};

/**
 * Retrieve all timetable sessions from localStorage with safe error handling
 */
export const getStoredSessions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Error reading timetable sessions from localStorage:', err);
    return [];
  }
};

/**
 * Save array of timetable sessions to localStorage
 */
export const saveSessionsToStorage = (sessions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    window.dispatchEvent(new Event('studymate_data_updated'));
    return true;
  } catch (err) {
    console.error('Error saving timetable sessions to localStorage:', err);
    return false;
  }
};

/**
 * Common duration preset options in minutes
 */
export const DURATION_PRESETS = [25, 30, 45, 60, 90, 120];

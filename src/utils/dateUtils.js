/**
 * Date and Time utilities for StudyMate timetable
 * Operates strictly with local dates and times to prevent UTC shifting
 */

/**
 * Format Date object to local YYYY-MM-DD string
 */
export const toDateString = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get today's local date as YYYY-MM-DD
 */
export const getTodayDateString = () => {
  return toDateString(new Date());
};

/**
 * Get current local time as HH:mm
 */
export const getCurrentTimeString = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Convert HH:mm to minutes from midnight (0 - 1440)
 */
export const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (isNaN(hours) ? 0 : hours) * 60 + (isNaN(minutes) ? 0 : minutes);
};

/**
 * Convert minutes from midnight to HH:mm string
 */
export const minutesToTime = (totalMinutes) => {
  const safeMinutes = Math.max(0, totalMinutes);
  const hours = Math.floor(safeMinutes / 60) % 24;
  const minutes = safeMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Calculate session end time in HH:mm from startTime and durationMinutes
 */
export const calculateEndTime = (startTime, durationMinutes) => {
  if (!startTime || !durationMinutes) return '';
  const startMins = timeToMinutes(startTime);
  const endMins = startMins + Number(durationMinutes);
  return minutesToTime(endMins);
};

/**
 * Check if a session crosses midnight (ends on the next calendar day)
 */
export const crossesMidnight = (startTime, durationMinutes) => {
  if (!startTime || !durationMinutes) return false;
  const startMins = timeToMinutes(startTime);
  const endMins = startMins + Number(durationMinutes);
  return endMins > 1440; // Beyond 24:00 (midnight)
};

/**
 * Format 24-hour HH:mm time to 12-hour string (e.g., "18:00" -> "6:00 PM")
 */
export const formatTime12Hour = (time24) => {
  if (!time24) return '';
  const [hoursStr, minsStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const mins = minsStr || '00';
  if (isNaN(hours)) return time24;

  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  return `${hours}:${mins} ${period}`;
};

/**
 * Format YYYY-MM-DD into a human-readable string (e.g., "Monday, Oct 26, 2026")
 */
export const formatDisplayDate = (dateStr, showWeekday = true) => {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const options = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...(showWeekday ? { weekday: 'short' } : {}),
    };
    return date.toLocaleDateString(undefined, options);
  } catch {
    return dateStr;
  }
};

/**
 * Format minutes into a readable duration string (e.g., 90 -> "1h 30m", 45 -> "45 mins")
 */
export const formatDuration = (minutes) => {
  const mins = Number(minutes);
  if (isNaN(mins) || mins <= 0) return '0 mins';
  if (mins < 60) {
    return `${mins} mins`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  return `${hours}h ${remainingMins}m`;
};

/**
 * Add or subtract days from a YYYY-MM-DD date string
 */
export const addDays = (dateStr, days) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return toDateString(date);
};

/**
 * Get array of 7 dates (YYYY-MM-DD) for Monday through Sunday for the week containing baseDateStr
 */
export const getWeekDays = (baseDateStr) => {
  const [year, month, day] = baseDateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  // Distance to Monday: if Sunday (0), Monday was 6 days ago (-6), otherwise 1 - dayOfWeek
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(year, month - 1, day);
  monday.setDate(monday.getDate() + distanceToMonday);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    weekDays.push(toDateString(current));
  }
  return weekDays;
};

/**
 * Check if a session is upcoming (in the future relative to right now)
 */
export const isSessionUpcoming = (session) => {
  if (!session || !session.date || !session.startTime) return false;
  const today = getTodayDateString();
  const currentTime = getCurrentTimeString();

  if (session.date > today) return true;
  if (session.date === today && session.startTime > currentTime) return true;
  return false;
};

/**
 * Check if two time intervals on the same date overlap
 * Condition: startA < endB && startB < endA
 * Touching sessions (endA === startB or endB === startA) do NOT overlap.
 */
export const checkSessionOverlap = (existingSessions, newSession, currentSessionId = null) => {
  if (!newSession.date || !newSession.startTime || !newSession.durationMinutes) {
    return { hasOverlap: false };
  }

  const newStart = timeToMinutes(newSession.startTime);
  const newEnd = newStart + Number(newSession.durationMinutes);

  const sameDaySessions = existingSessions.filter(
    (s) => s.date === newSession.date && s.id !== currentSessionId
  );

  for (const session of sameDaySessions) {
    const existingStart = timeToMinutes(session.startTime);
    const existingEnd = existingStart + Number(session.durationMinutes);

    // Overlap formula: startA < endB && startB < endA
    if (newStart < existingEnd && existingStart < newEnd) {
      return {
        hasOverlap: true,
        conflictingSession: session,
      };
    }
  }

  return { hasOverlap: false };
};

/**
 * Check if a task is overdue based on local date string YYYY-MM-DD
 * A task is overdue if and only if status is not 'completed' AND dueDate < todayDateStr
 */
export const isTaskOverdue = (dueDate, status, todayDateStr = getTodayDateString()) => {
  if (!dueDate || status === 'completed') return false;
  return dueDate < todayDateStr;
};

/**
 * Format task due date into a user-friendly badge label
 */
export const formatDueDateBadge = (dueDate, todayDateStr = getTodayDateString()) => {
  if (!dueDate) return '';
  if (dueDate === todayDateStr) {
    return 'Due Today';
  }
  const tomorrow = addDays(todayDateStr, 1);
  if (dueDate === tomorrow) {
    return 'Due Tomorrow';
  }
  const yesterday = addDays(todayDateStr, -1);
  if (dueDate === yesterday) {
    return 'Due Yesterday';
  }
  return `Due ${formatDisplayDate(dueDate, false)}`;
};

/**
 * Convert ISO date-time string safely to local YYYY-MM-DD string
 */
export const isoToLocalDateString = (isoString) => {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    return toDateString(d);
  } catch {
    return null;
  }
};

/**
 * Get all YYYY-MM-DD dates for the calendar month containing baseDateStr
 */
export const getMonthDays = (baseDateStr) => {
  if (!baseDateStr) return [];
  try {
    const [year, month] = baseDateStr.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    const days = [];
    for (let day = 1; day <= lastDay; day++) {
      const dayStr = String(day).padStart(2, '0');
      const monthStr = String(month).padStart(2, '0');
      days.push(`${year}-${monthStr}-${dayStr}`);
    }
    return days;
  } catch {
    return [];
  }
};

/**
 * Format date to short readable label (e.g., "Mon 27", "Oct 27")
 */
export const formatDateShort = (dateStr, showWeekday = true) => {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (showWeekday) {
      return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
};



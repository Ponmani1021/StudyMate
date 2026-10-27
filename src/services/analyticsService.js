import {
  getTodayDateString,
  getWeekDays,
  getMonthDays,
  addDays,
  formatDisplayDate,
  formatDuration,
  isoToLocalDateString,
  isTaskOverdue,
} from '../utils/dateUtils';
import { getDailyStudyGoal } from './studySessionStorage';

/**
 * Filter sessions by date range
 * @param {Array} sessions
 * @param {string} rangeType - 'today' | 'week' | 'month' | 'all'
 * @param {string} todayStr - YYYY-MM-DD
 */
export const filterSessionsByRange = (sessions = [], rangeType = 'week', todayStr = getTodayDateString()) => {
  if (!Array.isArray(sessions)) return [];

  if (rangeType === 'all') {
    return sessions;
  }

  if (rangeType === 'today') {
    return sessions.filter((s) => s.date === todayStr);
  }

  if (rangeType === 'week') {
    const weekDaysSet = new Set(getWeekDays(todayStr));
    return sessions.filter((s) => weekDaysSet.has(s.date));
  }

  if (rangeType === 'month') {
    const monthDaysSet = new Set(getMonthDays(todayStr));
    return sessions.filter((s) => monthDaysSet.has(s.date));
  }

  return sessions;
};

/**
 * Get date range sets and bounds for previous period comparison
 */
export const getPreviousPeriodData = (rangeType, todayStr = getTodayDateString()) => {
  if (rangeType === 'all') {
    return null;
  }

  if (rangeType === 'today') {
    const yesterday = addDays(todayStr, -1);
    return {
      label: 'yesterday',
      dateSet: new Set([yesterday]),
    };
  }

  if (rangeType === 'week') {
    const currentWeekDays = getWeekDays(todayStr);
    const monday = currentWeekDays[0];
    const prevMonday = addDays(monday, -7);
    const prevWeekDays = getWeekDays(prevMonday);
    return {
      label: 'last week',
      dateSet: new Set(prevWeekDays),
    };
  }

  if (rangeType === 'month') {
    const [year, month] = todayStr.split('-').map(Number);
    // Previous month
    const prevDate = new Date(year, month - 2, 1);
    const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-01`;
    const prevMonthDays = getMonthDays(prevMonthStr);
    return {
      label: 'last month',
      dateSet: new Set(prevMonthDays),
    };
  }

  return null;
};

/**
 * Calculate full analytics dataset
 */
export const calculateAnalytics = ({
  sessions = [],
  tasks = [],
  subjects = [],
  rangeType = 'week',
  todayStr = getTodayDateString(),
  dailyGoalMinutes = null,
}) => {
  // 1. Filter sessions for current period
  const periodSessions = filterSessionsByRange(sessions, rangeType, todayStr);
  const totalStudyMinutes = periodSessions.reduce(
    (acc, s) => acc + (Number(s.durationMinutes) || 0),
    0
  );

  // 2. Previous period comparison
  const prevPeriodInfo = getPreviousPeriodData(rangeType, todayStr);
  let previousPeriodComparison = null;

  if (prevPeriodInfo && sessions.length > 0) {
    // Only compare if user has records predating the current period
    const hasOlderHistory = sessions.some((s) => s.date < todayStr);

    if (hasOlderHistory) {
      const prevMinutes = sessions.reduce((acc, s) => {
        if (prevPeriodInfo.dateSet.has(s.date)) {
          return acc + (Number(s.durationMinutes) || 0);
        }
        return acc;
      }, 0);

      const diff = totalStudyMinutes - prevMinutes;
      previousPeriodComparison = {
        hasComparison: true,
        diffMinutes: diff,
        label: prevPeriodInfo.label,
        formattedDiff:
          diff > 0
            ? `+${formatDuration(diff)} vs ${prevPeriodInfo.label}`
            : diff < 0
            ? `-${formatDuration(Math.abs(diff))} vs ${prevPeriodInfo.label}`
            : `Same as ${prevPeriodInfo.label}`,
        isPositive: diff >= 0,
      };
    }
  }

  // 3. Task Completion Calculations for the period
  let periodDateSet = null;
  if (rangeType === 'today') {
    periodDateSet = new Set([todayStr]);
  } else if (rangeType === 'week') {
    periodDateSet = new Set(getWeekDays(todayStr));
  } else if (rangeType === 'month') {
    periodDateSet = new Set(getMonthDays(todayStr));
  }

  // Identify completed tasks in period using completedAt or updatedAt
  const completedInPeriod = tasks.filter((t) => {
    if (t.status !== 'completed') return false;
    if (rangeType === 'all') return true;

    const completionDate =
      isoToLocalDateString(t.completedAt) ||
      isoToLocalDateString(t.updatedAt) ||
      t.dueDate;

    return completionDate ? periodDateSet.has(completionDate) : false;
  });

  // Identify tasks eligible in this period (due in period OR completed in period)
  const eligibleInPeriod = tasks.filter((t) => {
    if (rangeType === 'all') return true;

    const isDueInPeriod = t.dueDate ? periodDateSet.has(t.dueDate) : false;
    const isCompletedInPeriod = completedInPeriod.some((c) => c.id === t.id);

    return isDueInPeriod || isCompletedInPeriod;
  });

  const completionRate =
    eligibleInPeriod.length > 0
      ? Math.round((completedInPeriod.length / eligibleInPeriod.length) * 100)
      : 0;

  // Global task status counts (overall status of tasks in workspace)
  let overallCompletedCount = 0;
  let overallPendingCount = 0;
  let overallOverdueCount = 0;

  tasks.forEach((t) => {
    if (t.status === 'completed') {
      overallCompletedCount++;
    } else {
      if (isTaskOverdue(t.dueDate, t.status, todayStr)) {
        overallOverdueCount++;
      } else {
        overallPendingCount++;
      }
    }
  });

  // 4. Daily Study Goal Comparison (Today's actual study vs goal)
  const targetGoalMinutes = Number(dailyGoalMinutes) > 0 ? Number(dailyGoalMinutes) : getDailyStudyGoal();
  const todaySessions = sessions.filter((s) => s.date === todayStr);
  const todayStudyMinutes = todaySessions.reduce(
    (acc, s) => acc + (Number(s.durationMinutes) || 0),
    0
  );

  const goalPercentage = targetGoalMinutes > 0 ? Math.round((todayStudyMinutes / targetGoalMinutes) * 100) : 0;
  const goalProgressFill = Math.min(100, goalPercentage);
  const goalRemainingMinutes = Math.max(0, targetGoalMinutes - todayStudyMinutes);
  const isGoalExceeded = todayStudyMinutes > targetGoalMinutes;
  const goalExceededMinutes = isGoalExceeded ? todayStudyMinutes - targetGoalMinutes : 0;

  // 5. Subject-Wise Breakdown for selected period
  const subjectMap = new Map();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  const subjectStudyMap = new Map();

  periodSessions.forEach((s) => {
    const mins = Number(s.durationMinutes) || 0;
    const subjId = s.subjectId || 'unassigned';
    const knownSubj = s.subjectId ? subjectMap.get(s.subjectId) : null;

    let subjName = 'General Study';
    let subjColor = '#8FA28A';

    if (knownSubj) {
      subjName = knownSubj.name;
      subjColor = knownSubj.color || '#8FA28A';
    } else if (s.subjectName) {
      subjName = s.subjectName;
      subjColor = s.subjectColor || '#8FA28A';
    } else if (s.subjectId) {
      subjName = 'Unknown Subject';
      subjColor = '#6e7066';
    }

    if (!subjectStudyMap.has(subjId)) {
      subjectStudyMap.set(subjId, {
        subjectId: s.subjectId,
        subjectName: subjName,
        subjectColor: subjColor,
        minutes: 0,
        sessionsCount: 0,
      });
    }

    const item = subjectStudyMap.get(subjId);
    item.minutes += mins;
    item.sessionsCount++;
  });

  const subjectBreakdown = Array.from(subjectStudyMap.values())
    .map((item) => ({
      ...item,
      percentage:
        totalStudyMinutes > 0 ? Math.round((item.minutes / totalStudyMinutes) * 100) : 0,
    }))
    .sort((a, b) => b.minutes - a.minutes);

  // 6. Recent Study Activity (actual recorded study sessions, newest first)
  const recentSessions = [...sessions]
    .sort((a, b) => {
      const timeA = a.completedAt ? new Date(a.completedAt).getTime() : new Date(a.date).getTime();
      const timeB = b.completedAt ? new Date(b.completedAt).getTime() : new Date(b.date).getTime();
      return timeB - timeA;
    })
    .slice(0, 8)
    .map((s) => {
      const knownSubj = s.subjectId ? subjectMap.get(s.subjectId) : null;
      return {
        ...s,
        displayName: knownSubj?.name || s.subjectName || 'General Study',
        displayColor: knownSubj?.color || s.subjectColor || '#8FA28A',
      };
    });

  return {
    rangeType,
    totalStudyMinutes,
    periodSessionsCount: periodSessions.length,
    previousPeriodComparison,

    // Task Analytics
    completedInPeriodCount: completedInPeriod.length,
    eligibleInPeriodCount: eligibleInPeriod.length,
    completionRate,
    overallCompletedCount,
    overallPendingCount,
    overallOverdueCount,
    totalTasksCount: tasks.length,

    // Daily Goal
    dailyGoalMinutes: targetGoalMinutes,
    todayStudyMinutes,
    goalPercentage,
    goalProgressFill,
    goalRemainingMinutes,
    isGoalExceeded,
    goalExceededMinutes,

    // Subject breakdown & Recent
    subjectBreakdown,
    recentSessions,
  };
};

/**
 * Generate grouped chart data based on rangeType and viewMode ('day' | 'week')
 */
export const getStudyTimeChartData = ({
  sessions = [],
  rangeType = 'week',
  viewMode = 'day', // 'day' | 'week'
  todayStr = getTodayDateString(),
}) => {
  if (rangeType === 'week' || (rangeType === 'today' && viewMode === 'day')) {
    // 7 days of the current week (Monday - Sunday)
    const weekDays = getWeekDays(todayStr);
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Group sessions by date
    const dayTotals = new Map();
    const daySessionCounts = new Map();
    weekDays.forEach((d) => {
      dayTotals.set(d, 0);
      daySessionCounts.set(d, 0);
    });

    sessions.forEach((s) => {
      if (dayTotals.has(s.date)) {
        dayTotals.set(s.date, dayTotals.get(s.date) + (Number(s.durationMinutes) || 0));
        daySessionCounts.set(s.date, daySessionCounts.get(s.date) + 1);
      }
    });

    let maxMinutes = 0;
    weekDays.forEach((d) => {
      const mins = dayTotals.get(d);
      if (mins > maxMinutes) maxMinutes = mins;
    });

    const items = weekDays.map((dateStr, idx) => {
      const mins = dayTotals.get(dateStr);
      const count = daySessionCounts.get(dateStr);
      return {
        date: dateStr,
        label: dayLabels[idx],
        fullDateLabel: formatDisplayDate(dateStr, true),
        minutes: mins,
        formattedDuration: formatDuration(mins),
        sessionsCount: count,
        isToday: dateStr === todayStr,
        isHighest: mins > 0 && mins === maxMinutes,
      };
    });

    return {
      chartType: 'day',
      title: 'Study Time by Day (This Week)',
      maxMinutes,
      items,
      mostStudiedDay: items.find((i) => i.isHighest) || null,
    };
  }

  if (rangeType === 'month') {
    const monthDays = getMonthDays(todayStr);

    if (viewMode === 'week') {
      // Group month days into weekly buckets
      const weekBuckets = [];
      let currentBucket = [];

      monthDays.forEach((dateStr, idx) => {
        currentBucket.push(dateStr);
        if (currentBucket.length === 7 || idx === monthDays.length - 1) {
          weekBuckets.push([...currentBucket]);
          currentBucket = [];
        }
      });

      const dayTotals = new Map();
      monthDays.forEach((d) => dayTotals.set(d, 0));
      sessions.forEach((s) => {
        if (dayTotals.has(s.date)) {
          dayTotals.set(s.date, dayTotals.get(s.date) + (Number(s.durationMinutes) || 0));
        }
      });

      let maxMinutes = 0;
      const items = weekBuckets.map((bucketDates, idx) => {
        const bucketMinutes = bucketDates.reduce((acc, d) => acc + dayTotals.get(d), 0);
        if (bucketMinutes > maxMinutes) maxMinutes = bucketMinutes;
        const startDate = bucketDates[0].split('-').slice(1).join('/');
        const endDate = bucketDates[bucketDates.length - 1].split('-').slice(1).join('/');
        return {
          date: bucketDates[0],
          label: `Wk ${idx + 1}`,
          fullDateLabel: `Week ${idx + 1} (${startDate} – ${endDate})`,
          minutes: bucketMinutes,
          formattedDuration: formatDuration(bucketMinutes),
          isToday: bucketDates.includes(todayStr),
          isHighest: bucketMinutes > 0 && bucketMinutes === maxMinutes,
        };
      });

      return {
        chartType: 'week',
        title: 'Study Time by Week (This Month)',
        maxMinutes,
        items,
        mostStudiedDay: items.find((i) => i.isHighest) || null,
      };
    } else {
      // Daily bars for the month
      const dayTotals = new Map();
      monthDays.forEach((d) => dayTotals.set(d, 0));
      sessions.forEach((s) => {
        if (dayTotals.has(s.date)) {
          dayTotals.set(s.date, dayTotals.get(s.date) + (Number(s.durationMinutes) || 0));
        }
      });

      let maxMinutes = 0;
      monthDays.forEach((d) => {
        const mins = dayTotals.get(d);
        if (mins > maxMinutes) maxMinutes = mins;
      });

      const items = monthDays.map((dateStr) => {
        const mins = dayTotals.get(dateStr);
        const dayNumber = dateStr.split('-')[2];
        return {
          date: dateStr,
          label: dayNumber,
          fullDateLabel: formatDisplayDate(dateStr, true),
          minutes: mins,
          formattedDuration: formatDuration(mins),
          isToday: dateStr === todayStr,
          isHighest: mins > 0 && mins === maxMinutes,
        };
      });

      return {
        chartType: 'day',
        title: 'Study Time by Day (This Month)',
        maxMinutes,
        items,
        mostStudiedDay: items.find((i) => i.isHighest) || null,
      };
    }
  }

  // rangeType === 'all'
  // Aggregate recent weeks or months
  const dateTotals = new Map();
  sessions.forEach((s) => {
    dateTotals.set(s.date, (dateTotals.get(s.date) || 0) + (Number(s.durationMinutes) || 0));
  });

  // Collect unique dates sorted
  const sortedDates = Array.from(dateTotals.keys()).sort();
  const recentDates = sortedDates.slice(-14); // Last 14 active days

  let maxMinutes = 0;
  recentDates.forEach((d) => {
    const mins = dateTotals.get(d);
    if (mins > maxMinutes) maxMinutes = mins;
  });

  const items = recentDates.map((dateStr) => {
    const mins = dateTotals.get(dateStr);
    const [, month, day] = dateStr.split('-');
    return {
      date: dateStr,
      label: `${month}/${day}`,
      fullDateLabel: formatDisplayDate(dateStr, true),
      minutes: mins,
      formattedDuration: formatDuration(mins),
      isToday: dateStr === todayStr,
      isHighest: mins > 0 && mins === maxMinutes,
    };
  });

  return {
    chartType: 'day',
    title: 'Study Time by Active Dates (All Time)',
    maxMinutes,
    items,
    mostStudiedDay: items.find((i) => i.isHighest) || null,
  };
};

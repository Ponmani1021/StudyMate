import { getStoredSubjects } from './subjectStorage';
import { getStoredSessions } from './timetableStorage';
import { getStoredTasks } from './taskStorage';
import {
  getStoredStudySessions,
  getDailyStudyGoal,
  getTimerSettings,
} from './studySessionStorage';
import { getTodayDateString } from '../utils/dateUtils';

/**
 * Generate and trigger download of the student's study data as a JSON file
 * @param {Object} user - Currently authenticated user profile
 * @param {string} theme - Active theme ('light' | 'dark')
 * @returns {Object} Result { success: boolean, filename?: string, error?: string }
 */
export const exportStudyMateData = (user, theme = 'light') => {
  try {
    const subjects = getStoredSubjects();
    const timetable = getStoredSessions();
    const tasks = getStoredTasks();
    const studySessions = getStoredStudySessions();
    const dailyGoalMinutes = getDailyStudyGoal();
    const timerSettings = getTimerSettings();

    // Safe sanitized profile (excluding any passwords or auth secrets)
    const profile = {
      username: user?.username || 'Student',
      displayName: user?.displayName || user?.username || 'Student',
      email: user?.email || '',
      role: user?.role || 'Student Account',
    };

    const exportData = {
      app: 'StudyMate',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      preferences: {
        dailyStudyGoalMinutes: dailyGoalMinutes,
        dailyStudyGoalHours: Math.round((dailyGoalMinutes / 60) * 10) / 10,
        theme: theme,
        timerSettings: {
          pomodoroMinutes: timerSettings?.pomodoroMinutes || 25,
          shortBreakMinutes: timerSettings?.shortBreakMinutes || 5,
          longBreakMinutes: timerSettings?.longBreakMinutes || 15,
          longBreakInterval: timerSettings?.longBreakInterval || 4,
          soundEnabled: timerSettings?.soundEnabled ?? true,
        },
      },
      data: {
        profile,
        subjects,
        timetable,
        tasks,
        studySessions,
      },
    };

    // Serialize JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Generate descriptive filename with current local date
    const today = getTodayDateString();
    const filename = `studymate-backup-${today}.json`;

    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      filename,
      counts: {
        subjects: subjects.length,
        timetable: timetable.length,
        tasks: tasks.length,
        studySessions: studySessions.length,
      },
    };
  } catch (err) {
    console.error('Error exporting StudyMate data:', err);
    return {
      success: false,
      error: 'Failed to generate study data backup. Please try again.',
    };
  }
};

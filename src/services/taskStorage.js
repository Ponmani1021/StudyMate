const STORAGE_KEY = 'studymate_tasks';

/**
 * Generate a unique, stable ID for tasks
 */
export const generateTaskId = () => {
  return `task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
};

/**
 * Retrieve all tasks from localStorage with safe error handling
 */
export const getStoredTasks = () => {
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
    console.error('Error reading tasks from localStorage:', err);
    return [];
  }
};

/**
 * Save array of tasks to localStorage
 */
export const saveTasksToStorage = (tasks) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    window.dispatchEvent(new Event('studymate_data_updated'));
    return true;
  } catch (err) {
    console.error('Error saving tasks to localStorage:', err);
    return false;
  }
};

/**
 * Toggle a task status between completed and pending
 */
export const toggleTaskCompletion = (taskId) => {
  const tasks = getStoredTasks();
  let updatedTask = null;
  let newStatus = 'pending';

  const updatedList = tasks.map((t) => {
    if (t.id === taskId) {
      newStatus = t.status === 'completed' ? 'pending' : 'completed';
      updatedTask = {
        ...t,
        status: newStatus,
        completedAt: newStatus === 'completed' ? (t.completedAt || new Date().toISOString()) : null,
        updatedAt: new Date().toISOString(),
      };
      return updatedTask;
    }
    return t;
  });

  saveTasksToStorage(updatedList);
  return { updatedList, updatedTask, newStatus };
};

/**
 * Priority levels and display configurations
 */
export const PRIORITY_CONFIG = {
  high: {
    label: 'High Priority',
    shortLabel: 'High',
    color: 'var(--error)',
    bg: '#FDF2F2',
    border: '#FECACA',
    order: 3,
  },
  medium: {
    label: 'Medium Priority',
    shortLabel: 'Medium',
    color: 'var(--warning)',
    bg: '#FEF3C7',
    border: '#FDE68A',
    order: 2,
  },
  low: {
    label: 'Low Priority',
    shortLabel: 'Low',
    color: 'var(--success)',
    bg: 'var(--bg-surface-alt)',
    border: 'var(--border-color)',
    order: 1,
  },
};

export const SORT_OPTIONS = [
  { value: 'dueDateAsc', label: 'Due Date — Earliest First' },
  { value: 'dueDateDesc', label: 'Due Date — Latest First' },
  { value: 'priorityDesc', label: 'Priority — High to Low' },
  { value: 'createdAtDesc', label: 'Recently Created' },
];

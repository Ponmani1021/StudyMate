const STORAGE_KEY = 'studymate_subjects';

/**
 * Generate a unique, stable ID for subjects
 */
export const generateSubjectId = () => {
  return `subj_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
};

/**
 * Retrieve all subjects from localStorage with safe error handling
 */
export const getStoredSubjects = () => {
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
    console.error('Error reading subjects from localStorage:', err);
    return [];
  }
};

/**
 * Save array of subjects to localStorage
 */
export const saveSubjectsToStorage = (subjects) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
    window.dispatchEvent(new Event('studymate_data_updated'));
    return true;
  } catch (err) {
    console.error('Error saving subjects to localStorage:', err);
    return false;
  }
};

/**
 * Check if a subject name already exists (case-insensitive)
 * Excludes the subject being edited (if currentId is provided)
 */
export const isDuplicateSubjectName = (subjects, name, currentId = null) => {
  const normalized = (name || '').trim().toLowerCase();
  if (!normalized) return false;
  return subjects.some((sub) => {
    if (currentId && sub.id === currentId) return false;
    return (sub.name || '').trim().toLowerCase() === normalized;
  });
};

/**
 * Color presets derived from App.css color scheme
 */
export const SUBJECT_COLOR_PRESETS = [
  { label: 'Sage Green', value: '#8FA28A' },
  { label: 'Terracotta', value: '#BA6A4C' },
  { label: 'Peach', value: '#FFAE6E' },
  { label: 'Dark Forest', value: '#24352F' },
  { label: 'Purple Accent', value: '#8B5DFF' },
  { label: 'Teal Green', value: '#2DAA9E' },
  { label: 'Gold Amber', value: '#B7791F' },
  { label: 'Coral Flame', value: '#EC5B38' },
];

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import styles from '../../styles/ThemeToggle.module.css';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  const titleText = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';

  return (
    <button
      type="button"
      className={`${styles.themeToggleBtn} ${className}`}
      onClick={toggleTheme}
      title={titleText}
      aria-label={titleText}
      aria-pressed={isDark}
    >
      {isDark ? (
        <Sun size={18} className={styles.icon} />
      ) : (
        <Moon size={18} className={styles.icon} />
      )}
    </button>
  );
};

export default ThemeToggle;

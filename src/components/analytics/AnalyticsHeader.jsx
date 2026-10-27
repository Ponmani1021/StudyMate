import React from 'react';
import styles from '../../styles/Progress.module.css';

const RANGES = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'all', label: 'All Time' },
];

const AnalyticsHeader = ({ rangeType, onChangeRange }) => {
  return (
    <div className={styles.headerRow}>
      <div className={styles.headerText}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 className={styles.pageTitle}>Progress & Analytics</h1>
        </div>
        <p className={styles.pageDescription}>
          Understand your study habits and track your progress.
        </p>
      </div>

      <div className={styles.rangeSelector} role="tablist" aria-label="Select Analytics Time Period">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={rangeType === r.id}
            className={`${styles.rangeBtn} ${rangeType === r.id ? styles.activeRange : ''}`}
            onClick={() => onChangeRange(r.id)}
          >
            <span>{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsHeader;

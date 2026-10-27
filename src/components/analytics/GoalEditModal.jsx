import React, { useState, useEffect } from 'react';
import { Target, X, Clock } from 'lucide-react';
import styles from '../../styles/Modal.module.css';

const GOAL_PRESETS = [
  { label: '30 mins', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: '4 hours', value: 240 },
];

const GoalEditForm = ({ currentGoal, onSave, onClose }) => {
  const [goalMinutes, setGoalMinutes] = useState(currentGoal || 120);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(goalMinutes, 10);
    if (isNaN(val) || val < 15 || val > 720) {
      setError('Please choose a realistic daily study goal between 15 and 720 minutes (12 hours).');
      return;
    }
    onSave(val);
    onClose();
  };

  return (
    <>
      <div className={styles.modalHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Target size={20} color="var(--btn-primary)" />
          <h2 id="goal-modal-title" className={styles.modalTitle}>
            Configure Daily Study Goal
          </h2>
        </div>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.modalBody}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Set a realistic daily target for focused study. Progress & Analytics will measure your daily actual recorded study sessions against this goal.
          </p>

          {error && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                backgroundColor: '#fdf2f2',
                color: 'var(--error)',
                fontSize: '0.85rem',
                border: '1px solid #fecaca',
              }}
            >
              {error}
            </div>
          )}

          {/* Quick Preset Pills */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Quick Presets</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {GOAL_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setGoalMinutes(p.value);
                    setError('');
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    border: '1px solid var(--border-color)',
                    background:
                      Number(goalMinutes) === p.value
                        ? 'var(--btn-primary)'
                        : 'var(--bg-surface-alt)',
                    color:
                      Number(goalMinutes) === p.value
                        ? 'var(--text-inverse)'
                        : 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Minute Input */}
          <div className={styles.formGroup}>
            <label htmlFor="goal-minutes-input" className={styles.label}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} />
                Daily Target (Minutes)
              </span>
            </label>
            <input
              id="goal-minutes-input"
              type="number"
              min="15"
              max="720"
              step="15"
              className={styles.input}
              value={goalMinutes}
              onChange={(e) => {
                setGoalMinutes(e.target.value);
                setError('');
              }}
              required
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn}>
            Save Study Goal
          </button>
        </div>
      </form>
    </>
  );
};

const GoalEditModal = ({ isOpen, onClose, currentGoal, onSave }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="presentation">
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-modal-title"
      >
        <GoalEditForm
          currentGoal={currentGoal}
          onSave={onSave}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default GoalEditModal;

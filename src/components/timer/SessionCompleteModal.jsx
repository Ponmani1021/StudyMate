import React from 'react';
import { Sparkles, Coffee, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { formatDuration } from '../../utils/dateUtils';
import styles from '../../styles/Modal.module.css';
import timerStyles from '../../styles/StudyTimer.module.css';

const SessionCompleteModal = ({
  isOpen,
  onClose,
  completedSession,
  onStartBreak,
  onStartNextFocus,
}) => {
  if (!isOpen || !completedSession) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="presentation">
      <div
        className={`${styles.modalCard} ${styles.confirmCard}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-complete-modal-title"
      >
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={20} color="var(--success)" />
            <h2 id="session-complete-modal-title" className={styles.modalTitle}>
              Session Completed!
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

        <div className={styles.modalBody} style={{ textAlign: 'center' }}>
          <div className={timerStyles.celebrateIconWrap}>
            <Sparkles size={32} />
          </div>

          <h3 className={timerStyles.celebrateTitle}>
            Great Focus!
          </h3>

          <p className={timerStyles.celebrateSubtitle}>
            You just completed a focus block for{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {completedSession.subjectName || 'General Study'}
            </strong>
            .
          </p>

          <div className={timerStyles.celebrateSummaryBox}>
            <div className={timerStyles.celebrateStatItem}>
              <span className={timerStyles.celebrateStatValue}>
                {formatDuration(completedSession.durationMinutes)}
              </span>
              <span className={timerStyles.celebrateStatLabel}>Time Focused</span>
            </div>
            <div
              style={{
                width: 1,
                height: 36,
                backgroundColor: 'var(--border-color)',
              }}
            />
            <div className={timerStyles.celebrateStatItem}>
              <span
                className={timerStyles.celebrateStatValue}
                style={{ color: 'var(--success)' }}
              >
                +1
              </span>
              <span className={timerStyles.celebrateStatLabel}>Session Logged</span>
            </div>
          </div>

          {completedSession.notes && (
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-surface-alt)',
                padding: '8px 12px',
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              "{completedSession.notes}"
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              className={timerStyles.primaryActionBtn}
              onClick={onStartBreak}
              style={{ justifyContent: 'center', width: '100%' }}
            >
              <Coffee size={18} />
              <span>Take a 5-Minute Break</span>
            </button>

            <button
              type="button"
              className={timerStyles.secondaryActionBtn}
              onClick={onStartNextFocus}
              style={{ justifyContent: 'center', width: '100%' }}
            >
              <span>Start Next Focus Block</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionCompleteModal;

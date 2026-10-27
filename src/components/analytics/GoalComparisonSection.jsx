import React from 'react';
import { Target, CheckCircle2, Clock, Edit2, Flame } from 'lucide-react';
import { formatDuration } from '../../utils/dateUtils';
import styles from '../../styles/Progress.module.css';

const GoalComparisonSection = ({
  analytics,
  onOpenGoalModal,
}) => {
  const {
    todayStudyMinutes,
    dailyGoalMinutes,
    goalPercentage,
    goalProgressFill,
    goalRemainingMinutes,
    isGoalExceeded,
    goalExceededMinutes,
  } = analytics;

  return (
    <div className={styles.goalComparisonCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleWrap}>
          <Target size={20} color="var(--btn-primary)" />
          <div>
            <h2 className={styles.sectionTitle}>Daily Study Goal Comparison</h2>
            <span className={styles.sectionSubtext}>
              Today's recorded study time compared with your daily target
            </span>
          </div>
        </div>

        <button
          type="button"
          className={styles.editGoalTriggerBtn}
          onClick={onOpenGoalModal}
        >
          <Edit2 size={13} />
          <span>Change Goal</span>
        </button>
      </div>

      {/* 3 Metric Stats Blocks */}
      <div className={styles.goalStatsRow}>
        <div className={styles.goalStatItem}>
          <span className={styles.goalStatLabel}>Today's Focus</span>
          <span className={styles.goalStatValue}>
            {formatDuration(todayStudyMinutes)}
          </span>
        </div>

        <div className={styles.goalStatItem}>
          <span className={styles.goalStatLabel}>Daily Target</span>
          <span className={styles.goalStatValue}>
            {formatDuration(dailyGoalMinutes)}
          </span>
        </div>

        <div className={styles.goalStatItem}>
          <span className={styles.goalStatLabel}>
            {isGoalExceeded ? 'Exceeded By' : 'Remaining Required'}
          </span>
          <span
            className={styles.goalStatValue}
            style={{
              color: isGoalExceeded ? 'var(--success)' : 'var(--text-primary)',
            }}
          >
            {isGoalExceeded
              ? `+${formatDuration(goalExceededMinutes)}`
              : formatDuration(goalRemainingMinutes)}
          </span>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className={styles.goalProgressContainer}>
        <div className={styles.goalProgressHeader}>
          <span>Goal Completion</span>
          <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
            {goalPercentage}%
          </span>
        </div>

        <div className={styles.goalProgressBarBg} style={{ height: 10 }}>
          <div
            className={styles.goalProgressBarFill}
            style={{
              width: `${goalProgressFill}%`,
              backgroundColor: isGoalExceeded ? 'var(--success)' : 'var(--btn-primary)',
            }}
          />
        </div>

        {/* Status Message */}
        <div className={styles.goalStatusMsg}>
          {isGoalExceeded ? (
            <>
              <Flame size={15} color="var(--success)" />
              <span style={{ color: 'var(--success)' }}>
                Outstanding! You exceeded your daily study goal by {formatDuration(goalExceededMinutes)}.
              </span>
            </>
          ) : goalRemainingMinutes === 0 && todayStudyMinutes > 0 ? (
            <>
              <CheckCircle2 size={15} color="var(--success)" />
              <span style={{ color: 'var(--success)' }}>
                Target achieved! You completed 100% of your daily study goal.
              </span>
            </>
          ) : (
            <>
              <Clock size={15} color="var(--text-muted)" />
              <span>
                {formatDuration(goalRemainingMinutes)} needed to reach your {formatDuration(dailyGoalMinutes)} target for today.
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalComparisonSection;

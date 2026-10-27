import React from 'react';
import {
  Clock,
  CheckCircle2,
  Percent,
  Target,
  TrendingUp,
  TrendingDown,
  Edit2,
} from 'lucide-react';
import { formatDuration } from '../../utils/dateUtils';
import styles from '../../styles/Progress.module.css';

const SummaryCards = ({
  analytics,
  onOpenGoalModal,
}) => {
  const {
    totalStudyMinutes,
    previousPeriodComparison,
    completedInPeriodCount,
    eligibleInPeriodCount,
    completionRate,
    todayStudyMinutes,
    dailyGoalMinutes,
    goalPercentage,
    goalProgressFill,
    rangeType,
  } = analytics;

  const getPeriodLabelText = () => {
    switch (rangeType) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      default:
        return 'All Time';
    }
  };

  return (
    <div className={styles.summaryGrid}>
      {/* Card 1: Total Study Time */}
      <div className={styles.summaryCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>Total Study Time</span>
          <div
            className={styles.cardIconWrap}
            style={{
              backgroundColor: 'rgba(186, 106, 76, 0.1)',
              color: 'var(--btn-primary)',
            }}
          >
            <Clock size={19} />
          </div>
        </div>

        <div>
          <div className={styles.cardMainValue}>
            {formatDuration(totalStudyMinutes)}
          </div>
          <div className={styles.cardSubtext}>
            Recorded focus for {getPeriodLabelText().toLowerCase()}
          </div>

          {/* Previous period comparison only when historical data exists */}
          {previousPeriodComparison?.hasComparison && (
            <div
              className={`${styles.diffBadge} ${
                previousPeriodComparison.isPositive
                  ? styles.diffPositive
                  : styles.diffNegative
              }`}
            >
              {previousPeriodComparison.isPositive ? (
                <TrendingUp size={13} />
              ) : (
                <TrendingDown size={13} />
              )}
              <span>{previousPeriodComparison.formattedDiff}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card 2: Tasks Completed */}
      <div className={styles.summaryCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>Tasks Completed</span>
          <div
            className={styles.cardIconWrap}
            style={{
              backgroundColor: 'rgba(57, 122, 88, 0.12)',
              color: 'var(--success)',
            }}
          >
            <CheckCircle2 size={19} />
          </div>
        </div>

        <div>
          <div className={styles.cardMainValue}>
            {completedInPeriodCount}
          </div>
          <div className={styles.cardSubtext}>
            {rangeType === 'all'
              ? 'All-time completed assignments'
              : `Completed ${getPeriodLabelText().toLowerCase()}`}
          </div>
        </div>
      </div>

      {/* Card 3: Task Completion Rate */}
      <div className={styles.summaryCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>Task Completion Rate</span>
          <div
            className={styles.cardIconWrap}
            style={{
              backgroundColor: 'rgba(183, 121, 31, 0.12)',
              color: 'var(--warning)',
            }}
          >
            <Percent size={19} />
          </div>
        </div>

        <div>
          <div className={styles.cardMainValue}>
            {eligibleInPeriodCount > 0 ? `${completionRate}%` : '0%'}
          </div>
          <div className={styles.cardSubtext}>
            {eligibleInPeriodCount > 0
              ? `${completedInPeriodCount} of ${eligibleInPeriodCount} eligible task${
                  eligibleInPeriodCount === 1 ? '' : 's'
                }`
              : 'No tasks due in this period'}
          </div>
        </div>
      </div>

      {/* Card 4: Daily Study Goal */}
      <div className={styles.summaryCard}>
        <div className={styles.cardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className={styles.cardLabel}>Daily Study Goal</span>
            <button
              type="button"
              className={styles.editGoalTriggerBtn}
              onClick={onOpenGoalModal}
              title="Configure daily study goal"
              aria-label="Configure daily study goal"
            >
              <Edit2 size={12} />
            </button>
          </div>
          <div
            className={styles.cardIconWrap}
            style={{
              backgroundColor: 'rgba(143, 162, 138, 0.15)',
              color: '#586744',
            }}
          >
            <Target size={19} />
          </div>
        </div>

        <div>
          <div className={styles.cardValueRow}>
            <span className={styles.cardMainValue}>
              {formatDuration(todayStudyMinutes)}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              / {formatDuration(dailyGoalMinutes)}
            </span>
          </div>

          <div className={styles.cardSubtext}>
            {goalPercentage}% of today's target achieved
          </div>

          <div className={styles.goalProgressBarBg}>
            <div
              className={styles.goalProgressBarFill}
              style={{ width: `${goalProgressFill}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;

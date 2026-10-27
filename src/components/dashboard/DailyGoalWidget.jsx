import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Flame, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatDuration } from '../../utils/dateUtils';
import styles from '../../styles/Dashboard.module.css';

const DailyGoalWidget = ({
  todayStudyMinutes = 0,
  dailyGoalMinutes = 120,
}) => {
  const safeGoal = Math.max(1, dailyGoalMinutes);
  const goalPercentage = Math.round((todayStudyMinutes / safeGoal) * 100);
  const progressFill = Math.min(100, goalPercentage);
  const isExceeded = todayStudyMinutes > safeGoal;
  const exceededMinutes = isExceeded ? todayStudyMinutes - safeGoal : 0;
  const remainingMinutes = Math.max(0, safeGoal - todayStudyMinutes);

  return (
    <div className={styles.sectionCard} aria-labelledby="daily-goal-title">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleWrap}>
          <Target size={20} color="var(--btn-primary)" />
          <h2 id="daily-goal-title" className={styles.sectionTitle}>
            Daily Study Goal
          </h2>
        </div>

        <Link to="/dashboard/progress" className={styles.sectionLink}>
          <span>View Progress</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div>
        <div className={styles.goalMetricValues}>
          <div className={styles.goalCurrentVal}>
            {formatDuration(todayStudyMinutes)}{' '}
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              / {formatDuration(safeGoal)}
            </span>
          </div>

          <div
            className={styles.goalPercentTag}
            style={{ color: isExceeded ? 'var(--success)' : 'var(--btn-primary)' }}
          >
            {goalPercentage}%
          </div>
        </div>

        <div className={styles.goalBarBg}>
          <div
            className={styles.goalBarFill}
            style={{
              width: `${progressFill}%`,
              backgroundColor: isExceeded ? 'var(--success)' : 'var(--btn-primary)',
            }}
          />
        </div>

        <div className={styles.goalFooterText}>
          {isExceeded ? (
            <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
              <Flame size={14} />
              Goal exceeded by {formatDuration(exceededMinutes)} today!
            </span>
          ) : remainingMinutes === 0 && todayStudyMinutes > 0 ? (
            <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
              <CheckCircle2 size={14} />
              Daily target reached! Great job!
            </span>
          ) : (
            <span>
              {formatDuration(remainingMinutes)} remaining to reach today's target.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyGoalWidget;

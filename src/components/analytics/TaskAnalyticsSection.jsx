import React from 'react';
import { CheckSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../../styles/Progress.module.css';

const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TaskAnalyticsSection = ({ analytics }) => {
  const {
    overallCompletedCount,
    overallPendingCount,
    overallOverdueCount,
    totalTasksCount,
    completedInPeriodCount,
    eligibleInPeriodCount,
    completionRate,
    rangeType,
  } = analytics;

  // Calculate fractions for donut chart based on overall tasks
  const safeTotal = Math.max(1, totalTasksCount);
  const completedRatio = overallCompletedCount / safeTotal;
  const pendingRatio = overallPendingCount / safeTotal;
  const overdueRatio = overallOverdueCount / safeTotal;

  // Segment strokeDasharray & offsets
  const completedDash = `${completedRatio * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
  const pendingDash = `${pendingRatio * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
  const overdueDash = `${overdueRatio * CIRCUMFERENCE} ${CIRCUMFERENCE}`;

  const completedOffset = 0;
  const pendingOffset = -(completedRatio * CIRCUMFERENCE);
  const overdueOffset = -((completedRatio + pendingRatio) * CIRCUMFERENCE);

  return (
    <div className={styles.analyticsSectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleWrap}>
          <CheckSquare size={20} color="var(--btn-primary)" />
          <div>
            <h2 className={styles.sectionTitle}>Task Completion Analytics</h2>
            <span className={styles.sectionSubtext}>
              {rangeType === 'all'
                ? 'Overview of all assignments & tasks'
                : `Task performance for ${rangeType}`}
            </span>
          </div>
        </div>

        <Link
          to="/dashboard/tasks"
          style={{
            fontSize: '0.82rem',
            color: 'var(--btn-primary)',
            textDecoration: 'none',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>Manage Tasks</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {totalTasksCount === 0 ? (
        <div className={styles.emptyCardState}>
          <CheckSquare size={36} color="var(--border-glow)" />
          <h3 className={styles.emptyStateTitle}>No Tasks Created</h3>
          <p className={styles.emptyStateText}>
            You haven't added any assignments or study tasks yet. Add your tasks to monitor completion rates.
          </p>
          <Link to="/dashboard/tasks" className={styles.emptyActionLink}>
            <span>Go to Tasks Module</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className={styles.donutWrapper}>
          {/* SVG Donut */}
          <div className={styles.donutSvgWrap}>
            <svg
              className={styles.donutSvg}
              viewBox="0 0 140 140"
              aria-label="Task status distribution"
              role="img"
            >
              {/* Background circle */}
              <circle
                cx="70"
                cy="70"
                r={RADIUS}
                fill="none"
                stroke="var(--bg-surface-alt)"
                strokeWidth="16"
              />

              {/* Completed Tasks Segment (Green) */}
              {overallCompletedCount > 0 && (
                <circle
                  cx="70"
                  cy="70"
                  r={RADIUS}
                  className={styles.donutSegment}
                  stroke="var(--success)"
                  strokeDasharray={completedDash}
                  strokeDashoffset={completedOffset}
                />
              )}

              {/* Pending Tasks Segment (Amber) */}
              {overallPendingCount > 0 && (
                <circle
                  cx="70"
                  cy="70"
                  r={RADIUS}
                  className={styles.donutSegment}
                  stroke="var(--warning)"
                  strokeDasharray={pendingDash}
                  strokeDashoffset={pendingOffset}
                />
              )}

              {/* Overdue Tasks Segment (Red) */}
              {overallOverdueCount > 0 && (
                <circle
                  cx="70"
                  cy="70"
                  r={RADIUS}
                  className={styles.donutSegment}
                  stroke="var(--error)"
                  strokeDasharray={overdueDash}
                  strokeDashoffset={overdueOffset}
                />
              )}
            </svg>

            {/* Donut Center Display */}
            <div className={styles.donutCenterText}>
              <span className={styles.donutCenterPercent}>
                {eligibleInPeriodCount > 0
                  ? `${completionRate}%`
                  : `${Math.round((overallCompletedCount / safeTotal) * 100)}%`}
              </span>
              <span className={styles.donutCenterLabel}>
                {eligibleInPeriodCount > 0 ? 'Period Rate' : 'Total Rate'}
              </span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className={styles.donutLegend}>
            <div className={styles.legendItem}>
              <div className={styles.legendLeft}>
                <span
                  className={styles.legendDot}
                  style={{ backgroundColor: 'var(--success)' }}
                />
                <span>Completed</span>
              </div>
              <span className={styles.legendCount}>
                {overallCompletedCount}
              </span>
            </div>

            <div className={styles.legendItem}>
              <div className={styles.legendLeft}>
                <span
                  className={styles.legendDot}
                  style={{ backgroundColor: 'var(--warning)' }}
                />
                <span>Pending</span>
              </div>
              <span className={styles.legendCount}>
                {overallPendingCount}
              </span>
            </div>

            <div className={styles.legendItem}>
              <div className={styles.legendLeft}>
                <span
                  className={styles.legendDot}
                  style={{ backgroundColor: 'var(--error)' }}
                />
                <span>Overdue</span>
              </div>
              <span className={styles.legendCount} style={{ color: overallOverdueCount > 0 ? 'var(--error)' : undefined }}>
                {overallOverdueCount}
              </span>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: 8,
                marginTop: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Workspace Tasks</span>
                <strong style={{ color: 'var(--text-primary)' }}>{totalTasksCount}</strong>
              </div>
              {eligibleInPeriodCount > 0 && rangeType !== 'all' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                  <span>Completed in Period</span>
                  <strong style={{ color: 'var(--success)' }}>
                    {completedInPeriodCount} of {eligibleInPeriodCount}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskAnalyticsSection;

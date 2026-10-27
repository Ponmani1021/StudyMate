import React from 'react';
import { BookOpen, Timer, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDuration } from '../../utils/dateUtils';
import styles from '../../styles/Progress.module.css';

const SubjectStudySection = ({ subjectBreakdown = [], rangeType }) => {
  const getPeriodLabel = () => {
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
    <div className={styles.analyticsSectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleWrap}>
          <BookOpen size={20} color="var(--btn-primary)" />
          <div>
            <h2 className={styles.sectionTitle}>Subject Study Distribution</h2>
            <span className={styles.sectionSubtext}>
              Recorded focus time per subject for {getPeriodLabel().toLowerCase()}
            </span>
          </div>
        </div>

        <Link
          to="/dashboard/subjects"
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
          <span>View Subjects</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {subjectBreakdown.length === 0 ? (
        <div className={styles.emptyCardState}>
          <Timer size={36} color="var(--border-glow)" />
          <h3 className={styles.emptyStateTitle}>No Study Sessions Recorded</h3>
          <p className={styles.emptyStateText}>
            No focus time has been recorded for any subject in this period. Use the Study Timer to track your study sessions.
          </p>
          <Link to="/dashboard/timer" className={styles.emptyActionLink}>
            <span>Start Study Timer</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className={styles.subjectList}>
          {subjectBreakdown.map((item) => (
            <div key={item.subjectId || 'unassigned'} className={styles.subjectRow}>
              <div className={styles.subjectRowHeader}>
                <div className={styles.subjectNameWrap}>
                  <span
                    className={styles.subjectDot}
                    style={{ backgroundColor: item.subjectColor }}
                  />
                  <span>{item.subjectName}</span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    ({item.sessionsCount} session{item.sessionsCount === 1 ? '' : 's'})
                  </span>
                </div>

                <div className={styles.subjectTimeWrap}>
                  <span className={styles.subjectTimeVal}>
                    {formatDuration(item.minutes)}
                  </span>
                  <span className={styles.subjectPercent}>
                    ({item.percentage}%)
                  </span>
                </div>
              </div>

              <div className={styles.subjectBarBg}>
                <div
                  className={styles.subjectBarFill}
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.subjectColor,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectStudySection;

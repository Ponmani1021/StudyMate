import React from 'react';
import { History, Calendar, Clock, Layers, ArrowRight, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDisplayDate, formatDuration } from '../../utils/dateUtils';
import styles from '../../styles/Progress.module.css';

const RecentActivitySection = ({ recentSessions = [] }) => {
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className={styles.analyticsSectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleWrap}>
          <History size={20} color="var(--btn-primary)" />
          <div>
            <h2 className={styles.sectionTitle}>Recent Study Activity</h2>
            <span className={styles.sectionSubtext}>
              Chronological log of actual completed study sessions
            </span>
          </div>
        </div>

        <Link
          to="/dashboard/timer"
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
          <span>Open Timer Log</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {recentSessions.length === 0 ? (
        <div className={styles.emptyCardState}>
          <Timer size={36} color="var(--border-glow)" />
          <h3 className={styles.emptyStateTitle}>No Study Sessions Recorded</h3>
          <p className={styles.emptyStateText}>
            When you complete focus blocks using the Study Timer or log past study sessions, they will be listed here.
          </p>
          <Link to="/dashboard/timer" className={styles.emptyActionLink}>
            <span>Go to Study Timer</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className={styles.recentActivityList}>
          {recentSessions.map((session) => (
            <div key={session.id} className={styles.activityCard}>
              <div className={styles.activityLeft}>
                <span
                  className={styles.subjectDot}
                  style={{
                    backgroundColor: session.displayColor,
                    width: 11,
                    height: 11,
                  }}
                />
                <div className={styles.activityInfo}>
                  <h4 className={styles.activitySubject}>{session.displayName}</h4>
                  {session.notes && (
                    <p className={styles.activityNote}>{session.notes}</p>
                  )}
                  <div className={styles.activityMeta}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={11} />
                      {formatDisplayDate(session.date, true)}
                    </span>
                    {session.completedAt && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} />
                        {formatTime(session.completedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.activityDurationBadge}>
                <Layers size={13} color="var(--btn-primary)" />
                <span>{formatDuration(session.durationMinutes)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivitySection;

import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckSquare,
  CalendarDays,
  Timer,
  ArrowRight,
} from 'lucide-react';
import { formatDuration } from '../../utils/dateUtils';
import styles from '../../styles/Dashboard.module.css';

const SummaryStatsCards = ({
  subjectCount = 0,
  pendingTaskCount = 0,
  overdueTaskCount = 0,
  todaySessionCount = 0,
  todayStudyMinutes = 0,
  todayRecordedSessionsCount = 0,
}) => {
  return (
    <div className={styles.summaryStatsGrid} aria-label="Key study metrics">
      {/* Card 1: Total Subjects */}
      <Link to="/dashboard/subjects" className={styles.statCard} title="Manage academic subjects">
        <div className={styles.statCardTop}>
          <span className={styles.statCardLabel}>Total Subjects</span>
          <div
            className={styles.statIconWrap}
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
            }}
          >
            <BookOpen size={20} />
          </div>
        </div>

        <div className={styles.statCardBottom}>
          <div className={styles.statCardValue}>{subjectCount}</div>
          <div className={styles.statCardSubtext}>
            <span>Enrolled courses</span>
            <ArrowRight size={13} style={{ marginLeft: 'auto' }} />
          </div>
        </div>
      </Link>

      {/* Card 2: Pending Tasks */}
      <Link to="/dashboard/tasks" className={styles.statCard} title="View assignments and tasks">
        <div className={styles.statCardTop}>
          <span className={styles.statCardLabel}>Pending Tasks</span>
          <div
            className={styles.statIconWrap}
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              color: 'var(--warning)',
            }}
          >
            <CheckSquare size={20} />
          </div>
        </div>

        <div className={styles.statCardBottom}>
          <div className={styles.statCardValue}>{pendingTaskCount}</div>
          <div className={styles.statCardSubtext}>
            {overdueTaskCount > 0 ? (
              <span style={{ color: 'var(--error)', fontWeight: 700 }}>
                {overdueTaskCount} overdue
              </span>
            ) : (
              <span>All up to date</span>
            )}
            <ArrowRight size={13} style={{ marginLeft: 'auto' }} />
          </div>
        </div>
      </Link>

      {/* Card 3: Today's Scheduled Sessions */}
      <Link to="/dashboard/timetable" className={styles.statCard} title="View today's planned timetable">
        <div className={styles.statCardTop}>
          <span className={styles.statCardLabel}>Today's Schedule</span>
          <div
            className={styles.statIconWrap}
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: '#8b5cf6',
            }}
          >
            <CalendarDays size={20} />
          </div>
        </div>

        <div className={styles.statCardBottom}>
          <div className={styles.statCardValue}>{todaySessionCount}</div>
          <div className={styles.statCardSubtext}>
            <span>Planned session{todaySessionCount === 1 ? '' : 's'}</span>
            <ArrowRight size={13} style={{ marginLeft: 'auto' }} />
          </div>
        </div>
      </Link>

      {/* Card 4: Today's Recorded Study Time */}
      <Link to="/dashboard/timer" className={styles.statCard} title="View study timer and session records">
        <div className={styles.statCardTop}>
          <span className={styles.statCardLabel}>Studied Today</span>
          <div
            className={styles.statIconWrap}
            style={{
              backgroundColor: 'rgba(186, 106, 76, 0.1)',
              color: 'var(--btn-primary)',
            }}
          >
            <Timer size={20} />
          </div>
        </div>

        <div className={styles.statCardBottom}>
          <div className={styles.statCardValue}>
            {formatDuration(todayStudyMinutes)}
          </div>
          <div className={styles.statCardSubtext}>
            {todayStudyMinutes > 0 ? (
              <span>{todayRecordedSessionsCount} session{todayRecordedSessionsCount === 1 ? '' : 's'} logged</span>
            ) : (
              <span>No study logged yet</span>
            )}
            <ArrowRight size={13} style={{ marginLeft: 'auto' }} />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SummaryStatsCards;

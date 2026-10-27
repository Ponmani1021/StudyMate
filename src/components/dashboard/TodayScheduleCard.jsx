import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, ArrowRight, Plus, Calendar } from 'lucide-react';
import {
  calculateEndTime,
  formatTime12Hour,
  formatDuration,
} from '../../utils/dateUtils';
import styles from '../../styles/Dashboard.module.css';

const TodayScheduleCard = ({
  todaySessions = [],
  subjectsMap = new Map(),
}) => {
  // Sort sessions by startTime earliest first
  const sortedSessions = [...todaySessions].sort((a, b) => {
    return (a.startTime || '').localeCompare(b.startTime || '');
  });

  return (
    <div className={styles.sectionCard} aria-labelledby="today-schedule-title">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleWrap}>
          <CalendarDays size={20} color="var(--btn-primary)" />
          <h2 id="today-schedule-title" className={styles.sectionTitle}>
            Today's Study Schedule ({todaySessions.length})
          </h2>
        </div>

        <Link to="/dashboard/timetable" className={styles.sectionLink}>
          <span>View Full Timetable</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {sortedSessions.length === 0 ? (
        <div className={styles.emptyStateContainer}>
          <Calendar size={36} color="var(--border-glow)" />
          <h3 className={styles.emptyStateTitle}>No study sessions planned for today</h3>
          <p className={styles.emptyStateText}>
            Visit your timetable to schedule focused study blocks and revision times.
          </p>
          <Link to="/dashboard/timetable" className={styles.emptyStateBtn}>
            <Plus size={14} />
            <span>Plan a Session</span>
          </Link>
        </div>
      ) : (
        <div className={styles.scheduleList}>
          {sortedSessions.map((session) => {
            const subject = session.subjectId ? subjectsMap.get(session.subjectId) : null;
            const subjectName = subject ? subject.name : session.subjectName || 'General Study';
            const subjectColor = subject ? subject.color : session.subjectColor || '#8FA28A';

            const endTime = calculateEndTime(session.startTime, session.durationMinutes);
            const timeRange = `${formatTime12Hour(session.startTime)} – ${formatTime12Hour(endTime)}`;

            return (
              <div key={session.id} className={styles.scheduleItem}>
                <div className={styles.scheduleLeft}>
                  <span
                    className={styles.scheduleDot}
                    style={{ backgroundColor: subjectColor }}
                  />

                  <div className={styles.scheduleDetails}>
                    <h3 className={styles.scheduleTitle}>
                      {session.title || subjectName}
                    </h3>

                    <div className={styles.scheduleMeta}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {subjectName}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} />
                        {timeRange}
                      </span>
                      {session.notes && (
                        <>
                          <span>•</span>
                          <span style={{ fontStyle: 'italic' }}>{session.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.scheduleDurationBadge}>
                  {formatDuration(session.durationMinutes)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TodayScheduleCard;

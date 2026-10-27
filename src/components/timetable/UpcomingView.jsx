import React, { useMemo } from 'react';
import { CalendarClock, Plus } from 'lucide-react';
import StudySessionCard from './StudySessionCard';
import {
  isSessionUpcoming,
  formatDisplayDate,
  getTodayDateString,
  addDays
} from '../../utils/dateUtils';
import styles from '../../styles/Timetable.module.css';

const UpcomingView = ({
  sessions = [],
  subjects = [],
  onAddSession,
  onEditSession,
  onDeleteSession,
}) => {
  const today = getTodayDateString();
  const tomorrow = addDays(today, 1);

  const subjectsMap = useMemo(() => {
    const map = new Map();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  // Filter only upcoming sessions and group by date
  const groupedSessions = useMemo(() => {
    const upcoming = sessions
      .filter((s) => isSessionUpcoming(s))
      .sort((a, b) => {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        return a.startTime.localeCompare(b.startTime);
      });

    const groups = [];
    const dateMap = new Map();

    upcoming.forEach((session) => {
      if (!dateMap.has(session.date)) {
        dateMap.set(session.date, []);
        groups.push({
          date: session.date,
          sessions: dateMap.get(session.date),
        });
      }
      dateMap.get(session.date).push(session);
    });

    return groups;
  }, [sessions]);

  if (groupedSessions.length === 0) {
    return (
      <div className={styles.emptyStateContainer}>
        <div className={styles.emptyIconCircle}>
          <CalendarClock size={28} />
        </div>
        <h3 className={styles.emptyTitle}>No upcoming study sessions.</h3>
        <p className={styles.emptySubtitle}>
          You have no future sessions scheduled. Start planning your revision to stay on track!
        </p>
        <button
          type="button"
          className={styles.emptyActionBtn}
          onClick={onAddSession}
        >
          <Plus size={16} />
          <span>Plan a Study Session</span>
        </button>
      </div>
    );
  }

  const getDateHeaderLabel = (dateStr) => {
    if (dateStr === today) {
      return `Today — ${formatDisplayDate(dateStr, true)}`;
    }
    if (dateStr === tomorrow) {
      return `Tomorrow — ${formatDisplayDate(dateStr, true)}`;
    }
    return formatDisplayDate(dateStr, true);
  };

  return (
    <div className={styles.upcomingGroups} role="region" aria-label="Upcoming study sessions list">
      {groupedSessions.map((group) => (
        <section key={group.date} className={styles.upcomingGroup}>
          <div className={styles.upcomingDateHeader}>
            <span>{getDateHeaderLabel(group.date)}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              ({group.sessions.length} session{group.sessions.length > 1 ? 's' : ''})
            </span>
          </div>

          <div className={styles.upcomingGroupGrid}>
            {group.sessions.map((session) => (
              <StudySessionCard
                key={session.id}
                session={session}
                subject={subjectsMap.get(session.subjectId)}
                onEdit={onEditSession}
                onDelete={onDeleteSession}
                showDate={false}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default UpcomingView;

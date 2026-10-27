import React, { useMemo } from 'react';
import { Plus, CalendarX } from 'lucide-react';
import StudySessionCard from './StudySessionCard';
import styles from '../../styles/Timetable.module.css';

const DayView = ({
  sessions = [],
  subjects = [],
  selectedDate,
  onAddSession,
  onEditSession,
  onDeleteSession,
}) => {
  const subjectsMap = useMemo(() => {
    const map = new Map();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const daySessions = useMemo(() => {
    return sessions
      .filter((s) => s.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [sessions, selectedDate]);

  if (daySessions.length === 0) {
    return (
      <div className={styles.emptyStateContainer}>
        <div className={styles.emptyIconCircle}>
          <CalendarX size={28} />
        </div>
        <h3 className={styles.emptyTitle}>No study sessions planned for this day.</h3>
        <p className={styles.emptySubtitle}>
          Plan what to study and set aside dedicated time on your schedule.
        </p>
        <button
          type="button"
          className={styles.emptyActionBtn}
          onClick={onAddSession}
        >
          <Plus size={16} />
          <span>Add Study Session</span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dayViewList} role="list" aria-label="Day study sessions">
      {daySessions.map((session) => (
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
  );
};

export default DayView;

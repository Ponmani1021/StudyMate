import React, { useMemo } from 'react';
import {
  getWeekDays,
  getTodayDateString,
  formatTime12Hour,
  calculateEndTime
} from '../../utils/dateUtils';
import styles from '../../styles/Timetable.module.css';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WeekView = ({
  sessions = [],
  subjects = [],
  selectedDate,
  onEditSession,
  onSelectDate,
}) => {
  const today = getTodayDateString();

  const subjectsMap = useMemo(() => {
    const map = new Map();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const weekDays = useMemo(() => {
    return getWeekDays(selectedDate);
  }, [selectedDate]);

  return (
    <div className={styles.weekGrid} role="region" aria-label="Weekly study schedule">
      {weekDays.map((dateStr, index) => {
        const isToday = dateStr === today;
        const dayNum = dateStr.split('-')[2];
        const daySessions = sessions
          .filter((s) => s.date === dateStr)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        return (
          <div
            key={dateStr}
            className={`${styles.weekDayCol} ${isToday ? styles.isTodayCol : ''}`}
          >
            <div
              className={styles.weekDayHeader}
              onClick={() => onSelectDate && onSelectDate(dateStr)}
              style={{ cursor: 'pointer' }}
              title="Click to view day schedule"
            >
              <span className={styles.weekDayName}>{DAY_NAMES[index]}</span>
              <span className={styles.weekDayDate}>{dayNum}</span>
              {isToday && <span className={styles.todayIndicator}>Today</span>}
            </div>

            <div className={styles.weekDaySessions}>
              {daySessions.length === 0 ? (
                <div className={styles.weekEmptyDay}>No sessions</div>
              ) : (
                daySessions.map((session) => {
                  const subject = subjectsMap.get(session.subjectId);
                  const subjectName = subject?.name || 'Subject';
                  const subjectColor = subject?.color || 'var(--btn-primary)';
                  const displayTitle = session.title?.trim() || subjectName;
                  const end = calculateEndTime(session.startTime, session.durationMinutes);

                  return (
                    <div
                      key={session.id}
                      className={styles.weekSessionCard}
                      style={{ borderLeftColor: subjectColor }}
                      onClick={() => onEditSession(session)}
                      title={`Click to edit: ${displayTitle} (${formatTime12Hour(
                        session.startTime
                      )} - ${formatTime12Hour(end)})`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onEditSession(session);
                        }
                      }}
                    >
                      <span className={styles.weekSessionTime}>
                        {formatTime12Hour(session.startTime)} – {formatTime12Hour(end)}
                      </span>
                      <span className={styles.weekSessionTitle}>{displayTitle}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekView;

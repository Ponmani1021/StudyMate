import React, { useMemo } from 'react';
import { Calendar, Clock, CalendarDays, ArrowUpRight } from 'lucide-react';
import {
  getTodayDateString,
  formatDuration,
  isSessionUpcoming,
  formatTime12Hour,
  formatDisplayDate
} from '../../utils/dateUtils';
import styles from '../../styles/Timetable.module.css';

const TimetableSummary = ({ sessions = [], subjects = [] }) => {
  const subjectsMap = useMemo(() => {
    const map = new Map();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const summary = useMemo(() => {
    const today = getTodayDateString();

    // Today's sessions
    const todaySessions = sessions.filter((s) => s.date === today);
    const todayCount = todaySessions.length;
    const todayDuration = todaySessions.reduce(
      (sum, s) => sum + (Number(s.durationMinutes) || 0),
      0
    );

    // Upcoming sessions
    const upcomingSessions = sessions
      .filter((s) => isSessionUpcoming(s))
      .sort((a, b) => {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        return a.startTime.localeCompare(b.startTime);
      });

    const upcomingCount = upcomingSessions.length;
    const nextSession = upcomingSessions[0] || null;

    let nextSessionTitle = 'None scheduled';
    let nextSessionSubtext = 'No upcoming sessions';

    if (nextSession) {
      const subject = subjectsMap.get(nextSession.subjectId);
      const subjectName = subject?.name || 'Subject';
      const timeStr = formatTime12Hour(nextSession.startTime);
      nextSessionTitle = `${subjectName}`;

      if (nextSession.date === today) {
        nextSessionSubtext = `Today at ${timeStr}`;
      } else {
        const dateStr = formatDisplayDate(nextSession.date, true);
        nextSessionSubtext = `${dateStr} • ${timeStr}`;
      }
    }

    return {
      todayCount,
      todayDuration: formatDuration(todayDuration),
      upcomingCount,
      nextSessionTitle,
      nextSessionSubtext,
    };
  }, [sessions, subjectsMap]);

  return (
    <div className={styles.summaryGrid} role="region" aria-label="Timetable summary statistics">
      {/* 1. Today's Sessions */}
      <div className={styles.summaryCard}>
        <div
          className={styles.summaryIconWrap}
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}
        >
          <Calendar size={20} />
        </div>
        <div className={styles.summaryInfo}>
          <span className={styles.summaryValue}>{summary.todayCount}</span>
          <span className={styles.summaryLabel}>Today's Sessions</span>
        </div>
      </div>

      {/* 2. Today's Planned Study Time */}
      <div className={styles.summaryCard}>
        <div
          className={styles.summaryIconWrap}
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}
        >
          <Clock size={20} />
        </div>
        <div className={styles.summaryInfo}>
          <span className={styles.summaryValue}>{summary.todayDuration}</span>
          <span className={styles.summaryLabel}>Planned Study Time</span>
        </div>
      </div>

      {/* 3. Upcoming Sessions */}
      <div className={styles.summaryCard}>
        <div
          className={styles.summaryIconWrap}
          style={{
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            color: '#a78bfa',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}
        >
          <CalendarDays size={20} />
        </div>
        <div className={styles.summaryInfo}>
          <span className={styles.summaryValue}>{summary.upcomingCount}</span>
          <span className={styles.summaryLabel}>Upcoming Sessions</span>
        </div>
      </div>

      {/* 4. Next Session */}
      <div className={styles.summaryCard}>
        <div
          className={styles.summaryIconWrap}
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}
        >
          <ArrowUpRight size={20} />
        </div>
        <div className={styles.summaryInfo}>
          <span className={styles.summaryValue} title={summary.nextSessionTitle}>
            {summary.nextSessionTitle}
          </span>
          <span className={styles.nextSubtext}>{summary.nextSessionSubtext}</span>
        </div>
      </div>
    </div>
  );
};

export default TimetableSummary;

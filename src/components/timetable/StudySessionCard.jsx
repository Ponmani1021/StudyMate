import React from 'react';
import { Clock, Edit2, Trash2, FileText, Calendar } from 'lucide-react';
import {
  calculateEndTime,
  formatTime12Hour,
  formatDuration,
  formatDisplayDate
} from '../../utils/dateUtils';
import styles from '../../styles/Timetable.module.css';

const StudySessionCard = ({
  session,
  subject,
  onEdit,
  onDelete,
  showDate = false,
}) => {
  const subjectName = subject?.name || 'Untitled Subject';
  const subjectColor = subject?.color || 'var(--btn-primary)';
  const displayTitle = session.title?.trim() || subjectName;

  const endTime = calculateEndTime(session.startTime, session.durationMinutes);
  const formattedStart = formatTime12Hour(session.startTime);
  const formattedEnd = formatTime12Hour(endTime);
  const durationText = formatDuration(session.durationMinutes);

  return (
    <article className={styles.sessionCard} role="listitem">
      {/* Accent color strip on left side */}
      <div
        className={styles.cardColorStrip}
        style={{ backgroundColor: subjectColor }}
      />

      <div className={styles.sessionCardContent}>
        <div className={styles.cardTopRow}>
          <div className={styles.subjectBadge}>
            <span
              className={styles.subjectDot}
              style={{ backgroundColor: subjectColor }}
            />
            <span>{subjectName}</span>
          </div>

          <span className={styles.timeDurationBadge}>{durationText}</span>
        </div>

        <h3 className={styles.sessionTitle}>{displayTitle}</h3>

        <div className={styles.timeRow}>
          <Clock size={15} />
          <span>
            {formattedStart} – {formattedEnd}
          </span>
        </div>

        {showDate && (
          <div className={styles.timeRow} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <Calendar size={14} />
            <span>{formatDisplayDate(session.date, true)}</span>
          </div>
        )}

        {session.notes && (
          <div className={styles.notesBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
              <FileText size={12} />
              <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Notes:</strong>
            </div>
            <div>{session.notes}</div>
          </div>
        )}

        <div className={styles.cardActionsRow}>
          <button
            type="button"
            className={styles.cardActionBtn}
            onClick={() => onEdit(session)}
            aria-label={`Edit session ${displayTitle}`}
          >
            <Edit2 size={13} />
            <span>Edit</span>
          </button>
          <button
            type="button"
            className={`${styles.cardActionBtn} ${styles.cardDeleteBtn}`}
            onClick={() => onDelete(session)}
            aria-label={`Delete session ${displayTitle}`}
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default StudySessionCard;

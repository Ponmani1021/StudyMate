import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Clock, AlertCircle, BookOpen, ExternalLink } from 'lucide-react';
import { DURATION_PRESETS } from '../../services/timetableStorage';
import {
  getTodayDateString,
  calculateEndTime,
  crossesMidnight,
  formatTime12Hour,
  checkSessionOverlap,
  formatDisplayDate
} from '../../utils/dateUtils';
import modalStyles from '../../styles/Modal.module.css';
import timetableStyles from '../../styles/Timetable.module.css';

const StudySessionModal = ({
  onClose,
  onSave,
  sessionToEdit = null,
  initialDate = null,
  subjects = [],
  existingSessions = [],
}) => {
  const [subjectId, setSubjectId] = useState(() => {
    if (sessionToEdit) return sessionToEdit.subjectId;
    return subjects.length > 0 ? subjects[0].id : '';
  });

  const [title, setTitle] = useState(() => sessionToEdit?.title || '');
  const [date, setDate] = useState(() => {
    if (sessionToEdit?.date) return sessionToEdit.date;
    if (initialDate) return initialDate;
    return getTodayDateString();
  });
  const [startTime, setStartTime] = useState(() => sessionToEdit?.startTime || '09:00');
  const [durationMinutes, setDurationMinutes] = useState(() => sessionToEdit?.durationMinutes || 60);
  const [notes, setNotes] = useState(() => sessionToEdit?.notes || '');
  const [error, setError] = useState('');

  const subjectSelectRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Dynamic end time preview
  const calculatedEndTime = calculateEndTime(startTime, durationMinutes);
  const isCrossingMidnight = crossesMidnight(startTime, durationMinutes);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!subjectId) {
      setError('Please select a subject for this session.');
      return;
    }

    if (!date) {
      setError('Please select a valid date.');
      return;
    }

    if (!startTime) {
      setError('Please select a start time.');
      return;
    }

    const durationNum = Number(durationMinutes);
    if (isNaN(durationNum) || durationNum <= 0) {
      setError('Please specify a positive duration in minutes.');
      return;
    }

    if (isCrossingMidnight) {
      setError('Session cannot extend into the next day. Please choose a duration or start time that ends before midnight.');
      return;
    }

    // Overlap validation
    const overlapResult = checkSessionOverlap(
      existingSessions,
      {
        date,
        startTime,
        durationMinutes: durationNum,
      },
      sessionToEdit ? sessionToEdit.id : null
    );

    if (overlapResult.hasOverlap) {
      const conflict = overlapResult.conflictingSession;
      const conflictSubject = subjects.find((s) => s.id === conflict.subjectId);
      const conflictSubjectName = conflictSubject?.name || conflict.title || 'Session';
      const conflictEnd = calculateEndTime(conflict.startTime, conflict.durationMinutes);

      setError(
        `Time conflict: This overlaps with "${conflictSubjectName}" scheduled from ${formatTime12Hour(
          conflict.startTime
        )} to ${formatTime12Hour(conflictEnd)} on ${formatDisplayDate(date)}.`
      );
      return;
    }

    // Validation passed
    onSave({
      subjectId,
      title: title.trim(),
      date,
      startTime,
      durationMinutes: durationNum,
      notes: notes.trim(),
    });
  };

  return (
    <div className={modalStyles.modalOverlay} onClick={onClose} role="presentation">
      <div
        className={modalStyles.modalCard}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-modal-title"
      >
        <div className={modalStyles.modalHeader}>
          <h2 id="session-modal-title" className={modalStyles.modalTitle}>
            {sessionToEdit ? 'Edit Study Session' : 'Add Study Session'}
          </h2>
          <button
            type="button"
            className={modalStyles.closeBtn}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={modalStyles.modalBody}>
            {error && (
              <div
                style={{
                  backgroundColor: '#FDF2F2',
                  border: '1px solid var(--error)',
                  color: 'var(--error)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                }}
                role="alert"
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Subject Dropdown */}
            <div className={modalStyles.formGroup}>
              <label htmlFor="session-subject" className={modalStyles.label}>
                <span>Subject *</span>
              </label>
              {subjects.length === 0 ? (
                <div className={timetableStyles.noSubjectsWarning}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                    <BookOpen size={16} />
                    <span>No subjects available</span>
                  </div>
                  <p style={{ margin: 0 }}>
                    You need to create at least one subject before scheduling a study session.
                  </p>
                  <Link
                    to="/dashboard/subjects"
                    className={timetableStyles.linkToSubjects}
                    onClick={onClose}
                  >
                    <span>Go to Subjects Module</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>
              ) : (
                <select
                  ref={subjectSelectRef}
                  id="session-subject"
                  className={modalStyles.input}
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    if (error) setError('');
                  }}
                  required
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Session Title (Optional) */}
            <div className={modalStyles.formGroup}>
              <label htmlFor="session-title" className={modalStyles.label}>
                <span>Session Title</span>
                <span className={modalStyles.optionalTag}>Optional (Defaults to Subject Name)</span>
              </label>
              <input
                id="session-title"
                type="text"
                className={modalStyles.input}
                placeholder="e.g., Morning Revision, Chapter 3 Practice"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
              />
            </div>

            {/* Date and Start Time Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className={modalStyles.formGroup}>
                <label htmlFor="session-date" className={modalStyles.label}>
                  <span>Date *</span>
                </label>
                <input
                  id="session-date"
                  type="date"
                  className={modalStyles.input}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (error) setError('');
                  }}
                  required
                />
              </div>

              <div className={modalStyles.formGroup}>
                <label htmlFor="session-start-time" className={modalStyles.label}>
                  <span>Start Time *</span>
                </label>
                <input
                  id="session-start-time"
                  type="time"
                  className={modalStyles.input}
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    if (error) setError('');
                  }}
                  required
                />
              </div>
            </div>

            {/* Duration Selector */}
            <div className={modalStyles.formGroup}>
              <label htmlFor="session-duration" className={modalStyles.label}>
                <span>Duration (minutes) *</span>
              </label>

              <div className={timetableStyles.durationPresetGroup}>
                {DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`${timetableStyles.presetChip} ${
                      Number(durationMinutes) === preset ? timetableStyles.chipActive : ''
                    }`}
                    onClick={() => {
                      setDurationMinutes(preset);
                      if (error) setError('');
                    }}
                  >
                    {preset}m
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 8 }}>
                <input
                  id="session-duration"
                  type="number"
                  min="5"
                  max="480"
                  step="5"
                  className={modalStyles.input}
                  placeholder="Custom duration in minutes"
                  value={durationMinutes}
                  onChange={(e) => {
                    setDurationMinutes(e.target.value);
                    if (error) setError('');
                  }}
                  required
                />
              </div>
            </div>

            {/* Calculated End Time Indicator */}
            {calculatedEndTime && (
              <div className={timetableStyles.calculatedEndTimeBox}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={16} />
                  <span>Calculated End Time:</span>
                </div>
                <span
                  className={timetableStyles.endTimeValue}
                  style={isCrossingMidnight ? { color: 'var(--error)' } : {}}
                >
                  {formatTime12Hour(calculatedEndTime)}
                  {isCrossingMidnight && ' (Crosses midnight!)'}
                </span>
              </div>
            )}

            {/* Notes */}
            <div className={modalStyles.formGroup}>
              <label htmlFor="session-notes" className={modalStyles.label}>
                <span>Notes & Focus Area</span>
                <span className={modalStyles.optionalTag}>Optional</span>
              </label>
              <textarea
                id="session-notes"
                className={modalStyles.textarea}
                placeholder="Key concepts to review, homework problems to finish..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className={modalStyles.modalFooter}>
            <button type="button" className={modalStyles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={modalStyles.saveBtn}
              disabled={subjects.length === 0}
            >
              {sessionToEdit ? 'Save Changes' : 'Save Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudySessionModal;

import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, BookOpen, FileText } from 'lucide-react';
import { getTodayDateString } from '../../utils/dateUtils';
import styles from '../../styles/Modal.module.css';

const QUICK_MINUTES = [15, 25, 30, 45, 60, 90, 120];

const ManualLogForm = ({ onClose, onSave, subjects }) => {
  const [subjectId, setSubjectId] = useState(() => subjects[0]?.id || '');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [date, setDate] = useState(() => getTodayDateString());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const mins = parseInt(durationMinutes, 10);
    if (isNaN(mins) || mins <= 0 || mins > 720) {
      setError('Please enter a valid study duration between 1 and 720 minutes.');
      return;
    }
    if (!date) {
      setError('Please select a valid date.');
      return;
    }

    const selectedSubject = subjects.find((s) => s.id === subjectId);
    let sessionCompletedAt;
    try {
      if (date === getTodayDateString()) {
        sessionCompletedAt = new Date().toISOString();
      } else {
        sessionCompletedAt = new Date(`${date}T12:00:00`).toISOString();
      }
    } catch {
      sessionCompletedAt = new Date().toISOString();
    }

    onSave({
      subjectId: subjectId || null,
      subjectName: selectedSubject ? selectedSubject.name : 'General Study',
      subjectColor: selectedSubject ? selectedSubject.color : '#8FA28A',
      durationMinutes: mins,
      date,
      completedAt: sessionCompletedAt,
      notes: notes.trim(),
      mode: 'custom',
    });

    onClose();
  };

  return (
    <>
      <div className={styles.modalHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Clock size={20} color="var(--btn-primary)" />
          <h2 id="manual-session-modal-title" className={styles.modalTitle}>
            Log Past Study Session
          </h2>
        </div>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.modalBody}>
          {error && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                backgroundColor: '#fdf2f2',
                color: 'var(--error)',
                fontSize: '0.85rem',
                border: '1px solid #fecaca',
              }}
            >
              {error}
            </div>
          )}

          {/* Subject Field */}
          <div className={styles.formGroup}>
            <label htmlFor="manual-subj" className={styles.label}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={14} />
                Subject
              </span>
            </label>
            <select
              id="manual-subj"
              className={styles.input}
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value="">General Study (No specific subject)</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Duration in Minutes */}
          <div className={styles.formGroup}>
            <label htmlFor="manual-duration" className={styles.label}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} />
                Study Duration (Minutes)
              </span>
            </label>
            <input
              id="manual-duration"
              type="number"
              min="1"
              max="720"
              className={styles.input}
              value={durationMinutes}
              onChange={(e) => {
                setDurationMinutes(e.target.value);
                setError('');
              }}
              required
            />

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {QUICK_MINUTES.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  style={{
                    background:
                      Number(durationMinutes) === mins
                        ? 'var(--btn-primary)'
                        : 'var(--bg-surface-alt)',
                    color:
                      Number(durationMinutes) === mins
                        ? '#ffffff'
                        : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 14,
                    padding: '3px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Date Field */}
          <div className={styles.formGroup}>
            <label htmlFor="manual-date" className={styles.label}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} />
                Session Date
              </span>
            </label>
            <input
              id="manual-date"
              type="date"
              className={styles.input}
              value={date}
              max={getTodayDateString()}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Notes / Topics Covered */}
          <div className={styles.formGroup}>
            <label htmlFor="manual-notes" className={styles.label}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={14} />
                Notes / Topics Covered
              </span>
              <span className={styles.optionalTag}>Optional</span>
            </label>
            <textarea
              id="manual-notes"
              className={styles.textarea}
              placeholder="What did you study during this session?"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={160}
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn}>
            Save Session Record
          </button>
        </div>
      </form>
    </>
  );
};

const ManualLogModal = ({
  isOpen,
  onClose,
  onSave,
  subjects = [],
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="presentation">
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-session-modal-title"
      >
        <ManualLogForm onClose={onClose} onSave={onSave} subjects={subjects} />
      </div>
    </div>
  );
};

export default ManualLogModal;

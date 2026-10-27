import React from 'react';
import { BookOpen, ListTodo, Volume2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../../styles/StudyTimer.module.css';

const TimerSubjectSelector = ({
  subjects = [],
  selectedSubjectId,
  onSelectSubject,
  notes,
  onChangeNotes,
  tasks = [],
  onSelectTask,
  soundEnabled,
  onToggleSound,
  onTestSound,
}) => {
  // Pending tasks for quick selection
  const pendingTasks = tasks.filter((t) => t.status !== 'completed').slice(0, 3);

  return (
    <div className={styles.configCard}>
      <div className={styles.cardSectionHeader}>
        <h2 className={styles.cardSectionTitle}>
          <BookOpen size={18} color="var(--btn-primary)" />
          <span>Session Focus & Subject</span>
        </h2>
        {subjects.length === 0 && (
          <Link
            to="/dashboard/subjects"
            style={{
              fontSize: '0.8rem',
              color: 'var(--btn-primary)',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Plus size={13} />
            <span>Add Subjects</span>
          </Link>
        )}
      </div>

      {/* Subject Dropdown */}
      <div className={styles.formGroup}>
        <label htmlFor="timer-subject-select" className={styles.formLabel}>
          Select Subject
        </label>
        <select
          id="timer-subject-select"
          className={styles.selectInput}
          value={selectedSubjectId || ''}
          onChange={(e) => onSelectSubject(e.target.value)}
        >
          <option value="">General Study (No specific subject)</option>
          {subjects.map((subj) => (
            <option key={subj.id} value={subj.id}>
              {subj.name}
            </option>
          ))}
        </select>
      </div>

      {/* Focus Note or Task Goal */}
      <div className={styles.formGroup}>
        <label htmlFor="timer-note-input" className={styles.formLabel}>
          Session Goal / Topic (Optional)
        </label>
        <input
          id="timer-note-input"
          type="text"
          className={styles.textInput}
          placeholder="e.g. Chapter 4 Exercises, Research paper reading..."
          value={notes}
          onChange={(e) => onChangeNotes(e.target.value)}
          maxLength={80}
        />
      </div>

      {/* Quick Task Selection if available */}
      {pendingTasks.length > 0 && (
        <div className={styles.tasksPickerBox}>
          <span className={styles.tasksPickerTitle}>
            <ListTodo size={13} style={{ display: 'inline', marginRight: 4 }} />
            Quick link to an assignment or task:
          </span>
          <div className={styles.taskChipsList}>
            {pendingTasks.map((t) => (
              <button
                key={t.id}
                type="button"
                className={styles.taskChip}
                onClick={() => onSelectTask(t)}
                title={`Focus on: ${t.title}`}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.title}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                  }}
                >
                  Link
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sound alert options */}
      <div className={styles.optionsToggleRow}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => onToggleSound(e.target.checked)}
            style={{ accentColor: 'var(--btn-primary)', cursor: 'pointer' }}
          />
          <Volume2 size={16} />
          <span>Play chime on finish</span>
        </label>

        {soundEnabled && (
          <button
            type="button"
            className={styles.soundTestBtn}
            onClick={onTestSound}
            title="Preview chime sound"
          >
            Preview sound
          </button>
        )}
      </div>
    </div>
  );
};

export default TimerSubjectSelector;

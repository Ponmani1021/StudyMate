import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, AlertCircle, ExternalLink, Flag } from 'lucide-react';
import { getTodayDateString } from '../../utils/dateUtils';
import modalStyles from '../../styles/Modal.module.css';
import taskStyles from '../../styles/Tasks.module.css';

const TaskModal = ({
  onClose,
  onSave,
  taskToEdit = null,
  subjects = [],
}) => {
  const [title, setTitle] = useState(() => taskToEdit?.title || '');
  const [description, setDescription] = useState(() => taskToEdit?.description || '');
  const [subjectId, setSubjectId] = useState(() => taskToEdit?.subjectId || '');
  const [dueDate, setDueDate] = useState(() => taskToEdit?.dueDate || getTodayDateString());
  const [priority, setPriority] = useState(() => taskToEdit?.priority || 'medium');
  const [error, setError] = useState('');

  const titleInputRef = useRef(null);

  useEffect(() => {
    // Focus title input
    const timer = setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Task title is required.');
      if (titleInputRef.current) titleInputRef.current.focus();
      return;
    }

    if (!dueDate) {
      setError('Please select a due date.');
      return;
    }

    if (!['high', 'medium', 'low'].includes(priority)) {
      setError('Please select a valid priority level.');
      return;
    }

    onSave({
      title: trimmedTitle,
      description: description.trim(),
      subjectId: subjectId || null,
      dueDate,
      priority,
    });
  };

  return (
    <div className={modalStyles.modalOverlay} onClick={onClose} role="presentation">
      <div
        className={modalStyles.modalCard}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
      >
        <div className={modalStyles.modalHeader}>
          <h2 id="task-modal-title" className={modalStyles.modalTitle}>
            {taskToEdit ? 'Edit Task' : 'Add New Task'}
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

            {/* Task Title */}
            <div className={modalStyles.formGroup}>
              <label htmlFor="task-title" className={modalStyles.label}>
                <span>Task Title *</span>
              </label>
              <input
                ref={titleInputRef}
                id="task-title"
                type="text"
                className={`${modalStyles.input} ${error && !title.trim() ? modalStyles.inputError : ''}`}
                placeholder="e.g., Complete Python Assignment, Prepare Notes for DBMS"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>

            {/* Description */}
            <div className={modalStyles.formGroup}>
              <label htmlFor="task-description" className={modalStyles.label}>
                <span>Description</span>
                <span className={modalStyles.optionalTag}>Optional</span>
              </label>
              <textarea
                id="task-description"
                className={modalStyles.textarea}
                placeholder="Add subtasks, instructions, reference chapters, or submission details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Subject Select */}
            <div className={modalStyles.formGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="task-subject" className={modalStyles.label}>
                  <span>Associated Subject</span>
                  <span className={modalStyles.optionalTag}>Optional</span>
                </label>
                {subjects.length === 0 && (
                  <Link
                    to="/dashboard/subjects"
                    onClick={onClose}
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--btn-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontWeight: 600,
                    }}
                  >
                    <span>+ Add Subjects</span>
                    <ExternalLink size={12} />
                  </Link>
                )}
              </div>
              <select
                id="task-subject"
                className={modalStyles.input}
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                <option value="">No Subject (General Task)</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className={modalStyles.formGroup}>
              <label htmlFor="task-due-date" className={modalStyles.label}>
                <span>Due Date *</span>
              </label>
              <input
                id="task-due-date"
                type="date"
                className={modalStyles.input}
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>

            {/* Priority Selection */}
            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>
                <span>Priority Level *</span>
              </label>
              <div className={taskStyles.prioritySelectGrid} role="radiogroup" aria-label="Select priority">
                <button
                  type="button"
                  role="radio"
                  aria-checked={priority === 'high'}
                  className={`${taskStyles.priorityOptionBtn} ${
                    priority === 'high' ? taskStyles.selectedHigh : ''
                  }`}
                  onClick={() => setPriority('high')}
                >
                  <Flag size={15} />
                  <span>High</span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={priority === 'medium'}
                  className={`${taskStyles.priorityOptionBtn} ${
                    priority === 'medium' ? taskStyles.selectedMedium : ''
                  }`}
                  onClick={() => setPriority('medium')}
                >
                  <Flag size={15} />
                  <span>Medium</span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={priority === 'low'}
                  className={`${taskStyles.priorityOptionBtn} ${
                    priority === 'low' ? taskStyles.selectedLow : ''
                  }`}
                  onClick={() => setPriority('low')}
                >
                  <Flag size={15} />
                  <span>Low</span>
                </button>
              </div>
            </div>
          </div>

          <div className={modalStyles.modalFooter}>
            <button type="button" className={modalStyles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={modalStyles.saveBtn}>
              {taskToEdit ? 'Save Changes' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

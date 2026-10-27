import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import { SUBJECT_COLOR_PRESETS, isDuplicateSubjectName } from '../../services/subjectStorage';
import styles from '../../styles/Modal.module.css';

const SubjectModal = ({ onClose, onSave, subjectToEdit, existingSubjects = [] }) => {
  const [name, setName] = useState(() => subjectToEdit?.name || '');
  const [description, setDescription] = useState(() => subjectToEdit?.description || '');
  const [color, setColor] = useState(() => subjectToEdit?.color || SUBJECT_COLOR_PRESETS[0].value);
  const [error, setError] = useState('');

  const nameInputRef = useRef(null);

  useEffect(() => {
    // Auto-focus input
    const timer = setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 50);

    // Handle escape key
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
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Subject name is required.');
      if (nameInputRef.current) nameInputRef.current.focus();
      return;
    }

    const currentId = subjectToEdit ? subjectToEdit.id : null;
    if (isDuplicateSubjectName(existingSubjects, trimmedName, currentId)) {
      setError(`A subject named "${trimmedName}" already exists. Please choose a different name.`);
      if (nameInputRef.current) nameInputRef.current.focus();
      return;
    }

    onSave({
      name: trimmedName,
      description: description.trim(),
      color,
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="presentation">
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subject-modal-title"
      >
        <div className={styles.modalHeader}>
          <h2 id="subject-modal-title" className={styles.modalTitle}>
            {subjectToEdit ? 'Edit Subject' : 'Add New Subject'}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label htmlFor="subject-name" className={styles.label}>
                <span>Subject Name *</span>
              </label>
              <input
                ref={nameInputRef}
                id="subject-name"
                type="text"
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                placeholder="e.g., Mathematics, Database Management, Python"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                required
              />
              {error && <span className={styles.errorMessage}>{error}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="subject-description" className={styles.label}>
                <span>Description</span>
                <span className={styles.optionalTag}>Optional</span>
              </label>
              <textarea
                id="subject-description"
                className={styles.textarea}
                placeholder="Brief summary of syllabus, instructor, or key topics covered..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className={styles.colorPickerGroup}>
              <label className={styles.label}>
                <span>Subject Color Accent</span>
              </label>
              <div className={styles.colorPalette} role="radiogroup" aria-label="Select subject color">
                {SUBJECT_COLOR_PRESETS.map((preset) => {
                  const isSelected = color === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      title={preset.label}
                      className={`${styles.colorOption} ${isSelected ? styles.colorSelected : ''}`}
                      style={{ backgroundColor: preset.value }}
                      onClick={() => setColor(preset.value)}
                    >
                      {isSelected && <Check size={16} className={styles.colorCheck} strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn}>
              {subjectToEdit ? 'Save Changes' : 'Save Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectModal;

import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import styles from '../../styles/Modal.module.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, subjectName, confirmLabel = 'Delete' }) => {
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="presentation">
      <div
        className={`${styles.modalCard} ${styles.confirmCard}`}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={22} color="var(--error)" />
            <h2 id="confirm-modal-title" className={styles.modalTitle}>
              {title || 'Confirm Deletion'}
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

        <div className={styles.modalBody}>
          <p className={styles.confirmText}>
            {message || (
              <>
                Are you sure you want to delete <span className={styles.confirmHighlight}>"{subjectName}"</span>?
                This action cannot be undone.
              </>
            )}
          </p>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={styles.deleteBtn} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

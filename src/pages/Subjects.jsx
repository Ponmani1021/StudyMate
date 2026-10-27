import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  BookOpen,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import {
  getStoredSubjects,
  saveSubjectsToStorage,
  generateSubjectId
} from '../services/subjectStorage';
import SubjectModal from '../components/subjects/SubjectModal';
import ConfirmModal from '../components/common/ConfirmModal';
import styles from '../styles/Subjects.module.css';

const Subjects = () => {
  const [subjects, setSubjects] = useState(() => getStoredSubjects());

  useEffect(() => {
    const handleUpdate = () => {
      setSubjects(getStoredSubjects());
    };

    window.addEventListener('studymate_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('studymate_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setSubjectToEdit(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (subject) => {
    setSubjectToEdit(subject);
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubjectToEdit(null);
  };

  // Save Subject (Add or Edit)
  const handleSaveSubject = ({ name, description, color }) => {
    let updatedList;
    if (subjectToEdit) {
      // Edit existing
      updatedList = subjects.map((sub) => {
        if (sub.id === subjectToEdit.id) {
          return {
            ...sub,
            name,
            description,
            color,
            updatedAt: new Date().toISOString(),
          };
        }
        return sub;
      });
      showToast(`Subject "${name}" updated successfully!`);
    } else {
      // Create new
      const newSubject = {
        id: generateSubjectId(),
        name,
        description,
        color,
        createdAt: new Date().toISOString(),
      };
      updatedList = [newSubject, ...subjects];
      showToast(`Subject "${name}" added successfully!`);
    }

    setSubjects(updatedList);
    saveSubjectsToStorage(updatedList);
    handleCloseModal();
  };

  // Open Delete Confirmation
  const handleOpenDeleteModal = (subject) => {
    setSubjectToDelete(subject);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!subjectToDelete) return;
    const updatedList = subjects.filter((sub) => sub.id !== subjectToDelete.id);
    setSubjects(updatedList);
    saveSubjectsToStorage(updatedList);
    showToast(`Subject "${subjectToDelete.name}" deleted.`);
    setSubjectToDelete(null);
  };

  // Filtered subjects based on search query
  const filteredSubjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter((sub) => sub.name.toLowerCase().includes(q));
  }, [subjects, searchQuery]);

  // Format created date
  const formatDate = (isoString) => {
    if (!isoString) return 'Added recently';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Added recently';
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Page Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerText}>
          <h1 className={styles.pageTitle}>Subjects</h1>
          <p className={styles.pageDescription}>
            Organize and manage your study subjects.
          </p>
        </div>
        <button
          type="button"
          className={styles.addSubjectBtn}
          onClick={handleOpenAddModal}
          aria-label="Add a new subject"
        >
          <Plus size={18} />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Search Input (visible if there are subjects or active search) */}
      {(subjects.length > 0 || searchQuery) && (
        <div className={styles.searchBarWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search subjects by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search subjects by name"
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Main Content: List, Search Empty, or Empty State */}
      {subjects.length === 0 ? (
        /* Empty State when no subjects exist */
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyIconCircle}>
            <BookOpen size={30} />
          </div>
          <h2 className={styles.emptyTitle}>No subjects added yet.</h2>
          <p className={styles.emptySubtitle}>
            Start organizing your studies by adding your first subject.
          </p>
          <button
            type="button"
            className={styles.emptyActionBtn}
            onClick={handleOpenAddModal}
          >
            <Plus size={18} />
            <span>Add Your First Subject</span>
          </button>
        </div>
      ) : filteredSubjects.length === 0 ? (
        /* Empty State when search has no matches */
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyIconCircle}>
            <Search size={30} />
          </div>
          <h2 className={styles.emptyTitle}>No subjects found</h2>
          <p className={styles.emptySubtitle}>
            No subjects match your search for "<strong>{searchQuery}</strong>".
          </p>
          <button
            type="button"
            className={styles.clearSearchActionBtn}
            onClick={() => setSearchQuery('')}
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        /* Subject Cards Responsive Grid */
        <div className={styles.cardsGrid} role="list" aria-label="Subject cards">
          {filteredSubjects.map((subject) => {
            const subjectColor = subject.color || 'var(--bg-primary)';
            return (
              <article
                key={subject.id}
                className={styles.subjectCard}
                role="listitem"
              >
                {/* Color bar at top of card */}
                <div
                  className={styles.cardColorBar}
                  style={{ backgroundColor: subjectColor }}
                />

                <div className={styles.cardMain}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.subjectTitle}>{subject.name}</h2>
                    <span
                      className={styles.colorBadge}
                      style={{ backgroundColor: subjectColor }}
                      title={`Color: ${subjectColor}`}
                    />
                  </div>

                  {subject.description ? (
                    <p className={styles.subjectDescription}>{subject.description}</p>
                  ) : (
                    <p className={styles.noDescription}>No description provided.</p>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.cardMeta}>
                    <Calendar size={14} />
                    <span>{formatDate(subject.createdAt)}</span>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => handleOpenEditModal(subject)}
                      aria-label={`Edit ${subject.name}`}
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => handleOpenDeleteModal(subject)}
                      aria-label={`Delete ${subject.name}`}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      {isModalOpen && (
        <SubjectModal
          onClose={handleCloseModal}
          onSave={handleSaveSubject}
          subjectToEdit={subjectToEdit}
          existingSubjects={subjects}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!subjectToDelete}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Subject"
        subjectName={subjectToDelete?.name}
      />

      {/* Toast feedback */}
      {toastMessage && (
        <div className={styles.toastNotice} role="status">
          <CheckCircle2 size={18} color="var(--success)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Subjects;

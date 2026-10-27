import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { getStoredSubjects } from '../services/subjectStorage';
import {
  getStoredSessions,
  saveSessionsToStorage,
  generateSessionId
} from '../services/timetableStorage';
import { getTodayDateString } from '../utils/dateUtils';

import TimetableSummary from '../components/timetable/TimetableSummary';
import TimetableToolbar from '../components/timetable/TimetableToolbar';
import DayView from '../components/timetable/DayView';
import WeekView from '../components/timetable/WeekView';
import UpcomingView from '../components/timetable/UpcomingView';
import StudySessionModal from '../components/timetable/StudySessionModal';
import ConfirmModal from '../components/common/ConfirmModal';

import styles from '../styles/Timetable.module.css';

const Timetable = () => {
  const [sessions, setSessions] = useState(() => getStoredSessions());
  const [subjects, setSubjects] = useState(() => getStoredSubjects());

  useEffect(() => {
    const handleUpdate = () => {
      setSessions(getStoredSessions());
      setSubjects(getStoredSubjects());
    };

    window.addEventListener('studymate_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('studymate_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);
  const [activeView, setActiveView] = useState('day'); // 'day' | 'week' | 'upcoming'
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState(null);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleOpenAddModal = (dateForSession = null) => {
    setSessionToEdit(null);
    if (dateForSession) {
      setSelectedDate(dateForSession);
    }
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (session) => {
    setSessionToEdit(session);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSessionToEdit(null);
  };

  // Save Session (Create or Update)
  const handleSaveSession = ({
    subjectId,
    title,
    date,
    startTime,
    durationMinutes,
    notes,
  }) => {
    let updatedList;
    const nowIso = new Date().toISOString();

    if (sessionToEdit) {
      // Edit existing session
      updatedList = sessions.map((s) => {
        if (s.id === sessionToEdit.id) {
          return {
            ...s,
            subjectId,
            title,
            date,
            startTime,
            durationMinutes,
            notes,
            updatedAt: nowIso,
          };
        }
        return s;
      });
      showToast('Study session updated successfully!');
    } else {
      // Add new session
      const newSession = {
        id: generateSessionId(),
        subjectId,
        title,
        date,
        startTime,
        durationMinutes,
        notes,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      updatedList = [newSession, ...sessions];
      showToast('Study session added to your timetable!');
    }

    setSessions(updatedList);
    saveSessionsToStorage(updatedList);
    handleCloseModal();
  };

  // Delete Session Handlers
  const handleOpenDeleteModal = (session) => {
    setSessionToDelete(session);
  };

  const handleConfirmDelete = () => {
    if (!sessionToDelete) return;
    const updatedList = sessions.filter((s) => s.id !== sessionToDelete.id);
    setSessions(updatedList);
    saveSessionsToStorage(updatedList);
    showToast('Study session removed from timetable.');
    setSessionToDelete(null);
  };

  const deleteTargetSubject = subjects.find(
    (s) => s.id === sessionToDelete?.subjectId
  );
  const deleteTargetTitle =
    sessionToDelete?.title?.trim() ||
    deleteTargetSubject?.name ||
    'Study Session';

  return (
    <div className={styles.timetableContainer}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerText}>
          <h1 className={styles.pageTitle}>Study Timetable</h1>
          <p className={styles.pageDescription}>
            Plan your study sessions and organize your time effectively.
          </p>
        </div>

        <button
          type="button"
          className={styles.addSessionBtn}
          onClick={() => handleOpenAddModal(selectedDate)}
          aria-label="Add a new study session"
        >
          <Plus size={18} />
          <span>Add Study Session</span>
        </button>
      </div>

      {/* Summary Cards */}
      <TimetableSummary sessions={sessions} subjects={subjects} />

      {/* View Switcher and Date Navigation Toolbar */}
      <TimetableToolbar
        activeView={activeView}
        onViewChange={setActiveView}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Active View Display */}
      {activeView === 'day' && (
        <DayView
          sessions={sessions}
          subjects={subjects}
          selectedDate={selectedDate}
          onAddSession={() => handleOpenAddModal(selectedDate)}
          onEditSession={handleOpenEditModal}
          onDeleteSession={handleOpenDeleteModal}
        />
      )}

      {activeView === 'week' && (
        <WeekView
          sessions={sessions}
          subjects={subjects}
          selectedDate={selectedDate}
          onEditSession={handleOpenEditModal}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setActiveView('day');
          }}
        />
      )}

      {activeView === 'upcoming' && (
        <UpcomingView
          sessions={sessions}
          subjects={subjects}
          onAddSession={() => handleOpenAddModal(selectedDate)}
          onEditSession={handleOpenEditModal}
          onDeleteSession={handleOpenDeleteModal}
        />
      )}

      {/* Add / Edit Session Modal */}
      {isModalOpen && (
        <StudySessionModal
          onClose={handleCloseModal}
          onSave={handleSaveSession}
          sessionToEdit={sessionToEdit}
          initialDate={selectedDate}
          subjects={subjects}
          existingSessions={sessions}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Study Session"
        message={
          <>
            Are you sure you want to delete the scheduled session for{' '}
            <strong>"{deleteTargetTitle}"</strong>?
          </>
        }
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className={styles.toastNotice} role="status">
          <CheckCircle2 size={18} color="var(--success)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Timetable;

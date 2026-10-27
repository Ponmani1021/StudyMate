import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Timer as TimerIcon, Plus, Info } from 'lucide-react';

import { getStoredSubjects } from '../services/subjectStorage';
import { getStoredTasks } from '../services/taskStorage';
import {
  getStoredStudySessions,
  addStudySession,
  deleteStudySession,
  getTimerSettings,
  saveTimerSettings,
  calculateStudyStats,
  playTimerAlertChime,
} from '../services/studySessionStorage';
import { getTodayDateString } from '../utils/dateUtils';

import TimerDisplay from '../components/timer/TimerDisplay';
import TimerControls from '../components/timer/TimerControls';
import TimerModeSelector from '../components/timer/TimerModeSelector';
import TimerSubjectSelector from '../components/timer/TimerSubjectSelector';
import StudyStatsSummary from '../components/timer/StudyStatsSummary';
import SessionHistory from '../components/timer/SessionHistory';
import ManualLogModal from '../components/timer/ManualLogModal';
import SessionCompleteModal from '../components/timer/SessionCompleteModal';
import ConfirmModal from '../components/common/ConfirmModal';

import styles from '../styles/StudyTimer.module.css';

const StudyTimer = () => {
  // Subjects and tasks loaded from storage
  const [subjects, setSubjects] = useState(() => getStoredSubjects());
  const [tasks, setTasks] = useState(() => getStoredTasks());

  // Timer configuration & user preferences
  const [settings, setSettings] = useState(() => getTimerSettings());

  // Active study sessions in localStorage
  const [sessions, setSessions] = useState(() => getStoredStudySessions());

  // Sync data on cross-module storage update
  useEffect(() => {
    const handleUpdate = () => {
      setSubjects(getStoredSubjects());
      setTasks(getStoredTasks());
      setSettings(getTimerSettings());
      setSessions(getStoredStudySessions());
    };

    window.addEventListener('studymate_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('studymate_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Selected subject & session note
  const [selectedSubjectId, setSelectedSubjectId] = useState(() => subjects[0]?.id || '');
  const [sessionNotes, setSessionNotes] = useState('');

  // Timer state
  const [mode, setMode] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak' | 'custom'
  const [customMinutes, setCustomMinutes] = useState(30);
  const [durationMinutes, setDurationMinutes] = useState(settings.pomodoroMinutes || 25);
  const [timeLeft, setTimeLeft] = useState((settings.pomodoroMinutes || 25) * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCycle, setPomodoroCycle] = useState(1);

  // Modals state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [completedSessionToCelebrate, setCompletedSessionToCelebrate] = useState(null);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState(null);

  const originalTitleRef = useRef(document.title);

  // Lookup for currently selected subject
  const currentSubject = useMemo(() => {
    if (!selectedSubjectId) return null;
    return subjects.find((s) => s.id === selectedSubjectId) || null;
  }, [selectedSubjectId, subjects]);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Update browser tab title with live countdown
  useEffect(() => {
    const originalTitle = originalTitleRef.current;
    if (isRunning) {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      const prefix = mode === 'focus' || mode === 'custom' ? '🎯' : '☕';
      const subjName = currentSubject?.name || 'Study';
      document.title = `${prefix} (${formatted}) ${subjName} | StudyMate`;
    } else {
      document.title = originalTitle || 'StudyMate';
    }

    return () => {
      document.title = originalTitle || 'StudyMate';
    };
  }, [timeLeft, isRunning, mode, currentSubject]);

  // Action triggered when timer reaches 00:00
  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);

    const isStudySession = mode === 'focus' || mode === 'custom';

    if (isStudySession) {
      // Auto-record completed study session
      const nowIso = new Date().toISOString();
      const newSession = addStudySession({
        subjectId: currentSubject ? currentSubject.id : null,
        subjectName: currentSubject ? currentSubject.name : 'General Study',
        subjectColor: currentSubject ? currentSubject.color : '#8FA28A',
        durationMinutes: durationMinutes,
        date: getTodayDateString(),
        completedAt: nowIso,
        notes: sessionNotes.trim(),
        mode: mode,
      });

      // Update local state
      setSessions((prev) => [newSession, ...prev]);

      if (settings.soundEnabled) {
        playTimerAlertChime('focusComplete');
      }

      setCompletedSessionToCelebrate(newSession);
      setPomodoroCycle((prev) => (prev >= (settings.longBreakInterval || 4) ? 1 : prev + 1));
    } else {
      // Break session finished
      if (settings.soundEnabled) {
        playTimerAlertChime('breakComplete');
      }
      showToast('Break finished! Ready for your next focus session.');
      setMode('focus');
      setDurationMinutes(settings.pomodoroMinutes || 25);
      setTimeLeft((settings.pomodoroMinutes || 25) * 60);
    }
  }, [
    mode,
    currentSubject,
    durationMinutes,
    sessionNotes,
    settings.soundEnabled,
    settings.longBreakInterval,
    settings.pomodoroMinutes,
    showToast,
  ]);

  // Handle countdown interval
  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning, handleTimerComplete]);

  // Start / Pause controls
  const handleStart = () => {
    if (timeLeft <= 0) {
      setTimeLeft(durationMinutes * 60);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(durationMinutes * 60);
  };

  // Switch between Focus, Short Break, Long Break, Custom
  const handleSwitchMode = (newMode, minutes) => {
    setIsRunning(false);
    setMode(newMode);
    setDurationMinutes(minutes);
    setTimeLeft(minutes * 60);
  };

  // Skip to next phase
  const handleSkip = () => {
    setIsRunning(false);
    if (mode === 'focus' || mode === 'custom') {
      const isLongBreak = pomodoroCycle >= (settings.longBreakInterval || 4);
      const nextMode = isLongBreak ? 'longBreak' : 'shortBreak';
      const mins = isLongBreak
        ? settings.longBreakMinutes || 15
        : settings.shortBreakMinutes || 5;
      handleSwitchMode(nextMode, mins);
      showToast(`Skipped to ${isLongBreak ? 'Long' : 'Short'} Break.`);
    } else {
      handleSwitchMode('focus', settings.pomodoroMinutes || 25);
      showToast('Switched to Focus session.');
    }
  };

  // Log partial focus if user stops early
  const elapsedSeconds = durationMinutes * 60 - timeLeft;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const canLogCurrent =
    (mode === 'focus' || mode === 'custom') && elapsedMinutes >= 1;

  const handleLogCurrentFocus = () => {
    if (elapsedMinutes < 1) return;

    const newSession = addStudySession({
      subjectId: currentSubject ? currentSubject.id : null,
      subjectName: currentSubject ? currentSubject.name : 'General Study',
      subjectColor: currentSubject ? currentSubject.color : '#8FA28A',
      durationMinutes: elapsedMinutes,
      date: getTodayDateString(),
      completedAt: new Date().toISOString(),
      notes: sessionNotes.trim() ? `${sessionNotes.trim()} (partial session)` : 'Partial session',
      mode: mode,
    });

    setSessions((prev) => [newSession, ...prev]);
    setIsRunning(false);
    setTimeLeft(durationMinutes * 60);
    showToast(`Logged ${elapsedMinutes} minutes of focused study!`);
  };

  // Sound toggle & preview
  const handleToggleSound = (enabled) => {
    const updated = saveTimerSettings({ soundEnabled: enabled });
    setSettings(updated);
    showToast(enabled ? 'Timer sound alert enabled.' : 'Timer sound alert muted.');
  };

  const handleTestSound = () => {
    playTimerAlertChime('focusComplete');
  };

  // Update daily goal
  const handleUpdateDailyGoal = (newGoal) => {
    const updated = saveTimerSettings({ dailyGoalMinutes: newGoal });
    setSettings(updated);
    showToast(`Daily study goal updated to ${newGoal} minutes.`);
  };

  // Quick link task into timer
  const handleSelectTask = (task) => {
    if (task.subjectId) {
      setSelectedSubjectId(task.subjectId);
    }
    setSessionNotes(`Focus on: ${task.title}`);
    showToast(`Linked task "${task.title}".`);
  };

  // Delete session handler
  const handleConfirmDelete = () => {
    if (!sessionToDelete) return;
    const updated = deleteStudySession(sessionToDelete.id);
    setSessions(updated);
    setSessionToDelete(null);
    showToast('Study session deleted.');
  };

  // Manual session save handler
  const handleSaveManualSession = (sessionData) => {
    const newSession = addStudySession(sessionData);
    setSessions((prev) => [newSession, ...prev]);
    showToast(`Recorded ${sessionData.durationMinutes}m for ${sessionData.subjectName}!`);
  };

  // Modal actions after completion celebration
  const handleStartBreakAfterCelebration = () => {
    setCompletedSessionToCelebrate(null);
    const isLong = pomodoroCycle >= (settings.longBreakInterval || 4);
    const breakMode = isLong ? 'longBreak' : 'shortBreak';
    const breakMins = isLong ? settings.longBreakMinutes || 15 : settings.shortBreakMinutes || 5;
    handleSwitchMode(breakMode, breakMins);
    setIsRunning(true);
  };

  const handleStartNextFocusAfterCelebration = () => {
    setCompletedSessionToCelebrate(null);
    handleSwitchMode('focus', settings.pomodoroMinutes || 25);
    setIsRunning(true);
  };

  // Calculated statistics
  const studyStats = useMemo(() => {
    return calculateStudyStats(
      sessions,
      subjects,
      getTodayDateString(),
      settings.dailyGoalMinutes || 120
    );
  }, [sessions, subjects, settings.dailyGoalMinutes]);

  return (
    <div className={styles.pageContainer}>
      {/* Header Row */}
      <div className={styles.headerRow}>
        <div className={styles.headerText}>
          <h1 className={styles.pageTitle}>Study Timer</h1>
          <p className={styles.pageDescription}>
            Focus on your academic subjects using the Pomodoro technique and track your study time.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.secondaryActionBtn}
            onClick={() => setIsManualModalOpen(true)}
          >
            <Plus size={16} />
            <span>Log Past Session</span>
          </button>
        </div>
      </div>

      {/* Main Timer Section: Left = Timer Card, Right = Subject & Notes Card */}
      <div className={styles.timerLayoutGrid}>
        {/* Left: Interactive Timer Card */}
        <div
          className={`${styles.timerMainCard} ${
            mode === 'focus' || mode === 'custom'
              ? isRunning ? styles.activeFocus : ''
              : isRunning ? styles.activeBreak : ''
          }`}
        >
          {/* Mode Selector Tabs */}
          <TimerModeSelector
            activeMode={mode}
            onSelectMode={(newMode, mins) => handleSwitchMode(newMode, mins)}
            customMinutes={customMinutes}
            onChangeCustomMinutes={(mins) => {
              setCustomMinutes(mins);
              handleSwitchMode('custom', mins);
            }}
            settings={settings}
          />

          {/* Big Visual Circular Countdown Ring */}
          <TimerDisplay
            timeLeft={timeLeft}
            totalDurationSeconds={durationMinutes * 60}
            mode={mode}
            isRunning={isRunning}
            subject={currentSubject}
            notes={sessionNotes}
            pomodoroCycle={pomodoroCycle}
            totalCycles={settings.longBreakInterval || 4}
          />

          {/* Controls: Play/Pause, Reset, Skip, Audio Toggle, Save Partial Focus */}
          <TimerControls
            isRunning={isRunning}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
            onSkip={handleSkip}
            onLogCurrentFocus={handleLogCurrentFocus}
            soundEnabled={settings.soundEnabled}
            onToggleSound={() => handleToggleSound(!settings.soundEnabled)}
            canLogCurrent={canLogCurrent}
            elapsedMinutes={elapsedMinutes}
          />
        </div>

        {/* Right: Subject Selection & Notes */}
        <div className={styles.sideColumn}>
          <TimerSubjectSelector
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            onSelectSubject={setSelectedSubjectId}
            notes={sessionNotes}
            onChangeNotes={setSessionNotes}
            tasks={tasks}
            onSelectTask={handleSelectTask}
            soundEnabled={settings.soundEnabled}
            onToggleSound={handleToggleSound}
            onTestSound={handleTestSound}
          />

          {/* Helper Pomodoro Info */}
          <div
            style={{
              padding: '16px',
              borderRadius: '14px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            <Info size={18} color="var(--btn-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>The Pomodoro Method:</strong> Study for 25 minutes with full concentration, take a 5-minute break to refresh, and after 4 study sessions, take a longer 15-minute break. All completed focus sessions are recorded to your statistics below.
            </div>
          </div>
        </div>
      </div>

      {/* Calculated Study Statistics & Subject Breakdown */}
      <StudyStatsSummary
        stats={studyStats}
        dailyGoalMinutes={settings.dailyGoalMinutes || 120}
        onUpdateDailyGoal={handleUpdateDailyGoal}
      />

      {/* Session History Log */}
      <SessionHistory
        sessions={sessions}
        subjects={subjects}
        onDeleteSession={(s) => setSessionToDelete(s)}
        onOpenManualModal={() => setIsManualModalOpen(true)}
      />

      {/* Manual Session Logging Modal */}
      <ManualLogModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSave={handleSaveManualSession}
        subjects={subjects}
      />

      {/* Session Completion Celebration Modal */}
      <SessionCompleteModal
        isOpen={Boolean(completedSessionToCelebrate)}
        onClose={() => setCompletedSessionToCelebrate(null)}
        completedSession={completedSessionToCelebrate}
        onStartBreak={handleStartBreakAfterCelebration}
        onStartNextFocus={handleStartNextFocusAfterCelebration}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(sessionToDelete)}
        onClose={() => setSessionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Session Record"
        message={`Are you sure you want to delete this recorded session of ${sessionToDelete?.durationMinutes} minutes for ${sessionToDelete?.subjectName || 'General Study'}?`}
        confirmLabel="Delete Session"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className={styles.toastNotice} role="status">
          <TimerIcon size={16} color="var(--btn-primary)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default StudyTimer;

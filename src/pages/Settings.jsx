import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Clock,
  Sun,
  Moon,
  User,
  Download,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';

import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { getDailyStudyGoal, saveDailyStudyGoal } from '../services/studySessionStorage';
import { exportStudyMateData } from '../services/exportService';
import { getStoredSubjects } from '../services/subjectStorage';
import { getStoredSessions } from '../services/timetableStorage';
import { getStoredTasks } from '../services/taskStorage';
import { getStoredStudySessions } from '../services/studySessionStorage';

import styles from '../styles/Settings.module.css';

const GOAL_HOUR_PRESETS = [1, 1.5, 2, 2.5, 3, 4, 5];

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { user, updateUser } = useAuth();

  // Study Goal State (stored in minutes, edited in hours)
  const [goalHours, setGoalHours] = useState(() => {
    const mins = getDailyStudyGoal();
    return Math.round((mins / 60) * 10) / 10;
  });
  const [goalStatus, setGoalStatus] = useState(null); // { type: 'success' | 'error', message: string }

  // Profile Form State
  const [displayName, setDisplayName] = useState(
    () => user?.displayName || user?.username || 'Ponmani'
  );
  const [email, setEmail] = useState(() => user?.email || '');
  const [profileStatus, setProfileStatus] = useState(null);

  // Export State & Summary Counts
  const [exportStatus, setExportStatus] = useState(null);
  const [dataCounts, setDataCounts] = useState(() => ({
    subjects: getStoredSubjects().length,
    timetable: getStoredSessions().length,
    tasks: getStoredTasks().length,
    sessions: getStoredStudySessions().length,
  }));

  useEffect(() => {
    const handleUpdate = () => {
      setDataCounts({
        subjects: getStoredSubjects().length,
        timetable: getStoredSessions().length,
        tasks: getStoredTasks().length,
        sessions: getStoredStudySessions().length,
      });
      const mins = getDailyStudyGoal();
      setGoalHours(Math.round((mins / 60) * 10) / 10);
    };

    window.addEventListener('studymate_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('studymate_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Global Toast Notice
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 1. Handle Study Goal Save
  const handleSaveGoal = (e) => {
    e.preventDefault();
    setGoalStatus(null);

    const val = parseFloat(goalHours);
    if (isNaN(val) || val < 0.5 || val > 24) {
      setGoalStatus({
        type: 'error',
        message: 'Please enter a valid daily study goal between 0.5 and 24 hours.',
      });
      return;
    }

    const minutes = Math.round(val * 60);
    saveDailyStudyGoal(minutes);

    setGoalStatus({
      type: 'success',
      message: `Daily goal saved: ${val} hour${val === 1 ? '' : 's'} (${minutes} mins). Progress & Analytics updated.`,
    });
    showToast(`Saved daily study target of ${val}h (${minutes}m)!`);
  };

  // 2. Handle Profile Preferences Save
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileStatus(null);

    const trimmedName = displayName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setProfileStatus({
        type: 'error',
        message: 'Display name cannot be left blank.',
      });
      return;
    }

    if (trimmedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setProfileStatus({
          type: 'error',
          message: 'Please enter a valid email address.',
        });
        return;
      }
    }

    if (updateUser) {
      updateUser({
        displayName: trimmedName,
        email: trimmedEmail,
      });
    }

    setProfileStatus({
      type: 'success',
      message: 'Profile preferences updated successfully.',
    });
    showToast('Profile information updated!');
  };

  // 3. Handle JSON Data Export
  const handleExportData = () => {
    setExportStatus(null);
    const result = exportStudyMateData(user, theme);

    if (result.success) {
      setExportStatus({
        type: 'success',
        message: `Successfully generated and downloaded backup file: ${result.filename}`,
      });
      showToast('StudyMate backup file downloaded successfully!');
    } else {
      setExportStatus({
        type: 'error',
        message: result.error || 'Failed to export study records.',
      });
    }
  };

  // Calculated minute equivalent for the current goal hours input
  const parsedHours = parseFloat(goalHours);
  const calculatedMinutes =
    !isNaN(parsedHours) && parsedHours > 0 ? Math.round(parsedHours * 60) : 0;

  return (
    <div className={styles.pageContainer}>
      {/* Page Header */}
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>Settings</h1>
        <p className={styles.pageDescription}>
          Customize your StudyMate experience, manage preferences, and export study data.
        </p>
      </div>

      <div className={styles.sectionsStack}>
        {/* SECTION 1: Study Preferences */}
        <section className={styles.settingsCard} aria-labelledby="section-study-preferences">
          <div className={styles.cardHeader}>
            <div
              className={styles.cardIconWrap}
              style={{
                backgroundColor: 'rgba(186, 106, 76, 0.1)',
                color: 'var(--btn-primary)',
              }}
            >
              <Clock size={20} />
            </div>
            <div className={styles.cardHeaderText}>
              <h2 id="section-study-preferences" className={styles.cardTitle}>
                Study Preferences
              </h2>
              <p className={styles.cardSubtitle}>
                Configure your target daily study hours. Progress & Analytics and Study Timer use this target to measure your daily consistency.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveGoal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {goalStatus && (
              <div
                className={goalStatus.type === 'success' ? styles.alertSuccess : styles.alertError}
                role="alert"
              >
                {goalStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{goalStatus.message}</span>
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="daily-goal-hours" className={styles.label}>
                <span>Daily Study Goal (Hours)</span>
                {calculatedMinutes > 0 && (
                  <span className={styles.minuteEquivalentTag}>
                    = {calculatedMinutes} minutes/day
                  </span>
                )}
              </label>

              <input
                id="daily-goal-hours"
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                className={styles.input}
                value={goalHours}
                onChange={(e) => {
                  setGoalHours(e.target.value);
                  setGoalStatus(null);
                }}
                required
              />

              <span className={styles.helperText}>
                Enter between 0.5 and 24 hours per day (in 0.5-hour increments).
              </span>
            </div>

            {/* Quick Presets */}
            <div className={styles.presetsRow}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Quick options:
              </span>
              {GOAL_HOUR_PRESETS.map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  className={`${styles.presetBtn} ${
                    parseFloat(goalHours) === hrs ? styles.activePreset : ''
                  }`}
                  onClick={() => {
                    setGoalHours(hrs);
                    setGoalStatus(null);
                  }}
                >
                  {hrs} {hrs === 1 ? 'hr' : 'hrs'}
                </button>
              ))}
            </div>

            <button type="submit" className={styles.saveBtn}>
              <span>Save Study Target</span>
            </button>
          </form>
        </section>

        {/* SECTION 2: Appearance (Theme Switching) */}
        <section className={styles.settingsCard} aria-labelledby="section-appearance">
          <div className={styles.cardHeader}>
            <div
              className={styles.cardIconWrap}
              style={{
                backgroundColor: 'rgba(57, 122, 88, 0.12)',
                color: 'var(--success)',
              }}
            >
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <div className={styles.cardHeaderText}>
              <h2 id="section-appearance" className={styles.cardTitle}>
                Appearance
              </h2>
              <p className={styles.cardSubtitle}>
                Choose between Light Theme and Dark Theme. The selected theme takes effect immediately and persists across sessions.
              </p>
            </div>
          </div>

          <div className={styles.themeTilesGrid} role="radiogroup" aria-label="Theme Selection">
            {/* Light Theme Tile */}
            <div
              role="radio"
              aria-checked={theme === 'light'}
              tabIndex={0}
              className={`${styles.themeTile} ${theme === 'light' ? styles.activeThemeTile : ''}`}
              onClick={() => {
                setTheme('light');
                showToast('Light theme activated!');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setTheme('light');
                }
              }}
            >
              <div className={styles.themeTileContent}>
                <div
                  className={styles.themeIconWrap}
                  style={{
                    backgroundColor: 'rgba(183, 121, 31, 0.12)',
                    color: '#B7791F',
                  }}
                >
                  <Sun size={20} />
                </div>
                <div>
                  <h3 className={styles.themeTileTitle}>Light Theme</h3>
                  <p className={styles.themeTileDesc}>Clean white surfaces and earthy forest tones</p>
                </div>
              </div>

              <div
                className={`${styles.checkCircle} ${
                  theme === 'light' ? styles.activeCheckCircle : ''
                }`}
              >
                {theme === 'light' && <Check size={14} />}
              </div>
            </div>

            {/* Dark Theme Tile */}
            <div
              role="radio"
              aria-checked={theme === 'dark'}
              tabIndex={0}
              className={`${styles.themeTile} ${theme === 'dark' ? styles.activeThemeTile : ''}`}
              onClick={() => {
                setTheme('dark');
                showToast('Dark theme activated!');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setTheme('dark');
                }
              }}
            >
              <div className={styles.themeTileContent}>
                <div
                  className={styles.themeIconWrap}
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.12)',
                    color: '#a78bfa',
                  }}
                >
                  <Moon size={20} />
                </div>
                <div>
                  <h3 className={styles.themeTileTitle}>Dark Theme</h3>
                  <p className={styles.themeTileDesc}>Slate gray backgrounds with gentle contrast for night study</p>
                </div>
              </div>

              <div
                className={`${styles.checkCircle} ${
                  theme === 'dark' ? styles.activeCheckCircle : ''
                }`}
              >
                {theme === 'dark' && <Check size={14} />}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Profile Preferences */}
        <section className={styles.settingsCard} aria-labelledby="section-profile">
          <div className={styles.cardHeader}>
            <div
              className={styles.cardIconWrap}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#60a5fa',
              }}
            >
              <User size={20} />
            </div>
            <div className={styles.cardHeaderText}>
              <h2 id="section-profile" className={styles.cardTitle}>
                Profile Preferences
              </h2>
              <p className={styles.cardSubtitle}>
                Manage your student identity information. Changes update your greeting across the application immediately.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {profileStatus && (
              <div
                className={profileStatus.type === 'success' ? styles.alertSuccess : styles.alertError}
                role="alert"
              >
                {profileStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{profileStatus.message}</span>
              </div>
            )}

            <div className={styles.profileFieldsGrid}>
              {/* Username (Fixed / System ID) */}
              <div className={styles.formGroup}>
                <label htmlFor="profile-username" className={styles.label}>
                  Username
                </label>
                <input
                  id="profile-username"
                  type="text"
                  className={styles.input}
                  value={user?.username || 'Ponmani'}
                  disabled
                  title="System login username cannot be changed"
                />
                <span className={styles.helperText}>
                  Your primary account login identifier.
                </span>
              </div>

              {/* Display Name */}
              <div className={styles.formGroup}>
                <label htmlFor="profile-displayname" className={styles.label}>
                  Display Name
                </label>
                <input
                  id="profile-displayname"
                  type="text"
                  className={styles.input}
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    setProfileStatus(null);
                  }}
                  placeholder="e.g. Ponmani"
                  maxLength={40}
                  required
                />
                <span className={styles.helperText}>
                  Shown on your dashboard greeting and sidebar.
                </span>
              </div>
            </div>

            <div className={styles.profileFieldsGrid}>
              {/* Email Address */}
              <div className={styles.formGroup}>
                <label htmlFor="profile-email" className={styles.label}>
                  <span>Email Address</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                    Optional
                  </span>
                </label>
                <input
                  id="profile-email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setProfileStatus(null);
                  }}
                  placeholder="e.g. ponmani@university.edu"
                  maxLength={60}
                />
                <span className={styles.helperText}>
                  Optional contact email for your study profile.
                </span>
              </div>

              {/* Account Role */}
              <div className={styles.formGroup}>
                <label htmlFor="profile-role" className={styles.label}>
                  Account Type
                </label>
                <input
                  id="profile-role"
                  type="text"
                  className={styles.input}
                  value={user?.role || 'Student Account'}
                  disabled
                />
                <span className={styles.helperText}>
                  Standard student access privileges.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={14} color="var(--success)" />
              <span>Authentication credentials and passwords are kept secure and are never displayed.</span>
            </div>

            <button type="submit" className={styles.saveBtn}>
              <span>Update Profile</span>
            </button>
          </form>
        </section>

        {/* SECTION 4: Export Study Data */}
        <section className={styles.settingsCard} aria-labelledby="section-export">
          <div className={styles.cardHeader}>
            <div
              className={styles.cardIconWrap}
              style={{
                backgroundColor: 'rgba(183, 121, 31, 0.12)',
                color: 'var(--warning)',
              }}
            >
              <Download size={20} />
            </div>
            <div className={styles.cardHeaderText}>
              <h2 id="section-export" className={styles.cardTitle}>
                Export Study Data
              </h2>
              <p className={styles.cardSubtitle}>
                Download your complete StudyMate data as a JSON file for your personal records, offline backup, or transfer.
              </p>
            </div>
          </div>

          <div className={styles.exportSummaryBox}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Data Included in Backup:
            </span>

            <div className={styles.exportMetricsRow}>
              <div className={styles.exportMetricItem}>
                <span className={styles.exportMetricValue}>{dataCounts.subjects}</span>
                <span className={styles.exportMetricLabel}>Enrolled Subjects</span>
              </div>

              <div className={styles.exportMetricItem}>
                <span className={styles.exportMetricValue}>{dataCounts.timetable}</span>
                <span className={styles.exportMetricLabel}>Timetable Sessions</span>
              </div>

              <div className={styles.exportMetricItem}>
                <span className={styles.exportMetricValue}>{dataCounts.tasks}</span>
                <span className={styles.exportMetricLabel}>Assignments & Tasks</span>
              </div>

              <div className={styles.exportMetricItem}>
                <span className={styles.exportMetricValue}>{dataCounts.sessions}</span>
                <span className={styles.exportMetricLabel}>Recorded Focus Sessions</span>
              </div>
            </div>

            <p className={styles.exportNote}>
              <strong>Note:</strong> Exporting produces a standard <code>.json</code> file. Your data remains stored safely in your browser and is never deleted, modified, or sent to an external server.
            </p>
          </div>

          {exportStatus && (
            <div
              className={exportStatus.type === 'success' ? styles.alertSuccess : styles.alertError}
              role="alert"
            >
              {exportStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{exportStatus.message}</span>
            </div>
          )}

          <button
            type="button"
            className={styles.exportBtn}
            onClick={handleExportData}
          >
            <Download size={18} />
            <span>Export JSON Backup</span>
          </button>
        </section>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className={styles.toastNotice} role="status">
          <SettingsIcon size={16} color="var(--btn-primary)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Settings;

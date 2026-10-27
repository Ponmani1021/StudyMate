import React, { useState, useMemo } from 'react';
import {
  History,
  Trash2,
  Plus,
  Clock,
  Calendar,
  Layers,
  Inbox,
} from 'lucide-react';
import {
  formatDisplayDate,
  formatDuration,
  getTodayDateString,
  getWeekDays,
} from '../../utils/dateUtils';
import styles from '../../styles/StudyTimer.module.css';

const SessionHistory = ({
  sessions = [],
  subjects = [],
  onDeleteSession,
  onOpenManualModal,
}) => {
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'week'
  const [subjectFilter, setSubjectFilter] = useState('all');

  const today = getTodayDateString();
  const currentWeekDays = useMemo(() => new Set(getWeekDays(today)), [today]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      // Date filter
      if (dateFilter === 'today' && s.date !== today) {
        return false;
      }
      if (dateFilter === 'week' && !currentWeekDays.has(s.date)) {
        return false;
      }

      // Subject filter
      if (subjectFilter !== 'all') {
        if (subjectFilter === 'unassigned') {
          if (s.subjectId) return false;
        } else if (s.subjectId !== subjectFilter) {
          return false;
        }
      }

      return true;
    });
  }, [sessions, dateFilter, subjectFilter, today, currentWeekDays]);

  const formatCompletionTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className={styles.historySection}>
      <div className={styles.historyHeaderRow}>
        <h2 className={styles.historyTitle}>
          <History size={20} color="var(--btn-primary)" />
          <span>Recorded Focus Sessions ({filteredSessions.length})</span>
        </h2>

        <div className={styles.historyFiltersRow}>
          {/* Date Filter */}
          <select
            className={styles.filterSelect}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            aria-label="Filter by date"
          >
            <option value="all">All Dates</option>
            <option value="today">Today Only</option>
            <option value="week">This Week</option>
          </select>

          {/* Subject Filter */}
          <select
            className={styles.filterSelect}
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            aria-label="Filter by subject"
          >
            <option value="all">All Subjects</option>
            <option value="unassigned">General Study</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          {/* Manual Log Button */}
          <button
            type="button"
            className={styles.secondaryActionBtn}
            onClick={onOpenManualModal}
            style={{ padding: '7px 12px', fontSize: '0.85rem' }}
          >
            <Plus size={15} />
            <span>Log Past Session</span>
          </button>
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <Inbox size={42} />
          </div>
          <h3 className={styles.emptyStateTitle}>No study sessions recorded yet</h3>
          <p className={styles.emptyStateText}>
            {sessions.length === 0
              ? 'Complete a focus session above or manually record your offline study time to see it here.'
              : 'No sessions match your selected date or subject filters.'}
          </p>
          {sessions.length === 0 && (
            <button
              type="button"
              className={styles.primaryActionBtn}
              onClick={onOpenManualModal}
              style={{ marginTop: 8 }}
            >
              <Plus size={16} />
              <span>Log Past Study Session</span>
            </button>
          )}
        </div>
      ) : (
        <div className={styles.historyList}>
          {filteredSessions.map((s) => (
            <div key={s.id} className={styles.historyCard}>
              <div className={styles.historyLeft}>
                <span
                  className={styles.historySubjectDot}
                  style={{ backgroundColor: s.subjectColor || '#8FA28A' }}
                />

                <div className={styles.historyDetails}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h4 className={styles.historySubjectTitle}>
                      {s.subjectName || 'General Study'}
                    </h4>
                    {s.mode === 'custom' && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '1px 6px',
                          borderRadius: 4,
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-color)',
                          textTransform: 'uppercase',
                        }}
                      >
                        Custom
                      </span>
                    )}
                  </div>

                  {s.notes && <p className={styles.historyNotes}>{s.notes}</p>}

                  <div className={styles.historyMeta}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} />
                      {formatDisplayDate(s.date, true)}
                    </span>
                    {s.completedAt && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} />
                        {formatCompletionTime(s.completedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.historyRight}>
                <div className={styles.historyDurationBadge}>
                  <Layers size={13} color="var(--btn-primary)" />
                  <span>{formatDuration(s.durationMinutes)}</span>
                </div>

                <button
                  type="button"
                  className={styles.deleteSessionBtn}
                  onClick={() => onDeleteSession(s)}
                  title="Delete recorded session"
                  aria-label="Delete recorded session"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionHistory;

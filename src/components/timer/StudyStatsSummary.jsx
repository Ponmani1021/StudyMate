import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Flame,
  Award,
  BookOpen,
  Edit2,
  Check,
} from 'lucide-react';
import { formatDuration } from '../../utils/dateUtils';
import styles from '../../styles/StudyTimer.module.css';

const StudyStatsSummary = ({
  stats,
  dailyGoalMinutes,
  onUpdateDailyGoal,
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [customGoal, setCustomGoal] = useState(dailyGoalMinutes || 120);

  const handleSaveGoal = () => {
    const val = parseInt(customGoal, 10);
    if (!isNaN(val) && val > 0 && val <= 720) {
      onUpdateDailyGoal(val);
    }
    setIsEditingGoal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 4 Quick Stat Cards */}
      <div className={styles.statsSummaryGrid}>
        {/* Today's Study Time */}
        <div className={styles.statCard}>
          <div className={styles.statTopRow}>
            <span className={styles.statLabel}>Today's Focus</span>
            <div
              className={styles.statIconWrap}
              style={{
                backgroundColor: 'rgba(186, 106, 76, 0.1)',
                color: 'var(--btn-primary)',
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          <div>
            <div className={styles.statValue}>
              {formatDuration(stats.todayMinutes)}
            </div>
            <div className={styles.statSubtext}>
              {stats.todaySessionsCount} session{stats.todaySessionsCount === 1 ? '' : 's'} recorded today
            </div>
          </div>
        </div>

        {/* This Week's Study Time */}
        <div className={styles.statCard}>
          <div className={styles.statTopRow}>
            <span className={styles.statLabel}>This Week</span>
            <div
              className={styles.statIconWrap}
              style={{
                backgroundColor: 'rgba(57, 122, 88, 0.1)',
                color: 'var(--success)',
              }}
            >
              <Calendar size={18} />
            </div>
          </div>
          <div>
            <div className={styles.statValue}>
              {formatDuration(stats.weekMinutes)}
            </div>
            <div className={styles.statSubtext}>
              Monday to Sunday total
            </div>
          </div>
        </div>

        {/* Total Sessions Recorded */}
        <div className={styles.statCard}>
          <div className={styles.statTopRow}>
            <span className={styles.statLabel}>Total Sessions</span>
            <div
              className={styles.statIconWrap}
              style={{
                backgroundColor: 'rgba(183, 121, 31, 0.1)',
                color: 'var(--warning)',
              }}
            >
              <Flame size={18} />
            </div>
          </div>
          <div>
            <div className={styles.statValue}>
              {stats.totalSessionsCount}
            </div>
            <div className={styles.statSubtext}>
              {formatDuration(stats.totalMinutes)} all-time focused
            </div>
          </div>
        </div>

        {/* Daily Study Goal */}
        <div className={styles.statCard}>
          <div className={styles.statTopRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className={styles.statLabel}>Daily Goal</span>
              {!isEditingGoal && (
                <button
                  type="button"
                  onClick={() => setIsEditingGoal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: 0,
                    display: 'flex',
                  }}
                  title="Edit daily goal"
                  aria-label="Edit daily goal"
                >
                  <Edit2 size={12} />
                </button>
              )}
            </div>
            <div
              className={styles.statIconWrap}
              style={{
                backgroundColor: 'rgba(143, 162, 138, 0.15)',
                color: '#586744',
              }}
            >
              <Award size={18} />
            </div>
          </div>

          <div>
            {isEditingGoal ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0' }}>
                <input
                  type="number"
                  min="15"
                  max="720"
                  step="15"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  style={{
                    width: 70,
                    padding: '4px 6px',
                    borderRadius: 6,
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                  }}
                  autoFocus
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>mins</span>
                <button
                  type="button"
                  onClick={handleSaveGoal}
                  style={{
                    background: 'var(--btn-primary)',
                    border: 'none',
                    borderRadius: 6,
                    color: '#fff',
                    padding: '4px 8px',
                    cursor: 'pointer',
                  }}
                  title="Save goal"
                >
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <div className={styles.statValue}>
                {stats.goalProgressPercent}%
              </div>
            )}

            <div className={styles.statSubtext}>
              {stats.todayMinutes} / {dailyGoalMinutes} mins completed
            </div>

            <div className={styles.goalProgressBarBg}>
              <div
                className={styles.goalProgressBarFill}
                style={{ width: `${stats.goalProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subject Study Breakdown */}
      {stats.subjectBreakdown.length > 0 && (
        <div className={styles.subjectBreakdownCard}>
          <div className={styles.cardSectionHeader}>
            <h2 className={styles.cardSectionTitle}>
              <BookOpen size={18} color="var(--btn-primary)" />
              <span>Subject Study Breakdown</span>
            </h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Based on recorded sessions
            </span>
          </div>

          <div className={styles.subjectBreakdownList}>
            {stats.subjectBreakdown.map((item) => (
              <div key={item.subjectId || 'unassigned'} className={styles.subjectProgressItem}>
                <div className={styles.subjectProgressHeader}>
                  <div className={styles.subjectProgressName}>
                    <span
                      className={styles.subjectDot}
                      style={{ backgroundColor: item.subjectColor }}
                    />
                    <span>{item.subjectName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ({item.count} session{item.count === 1 ? '' : 's'})
                    </span>
                  </div>
                  <div className={styles.subjectProgressTime}>
                    {formatDuration(item.minutes)} ({item.percentage}%)
                  </div>
                </div>

                <div className={styles.subjectBarBg}>
                  <div
                    className={styles.subjectBarFill}
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.subjectColor,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyStatsSummary;

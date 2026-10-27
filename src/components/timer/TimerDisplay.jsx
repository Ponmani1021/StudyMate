import React from 'react';
import { Sparkles, Coffee } from 'lucide-react';
import styles from '../../styles/StudyTimer.module.css';

const RADIUS = 115;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TimerDisplay = ({
  timeLeft,
  totalDurationSeconds,
  mode,
  subject,
  notes,
  pomodoroCycle = 1,
  totalCycles = 4,
}) => {
  // Format minutes and seconds as MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Calculate SVG stroke offset
  const safeTotal = Math.max(1, totalDurationSeconds);
  const progressRatio = Math.max(0, Math.min(1, timeLeft / safeTotal));
  const strokeDashoffset = CIRCUMFERENCE * (1 - progressRatio);

  const isBreak = mode === 'shortBreak' || mode === 'longBreak';

  return (
    <div className={styles.circleWrapper}>
      <svg
        className={styles.timerSvg}
        viewBox="0 0 260 260"
        aria-hidden="true"
      >
        {/* Background track */}
        <circle
          className={styles.circleBackground}
          cx="130"
          cy="130"
          r={RADIUS}
        />
        {/* Animated countdown progress ring */}
        <circle
          className={`${styles.circleProgress} ${isBreak ? styles.breakProgress : ''}`}
          cx="130"
          cy="130"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          style={
            !isBreak && subject?.color
              ? { stroke: subject.color }
              : undefined
          }
        />
      </svg>

      <div className={styles.circleInnerContent}>
        {/* Mode Tag */}
        <div
          className={`${styles.modeBadge} ${isBreak ? styles.breakBadge : styles.focusBadge}`}
        >
          {isBreak ? (
            <>
              <Coffee size={13} />
              <span>{mode === 'longBreak' ? 'Long Break' : 'Short Break'}</span>
            </>
          ) : (
            <>
              <Sparkles size={13} />
              <span>{mode === 'custom' ? 'Custom Timer' : 'Focus Session'}</span>
            </>
          )}
        </div>

        {/* Big Digital Clock */}
        <div className={styles.timeDisplay} aria-live="polite">
          {formattedTime}
        </div>

        {/* Active Subject Tag */}
        <div className={styles.subjectActiveTag} title={notes || subject?.name}>
          <span
            className={styles.subjectDot}
            style={{ backgroundColor: subject?.color || '#8FA28A' }}
          />
          <span>{notes ? `${subject?.name || 'General Study'}: ${notes}` : subject?.name || 'General Study'}</span>
        </div>

        {/* Pomodoro Progress Dots */}
        {mode === 'focus' && (
          <div className={styles.cycleDotsRow} style={{ marginTop: 10 }}>
            {Array.from({ length: totalCycles }).map((_, idx) => {
              const dotIndex = idx + 1;
              const isCompleted = dotIndex < pomodoroCycle;
              const isCurrent = dotIndex === pomodoroCycle;

              return (
                <div
                  key={idx}
                  className={`${styles.cycleDot} ${
                    isCompleted ? styles.completedDot : isCurrent ? styles.currentDot : ''
                  }`}
                  title={`Pomodoro ${dotIndex} of ${totalCycles}`}
                />
              );
            })}
            <span className={styles.cycleLabel}>
              {pomodoroCycle}/{totalCycles}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimerDisplay;

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  CheckCircle2,
} from 'lucide-react';
import styles from '../../styles/StudyTimer.module.css';

const TimerControls = ({
  isRunning,
  onStart,
  onPause,
  onReset,
  onSkip,
  onLogCurrentFocus,
  soundEnabled,
  onToggleSound,
  canLogCurrent,
  elapsedMinutes,
}) => {
  return (
    <div className={styles.controlsRow}>
      {/* Sound Toggle */}
      <button
        type="button"
        className={styles.iconControlBtn}
        onClick={onToggleSound}
        title={soundEnabled ? 'Mute alert sound' : 'Enable alert sound'}
        aria-label={soundEnabled ? 'Mute alert sound' : 'Enable alert sound'}
      >
        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} color="var(--text-muted)" />}
      </button>

      {/* Reset Button */}
      <button
        type="button"
        className={styles.iconControlBtn}
        onClick={onReset}
        title="Reset timer"
        aria-label="Reset timer"
      >
        <RotateCcw size={19} />
      </button>

      {/* Primary Start / Pause Button */}
      <button
        type="button"
        className={`${styles.startPauseBtn} ${isRunning ? styles.runningBtn : ''}`}
        onClick={isRunning ? onPause : onStart}
      >
        {isRunning ? (
          <>
            <Pause size={20} />
            <span>Pause</span>
          </>
        ) : (
          <>
            <Play size={20} fill="currentColor" />
            <span>Start Focus</span>
          </>
        )}
      </button>

      {/* Skip to Next Mode */}
      <button
        type="button"
        className={styles.iconControlBtn}
        onClick={onSkip}
        title="Skip to next phase"
        aria-label="Skip to next phase"
      >
        <SkipForward size={19} />
      </button>

      {/* Log partial progress button if focused for at least 1 min */}
      {canLogCurrent && (
        <button
          type="button"
          className={styles.logNowBtn}
          onClick={onLogCurrentFocus}
          title={`Log completed ${elapsedMinutes} min${elapsedMinutes > 1 ? 's' : ''} of focus now`}
        >
          <CheckCircle2 size={15} />
          <span>Save {elapsedMinutes}m Focus</span>
        </button>
      )}
    </div>
  );
};

export default TimerControls;

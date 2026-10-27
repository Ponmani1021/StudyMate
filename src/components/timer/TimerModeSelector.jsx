import React from 'react';
import { Sparkles, Coffee, Clock } from 'lucide-react';
import styles from '../../styles/StudyTimer.module.css';

const CUSTOM_PRESETS = [15, 20, 30, 45, 60];

const TimerModeSelector = ({
  activeMode,
  onSelectMode,
  customMinutes,
  onChangeCustomMinutes,
  settings,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      {/* Segmented Mode Selector */}
      <div className={styles.modeTabsContainer} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'focus'}
          className={`${styles.modeTabBtn} ${activeMode === 'focus' ? styles.activeModeTab : ''}`}
          onClick={() => onSelectMode('focus', settings.pomodoroMinutes || 25)}
        >
          <Sparkles size={15} />
          <span>Focus ({settings.pomodoroMinutes || 25}m)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'shortBreak'}
          className={`${styles.modeTabBtn} ${activeMode === 'shortBreak' ? styles.activeModeTab : ''}`}
          onClick={() => onSelectMode('shortBreak', settings.shortBreakMinutes || 5)}
        >
          <Coffee size={15} />
          <span>Short Break ({settings.shortBreakMinutes || 5}m)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'longBreak'}
          className={`${styles.modeTabBtn} ${activeMode === 'longBreak' ? styles.activeModeTab : ''}`}
          onClick={() => onSelectMode('longBreak', settings.longBreakMinutes || 15)}
        >
          <Coffee size={15} />
          <span>Long Break ({settings.longBreakMinutes || 15}m)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'custom'}
          className={`${styles.modeTabBtn} ${activeMode === 'custom' ? styles.activeModeTab : ''}`}
          onClick={() => onSelectMode('custom', customMinutes || 30)}
        >
          <Clock size={15} />
          <span>Custom</span>
        </button>
      </div>

      {/* Custom Duration Presets & Input */}
      {activeMode === 'custom' && (
        <div className={styles.customPresetsRow}>
          {CUSTOM_PRESETS.map((mins) => (
            <button
              key={mins}
              type="button"
              className={`${styles.presetPill} ${customMinutes === mins ? styles.activePresetPill : ''}`}
              onClick={() => onChangeCustomMinutes(mins)}
            >
              {mins}m
            </button>
          ))}

          <div className={styles.customInputGroup}>
            <input
              type="number"
              min="1"
              max="180"
              className={styles.customMinutesInput}
              value={customMinutes}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val > 0 && val <= 360) {
                  onChangeCustomMinutes(val);
                }
              }}
              aria-label="Custom minutes"
            />
            <span className={styles.customInputLabel}>min</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerModeSelector;

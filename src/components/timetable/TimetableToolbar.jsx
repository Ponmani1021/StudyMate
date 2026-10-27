import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  formatDisplayDate,
  addDays,
  getTodayDateString,
  getWeekDays
} from '../../utils/dateUtils';
import styles from '../../styles/Timetable.module.css';

const TimetableToolbar = ({
  activeView,
  onViewChange,
  selectedDate,
  onDateChange,
}) => {
  const today = getTodayDateString();

  // Navigation handlers
  const handlePrev = () => {
    if (activeView === 'day') {
      onDateChange(addDays(selectedDate, -1));
    } else if (activeView === 'week') {
      onDateChange(addDays(selectedDate, -7));
    }
  };

  const handleNext = () => {
    if (activeView === 'day') {
      onDateChange(addDays(selectedDate, 1));
    } else if (activeView === 'week') {
      onDateChange(addDays(selectedDate, 7));
    }
  };

  const handleToday = () => {
    onDateChange(today);
  };

  // Compute label for Week view
  const getWeekRangeLabel = () => {
    const days = getWeekDays(selectedDate);
    const start = days[0];
    const end = days[6];
    return `${formatDisplayDate(start, false)} – ${formatDisplayDate(end, false)}`;
  };

  return (
    <div className={styles.toolbarCard} role="toolbar" aria-label="Timetable view and date controls">
      {/* View Switcher Tabs */}
      <div className={styles.viewTabs} role="tablist" aria-label="Select timetable view">
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'day'}
          className={`${styles.viewTab} ${activeView === 'day' ? styles.activeTab : ''}`}
          onClick={() => onViewChange('day')}
        >
          Day
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'week'}
          className={`${styles.viewTab} ${activeView === 'week' ? styles.activeTab : ''}`}
          onClick={() => onViewChange('week')}
        >
          Week
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'upcoming'}
          className={`${styles.viewTab} ${activeView === 'upcoming' ? styles.activeTab : ''}`}
          onClick={() => onViewChange('upcoming')}
        >
          Upcoming
        </button>
      </div>

      {/* Date Navigation (Day and Week views) */}
      {activeView !== 'upcoming' && (
        <div className={styles.dateNavGroup}>
          <div className={styles.navArrows}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={handlePrev}
              aria-label={activeView === 'day' ? 'Previous day' : 'Previous week'}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={styles.todayBtn}
              onClick={handleToday}
            >
              {activeView === 'day' ? 'Today' : 'Current Week'}
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={handleNext}
              aria-label={activeView === 'day' ? 'Next day' : 'Next week'}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <span className={styles.currentDateLabel}>
            {activeView === 'day' ? formatDisplayDate(selectedDate, true) : getWeekRangeLabel()}
          </span>
        </div>
      )}

      {activeView === 'upcoming' && (
        <span className={styles.currentDateLabel}>
          Chronological Plan
        </span>
      )}
    </div>
  );
};

export default TimetableToolbar;

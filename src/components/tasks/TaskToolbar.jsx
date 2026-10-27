import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { SORT_OPTIONS } from '../../services/taskStorage';
import styles from '../../styles/Tasks.module.css';

const TaskToolbar = ({
  activeFilter,
  onFilterChange,
  counts = { all: 0, pending: 0, completed: 0, overdue: 0 },
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
}) => {
  return (
    <div className={styles.toolbarCard} role="toolbar" aria-label="Task filters and search controls">
      {/* Filter Tabs Row */}
      <div className={styles.filterTabsRow} role="tablist" aria-label="Filter tasks by status">
        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === 'all'}
          className={`${styles.filterPill} ${activeFilter === 'all' ? styles.activeFilter : ''}`}
          onClick={() => onFilterChange('all')}
        >
          <span>All Tasks</span>
          <span className={styles.countBadge}>{counts.all}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === 'pending'}
          className={`${styles.filterPill} ${activeFilter === 'pending' ? styles.activeFilter : ''}`}
          onClick={() => onFilterChange('pending')}
        >
          <span>Pending</span>
          <span className={styles.countBadge}>{counts.pending}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === 'completed'}
          className={`${styles.filterPill} ${activeFilter === 'completed' ? styles.activeFilter : ''}`}
          onClick={() => onFilterChange('completed')}
        >
          <span>Completed</span>
          <span className={styles.countBadge}>{counts.completed}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === 'overdue'}
          className={`${styles.filterPill} ${activeFilter === 'overdue' ? styles.activeFilter : ''}`}
          onClick={() => onFilterChange('overdue')}
        >
          <span>Overdue</span>
          <span className={styles.countBadge}>{counts.overdue}</span>
        </button>
      </div>

      {/* Search and Sort Row */}
      <div className={styles.searchSortRow}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by title, notes, or subject..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search tasks"
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => onSearchChange('')}
              aria-label="Clear task search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className={styles.sortBox}>
          <label htmlFor="task-sort-select" className={styles.sortLabel}>
            <ArrowUpDown size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Sort by:
          </label>
          <select
            id="task-sort-select"
            className={styles.sortSelect}
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort tasks by"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskToolbar;

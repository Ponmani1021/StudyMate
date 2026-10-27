import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  ArrowRight,
  Check,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import {
  formatDueDateBadge,
  isTaskOverdue,
  getTodayDateString,
} from '../../utils/dateUtils';
import { PRIORITY_CONFIG } from '../../services/taskStorage';
import styles from '../../styles/Dashboard.module.css';

const TasksOverviewCard = ({
  tasks = [],
  subjectsMap = new Map(),
  onToggleTask,
}) => {
  const todayStr = getTodayDateString();

  // Metrics
  let completedCount = 0;
  let pendingCount = 0;
  let overdueCount = 0;

  tasks.forEach((t) => {
    if (t.status === 'completed') {
      completedCount++;
    } else {
      if (isTaskOverdue(t.dueDate, t.status, todayStr)) {
        overdueCount++;
      } else {
        pendingCount++;
      }
    }
  });

  // Filter incomplete tasks and sort by nearest due date first
  const incompleteTasks = tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 4);

  return (
    <div className={styles.sectionCard} aria-labelledby="tasks-overview-title">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleWrap}>
          <CheckSquare size={20} color="var(--btn-primary)" />
          <h2 id="tasks-overview-title" className={styles.sectionTitle}>
            Assignments & Tasks
          </h2>
        </div>

        <Link to="/dashboard/tasks" className={styles.sectionLink}>
          <span>View All Tasks</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Task Status Summary Badges */}
      <div className={styles.taskStatusBadgesRow}>
        <span className={`${styles.taskStatusPill} ${styles.pillPending}`}>
          <span>{pendingCount} Pending</span>
        </span>
        <span className={`${styles.taskStatusPill} ${styles.pillCompleted}`}>
          <Check size={12} />
          <span>{completedCount} Completed</span>
        </span>
        {overdueCount > 0 && (
          <span className={`${styles.taskStatusPill} ${styles.pillOverdue}`}>
            <AlertTriangle size={12} />
            <span>{overdueCount} Overdue</span>
          </span>
        )}
      </div>

      {/* Upcoming Incomplete Tasks List */}
      {incompleteTasks.length === 0 ? (
        <div className={styles.emptyStateContainer}>
          <CheckSquare size={36} color="var(--border-glow)" />
          <h3 className={styles.emptyStateTitle}>All tasks completed!</h3>
          <p className={styles.emptyStateText}>
            {tasks.length === 0
              ? 'You have not added any study tasks or assignments yet.'
              : 'Great work! You have no pending tasks right now.'}
          </p>
          <Link to="/dashboard/tasks" className={styles.emptyStateBtn}>
            <Plus size={14} />
            <span>Add a Task</span>
          </Link>
        </div>
      ) : (
        <div className={styles.tasksList}>
          {incompleteTasks.map((task) => {
            const subject = task.subjectId ? subjectsMap.get(task.subjectId) : null;
            const isOverdue = isTaskOverdue(task.dueDate, task.status, todayStr);
            const priorityConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.low;

            return (
              <div key={task.id} className={styles.taskItemRow}>
                <div className={styles.taskLeftContent}>
                  <button
                    type="button"
                    className={`${styles.checkboxBtn} ${
                      task.status === 'completed' ? styles.checkboxChecked : ''
                    }`}
                    onClick={() => onToggleTask(task.id)}
                    title={task.status === 'completed' ? 'Mark as pending' : 'Mark as complete'}
                    aria-label={`Toggle completion for ${task.title}`}
                  >
                    {task.status === 'completed' && <Check size={13} />}
                  </button>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 className={styles.taskTitleText}>
                      {task.title}
                    </h3>

                    <div className={styles.taskBadgesRow}>
                      {subject && (
                        <span className={styles.subjectPill}>
                          <span
                            className={styles.scheduleDot}
                            style={{ backgroundColor: subject.color || '#8FA28A' }}
                          />
                          <span>{subject.name}</span>
                        </span>
                      )}

                      {task.dueDate && (
                        <span
                          className={`${styles.dueDateBadge} ${
                            isOverdue ? styles.overdueBadge : ''
                          }`}
                        >
                          {formatDueDateBadge(task.dueDate, todayStr)}
                        </span>
                      )}

                      <span
                        className={styles.priorityBadge}
                        style={{
                          backgroundColor: priorityConf.bg,
                          color: priorityConf.color,
                          border: `1px solid ${priorityConf.border}`,
                        }}
                      >
                        {priorityConf.shortLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TasksOverviewCard;

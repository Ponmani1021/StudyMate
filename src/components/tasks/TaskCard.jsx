import React from 'react';
import {
  Check,
  Calendar,
  AlertCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  BookOpen
} from 'lucide-react';
import { PRIORITY_CONFIG } from '../../services/taskStorage';
import {
  getTodayDateString,
  isTaskOverdue,
  formatDueDateBadge
} from '../../utils/dateUtils';
import styles from '../../styles/Tasks.module.css';

const TaskCard = ({
  task,
  subject,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  const today = getTodayDateString();
  const isCompleted = task.status === 'completed';
  const isOverdue = isTaskOverdue(task.dueDate, task.status, today);

  const priorityMeta = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const dueDateLabel = formatDueDateBadge(task.dueDate, today);

  const subjectName = subject?.name || (task.subjectId ? 'Subject Unavailable' : null);
  const subjectColor = subject?.color || 'var(--text-secondary)';

  return (
    <article
      className={`${styles.taskCard} ${isCompleted ? styles.completedCard : ''} ${
        isOverdue ? styles.overdueCard : ''
      }`}
      role="listitem"
    >
      {/* Completion Toggle Button */}
      <button
        type="button"
        className={`${styles.completeToggleBtn} ${isCompleted ? styles.checkedBtn : ''}`}
        onClick={() => onToggleStatus(task.id)}
        aria-label={
          isCompleted
            ? `Mark "${task.title}" as pending`
            : `Mark "${task.title}" as completed`
        }
        title={isCompleted ? 'Click to mark as pending' : 'Click to mark as completed'}
      >
        {isCompleted && <Check size={16} strokeWidth={3} />}
      </button>

      {/* Task Content */}
      <div className={styles.taskContent}>
        <div className={styles.taskHeaderRow}>
          <h3
            className={`${styles.taskTitle} ${isCompleted ? styles.completedTitle : ''}`}
          >
            {task.title}
          </h3>
        </div>

        {task.description && (
          <p className={styles.taskDescription}>{task.description}</p>
        )}

        {/* Badges Row */}
        <div className={styles.badgesRow}>
          {/* Priority Badge */}
          <span
            className={`${styles.badge} ${styles.priorityBadge}`}
            style={{
              backgroundColor: priorityMeta.bg,
              color: priorityMeta.color,
              borderColor: priorityMeta.border,
            }}
          >
            {priorityMeta.label}
          </span>

          {/* Status Badge */}
          {isCompleted ? (
            <span className={`${styles.badge} ${styles.completedBadge}`}>
              <CheckCircle2 size={13} />
              <span>Completed</span>
            </span>
          ) : (
            <span className={`${styles.badge} ${styles.dueDateBadge}`}>
              <Clock size={13} />
              <span>Pending</span>
            </span>
          )}

          {/* Overdue Indicator */}
          {isOverdue && (
            <span className={`${styles.badge} ${styles.overdueBadge}`}>
              <AlertCircle size={13} />
              <span>Overdue</span>
            </span>
          )}

          {/* Subject Badge */}
          {subjectName ? (
            <span className={`${styles.badge} ${styles.subjectBadge}`}>
              <span
                className={styles.subjectDot}
                style={{ backgroundColor: subjectColor }}
              />
              <span>{subjectName}</span>
            </span>
          ) : (
            <span className={`${styles.badge} ${styles.subjectBadge}`} style={{ opacity: 0.8 }}>
              <BookOpen size={12} />
              <span>General Task</span>
            </span>
          )}

          {/* Due Date Badge */}
          <span
            className={`${styles.badge} ${isOverdue ? styles.overdueBadge : styles.dueDateBadge}`}
          >
            <Calendar size={13} />
            <span>{dueDateLabel}</span>
          </span>
        </div>
      </div>

      {/* Card Actions */}
      <div className={styles.cardActions}>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => onEdit(task)}
          aria-label={`Edit task ${task.title}`}
        >
          <Edit2 size={13} />
          <span>Edit</span>
        </button>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.deleteActionBtn}`}
          onClick={() => onDelete(task)}
          aria-label={`Delete task ${task.title}`}
        >
          <Trash2 size={13} />
          <span>Delete</span>
        </button>
      </div>
    </article>
  );
};

export default TaskCard;

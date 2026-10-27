import React, { useMemo } from 'react';
import { CheckSquare, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getTodayDateString, isTaskOverdue } from '../../utils/dateUtils';
import styles from '../../styles/Tasks.module.css';

const TaskSummary = ({ tasks = [] }) => {
  const summary = useMemo(() => {
    const today = getTodayDateString();

    let pendingCount = 0;
    let completedCount = 0;
    let overdueCount = 0;

    tasks.forEach((task) => {
      if (task.status === 'completed') {
        completedCount++;
      } else {
        if (isTaskOverdue(task.dueDate, task.status, today)) {
          overdueCount++;
        } else {
          pendingCount++;
        }
      }
    });

    return {
      total: tasks.length,
      pending: pendingCount,
      completed: completedCount,
      overdue: overdueCount,
    };
  }, [tasks]);

  return (
    <div className={styles.summaryGrid} role="region" aria-label="Task overview metrics">
      {/* 1. Total Tasks */}
      <div className={styles.summaryCard}>
        <div
          className={styles.summaryIconWrap}
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}
        >
          <CheckSquare size={22} />
        </div>
        <div className={styles.summaryInfo}>
          <span className={styles.summaryValue}>{summary.total}</span>
          <span className={styles.summaryLabel}>Total Tasks</span>
        </div>
      </div>

      {/* 2. Pending Tasks */}
      <div className={styles.summaryCard}>
        <div
          className={styles.summaryIconWrap}
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            color: '#fbbf24',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}
        >
          <Clock size={22} />
        </div>
        <div className={styles.summaryInfo}>
          <span className={styles.summaryValue}>{summary.pending}</span>
          <span className={styles.summaryLabel}>Pending Tasks</span>
        </div>
      </div>

      {/* 3. Completed Tasks */}
      <div className={styles.summaryCard}>
        <div
          className={styles.summaryIconWrap}
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}
        >
          <CheckCircle2 size={22} />
        </div>
        <div className={styles.summaryInfo}>
          <span className={styles.summaryValue}>{summary.completed}</span>
          <span className={styles.summaryLabel}>Completed Tasks</span>
        </div>
      </div>

      {/* 4. Overdue Tasks */}
      <div className={styles.summaryCard}>
        <div
          className={styles.summaryIconWrap}
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          <AlertTriangle size={22} />
        </div>
        <div className={styles.summaryInfo}>
          <span className={styles.summaryValue} style={{ color: summary.overdue > 0 ? 'var(--error)' : 'inherit' }}>
            {summary.overdue}
          </span>
          <span className={styles.summaryLabel}>Overdue Tasks</span>
        </div>
      </div>
    </div>
  );
};

export default TaskSummary;

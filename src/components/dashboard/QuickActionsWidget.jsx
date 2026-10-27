import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CalendarPlus,
  CheckSquare,
  Timer,
  BarChart3,
  Zap,
} from 'lucide-react';
import styles from '../../styles/Dashboard.module.css';

const QUICK_ACTIONS = [
  {
    title: 'Add Subject',
    path: '/dashboard/subjects',
    icon: BookOpen,
  },
  {
    title: 'Plan Session',
    path: '/dashboard/timetable',
    icon: CalendarPlus,
  },
  {
    title: 'Add Task',
    path: '/dashboard/tasks',
    icon: CheckSquare,
  },
  {
    title: 'Study Timer',
    path: '/dashboard/timer',
    icon: Timer,
  },
  {
    title: 'View Progress',
    path: '/dashboard/progress',
    icon: BarChart3,
  },
];

const QuickActionsWidget = () => {
  return (
    <div className={styles.sectionCard} aria-labelledby="quick-actions-title">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleWrap}>
          <Zap size={20} color="var(--btn-primary)" />
          <h2 id="quick-actions-title" className={styles.sectionTitle}>
            Quick Actions
          </h2>
        </div>
      </div>

      <div className={styles.quickActionsGrid}>
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.path}
              to={action.path}
              className={styles.quickActionCard}
              title={`Go to ${action.title}`}
            >
              <div className={styles.quickActionIconWrap}>
                <Icon size={18} />
              </div>
              <span>{action.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsWidget;

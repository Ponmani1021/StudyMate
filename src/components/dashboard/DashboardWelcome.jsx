import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, Timer } from 'lucide-react';
import { formatDisplayDate } from '../../utils/dateUtils';
import styles from '../../styles/Dashboard.module.css';

const DashboardWelcome = ({ user, todayDateStr }) => {
  const displayName = user?.displayName || user?.username || 'Student';
  const formattedDate = formatDisplayDate(todayDateStr, true);

  return (
    <section className={styles.welcomeBanner} aria-label="Welcome and daily summary banner">
      <div className={styles.welcomeContent}>
        <div className={styles.welcomeTopRow}>
          <div className={styles.greetingTag}>
            <Sparkles size={14} />
            <span>Student Dashboard</span>
          </div>

          <div className={styles.dateBadge}>
            <Calendar size={13} />
            <span>{formattedDate}</span>
          </div>
        </div>

        <h1 className={styles.welcomeTitle}>
          Welcome back, {displayName}!
        </h1>

        <p className={styles.welcomeText}>
          Here's your study overview for today. Stay consistent and keep moving toward your academic goals.
        </p>
      </div>

      <div className={styles.welcomeActions}>
        <Link to="/dashboard/timer" className={styles.welcomeActionBtn}>
          <Timer size={17} />
          <span>Start Focus Session</span>
        </Link>
      </div>
    </section>
  );
};

export default DashboardWelcome;

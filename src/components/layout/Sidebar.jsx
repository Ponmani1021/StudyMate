import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  CheckSquare,
  Timer,
  BarChart3,
  Settings,
  LogOut,
  X,
  GraduationCap,
  Info
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../styles/Sidebar.module.css';

const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    isImplemented: true,
  },
  {
    name: 'Subjects',
    path: '/dashboard/subjects',
    icon: BookOpen,
    isImplemented: true,
  },
  {
    name: 'Study Timetable',
    path: '/dashboard/timetable',
    icon: CalendarDays,
    isImplemented: true,
  },
  {
    name: 'Assignments & Tasks',
    path: '/dashboard/tasks',
    icon: CheckSquare,
    isImplemented: true,
  },
  {
    name: 'Study Timer',
    path: '/dashboard/timer',
    icon: Timer,
    isImplemented: true,
  },
  {
    name: 'Progress & Analytics',
    path: '/dashboard/progress',
    icon: BarChart3,
    isImplemented: true,
  },
  {
    name: 'Settings',
    path: '/dashboard/settings',
    icon: Settings,
    isImplemented: true,
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handlePlaceholderClick = (name) => {
    setNotice(`${name} module will be available in the next release!`);
    setTimeout(() => {
      setNotice(null);
    }, 2800);
  };

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <NavLink to="/dashboard" className={styles.brandLink} onClick={handleNavClick}>
            <div className={styles.brandIcon}>
              <GraduationCap size={22} />
            </div>
            <span className={styles.brandName}>
              Study<span>Mate</span>
            </span>
          </NavLink>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close sidebar menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className={styles.navSection} aria-label="Main Navigation">
          <div className={styles.navLabel}>Study Navigation</div>
          <ul className={styles.navList}>
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name} className={styles.navItem}>
                  {item.isImplemented ? (
                    <NavLink
                      to={item.path}
                      end={item.path === '/dashboard'}
                      className={({ isActive }) =>
                        `${styles.navLink} ${isActive ? styles.active : ''}`
                      }
                      onClick={handleNavClick}
                    >
                      <Icon size={19} className={styles.navIcon} />
                      <span className={styles.navText}>{item.name}</span>
                    </NavLink>
                  ) : (
                    <button
                      type="button"
                      className={`${styles.navLink} ${styles.placeholderItem}`}
                      onClick={() => handlePlaceholderClick(item.name)}
                      title={`${item.name} (Coming soon)`}
                    >
                      <Icon size={19} className={styles.navIcon} />
                      <span className={styles.navText}>{item.name}</span>
                      <span className={styles.soonBadge}>Soon</span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.profileCard}>
            <div className={styles.profileAvatar}>
              {(user?.displayName || user?.username || 'P').charAt(0).toUpperCase()}
            </div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{user?.displayName || user?.username || 'Ponmani'}</span>
              <span className={styles.profileRole}>Student Account</span>
            </div>
          </div>
          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
            aria-label="Log out of StudyMate"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {notice && (
        <div className={styles.placeholderNotice} role="status">
          <Info size={18} />
          <span>{notice}</span>
        </div>
      )}
    </>
  );
};

export default Sidebar;

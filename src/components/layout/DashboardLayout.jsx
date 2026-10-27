import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../styles/DashboardLayout.module.css';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className={styles.backdrop}
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Desktop Persistent / Mobile Drawer) */}
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      {/* Main Content Area */}
      <div className={styles.mainWrapper}>
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button
              type="button"
              className={styles.menuButton}
              onClick={handleOpenSidebar}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <div className={styles.portalTitle}>
              StudyMate Workspace
              <span className={styles.portalBadge}>Planner</span>
            </div>
          </div>

          <div className={styles.topBarRight}>
            <ThemeToggle />
            <div className={styles.userTag}>
              <span className={styles.userDot} />
              <span>{user?.username || 'Ponmani'}</span>
            </div>
          </div>
        </header>

        <main className={styles.contentArea}>
          <div key={location.pathname} className="pageEnter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

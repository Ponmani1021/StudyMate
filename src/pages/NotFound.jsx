import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Compass, Home, LayoutDashboard, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/NotFound.module.css';

const NotFound = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // If an unauthenticated user tries to access a nonexistent protected dashboard route,
  // follow the application's standard authentication redirect flow to /login
  if (location.pathname.startsWith('/dashboard') && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className={styles.notFoundContainer} role="region" aria-label="Page Not Found">
      <div className={styles.errorIconWrap} aria-hidden="true">
        <Compass size={38} />
      </div>

      <div className={styles.errorCode} aria-label="Error 404">
        404
      </div>

      <h1 className={styles.errorTitle}>Page Not Found</h1>

      <p className={styles.errorDescription}>
        Sorry, the page you're looking for doesn't exist or may have been moved.
      </p>

      <div className={styles.actionsRow}>
        <Link to="/" className={styles.secondaryBtn}>
          <Home size={17} />
          <span>Back to Home</span>
        </Link>

        {isAuthenticated ? (
          <Link to="/dashboard" className={styles.primaryBtn}>
            <LayoutDashboard size={17} />
            <span>Go to Dashboard</span>
          </Link>
        ) : (
          <Link to="/login" className={styles.primaryBtn}>
            <LogIn size={17} />
            <span>Go to Login</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default NotFound;

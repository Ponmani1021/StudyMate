import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../common/ThemeToggle';
import styles from '../../styles/Navbar.module.css';

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuthClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className={styles.navbar}>
      <div className={styles.mainContainer}>
        {/* Brand */}
        <Link to="/" className={styles.barndName} onClick={() => setMobileMenuOpen(false)}>
          <p className={styles.brandLogo}>
            <i className="fa-brands fa-leanpub brandLogo"></i>
          </p>
          &nbsp;
          <p className={styles.brandLogoName}>
            Study<span>Mate</span>
          </p>
        </Link>

        {/* Desktop Nav */}
        <div className={styles.desktopNav}>
          <nav aria-label="Main Public Navigation">
            <ul className={styles.navWrapper}>
              <li><Link to="/">Home</Link></li>
              <li><a href="#about">About</a></li>
              {/* <li><a href="#features">Features</a></li>
              <li><a href="#contact">Contact</a></li> */}
            </ul>
          </nav>
        </div>

        {/* Action Button & Mobile Toggle */}
        <div className={styles.navBtn}>
          <ThemeToggle />
          <button
            type="button"
            className={styles.btn}
            onClick={handleAuthClick}
          >
            {isAuthenticated ? 'Dashboard' : 'Login'}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className={styles.hamburgerBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className={styles.mobileNavDrawer}>
          <ul className={styles.mobileNavList}>
            <li>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <a href="#about" onClick={() => setMobileMenuOpen(false)}>
                About
              </a>
            </li>
            <li>
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>
                Features
              </a>
            </li>
            <li>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </a>
            </li>
            <li>
              <button
                type="button"
                className={styles.mobileLoginBtn}
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleAuthClick();
                }}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Login'}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
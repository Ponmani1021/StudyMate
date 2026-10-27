import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/Footer.module.css';

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerBrand}>
          <i className="fa-brands fa-leanpub"></i>
          <div>Study<span>Mate</span></div>
        </div>
        <p className={styles.footerText}>
          Personal Student Study Planner & Academic Management Platform.
        </p>
        <ul className={styles.footerLinks}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/login">Student Login</Link></li>
          <li><a href="#about">About</a></li>
        </ul>
        <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '8px' }}>
          &copy; {CURRENT_YEAR} StudyMate. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
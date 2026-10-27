import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  GraduationCap,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/common/ThemeToggle';
import styles from '../styles/Login.module.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = login(username, password);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Link to="/" className={styles.backHomeLink} aria-label="Return to Home">
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </Link>

      <div className={styles.topRightToggle}>
        <ThemeToggle />
      </div>

      <div className={styles.loginCard}>
        <div className={styles.brandHeader}>
          <div className={styles.brandIconWrap}>
            <GraduationCap size={28} />
          </div>
          <h1 className={styles.brandTitle}>
            Study<span>Mate</span>
          </h1>
          <p className={styles.subtitle}>
            Sign in to access your student study dashboard and subjects
          </p>
        </div>

        {/* Demo Credentials Helper */}
        <div className={styles.demoBox}>
          <KeyRound size={18} color="var(--btn-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div className={styles.demoText}>
            <strong>Demo Credentials:</strong>
            <br />
            Username: <code>Ponmani</code> &nbsp;|&nbsp; Password: <code>1234</code>
          </div>
        </div>

        {error && (
          <div className={styles.errorBanner} role="alert" aria-live="assertive">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                autoFocus
                required
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className={`${styles.input} ${styles.inputWithToggle} ${
                  error ? styles.inputError : ''
                }`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.togglePasswordBtn}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            <span>Sign In to StudyMate</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

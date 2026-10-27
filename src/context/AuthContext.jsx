import React, { useState } from 'react';
import { AuthContext } from './authContextInstance';

const STORAGE_KEY = 'studymate_auth_user';

// Demo hardcoded credentials
const VALID_USERNAME = 'Ponmani';
const VALID_PASSWORD = '1234';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      const storedProfile = localStorage.getItem('studymate_user_profile');
      if (stored) {
        const parsedAuth = JSON.parse(stored);
        const parsedProfile = storedProfile ? JSON.parse(storedProfile) : {};
        return {
          displayName: VALID_USERNAME,
          email: '',
          role: 'Student Account',
          ...parsedProfile,
          ...parsedAuth,
        };
      }
    } catch (e) {
      console.error('Failed to read auth state from sessionStorage:', e);
    }
    return null;
  });

  const login = (username, password) => {
    const trimmedUser = (username || '').trim();
    const trimmedPass = (password || '').trim();

    if (!trimmedUser || !trimmedPass) {
      return { success: false, error: 'Please enter both username and password.' };
    }

    if (trimmedUser === VALID_USERNAME && trimmedPass === VALID_PASSWORD) {
      let savedProfile = {};
      try {
        const rawProfile = localStorage.getItem('studymate_user_profile');
        if (rawProfile) savedProfile = JSON.parse(rawProfile);
      } catch (e) {
        console.error('Failed to read saved profile:', e);
      }

      const authUser = {
        username: VALID_USERNAME,
        displayName: savedProfile.displayName || VALID_USERNAME,
        email: savedProfile.email || '',
        role: 'Student Account',
        loggedInAt: new Date().toISOString(),
      };

      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      } catch (e) {
        console.error('Failed to save auth state to sessionStorage:', e);
      }
      setUser(authUser);
      return { success: true };
    } else {
      return { success: false, error: 'Invalid username or password. Please try again.' };
    }
  };

  const updateUser = (profileUpdates) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        ...profileUpdates,
        updatedAt: new Date().toISOString(),
      };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        localStorage.setItem('studymate_user_profile', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save updated profile:', e);
      }
      return updated;
    });
    return true;
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear auth state from sessionStorage:', e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

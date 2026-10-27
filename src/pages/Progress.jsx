import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Target, Info } from 'lucide-react';

import { getStoredSubjects } from '../services/subjectStorage';
import { getStoredTasks } from '../services/taskStorage';
import {
  getStoredStudySessions,
  getDailyStudyGoal,
  saveDailyStudyGoal,
} from '../services/studySessionStorage';
import { calculateAnalytics, getStudyTimeChartData } from '../services/analyticsService';
import { getTodayDateString } from '../utils/dateUtils';

import AnalyticsHeader from '../components/analytics/AnalyticsHeader';
import SummaryCards from '../components/analytics/SummaryCards';
import StudyTimeChart from '../components/analytics/StudyTimeChart';
import TaskAnalyticsSection from '../components/analytics/TaskAnalyticsSection';
import GoalComparisonSection from '../components/analytics/GoalComparisonSection';
import SubjectStudySection from '../components/analytics/SubjectStudySection';
import RecentActivitySection from '../components/analytics/RecentActivitySection';
import GoalEditModal from '../components/analytics/GoalEditModal';

import styles from '../styles/Progress.module.css';

const Progress = () => {
  // Real application data from localStorage
  const [subjects, setSubjects] = useState(() => getStoredSubjects());
  const [tasks, setTasks] = useState(() => getStoredTasks());
  const [sessions, setSessions] = useState(() => getStoredStudySessions());
  const [dailyGoal, setDailyGoal] = useState(() => getDailyStudyGoal());

  // Cross-module data reactivity
  useEffect(() => {
    const handleUpdate = () => {
      setSubjects(getStoredSubjects());
      setTasks(getStoredTasks());
      setSessions(getStoredStudySessions());
      setDailyGoal(getDailyStudyGoal());
    };

    window.addEventListener('studymate_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('studymate_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Date range and view modes
  const [rangeType, setRangeType] = useState('week'); // 'today' | 'week' | 'month' | 'all'
  const [viewMode, setViewMode] = useState('day'); // 'day' | 'week'
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const todayStr = useMemo(() => getTodayDateString(), []);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Recalculate analytics whenever rangeType, dailyGoal, or data changes
  const analytics = useMemo(() => {
    return calculateAnalytics({
      sessions,
      tasks,
      subjects,
      rangeType,
      todayStr,
      dailyGoalMinutes: dailyGoal,
    });
  }, [sessions, tasks, subjects, rangeType, todayStr, dailyGoal]);

  // Recalculate chart data whenever rangeType, viewMode, or sessions change
  const chartData = useMemo(() => {
    return getStudyTimeChartData({
      sessions,
      rangeType,
      viewMode,
      todayStr,
    });
  }, [sessions, rangeType, viewMode, todayStr]);

  const handleSaveGoal = (newGoal) => {
    const updated = saveDailyStudyGoal(newGoal);
    setDailyGoal(updated);
    showToast(`Daily study goal updated to ${updated} minutes.`);
  };

  return (
    <div className={styles.pageContainer}>
      {/* 1. Page Header with Date Range Selector */}
      <AnalyticsHeader
        rangeType={rangeType}
        onChangeRange={(newRange) => {
          setRangeType(newRange);
          // Default to daily view when switching ranges
          setViewMode('day');
        }}
      />

      {/* 2. Four Metric Summary Cards */}
      <SummaryCards
        analytics={analytics}
        onOpenGoalModal={() => setIsGoalModalOpen(true)}
      />

      {/* 3. Study Time Chart & Task Completion Analytics */}
      <div className={styles.analyticsRowTwoCol}>
        <StudyTimeChart
          chartData={chartData}
          rangeType={rangeType}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
        />

        <TaskAnalyticsSection analytics={analytics} />
      </div>

      {/* 4. Subject Study Distribution & Daily Goal Comparison */}
      <div className={styles.analyticsRowTwoCol}>
        <SubjectStudySection
          subjectBreakdown={analytics.subjectBreakdown}
          rangeType={rangeType}
        />

        <GoalComparisonSection
          analytics={analytics}
          onOpenGoalModal={() => setIsGoalModalOpen(true)}
        />
      </div>

      {/* 5. Recent Actual Recorded Study Activity */}
      <RecentActivitySection recentSessions={analytics.recentSessions} />

      {/* Informative Disclaimer Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          padding: '16px 20px',
          borderRadius: 12,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          fontSize: '0.84rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
        }}
      >
        <Info size={17} color="var(--btn-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>About StudyMate Analytics:</strong> All metrics, hours, and statistics displayed here are derived exclusively from actual completed study sessions and active task records. Study timetables represent your study plans, not completed study time. Analytics are provided as productivity insights and do not predict examination marks or guarantee academic results.
        </div>
      </div>

      {/* Goal Edit Modal */}
      <GoalEditModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        currentGoal={dailyGoal}
        onSave={handleSaveGoal}
      />

      {/* Toast Notice */}
      {toastMessage && (
        <div className={styles.toastNotice} role="status">
          <Target size={16} color="var(--btn-primary)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Progress;

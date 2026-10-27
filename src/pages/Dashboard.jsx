import React, { useState, useEffect, useMemo, useCallback } from 'react';

import { useAuth } from '../hooks/useAuth';
import { getStoredSubjects } from '../services/subjectStorage';
import { getStoredSessions } from '../services/timetableStorage';
import { getStoredTasks, toggleTaskCompletion } from '../services/taskStorage';
import {
  getStoredStudySessions,
  getDailyStudyGoal,
} from '../services/studySessionStorage';
import { getTodayDateString, isTaskOverdue } from '../utils/dateUtils';

import DashboardWelcome from '../components/dashboard/DashboardWelcome';
import SummaryStatsCards from '../components/dashboard/SummaryStatsCards';
import TodayScheduleCard from '../components/dashboard/TodayScheduleCard';
import TasksOverviewCard from '../components/dashboard/TasksOverviewCard';
import DailyGoalWidget from '../components/dashboard/DailyGoalWidget';
import WeeklySummaryWidget from '../components/dashboard/WeeklySummaryWidget';
import QuickActionsWidget from '../components/dashboard/QuickActionsWidget';

import styles from '../styles/Dashboard.module.css';

const Dashboard = () => {
  const { user } = useAuth();

  // Application data from localStorage
  const [subjects, setSubjects] = useState(() => getStoredSubjects());
  const [timetable, setTimetable] = useState(() => getStoredSessions());
  const [tasks, setTasks] = useState(() => getStoredTasks());
  const [sessions, setSessions] = useState(() => getStoredStudySessions());
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(() => getDailyStudyGoal());

  const todayDateStr = useMemo(() => getTodayDateString(), []);

  // Refresh all state from localStorage
  const refreshData = useCallback(() => {
    setSubjects(getStoredSubjects());
    setTimetable(getStoredSessions());
    setTasks(getStoredTasks());
    setSessions(getStoredStudySessions());
    setDailyGoalMinutes(getDailyStudyGoal());
  }, []);

  // Listen to cross-module updates and storage changes
  useEffect(() => {
    const handleUpdate = () => {
      refreshData();
    };

    window.addEventListener('studymate_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('studymate_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refreshData]);

  // Lookup map for subjects
  const subjectsMap = useMemo(() => {
    const map = new Map();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  // Today's scheduled timetable sessions
  const todaySessions = useMemo(() => {
    return timetable.filter((s) => s.date === todayDateStr);
  }, [timetable, todayDateStr]);

  // Today's actual recorded focus sessions from timer
  const todayStudySessions = useMemo(() => {
    return sessions.filter((s) => s.date === todayDateStr);
  }, [sessions, todayDateStr]);

  // Today's total actual recorded study time in minutes
  const todayStudyMinutes = useMemo(() => {
    return todayStudySessions.reduce(
      (acc, s) => acc + (Number(s.durationMinutes) || 0),
      0
    );
  }, [todayStudySessions]);

  // Task statistics
  const { pendingTaskCount, overdueTaskCount } = useMemo(() => {
    let pending = 0;
    let overdue = 0;

    tasks.forEach((t) => {
      if (t.status !== 'completed') {
        if (isTaskOverdue(t.dueDate, t.status, todayDateStr)) {
          overdue++;
        } else {
          pending++;
        }
      }
    });

    return { pendingTaskCount: pending + overdue, overdueTaskCount: overdue };
  }, [tasks, todayDateStr]);

  // Task toggle completion handler (reusing taskStorage)
  const handleToggleTask = (taskId) => {
    const result = toggleTaskCompletion(taskId);
    if (result?.updatedList) {
      setTasks(result.updatedList);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* 1. Personalized Welcome Section */}
      <DashboardWelcome user={user} todayDateStr={todayDateStr} />

      {/* 2. Four Key Summary Statistic Cards */}
      <SummaryStatsCards
        subjectCount={subjects.length}
        pendingTaskCount={pendingTaskCount}
        overdueTaskCount={overdueTaskCount}
        todaySessionCount={todaySessions.length}
        todayStudyMinutes={todayStudyMinutes}
        todayRecordedSessionsCount={todayStudySessions.length}
      />

      {/* 3. Main Dashboard Sections Grid (2 Columns) */}
      <div className={styles.dashboardMainGrid}>
        {/* Left Column: Scheduled Study & Assignments */}
        <div className={styles.dashboardColumn}>
          {/* Today's Study Schedule from Timetable */}
          <TodayScheduleCard
            todaySessions={todaySessions}
            subjectsMap={subjectsMap}
          />

          {/* Assignments & Tasks Overview */}
          <TasksOverviewCard
            tasks={tasks}
            subjectsMap={subjectsMap}
            onToggleTask={handleToggleTask}
          />
        </div>

        {/* Right Column: Goal, Weekly Summary & Quick Actions */}
        <div className={styles.dashboardColumn}>
          {/* Daily Study Goal vs Actual Study Time */}
          <DailyGoalWidget
            todayStudyMinutes={todayStudyMinutes}
            dailyGoalMinutes={dailyGoalMinutes}
          />

          {/* Weekly Study Summary Mini-Chart */}
          <WeeklySummaryWidget sessions={sessions} />

          {/* Quick Access Actions */}
          <QuickActionsWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

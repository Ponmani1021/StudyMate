import React, { useState, useEffect, useMemo } from 'react';
import { Plus, CheckCircle2, ListTodo, SearchX } from 'lucide-react';
import { getStoredSubjects } from '../services/subjectStorage';
import {
  getStoredTasks,
  saveTasksToStorage,
  generateTaskId,
  PRIORITY_CONFIG
} from '../services/taskStorage';
import { getTodayDateString, isTaskOverdue } from '../utils/dateUtils';

import TaskSummary from '../components/tasks/TaskSummary';
import TaskToolbar from '../components/tasks/TaskToolbar';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import ConfirmModal from '../components/common/ConfirmModal';

import styles from '../styles/Tasks.module.css';

const Tasks = () => {
  const [tasks, setTasks] = useState(() => getStoredTasks());
  const [subjects, setSubjects] = useState(() => getStoredSubjects());

  useEffect(() => {
    const handleUpdate = () => {
      setTasks(getStoredTasks());
      setSubjects(getStoredSubjects());
    };

    window.addEventListener('studymate_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('studymate_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pending' | 'completed' | 'overdue'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('dueDateAsc');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const today = getTodayDateString();

  const subjectsMap = useMemo(() => {
    const map = new Map();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Dynamic counts for filter badges
  const filterCounts = useMemo(() => {
    let pending = 0;
    let completed = 0;
    let overdue = 0;

    tasks.forEach((t) => {
      if (t.status === 'completed') {
        completed++;
      } else {
        if (isTaskOverdue(t.dueDate, t.status, today)) {
          overdue++;
        } else {
          pending++;
        }
      }
    });

    return {
      all: tasks.length,
      pending,
      completed,
      overdue,
    };
  }, [tasks, today]);

  // Filter, Search, and Sort
  const processedTasks = useMemo(() => {
    let list = [...tasks];

    // 1. Status Filter
    if (activeFilter === 'pending') {
      list = list.filter(
        (t) => t.status !== 'completed' && !isTaskOverdue(t.dueDate, t.status, today)
      );
    } else if (activeFilter === 'completed') {
      list = list.filter((t) => t.status === 'completed');
    } else if (activeFilter === 'overdue') {
      list = list.filter(
        (t) => t.status !== 'completed' && isTaskOverdue(t.dueDate, t.status, today)
      );
    }

    // 2. Search Query (title, description, subject name)
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((t) => {
        const titleMatch = (t.title || '').toLowerCase().includes(q);
        const descMatch = (t.description || '').toLowerCase().includes(q);
        const subject = subjectsMap.get(t.subjectId);
        const subjectMatch = subject ? subject.name.toLowerCase().includes(q) : false;
        return titleMatch || descMatch || subjectMatch;
      });
    }

    // 3. Sorting
    list.sort((a, b) => {
      if (sortOption === 'dueDateAsc') {
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      }
      if (sortOption === 'dueDateDesc') {
        return (b.dueDate || '').localeCompare(a.dueDate || '');
      }
      if (sortOption === 'priorityDesc') {
        const orderA = PRIORITY_CONFIG[a.priority]?.order || 0;
        const orderB = PRIORITY_CONFIG[b.priority]?.order || 0;
        if (orderB !== orderA) return orderB - orderA;
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      }
      if (sortOption === 'createdAtDesc') {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      return 0;
    });

    return list;
  }, [tasks, activeFilter, searchQuery, sortOption, today, subjectsMap]);

  // Modal Handlers
  const handleOpenAddModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTaskToEdit(null);
  };

  // Save Task (Create or Update)
  const handleSaveTask = ({ title, description, subjectId, dueDate, priority }) => {
    let updatedList;
    const nowIso = new Date().toISOString();

    if (taskToEdit) {
      // Edit existing
      updatedList = tasks.map((t) => {
        if (t.id === taskToEdit.id) {
          return {
            ...t,
            title,
            description,
            subjectId,
            dueDate,
            priority,
            updatedAt: nowIso,
          };
        }
        return t;
      });
      showToast(`Task "${title}" updated successfully!`);
    } else {
      // Add new
      const newTask = {
        id: generateTaskId(),
        title,
        description,
        subjectId,
        dueDate,
        priority,
        status: 'pending',
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      updatedList = [newTask, ...tasks];
      showToast(`Task "${title}" created successfully!`);
    }

    setTasks(updatedList);
    saveTasksToStorage(updatedList);
    handleCloseModal();
  };

  // Toggle Completion Status
  const handleToggleStatus = (taskId) => {
    let newStatus = 'pending';
    let targetTitle = '';

    const updatedList = tasks.map((t) => {
      if (t.id === taskId) {
        newStatus = t.status === 'completed' ? 'pending' : 'completed';
        targetTitle = t.title;
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'completed' ? (t.completedAt || new Date().toISOString()) : null,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    setTasks(updatedList);
    saveTasksToStorage(updatedList);

    if (newStatus === 'completed') {
      showToast(`Completed: "${targetTitle}"! Great job!`);
    } else {
      showToast(`Marked "${targetTitle}" as pending.`);
    }
  };

  // Delete Handlers
  const handleOpenDeleteModal = (task) => {
    setTaskToDelete(task);
  };

  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    const updatedList = tasks.filter((t) => t.id !== taskToDelete.id);
    setTasks(updatedList);
    saveTasksToStorage(updatedList);
    showToast(`Task "${taskToDelete.title}" deleted.`);
    setTaskToDelete(null);
  };

  return (
    <div className={styles.tasksContainer}>
      {/* Page Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerText}>
          <h1 className={styles.pageTitle}>Assignments & Tasks</h1>
          <p className={styles.pageDescription}>
            Organize your academic work, prioritize your tasks, and stay on top of deadlines.
          </p>
        </div>

        <button
          type="button"
          className={styles.addTaskBtn}
          onClick={handleOpenAddModal}
          aria-label="Add a new task"
        >
          <Plus size={18} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Summary Cards */}
      <TaskSummary tasks={tasks} />

      {/* Filter, Search & Sort Toolbar */}
      <TaskToolbar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={filterCounts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      {/* Task List or Empty State */}
      {tasks.length === 0 ? (
        /* Empty State: No tasks at all */
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyIconCircle}>
            <ListTodo size={30} />
          </div>
          <h2 className={styles.emptyTitle}>No tasks added yet.</h2>
          <p className={styles.emptySubtitle}>
            Create your first task to start organizing your academic work.
          </p>
          <button
            type="button"
            className={styles.emptyActionBtn}
            onClick={handleOpenAddModal}
          >
            <Plus size={16} />
            <span>Add Your First Task</span>
          </button>
        </div>
      ) : processedTasks.length === 0 ? (
        /* Empty State: Filter or Search returned 0 */
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyIconCircle}>
            <SearchX size={30} />
          </div>
          <h2 className={styles.emptyTitle}>No tasks match your current filters.</h2>
          <p className={styles.emptySubtitle}>
            Try clearing your search query or selecting a different filter tab.
          </p>
          <button
            type="button"
            className={styles.clearFilterBtn}
            onClick={() => {
              setActiveFilter('all');
              setSearchQuery('');
            }}
          >
            Reset Filters & Search
          </button>
        </div>
      ) : (
        /* Render Processed Tasks List */
        <div className={styles.tasksList} role="list" aria-label="Assignments and tasks list">
          {processedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              subject={subjectsMap.get(task.subjectId)}
              onToggleStatus={handleToggleStatus}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <TaskModal
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          taskToEdit={taskToEdit}
          subjects={subjects}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message={
          <>
            Are you sure you want to delete <span style={{ fontWeight: 700 }}>"{taskToDelete?.title}"</span>?
            This action cannot be undone.
          </>
        }
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className={styles.toastNotice} role="status">
          <CheckCircle2 size={18} color="var(--success)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Tasks;

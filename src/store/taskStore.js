import { addDays, startOfDay } from 'date-fns';

const STORAGE_KEY = 'drift_tasks';

const SAMPLE_TASKS = [
  {
    id: '1',
    title: 'Review Q1 performance report',
    dueDate: startOfDay(new Date(Date.now() - 86400000)).toISOString(),
    category: 'work',
    completed: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '2',
    title: 'Morning run',
    dueDate: startOfDay(new Date()).toISOString(),
    category: 'health',
    completed: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Call dentist',
    dueDate: startOfDay(new Date()).toISOString(),
    category: 'personal',
    completed: false,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: '4',
    title: 'Finish project proposal',
    dueDate: startOfDay(addDays(new Date(), 1)).toISOString(),
    category: 'work',
    completed: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '5',
    title: 'Buy groceries',
    dueDate: startOfDay(addDays(new Date(), 2)).toISOString(),
    category: 'personal',
    completed: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '6',
    title: 'Read design systems book',
    dueDate: null,
    category: 'learning',
    completed: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '7',
    title: 'Team retrospective',
    dueDate: startOfDay(addDays(new Date(), 3)).toISOString(),
    category: 'work',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Seed with sample tasks on first load
    saveTasks(SAMPLE_TASKS);
    return SAMPLE_TASKS;
  } catch {
    return SAMPLE_TASKS;
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // storage unavailable
  }
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

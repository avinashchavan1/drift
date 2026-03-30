import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loadTasks, saveTasks, generateId } from '../store/taskStore';

// In-memory cache for optimistic updates
let taskCache = null;

function getTasks() {
  if (!taskCache) taskCache = loadTasks();
  return taskCache;
}

function persistTasks(tasks) {
  taskCache = tasks;
  saveTasks(tasks);
  return tasks;
}

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
    staleTime: Infinity,
  });
}

export function useAddTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskData) => {
      const task = {
        id: generateId(),
        title: taskData.title,
        dueDate: taskData.dueDate ? taskData.dueDate.toISOString() : null,
        category: taskData.category || null,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      const tasks = getTasks();
      const updated = [task, ...tasks];
      persistTasks(updated);
      return task;
    },
    onMutate: async (taskData) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const prev = qc.getQueryData(['tasks']);
      const optimistic = {
        id: generateId(),
        title: taskData.title,
        dueDate: taskData.dueDate ? taskData.dueDate.toISOString() : null,
        category: taskData.category || null,
        completed: false,
        createdAt: new Date().toISOString(),
        _new: true,
      };
      qc.setQueryData(['tasks'], (old) => [optimistic, ...(old || [])]);
      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tasks'], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId) => {
      const tasks = getTasks();
      const updated = tasks.map(t =>
        t.id === taskId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
      );
      persistTasks(updated);
      return taskId;
    },
    onMutate: async (taskId) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const prev = qc.getQueryData(['tasks']);
      qc.setQueryData(['tasks'], (old) =>
        (old || []).map(t => t.id === taskId ? { ...t, completed: true } : t)
      );
      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tasks'], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUncompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId) => {
      const tasks = getTasks();
      const updated = tasks.map(t =>
        t.id === taskId ? { ...t, completed: false, completedAt: null } : t
      );
      persistTasks(updated);
      return taskId;
    },
    onMutate: async (taskId) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const prev = qc.getQueryData(['tasks']);
      qc.setQueryData(['tasks'], (old) =>
        (old || []).map(t => t.id === taskId ? { ...t, completed: false } : t)
      );
      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tasks'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const tasks = getTasks();
      const updated = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
      persistTasks(updated);
      return { id, ...updates };
    },
    onMutate: async ({ id, ...updates }) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const prev = qc.getQueryData(['tasks']);
      qc.setQueryData(['tasks'], (old) =>
        (old || []).map(t => t.id === id ? { ...t, ...updates } : t)
      );
      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tasks'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId) => {
      const tasks = getTasks();
      const updated = tasks.filter(t => t.id !== taskId);
      persistTasks(updated);
      return taskId;
    },
    onMutate: async (taskId) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const prev = qc.getQueryData(['tasks']);
      qc.setQueryData(['tasks'], (old) => (old || []).filter(t => t.id !== taskId));
      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tasks'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

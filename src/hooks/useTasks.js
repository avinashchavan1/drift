import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks';

// ─── Query ────────────────────────────────────────────────

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn:  tasksApi.getAll,
    staleTime: 30_000, // 30 s
  });
}

// ─── Shared optimistic-update helper ─────────────────────

function optimistic(qc, updater) {
  return async (arg) => {
    await qc.cancelQueries({ queryKey: ['tasks'] });
    const prev = qc.getQueryData(['tasks']);
    qc.setQueryData(['tasks'], (old) => updater(old || [], arg));
    return { prev };
  };
}

function rollback(qc) {
  return (_, __, ctx) => { if (ctx?.prev) qc.setQueryData(['tasks'], ctx.prev); };
}

function settle(qc) {
  return () => qc.invalidateQueries({ queryKey: ['tasks'] });
}

// ─── Add ──────────────────────────────────────────────────

export function useAddTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.create,
    onMutate: optimistic(qc, (tasks, data) => [
      {
        id: `temp-${Date.now()}`,
        title: data.title,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        category: data.category || null,
        priority: data.priority || null,
        completed: false,
        createdAt: new Date().toISOString(),
        _optimistic: true,
      },
      ...tasks,
    ]),
    onError: rollback(qc),
    onSettled: settle(qc),
  });
}

// ─── Complete ─────────────────────────────────────────────

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.complete,
    onMutate: optimistic(qc, (tasks, id) =>
      tasks.map(t => t.id === id
        ? { ...t, completed: true, completedAt: new Date().toISOString() }
        : t)
    ),
    onError: rollback(qc),
    onSettled: settle(qc),
  });
}

// ─── Uncomplete ───────────────────────────────────────────

export function useUncompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.uncomplete,
    onMutate: optimistic(qc, (tasks, id) =>
      tasks.map(t => t.id === id
        ? { ...t, completed: false, completedAt: null }
        : t)
    ),
    onError: rollback(qc),
    onSettled: settle(qc),
  });
}

// ─── Update ───────────────────────────────────────────────

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => tasksApi.update(id, data),
    onMutate: optimistic(qc, (tasks, { id, ...updates }) =>
      tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    ),
    onError: rollback(qc),
    onSettled: settle(qc),
  });
}

// ─── Delete ───────────────────────────────────────────────

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.delete,
    onMutate: optimistic(qc, (tasks, id) => tasks.filter(t => t.id !== id)),
    onError: rollback(qc),
    onSettled: settle(qc),
  });
}

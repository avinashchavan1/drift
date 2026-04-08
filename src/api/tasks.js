import { api } from './client';

// dueDate is a JS Date or null — convert to ISO string for the backend
function toPayload(data) {
  return {
    title:    data.title,
    dueDate:  data.dueDate ? new Date(data.dueDate).toISOString() : null,
    category: data.category || null,
    priority: data.priority || null,
  };
}

export const tasksApi = {
  getAll:     ()             => api.get('/tasks'),
  create:     (data)         => api.post('/tasks', toPayload(data)),
  update:     (id, data)     => api.put(`/tasks/${id}`, toPayload(data)),
  complete:   (id)           => api.patch(`/tasks/${id}/complete`),
  uncomplete: (id)           => api.patch(`/tasks/${id}/uncomplete`),
  delete:     (id)           => api.delete(`/tasks/${id}`),
};

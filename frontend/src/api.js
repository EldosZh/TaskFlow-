const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message = typeof body.detail === 'string' ? body.detail : 'Please check your input and try again.';
    } catch { /* Response had no JSON body. */ }
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
}

export const api = {
  tasks: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/tasks${query.size ? `?${query}` : ''}`);
  },
  stats: () => request('/tasks/stats'),
  create: (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  update: (id, task) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(task) }),
  remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};

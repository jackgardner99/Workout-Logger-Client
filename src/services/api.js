const BASE_URL = 'http://localhost:8000'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Token ${token}` }),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 204) return null

  const data = await res.json()

  if (!res.ok) throw data

  return data
}

export const api = {
  login: (body) =>
    request('/api/auth/login/', { method: 'POST', body: JSON.stringify(body) }),

  register: (body) =>
    request('/api/auth/register/', { method: 'POST', body: JSON.stringify(body) }),

  getLogs: () => request('/api/logs/'),

  getLog: (id) => request(`/api/logs/${id}/`),

  createLog: (body) =>
    request('/api/logs/', { method: 'POST', body: JSON.stringify(body) }),

  updateLog: (id, body) =>
    request(`/api/logs/${id}/`, { method: 'PUT', body: JSON.stringify(body) }),

  deleteLog: (id) => request(`/api/logs/${id}/`, { method: 'DELETE' }),

  getExercises: () => request('/api/exercises/'),

  getIntensities: () => request('/api/intensity/'),
}

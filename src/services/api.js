const BASE_URL = 'http://localhost:8000'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const data = await res.json()

  if (!res.ok) throw data

  return data
}

export const api = {
  login: (body) =>
    request('/api/auth/login/', { method: 'POST', body: JSON.stringify(body) }),

  register: (body) =>
    request('/api/auth/register/', { method: 'POST', body: JSON.stringify(body) }),
}

import { createContext, useContext, useState } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  const login = async (credentials) => {
    const data = await api.login(credentials)
    // Support DRF token auth (token/key) and Simple JWT (access)
    const t = data.token ?? data.access ?? data.key
    localStorage.setItem('token', t)
    setToken(t)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, register: api.register, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

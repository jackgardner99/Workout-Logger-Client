import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MyLogs from './pages/MyLogs'
import NewLog from './pages/NewLog'
import LogDetail from './pages/LogDetail'
import EditLog from './pages/EditLog'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/logs" element={<ProtectedRoute><MyLogs /></ProtectedRoute>} />
      <Route path="/logs/new" element={<ProtectedRoute><NewLog /></ProtectedRoute>} />
      <Route path="/logs/:id" element={<ProtectedRoute><LogDetail /></ProtectedRoute>} />
      <Route path="/logs/:id/edit" element={<ProtectedRoute><EditLog /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

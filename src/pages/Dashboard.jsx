import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const firstName = user?.first_name ?? user?.username ?? 'there'

  return (
    <Layout>
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">
        {greeting()}, {firstName} 👋
      </h1>

      <button
        onClick={() => navigate('/logs/new')}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
      >
        + Log new workout
      </button>
    </Layout>
  )
}

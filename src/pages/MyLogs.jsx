import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../services/api'

const CATEGORIES = ['All', 'Push', 'Pull', 'Legs', 'Core', 'Cardio']

const CATEGORY_COLORS = {
  Push: 'bg-blue-100 text-blue-700',
  Pull: 'bg-purple-100 text-purple-700',
  Legs: 'bg-green-100 text-green-700',
  Core: 'bg-yellow-100 text-yellow-700',
  Cardio: 'bg-orange-100 text-orange-700',
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function MyLogs() {
  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    api.getLogs()
      .then(setLogs)
      .catch(() => setError('Failed to load logs.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered =
    activeCategory === 'All'
      ? logs
      : logs.filter((log) =>
          log.exercises?.some((ex) => ex.category?.name === activeCategory)
        )

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Logs</h1>
        <button
          onClick={() => navigate('/logs/new')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
        >
          + New log
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && (
        <p className="text-sm text-gray-400">Loading logs…</p>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No logs found.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className="space-y-2">
          {filtered.map((log) => (
            <li key={log.id}>
              <button
                onClick={() => navigate(`/logs/${log.id}`)}
                className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between hover:border-gray-300 hover:shadow-sm transition text-left"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-gray-900">{log.title}</span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatDate(log.workout_date)}</span>
                    {log.exercises?.length != null && (
                      <>
                        <span>·</span>
                        <span>{log.exercises.length} exercise{log.exercises.length !== 1 ? 's' : ''}</span>
                      </>
                    )}
                    {(() => {
                      const cat = log.exercises?.[0]?.category?.name
                      return cat ? (
                        <>
                          <span>·</span>
                          <span className={`font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-600'}`}>
                            {cat}
                          </span>
                        </>
                      ) : null
                    })()}
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  )
}

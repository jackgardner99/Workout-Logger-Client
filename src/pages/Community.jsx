import { useEffect, useState } from 'react'
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
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function CommunityLogCard({ log, category }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <li className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full px-5 py-4 flex items-start justify-between gap-3 hover:bg-gray-50 transition text-left"
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
            {log.intensity?.name && (
              <>
                <span>·</span>
                <span>{log.intensity.name}</span>
              </>
            )}
            {category && (
              <>
                <span>·</span>
                <span className={`font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-600'}`}>
                  {category}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {log.user?.username && (
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              @{log.user.username}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && log.exercises?.length > 0 && (
        <div className="border-t border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-medium text-gray-500 border-b border-gray-100">
                <th className="text-left px-5 py-2.5">Exercise</th>
                <th className="text-center px-3 py-2.5">Sets</th>
                <th className="text-center px-3 py-2.5">Reps</th>
                <th className="text-center px-3 py-2.5">Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {log.exercises.map((ex) => (
                <tr key={ex.id}>
                  <td className="px-5 py-3 font-medium text-gray-900">{ex.exercise_name}</td>
                  <td className="text-center px-3 py-3 text-gray-700">{ex.sets}</td>
                  <td className="text-center px-3 py-3 text-gray-700">{ex.reps}</td>
                  <td className="text-center px-3 py-3 text-gray-700">
                    {ex.weight_lbs ? `${ex.weight_lbs} lbs` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </li>
  )
}

export default function Community() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    api.getCommunityLogs()
      .then(setLogs)
      .catch(() => setError('Failed to load community logs.'))
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
        <h1 className="text-2xl font-semibold text-gray-900">Community</h1>
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

      {loading && <p className="text-sm text-gray-400">Loading…</p>}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No logs found.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className="space-y-2">
          {filtered.map((log) => (
            <CommunityLogCard
              key={log.id}
              log={log}
              category={log.exercises?.[0]?.category?.name}
            />
          ))}
        </ul>
      )}
    </Layout>
  )
}

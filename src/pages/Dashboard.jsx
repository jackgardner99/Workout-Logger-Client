import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function toDateStr(date) {
  return date.toLocaleDateString('en-CA') // YYYY-MM-DD
}

function computeStats(logs) {
  const total = logs.length

  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
  monday.setHours(0, 0, 0, 0)

  const thisWeek = logs.filter((l) => {
    const [y, m, d] = l.workout_date.split('-').map(Number)
    return new Date(y, m - 1, d) >= monday
  }).length

  const logDates = new Set(logs.map((l) => l.workout_date))
  let streak = 0
  let day = new Date()
  if (!logDates.has(toDateStr(day))) {
    day.setDate(day.getDate() - 1)
  }
  while (logDates.has(toDateStr(day))) {
    streak++
    day.setDate(day.getDate() - 1)
  }

  return { total, thisWeek, streak }
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

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-6 py-5 flex flex-col gap-1">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const firstName = user?.first_name || user?.username || 'there'

  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getLogs()
      .then(setLogs)
      .finally(() => setLoading(false))
  }, [])

  const stats = computeStats(logs)
  const recentLogs = logs.slice(0, 5)

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {greeting()}, {firstName}
        </h1>
        <button
          onClick={() => navigate('/logs/new')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
        >
          + Log workout
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard
          label="This week"
          value={loading ? '—' : stats.thisWeek}
          sub="workouts logged"
        />
        <StatCard
          label="Total logs"
          value={loading ? '—' : stats.total}
          sub="all time"
        />
        <StatCard
          label="Streak"
          value={loading ? '—' : stats.streak}
          sub={stats.streak === 1 ? 'day in a row' : 'days in a row'}
        />
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Recent logs</h2>

        {loading && <p className="text-sm text-gray-400">Loading…</p>}

        {!loading && recentLogs.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center text-sm text-gray-400">
            No logs yet.{' '}
            <button
              onClick={() => navigate('/logs/new')}
              className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Log your first workout
            </button>
          </div>
        )}

        {!loading && recentLogs.length > 0 && (
          <ul className="space-y-2">
            {recentLogs.map((log) => (
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
                      {log.intensity?.name && (
                        <>
                          <span>·</span>
                          <span>{log.intensity.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </li>
            ))}

            {logs.length > 5 && (
              <li>
                <button
                  onClick={() => navigate('/logs')}
                  className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 py-2 transition-colors"
                >
                  View all {logs.length} logs →
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </Layout>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../services/api'

const CATEGORY_COLORS = {
  Push: 'bg-blue-100 text-blue-700',
  Pull: 'bg-purple-100 text-purple-700',
  Legs: 'bg-green-100 text-green-700',
  Core: 'bg-yellow-100 text-yellow-700',
  Cardio: 'bg-orange-100 text-orange-700',
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default function LogDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [log, setLog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getLog(id)
      .then(setLog)
      .catch(() => setError('Failed to load log.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <Layout><p className="text-sm text-gray-400">Loading…</p></Layout>
  }

  if (error || !log) {
    return <Layout><p className="text-sm text-red-600">{error ?? 'Log not found.'}</p></Layout>
  }

  const primaryCategory = log.exercises?.[0]?.category?.name

  return (
    <Layout>
      <div className="max-w-xl">
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-2xl font-semibold text-gray-900">{log.title}</h1>
          <button
            onClick={() => navigate(`/logs/${id}/edit`)}
            className="shrink-0 ml-4 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Edit
          </button>
        </div>

        <div className="flex items-center gap-3 mt-2 mb-8">
          <span className="text-sm text-gray-500">{formatDate(log.workout_date)}</span>
          {log.intensity?.name && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-500">{log.intensity.name}</span>
            </>
          )}
          {primaryCategory && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[primaryCategory] ?? 'bg-gray-100 text-gray-600'}`}>
              {primaryCategory}
            </span>
          )}
        </div>

        {log.exercises?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Exercises</h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-medium text-gray-500">
                    <th className="text-left px-5 py-3">Exercise</th>
                    <th className="text-center px-3 py-3">Sets</th>
                    <th className="text-center px-3 py-3">Reps</th>
                    <th className="text-center px-3 py-3">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {log.exercises.map((ex) => (
                    <tr key={ex.id}>
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{ex.exercise_name}</p>
                        {ex.notes && <p className="text-xs text-gray-400 mt-0.5">{ex.notes}</p>}
                      </td>
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
          </div>
        )}

        {log.notes && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Notes</h2>
            <p className="text-sm text-gray-600 bg-white border border-gray-200 rounded-xl px-5 py-4">
              {log.notes}
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

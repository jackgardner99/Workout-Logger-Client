import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ExercisePicker from '../components/ExercisePicker'
import { api } from '../services/api'

const today = new Date().toISOString().split('T')[0]

export default function NewLog() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ title: '', workout_date: today, intensity: '', notes: '' })
  const [intensities, setIntensities] = useState([])
  const [exercises, setExercises] = useState([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getIntensities().then(setIntensities)
  }, [])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAddExercise = (exercise) => {
    setExercises((prev) => [...prev, exercise])
  }

  const handleRemoveExercise = (index) => {
    setExercises((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await api.createLog({
        ...form,
        intensity: Number(form.intensity),
        exercises: exercises.map(({ exercise_id, sets, reps, weight_lbs, notes }) => ({
          exercise_id,
          sets,
          reps,
          weight_lbs,
          notes,
        })),
      })
      navigate('/logs')
    } catch (err) {
      setError(err?.detail ?? 'Failed to create log. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">New log</h1>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input
              name="title"
              type="text"
              required
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="e.g. Monday Push Day"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
              <input
                name="workout_date"
                type="date"
                required
                value={form.workout_date}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Intensity</label>
              <select
                name="intensity"
                required
                value={form.intensity}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              >
                <option value="">Select…</option>
                {intensities.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
              placeholder="How did it go?"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Exercises</label>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
              >
                + Add exercise
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400">
                No exercises added yet
              </div>
            ) : (
              <ul className="space-y-2">
                {exercises.map((ex, i) => (
                  <li key={i} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ex.exercise_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {ex.sets} sets · {ex.reps} reps
                        {ex.weight_lbs ? ` · ${ex.weight_lbs} lbs` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(i)}
                      className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none ml-4"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || exercises.length === 0}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? 'Saving…' : 'Save log'}
          </button>
        </form>
      </div>

      {pickerOpen && (
        <ExercisePicker
          onAdd={handleAddExercise}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </Layout>
  )
}

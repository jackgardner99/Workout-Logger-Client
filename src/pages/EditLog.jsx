import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import ExercisePicker from '../components/ExercisePicker'
import { api } from '../services/api'

export default function EditLog() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(null)
  const [intensities, setIntensities] = useState([])
  const [categories, setCategories] = useState([])
  const [exercises, setExercises] = useState([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([api.getLog(id), api.getIntensities(), api.getCategories()])
      .then(([log, intensityList, categoryList]) => {
        setForm({
          title: log.title,
          workout_date: log.workout_date,
          intensity_id: log.intensity?.id ?? '',
          category_id: log.category?.id ?? '',
          notes: log.notes ?? '',
        })
        setExercises(
          log.exercises.map((ex) => ({
            exercise_id: ex.exercise_id,
            exercise_name: ex.exercise_name,
            category: ex.category,
            sets: ex.sets,
            reps: ex.reps,
            weight_lbs: ex.weight_lbs,
            notes: ex.notes ?? '',
          }))
        )
        setIntensities(intensityList)
        setCategories(categoryList)
      })
      .catch(() => setError('Failed to load log.'))
      .finally(() => setLoading(false))
  }, [id])

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
      await api.updateLog(id, {
        ...form,
        intensity_id: Number(form.intensity_id),
        category_id: form.category_id ? Number(form.category_id) : null,
        exercises: exercises.map(({ exercise_id, sets, reps, weight_lbs, notes }) => ({
          exercise_id,
          sets,
          reps,
          weight_lbs,
          notes,
        })),
      })
      navigate(`/logs/${id}`)
    } catch (err) {
      setError(err?.detail ?? 'Failed to save changes. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Layout><p className="text-sm text-gray-400">Loading…</p></Layout>
  }

  if (error && !form) {
    return <Layout><p className="text-sm text-red-600">{error}</p></Layout>
  }

  return (
    <Layout>
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Edit log</h1>

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
                name="intensity_id"
                required
                value={form.intensity_id}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              >
                <option value="">Select…</option>
                {intensities.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(`/logs/${id}`)}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || exercises.length === 0}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? 'Saving…' : 'Save changes'}
            </button>
          </div>
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

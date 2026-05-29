import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../services/api'

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']

export default function CreateExercise() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', description: '', difficulty: '', category_id: '' })
  const [categories, setCategories] = useState([])
  const [muscleGroups, setMuscleGroups] = useState([])
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([api.getCategories(), api.getMuscleGroups()]).then(([cats, mgs]) => {
      setCategories(cats)
      setMuscleGroups(mgs)
    })
  }, [])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const toggleMuscleGroup = (id) => {
    setSelectedMuscleGroups((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await api.createExercise({
        name: form.name,
        description: form.description,
        difficulty: form.difficulty,
        category_id: form.category_id ? Number(form.category_id) : null,
        muscle_group_ids: selectedMuscleGroups,
      })
      navigate('/exercises')
    } catch (err) {
      setError(err?.error ?? 'Failed to create exercise. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-xl">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/exercises')}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Exercises
          </button>
          <span className="text-gray-200">/</span>
          <h1 className="text-2xl font-semibold text-gray-900">New exercise</h1>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <input
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="e.g. Barbell Bench Press"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Difficulty</label>
              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              >
                <option value="">None</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
              placeholder="Describe the exercise, form cues, etc."
            />
          </div>

          {muscleGroups.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Muscle Groups</label>
              <div className="grid grid-cols-2 gap-2">
                {muscleGroups.map((mg) => (
                  <label key={mg.id} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedMuscleGroups.includes(mg.id)}
                      onChange={() => toggleMuscleGroup(mg.id)}
                      className="accent-indigo-600"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{mg.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => navigate('/exercises')}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? 'Creating…' : 'Create exercise'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

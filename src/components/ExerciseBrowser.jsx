import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

export default function ExerciseBrowser({ onSelect }) {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    api.getExercises()
      .then(setExercises)
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const names = [...new Set(exercises.map((ex) => ex.category?.name).filter(Boolean))]
    return ['All', ...names]
  }, [exercises])

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesCategory = activeCategory === 'All' || ex.category?.name === activeCategory
      const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [exercises, activeCategory, search])

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Search exercises…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
      />

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-gray-400">Loading exercises…</p>}

      <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
        {filtered.map((ex) => (
          <li key={ex.id}>
            <button
              onClick={() => onSelect(ex)}
              className="w-full text-left px-2 py-3 hover:bg-indigo-50 rounded-lg transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                <span className="text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  Select →
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {ex.difficulty && (
                  <span className="text-xs text-gray-500">{ex.difficulty}</span>
                )}
                {ex.muscle_groups?.length > 0 && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-500">
                      {ex.muscle_groups.map((m) => m.name).join(', ')}
                    </span>
                  </>
                )}
              </div>
            </button>
          </li>
        ))}
        {!loading && filtered.length === 0 && (
          <li className="py-8 text-center text-sm text-gray-400">No exercises found.</li>
        )}
      </ul>
    </div>
  )
}

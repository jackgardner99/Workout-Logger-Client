import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../services/api'

const CATEGORY_COLORS = {
  Push: 'bg-blue-100 text-blue-700',
  Pull: 'bg-purple-100 text-purple-700',
  Legs: 'bg-green-100 text-green-700',
  Core: 'bg-yellow-100 text-yellow-700',
  Cardio: 'bg-orange-100 text-orange-700',
}

export default function Exercises() {
  const navigate = useNavigate()
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeDifficulty, setActiveDifficulty] = useState('')
  const [activeMuscleGroups, setActiveMuscleGroups] = useState([])

  useEffect(() => {
    api.getExercises()
      .then(setExercises)
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const names = [...new Set(exercises.map((ex) => ex.category?.name).filter(Boolean))].sort()
    return ['All', ...names]
  }, [exercises])

  const DIFFICULTY_ORDER = ['Beginner', 'Intermediate', 'Advanced']

  const difficulties = useMemo(() => {
    const present = new Set(exercises.map((ex) => ex.difficulty).filter(Boolean))
    return DIFFICULTY_ORDER.filter((d) => present.has(d))
  }, [exercises])

  const muscleGroups = useMemo(() => {
    const all = exercises.flatMap((ex) => ex.muscle_groups?.map((m) => m.name) ?? [])
    return [...new Set(all)].sort()
  }, [exercises])

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      if (activeCategory !== 'All' && ex.category?.name !== activeCategory) return false
      if (activeDifficulty && ex.difficulty !== activeDifficulty) return false
      if (activeMuscleGroups.length > 0) {
        const exMuscles = ex.muscle_groups?.map((m) => m.name) ?? []
        if (!activeMuscleGroups.every((mg) => exMuscles.includes(mg))) return false
      }
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [exercises, activeCategory, activeDifficulty, activeMuscleGroups, search])

  const toggleMuscleGroup = (name) => {
    setActiveMuscleGroups((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    )
  }

  const clearFilters = () => {
    setSearch('')
    setActiveCategory('All')
    setActiveDifficulty('')
    setActiveMuscleGroups([])
  }

  const hasActiveFilters =
    search || activeCategory !== 'All' || activeDifficulty || activeMuscleGroups.length > 0

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Exercises</h1>
        <button
          onClick={() => navigate('/exercises/new')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
        >
          + Add exercise
        </button>
      </div>

      <div className="flex gap-8 items-start">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 flex flex-col gap-6">
          <div>
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</p>
            <div className="flex flex-col gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {difficulties.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Difficulty</p>
              <div className="flex flex-col gap-1.5">
                {difficulties.map((diff) => (
                  <label key={diff} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="difficulty"
                      value={diff}
                      checked={activeDifficulty === diff}
                      onChange={() =>
                        setActiveDifficulty((prev) => (prev === diff ? '' : diff))
                      }
                      onClick={() => activeDifficulty === diff && setActiveDifficulty('')}
                      className="accent-indigo-600"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{diff}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {muscleGroups.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Muscle Group</p>
              <div className="flex flex-col gap-1.5">
                {muscleGroups.map((mg) => (
                  <label key={mg} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={activeMuscleGroups.includes(mg)}
                      onChange={() => toggleMuscleGroup(mg)}
                      className="accent-indigo-600"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{mg}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium text-left transition-colors"
            >
              Clear all filters
            </button>
          )}
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {loading && (
            <p className="text-sm text-gray-400">Loading exercises…</p>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-base font-medium text-gray-500 mb-1">No exercises match your filters</p>
              <p className="text-sm">Try adjusting or clearing your filters to see more results.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {filtered.map((ex) => (
                <li key={ex.id} className="py-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{ex.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {ex.category?.name && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[ex.category.name] ?? 'bg-gray-100 text-gray-600'}`}>
                          {ex.category.name}
                        </span>
                      )}
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
                    {ex.description && (
                      <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{ex.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  )
}

import { useState } from 'react'
import ExerciseBrowser from './ExerciseBrowser'

const EMPTY_DETAILS = { sets: '', reps: '', weight_lbs: '', notes: '' }

export default function ExercisePicker({ onAdd, onClose }) {
  const [selected, setSelected] = useState(null)
  const [details, setDetails] = useState(EMPTY_DETAILS)

  const handleSelect = (exercise) => {
    setSelected(exercise)
    setDetails(EMPTY_DETAILS)
  }

  const handleChange = (e) => {
    setDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleConfirm = () => {
    onAdd({
      exercise_id: selected.id,
      exercise_name: selected.name,
      category: selected.category,
      sets: Number(details.sets),
      reps: Number(details.reps),
      weight_lbs: Number(details.weight_lbs),
      notes: details.notes,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {selected ? selected.name : 'Select an exercise'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {!selected ? (
          <ExerciseBrowser onSelect={handleSelect} />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Sets</label>
                <input
                  name="sets"
                  type="number"
                  min="1"
                  required
                  value={details.sets}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="4"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Reps</label>
                <input
                  name="reps"
                  type="number"
                  min="1"
                  required
                  value={details.reps}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="8"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Weight (lbs)</label>
                <input
                  name="weight_lbs"
                  type="number"
                  min="0"
                  value={details.weight_lbs}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="135"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
              <input
                name="notes"
                type="text"
                value={details.notes}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. paused reps"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={!details.sets || !details.reps}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Add exercise
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

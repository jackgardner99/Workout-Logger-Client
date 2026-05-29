import { useEffect, useRef, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
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
  const date = new Date(year, month - 1, day)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function HeartIcon({ filled }) {
  return filled ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  )
}

function formatDateTime(isoString) {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function CommunityLogCard({ log, onToggleLike, currentUsername }) {
  const [expanded, setExpanded] = useState(false)
  const [liked, setLiked] = useState(log.liked_by_me)
  const [likeCount, setLikeCount] = useState(log.like_count)
  const [liking, setLiking] = useState(false)
  const [comments, setComments] = useState(log.comments ?? [])
  const [commentBody, setCommentBody] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const commentInputRef = useRef(null)

  const handleLike = async (e) => {
    e.stopPropagation()
    if (liking) return
    setLiking(true)
    const nextLiked = !liked
    setLiked(nextLiked)
    setLikeCount((prev) => prev + (nextLiked ? 1 : -1))
    try {
      const result = await onToggleLike(log.id)
      setLiked(result.liked)
      setLikeCount(result.like_count)
    } catch {
      setLiked(!nextLiked)
      setLikeCount((prev) => prev + (nextLiked ? -1 : 1))
    } finally {
      setLiking(false)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    const body = commentBody.trim()
    if (!body || submittingComment) return
    setSubmittingComment(true)
    try {
      const newComment = await api.createComment(log.id, body)
      setComments((prev) => [...prev, newComment])
      setCommentBody('')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    await api.deleteComment(log.id, commentId)
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

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
            {log.category?.name && (
              <>
                <span>·</span>
                <span className={`font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[log.category.name] ?? 'bg-gray-100 text-gray-600'}`}>
                  {log.category.name}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {log.user?.username && (
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              @{log.user.username}
            </span>
          )}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-xs font-medium transition-colors ${
              liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            }`}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <HeartIcon filled={liked} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <>
          {log.exercises?.length > 0 && (
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

          <div className="border-t border-gray-100 px-5 py-4 flex flex-col gap-3">
            {comments.length > 0 && (
              <ul className="flex flex-col gap-3">
                {comments.map((c) => (
                  <li key={c.id} className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-gray-800">@{c.user.username}</span>
                        <span className="text-xs text-gray-400">{formatDateTime(c.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{c.body}</p>
                    </div>
                    {c.user.username === currentUsername && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none shrink-0 mt-0.5"
                        aria-label="Delete comment"
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                ref={commentInputRef}
                type="text"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Leave a comment…"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                disabled={!commentBody.trim() || submittingComment}
                className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Post
              </button>
            </form>
          </div>
        </>
      )}
    </li>
  )
}

export default function Community() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    Promise.all([api.getCommunityLogs(), api.getCategories()])
      .then(([logList, categoryList]) => {
        setLogs(logList)
        setCategories(categoryList)
      })
      .catch(() => setError('Failed to load community logs.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered =
    activeCategory === 'All'
      ? logs
      : logs.filter((log) => log.category?.name === activeCategory)

  const handleToggleLike = (logId) => api.toggleLike(logId)

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Community</h1>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['All', ...categories.map((c) => c.name)].map((cat) => (
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
              onToggleLike={handleToggleLike}
              currentUsername={user?.username}
            />
          ))}
        </ul>
      )}
    </Layout>
  )
}

import { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import { addComment, getComments, deleteComment, type Comment } from '../lib/api'

export default function CommentSection({ contentId, episode }: { contentId: string; episode?: number }) {
  const { user, showToast } = useStore()
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const res = await getComments(contentId, episode ?? null).catch(() => [])
    setComments(res)
    setLoading(false)
  }

  useEffect(() => { load() }, [contentId, episode])

  const handleSubmit = async () => {
    if (!text.trim()) return
    const author = (user as any)?.username || 'Anonymous'
    const res = await addComment(contentId, episode ?? null, author, text.trim())
    if (res) {
      setComments(prev => [res, ...prev])
      setText('')
      showToast({ msg: 'Comment posted', type: 'success' })
    }
  }

  const handleDelete = async (id: number) => {
    await deleteComment(id)
    setComments(prev => prev.filter(c => c.id !== id))
    showToast({ msg: 'Comment deleted', type: 'info' })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white/90">Comments ({comments.length})</h3>
      <div className="flex gap-2">
        <input
          value={text} onChange={e => setText(e.target.value)} placeholder="Write a comment..."
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/30 focus:outline-none focus:border-accent/40"
        />
        <button onClick={handleSubmit} disabled={!text.trim()}
          className="px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent text-sm rounded-lg transition disabled:opacity-30">
          Post
        </button>
      </div>
      {loading ? (
        <div className="text-white/30 text-sm py-4 text-center">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-white/30 text-sm py-4 text-center">No comments yet</div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {comments.map(c => (
            <div key={c.id} className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-white/60">{c.author}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/20">{new Date(Number(c.created_at) * 1000).toLocaleDateString()}</span>
                  {(user as any)?.name === c.author && (
                    <button onClick={() => handleDelete(c.id)} className="text-[10px] text-red-400/50 hover:text-red-400 transition">delete</button>
                  )}
                </div>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

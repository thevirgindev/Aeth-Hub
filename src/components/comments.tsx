import { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import { Button } from './ui/button'
import { Send, Trash2 } from 'lucide-react'

interface Comment {
  id: string
  username: string
  avatar: string
  text: string
  gif?: string
  ts: number
}

const STORAGE_KEY = 'aeth_comments'
const loadComments = (): Comment[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

export function Comments() {
  const { user } = useStore()
  const [comments, setComments] = useState<Comment[]>(loadComments)
  const [text, setText] = useState('')
  const [gifUrl, setGifUrl] = useState('')
  const [showGifInput, setShowGifInput] = useState(false)

  useEffect(() => {
    const h = () => {
      const c = loadComments()
      if (JSON.stringify(c) !== JSON.stringify(comments)) setComments(c)
    }
    window.addEventListener('storage', h)
    return () => window.removeEventListener('storage', h)
  }, [comments])

  const save = (c: Comment[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c))
    setComments(c)
  }

  const post = () => {
    if (!text.trim() && !gifUrl) return
    const c: Comment = {
      id: crypto.randomUUID(),
      username: user?.username || 'Anon',
      avatar: user?.avatar || '',
      text: text.trim(),
      gif: gifUrl || undefined,
      ts: Date.now(),
    }
    save([c, ...comments])
    setText(''); setGifUrl(''); setShowGifInput(false)
  }

  const del = (id: string) => {
    save(comments.filter(c => c.id !== id))
  }

  const fmt = (ts: number) => {
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60000) return 'now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return d.toLocaleDateString()
  }

  return (
    <div className="mt-8 max-w-2xl">
      <h3 className="text-lg font-semibold text-text mb-4">Comments</h3>
      {!user ? (
        <div className="glass rounded-xl p-4 text-sm text-dim text-center">
          <a href="#" onClick={(e) => { e.preventDefault(); }} className="text-accent hover:underline">Sign in</a> to leave a comment
        </div>
      ) : (
        <div className="glass rounded-xl p-4 mb-4">
          <div className="flex gap-3">
            {user.avatar && (
              <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <textarea value={text} onChange={e => setText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-transparent text-sm text-text placeholder-dim/50 outline-none resize-none min-h-[40px] py-1"
                rows={2} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); post() } }} />
              {showGifInput && (
                <input value={gifUrl} onChange={e => setGifUrl(e.target.value)}
                  placeholder="Paste GIF URL..."
                  className="w-full bg-surface rounded-lg px-3 py-1.5 text-sm text-text outline-none mt-2" />
              )}
              <div className="flex items-center justify-between mt-2">
                <button onClick={() => setShowGifInput(!showGifInput)}
                  className="text-sm text-dim hover:text-accent cursor-pointer transition-colors">
                  {showGifInput ? 'Cancel GIF' : '+ GIF'}
                </button>
                <Button variant="primary" size="sm" onClick={post} disabled={!text.trim() && !gifUrl}>
                  <Send size={14} /> Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {comments.map(c => (
          <div key={c.id} className="glass rounded-xl p-3">
            <div className="flex gap-3">
              {c.avatar && (
                <img src={c.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text">{c.username}</span>
                  <span className="text-[11px] text-muted">{fmt(c.ts)}</span>
                  {user?.username === c.username && (
                    <button onClick={() => del(c.id)} className="ml-auto text-muted hover:text-error cursor-pointer transition-colors">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                {c.text && <p className="text-sm text-text/80 mt-1">{c.text}</p>}
                {c.gif && <img src={c.gif} alt="" className="mt-2 max-w-[300px] rounded-lg" loading="lazy" />}
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-dim text-center py-4">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  )
}

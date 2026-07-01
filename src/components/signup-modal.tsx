import { useState } from 'react'
import { useStore } from '../lib/store'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { X, User, Sparkles, LogIn, UserPlus, Eye, EyeOff, AtSign, Lock } from 'lucide-react'

export function SignupModal() {
  const { showSignup, setShowSignup, setUser, showToast } = useStore()
  const [tab, setTab] = useState<'signin' | 'create'>('signin')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [closing, setClosing] = useState(false)

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => { setClosing(false); setShowSignup(false) }, 200)
  }

  if (!showSignup && !closing) return null

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-deep/80 backdrop-blur-xl ${closing ? 'animate-fade-out' : 'animate-fade'}`} onClick={handleClose}>
      <div className="relative w-full max-w-lg mx-4 overflow-hidden rounded-2xl border border-border shadow-[0_24px_80px_rgba(0,0,0,0.6)] animate-modal-in" onClick={e => e.stopPropagation()}>
        <div className="relative bg-gradient-to-b from-accent/15 via-base to-deep p-10">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-accent/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-accent/8 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shadow-[0_0_24px_rgba(124,92,255,0.2)]">
                  <Sparkles size={22} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text">Welcome</h2>
                  <p className="text-sm text-dim">Sign in or create an account</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-muted hover:text-text cursor-pointer transition-colors p-1.5 hover:bg-white/5 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="flex mb-8 bg-white/5 rounded-xl p-1.5 border border-white/5">
              <button
                onClick={() => setTab('signin')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  tab === 'signin' ? 'bg-accent/20 text-text shadow-sm' : 'text-muted hover:text-dim'
                }`}
              >
                <LogIn size={15} />
                Sign In
              </button>
              <button
                onClick={() => setTab('create')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  tab === 'create' ? 'bg-accent/20 text-text shadow-sm' : 'text-muted hover:text-dim'
                }`}
              >
                <UserPlus size={15} />
                Create
              </button>
            </div>

            <div className="relative overflow-hidden">
              <div className={`space-y-4 transition-all duration-300 transform ${tab === 'signin' ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0 absolute inset-0 pointer-events-none'}`}>
                <div className="relative">
                  <AtSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/60" />
                  <Input placeholder="Email or Username"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white/5 border-white/10 focus:border-accent placeholder:text-muted/60 pl-10 py-2.5 text-sm" />
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/60" />
                  <Input placeholder="Password" type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-white/5 border-white/10 focus:border-accent placeholder:text-muted/60 pl-10 pr-10 py-2.5 text-sm" />
                  <button onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted/60 hover:text-text transition-colors cursor-pointer">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <button className="text-xs text-muted/60 hover:text-accent transition-colors cursor-pointer">Forgot password?</button>
                </div>
                <Button variant="primary" size="lg" className="w-full bg-accent hover:brightness-110 transition-all duration-150 py-3 text-sm"
                  onClick={() => {
                    if (email.trim()) { setUser({ username: email.trim(), avatar: '' }); setShowSignup(false); showToast({ msg: `Welcome back, ${email.trim()}!`, type: 'success' }) }
                  }}
                >
                  <LogIn size={16} /> Sign In
                </Button>
              </div>

              <div className={`space-y-4 transition-all duration-300 transform ${tab === 'create' ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0 absolute inset-0 pointer-events-none'}`}>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/60" />
                  <Input placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-white/5 border-white/10 focus:border-accent placeholder:text-muted/60 pl-10 py-2.5 text-sm" />
                </div>
                <div className="relative">
                  <AtSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/60" />
                  <Input placeholder="Email" type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white/5 border-white/10 focus:border-accent placeholder:text-muted/60 pl-10 py-2.5 text-sm" />
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/60" />
                  <Input placeholder="Password" type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-white/5 border-white/10 focus:border-accent placeholder:text-muted/60 pl-10 pr-10 py-2.5 text-sm" />
                  <button onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted/60 hover:text-text transition-colors cursor-pointer">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <Button variant="primary" size="lg" className="w-full bg-accent hover:brightness-110 transition-all duration-150 py-3 text-sm"
                  onClick={() => {
                    const name = username.trim() || email.trim()
                    if (name) { setUser({ username: name, avatar: '' }); setShowSignup(false); showToast({ msg: `Welcome, ${name}!`, type: 'success' }) }
                  }}
                >
                  <UserPlus size={16} /> Create Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

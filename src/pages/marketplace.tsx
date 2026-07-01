import { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import { saveSettings } from '../lib/api'
import type { UserTheme, ModComment } from '../lib/types'
import { getApprovedThemes, getPendingThemes, saveTheme, approveTheme, rejectTheme, deleteTheme, incrementDownloads, getComments, addComment, flagComment, moderateComment, getFlaggedComments } from '../lib/theme-store'
import { Input } from '../components/ui/input'
import { Palette, Upload, Shield, Check, X, Eye, MessageCircle, Flag, Trash2, Download, ChevronRight, Send, RotateCcw, Puzzle, Construction } from 'lucide-react'

const defaultColors = {
  deep: '#08080A', base: '#0B0D12', surface: '#111521',
  elevated: '#171C2A', text: '#F3F6FF', dim: 'rgba(243,246,255,0.72)',
  muted: 'rgba(243,246,255,0.48)', accent: '#7C5CFF', border: 'rgba(255,255,255,0.08)',
}

const colorLabels: { key: keyof typeof defaultColors; label: string }[] = [
  { key: 'deep', label: 'Deep' },
  { key: 'base', label: 'Base' },
  { key: 'surface', label: 'Surface' },
  { key: 'elevated', label: 'Elevated' },
  { key: 'text', label: 'Text' },
  { key: 'dim', label: 'Dim' },
  { key: 'muted', label: 'Muted' },
  { key: 'accent', label: 'Accent' },
  { key: 'border', label: 'Border' },
]

function ColorSwatch({ colors }: { colors: Record<string, string> }) {
  return (
    <div className="flex gap-0.5 overflow-hidden rounded-md h-4">
      {['deep', 'surface', 'elevated', 'text', 'accent', 'border'].map(k => (
        <div key={k} className="flex-1 first:rounded-l-md last:rounded-r-md" style={{ background: colors[k] || colors.deep }} />
      ))}
    </div>
  )
}

function MiniPreview({ colors }: { colors: UserTheme['colors'] }) {
  return (
    <div className="rounded-lg overflow-hidden border" style={{ borderColor: colors.border, background: colors.surface }}>
      <div className="h-1" style={{ background: colors.accent }} />
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: colors.accent }} />
          <div className="h-2 w-16 rounded-sm" style={{ background: colors.text, opacity: 0.5 }} />
        </div>
        <div className="h-2 w-24 rounded-sm" style={{ background: colors.dim, opacity: 0.3 }} />
        <div className="flex gap-1">
          <div className="h-4 w-4 rounded-sm flex-1" style={{ background: colors.elevated }} />
          <div className="h-4 w-4 rounded-sm flex-1" style={{ background: colors.elevated }} />
          <div className="h-4 w-4 rounded-sm flex-1" style={{ background: colors.accent, opacity: 0.6 }} />
        </div>
      </div>
    </div>
  )
}

function ThemeCard({ theme, onApply, onPreview, isMod }: {
  theme: UserTheme
  onApply: (t: UserTheme) => void
  onPreview: (t: UserTheme | null) => void
  isMod: boolean
}) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<ModComment[]>([])
  const [commentText, setCommentText] = useState('')
  const { showToast } = useStore()

  useEffect(() => {
    if (showComments) setComments(getComments(theme.id))
  }, [showComments, theme.id])

  const handleComment = () => {
    if (!commentText.trim()) return
    addComment(theme.id, 'User', commentText.trim())
    setComments(getComments(theme.id))
    setCommentText('')
    showToast({ msg: 'Comment added', type: 'success' })
  }

  return (
    <div className="bg-base border border-border/60 rounded-2xl p-4 hover:border-border-hover transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 overflow-hidden">
          <div className="w-full h-full p-2">
            <div className="w-full h-full rounded-sm" style={{ background: theme.colors.accent }} />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-text truncate">{theme.name}</h3>
          <p className="text-[10px] text-muted/60">by {theme.author} &middot; v{theme.version}</p>
          {theme.description && (
            <p className="text-[11px] text-dim mt-1 line-clamp-2">{theme.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted/40 shrink-0">
          <Download size={10} />
          {theme.downloads}
        </div>
      </div>

      <ColorSwatch colors={theme.colors} />

      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => onPreview(theme)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-dim hover:text-text hover:bg-white/5 transition-colors cursor-pointer"
          title="Preview">
          <Eye size={12} /> Preview
        </button>
        <button onClick={() => onApply(theme)}
          className="ml-auto px-3 py-1.5 bg-accent text-white rounded-lg text-[11px] font-semibold hover:brightness-110 transition-all cursor-pointer">
          Apply
        </button>
        <button onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-dim hover:text-text hover:bg-white/5 transition-colors cursor-pointer">
          <MessageCircle size={12} /> {comments.length}
        </button>
      </div>

      {isMod && (
        <div className="mt-2 flex gap-1">
          <button onClick={() => { deleteTheme(theme.id); showToast({ msg: 'Theme deleted', type: 'info' }) }}
            className="text-[10px] px-2 py-1 rounded-lg text-error/70 hover:text-error hover:bg-error/10 transition-colors cursor-pointer">
            <Trash2 size={10} /> Delete
          </button>
          {theme.modNotes && (
            <span className="text-[10px] text-muted/40 ml-auto truncate max-w-[120px]" title={theme.modNotes}>
              Note: {theme.modNotes}
            </span>
          )}
        </div>
      )}

      {showComments && (
        <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
          {comments.length === 0 && (
            <p className="text-[10px] text-muted/40">No comments yet.</p>
          )}
          {comments.map(c => (
            <div key={c.id} className={`text-[11px] ${c.moderated ? 'opacity-40' : ''}`}>
              <span className="font-medium text-dim">{c.author}: </span>
              <span className="text-muted/70">{c.text}</span>
              {!c.moderated && (
                <button onClick={() => { flagComment(c.id); showToast({ msg: 'Comment flagged', type: 'info' }) }}
                  className="ml-1.5 text-[9px] text-muted/30 hover:text-warning align-middle cursor-pointer">
                  <Flag size={9} />
                </button>
              )}
              {c.moderated && <span className="text-[9px] text-success ml-1">[moderated]</span>}
            </div>
          ))}
          <div className="flex gap-1.5">
            <input value={commentText} onChange={e => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-white/[0.03] border border-border/60 rounded-lg px-2.5 py-1.5 text-[11px] text-text placeholder:text-muted/30 outline-none focus:border-accent transition-colors"
              onKeyDown={e => e.key === 'Enter' && handleComment()} />
            <button onClick={handleComment}
              className="px-2 py-1.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors cursor-pointer">
              <Send size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function MarketplacePage() {
  const { settings, setSettings, showToast } = useStore()
  const [communityThemes, setCommunityThemes] = useState<UserTheme[]>([])
  const [pendingThemes, setPendingThemes] = useState<UserTheme[]>([])
  const [flaggedComments, setFlaggedComments] = useState<ModComment[]>([])
  const [previewTheme, setPreviewTheme] = useState<UserTheme | null>(null)
  const [isMod, setIsMod] = useState(false)
  const [activeTab, setActiveTab] = useState<'addons' | 'presets' | 'community' | 'upload' | 'mod'>('addons')
  const [uploading, setUploading] = useState(false)

  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formAuthor, setFormAuthor] = useState('')
  const [formVersion, setFormVersion] = useState('1.0.0')
  const [formColors, setFormColors] = useState({ ...defaultColors })
  const [formBodyFont, setFormBodyFont] = useState('')
  const [formHeadingFont, setFormHeadingFont] = useState('')
  const [formMonoFont, setFormMonoFont] = useState('')
  const [formRadius, setFormRadius] = useState(14)
  const [formScanlines, setFormScanlines] = useState(false)

  useEffect(() => {
    setCommunityThemes(getApprovedThemes())
    setPendingThemes(getPendingThemes())
    setFlaggedComments(getFlaggedComments())
    setIsMod(localStorage.getItem('aeth-is-mod') === 'true')
  }, [])

  const refresh = () => {
    setCommunityThemes(getApprovedThemes())
    setPendingThemes(getPendingThemes())
    setFlaggedComments(getFlaggedComments())
  }

  const handleApply = (theme: UserTheme) => {
    const { deep, base, surface, elevated, text, dim, muted, accent, border } = theme.colors
    const root = document.documentElement
    root.style.setProperty('--color-deep', deep)
    root.style.setProperty('--color-base', base)
    root.style.setProperty('--color-surface', surface)
    root.style.setProperty('--color-elevated', elevated)
    root.style.setProperty('--color-text', text)
    root.style.setProperty('--color-dim', dim)
    root.style.setProperty('--color-muted', muted)
    root.style.setProperty('--color-accent', accent)
    root.style.setProperty('--color-border', border)
    if (theme.fonts?.body) root.style.setProperty('--font-body', theme.fonts.body)
    if (theme.fonts?.heading) root.style.setProperty('--font-heading', theme.fonts.heading)
    if (theme.fonts?.mono) root.style.setProperty('--font-mono', theme.fonts.mono)
    if (theme.radius?.md) root.style.setProperty('--radius-md', `${theme.radius.md}px`)
    localStorage.setItem('aeth-custom-theme', JSON.stringify(theme))
    incrementDownloads(theme.id)
    const updated = { ...settings, theme_preset: 'custom' as const }
    setSettings(updated)
    saveSettings(updated).catch(() => {})
    document.documentElement.setAttribute('data-theme-preset', 'custom')
    setPreviewTheme(null)
    refresh()
    showToast({ msg: `Applied "${theme.name}" theme`, type: 'success' })
  }

  const handleClearCustom = () => {
    localStorage.removeItem('aeth-custom-theme')
    const root = document.documentElement
    ;['deep', 'base', 'surface', 'elevated', 'text', 'dim', 'muted', 'accent', 'border'].forEach(k => {
      root.style.removeProperty(`--color-${k}`)
    })
    ;['font-body', 'font-heading', 'font-mono', 'radius-md'].forEach(k => {
      root.style.removeProperty(`--${k}`)
    })
    const updated = { ...settings, theme_preset: 'default' as const }
    setSettings(updated)
    saveSettings(updated).catch(() => {})
    document.documentElement.setAttribute('data-theme-preset', 'default')
    showToast({ msg: 'Custom theme cleared', type: 'info' })
  }

  const handleUpload = () => {
    if (!formName.trim() || !formAuthor.trim()) {
      showToast({ msg: 'Name and author are required', type: 'error' })
      return
    }
    setUploading(true)
    try {
      const theme = saveTheme({
        name: formName.trim(),
        description: formDesc.trim(),
        author: formAuthor.trim(),
        version: formVersion.trim() || '1.0.0',
        preset: 'custom',
        colors: { ...formColors },
        fonts: formBodyFont || formHeadingFont || formMonoFont
          ? { body: formBodyFont || undefined, heading: formHeadingFont || undefined, mono: formMonoFont || undefined }
          : undefined,
        radius: { sm: formRadius, md: formRadius, lg: formRadius, xl: formRadius },
        effects: formScanlines ? { scanlines: true } : undefined,
      })
      showToast({ msg: `"${theme.name}" submitted for review!`, type: 'success' })
      setFormName(''); setFormDesc(''); setFormAuthor('')
      setFormVersion('1.0.0'); setFormColors({ ...defaultColors })
      setFormBodyFont(''); setFormHeadingFont(''); setFormMonoFont('')
      setFormRadius(14); setFormScanlines(false)
      refresh()
    } catch {
      showToast({ msg: 'Failed to save theme', type: 'error' })
    }
    setUploading(false)
  }

  const handlePreview = (theme: UserTheme | null) => {
    setPreviewTheme(theme)
  }

  const tabs = [
    { id: 'addons' as const, label: 'Addons', icon: Puzzle },
    { id: 'presets' as const, label: 'Presets', icon: Palette },
    { id: 'community' as const, label: 'Community Themes', icon: Download },
    { id: 'upload' as const, label: 'Upload', icon: Upload },
    ...(isMod ? [{ id: 'mod' as const, label: 'Mod Dashboard', icon: Shield }] : []),
  ]

  const isCustomActive = settings.theme_preset === 'custom'

  return (
    <div className="flex-1 pb-6 pt-6 px-6 animate-fade">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center">
            <Palette size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">Marketplace</h1>
            <p className="text-sm text-muted/70">Addons and community themes</p>
          </div>
        </div>
        <div className="mt-3 h-px bg-gradient-to-r from-accent/30 via-accent/10 to-transparent" />
      </div>

      <div className="flex flex-wrap items-center gap-1 mb-6 bg-white/[0.03] rounded-xl p-1 border border-border/30">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-accent text-white shadow-sm'
                : 'text-muted/60 hover:text-text hover:bg-white/5'
            }`}>
            <tab.icon size={14} />
            {tab.label}
            {tab.id === 'community' && communityThemes.length > 0 && (
              <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full">{communityThemes.length}</span>
            )}
            {tab.id === 'mod' && pendingThemes.length > 0 && (
              <span className="text-[9px] bg-warning/30 text-warning px-1.5 py-0.5 rounded-full">{pendingThemes.length}</span>
            )}
          </button>
        ))}
      </div>

      {isCustomActive && (
        <div className="mb-6 p-3 rounded-xl bg-accent/5 border border-accent/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-dim">
            <Palette size={14} className="text-accent" />
            Custom theme active
          </div>
          <button onClick={handleClearCustom}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-error/70 hover:text-error hover:bg-error/10 transition-colors cursor-pointer">
            <RotateCcw size={12} /> Reset to Default
          </button>
        </div>
      )}

      {activeTab === 'addons' && (
        <div className="flex flex-col items-center justify-center gap-4 text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Puzzle size={28} className="text-accent" />
          </div>
          <h2 className="text-lg font-bold text-text">Addons</h2>
          <p className="text-sm text-muted/70 max-w-md">
            Stremio-style addon support for community catalogs, scrapers, and subtitle sources will appear here.
          </p>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-dim text-xs">
            <Construction size={14} />
            Coming soon
          </div>
        </div>
      )}

      {activeTab === 'presets' && (
        <div className="space-y-4">
          <div className="max-w-2xl">
            <h2 className="text-base font-semibold text-text mb-1">Built-in Presets</h2>
            <p className="text-xs text-muted/60 mb-4">Choose from the default app themes</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => {
                handleClearCustom()
                const updated = { ...settings, theme_preset: 'default' as const }
                setSettings(updated)
                saveSettings(updated).catch(() => {})
                document.documentElement.setAttribute('data-theme-preset', 'default')
              }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                  settings.theme_preset === 'default' && !isCustomActive ? 'border-accent bg-accent/10' : 'border-border bg-surface/50 hover:border-border-hover'
                }`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#111521] border border-white/10 flex items-center justify-center">
                    <span className="text-[8px] text-[#7C5CFF] font-bold">A</span>
                  </div>
                  <span className="text-sm font-semibold text-text">Default</span>
                </div>
                <p className="text-[10px] text-muted/60">Dark space theme with purple accents</p>
                <div className="flex gap-1 mt-2">
                  <span className="w-4 h-2 rounded-sm bg-[#08080A]" />
                  <span className="w-4 h-2 rounded-sm bg-[#111521]" />
                  <span className="w-4 h-2 rounded-sm bg-[#7C5CFF]" />
                </div>
              </button>
              <button onClick={() => {
                handleClearCustom()
                const updated = { ...settings, theme_preset: 'pixelated-space' as const }
                setSettings(updated)
                saveSettings(updated).catch(() => {})
                document.documentElement.setAttribute('data-theme-preset', 'pixelated-space')
              }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                  settings.theme_preset === 'pixelated-space' ? 'border-accent bg-accent/10' : 'border-border bg-surface/50 hover:border-border-hover'
                }`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#000000] border border-[#222] flex items-center justify-center">
                    <span className="text-[8px] text-white font-mono font-bold">P</span>
                  </div>
                  <span className="text-sm font-mono text-[#d4d4d4]">Pixelated Space</span>
                </div>
                <p className="text-[10px] text-[#666] font-mono">Terminal-core monochrome pixel theme</p>
                <div className="flex gap-1 mt-2">
                  <span className="w-4 h-2 rounded-sm bg-[#000000]" />
                  <span className="w-4 h-2 rounded-sm bg-[#0a0a0a]" />
                  <span className="w-4 h-2 rounded-sm bg-[#ffffff]" />
                </div>
              </button>
            </div>
          </div>

          {previewTheme && (
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xs font-semibold text-text">Preview</h3>
                <button onClick={() => setPreviewTheme(null)}
                  className="text-[10px] text-muted/40 hover:text-text cursor-pointer">
                  <X size={12} />
                </button>
              </div>
              <MiniPreview colors={previewTheme.colors} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'community' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-text">Community Themes</h2>
              <p className="text-xs text-muted/60">{communityThemes.length} theme{communityThemes.length !== 1 ? 's' : ''} available</p>
            </div>
          </div>

          {communityThemes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
                <Palette size={24} className="text-muted/40" />
              </div>
              <p className="text-sm text-dim font-medium">No community themes yet</p>
              <p className="text-xs text-muted/60 mt-1 max-w-sm mx-auto">Be the first to upload a theme! Switch to the Upload tab to submit your creation for review.</p>
              <button onClick={() => setActiveTab('upload')}
                className="mt-4 px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all cursor-pointer inline-flex items-center gap-2">
                <Upload size={14} /> Upload Theme
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {communityThemes.map(theme => (
                <ThemeCard key={theme.id} theme={theme} onApply={handleApply} onPreview={handlePreview} isMod={isMod} />
              ))}
            </div>
          )}

          {previewTheme && communityThemes.length > 0 && (
            <div className="mt-6 max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xs font-semibold text-text">Preview: {previewTheme.name}</h3>
                <button onClick={() => setPreviewTheme(null)}
                  className="text-[10px] text-muted/40 hover:text-text cursor-pointer">
                  <X size={12} />
                </button>
              </div>
              <MiniPreview colors={previewTheme.colors} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="max-w-xl">
          <h2 className="text-base font-semibold text-text mb-1">Upload Theme</h2>
          <p className="text-xs text-muted/60 mb-4">Submit your custom theme for community review</p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-dim font-medium mb-1 block">Theme Name *</label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="My Awesome Theme" />
              </div>
              <div>
                <label className="text-[11px] text-dim font-medium mb-1 block">Author *</label>
                <Input value={formAuthor} onChange={e => setFormAuthor(e.target.value)} placeholder="Your name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-dim font-medium mb-1 block">Version</label>
                <Input value={formVersion} onChange={e => setFormVersion(e.target.value)} placeholder="1.0.0" />
              </div>
              <div>
                <label className="text-[11px] text-dim font-medium mb-1 block">Description</label>
                <Input value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="What makes this theme special?" />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-dim font-medium mb-2 block">Colors</label>
              <div className="grid grid-cols-3 gap-2">
                {colorLabels.map(({ key }) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <input type="color" value={formColors[key]}
                      onChange={e => setFormColors(f => ({ ...f, [key]: e.target.value }))}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0" />
                    <input value={formColors[key]}
                      onChange={e => setFormColors(f => ({ ...f, [key]: e.target.value }))}
                      className="flex-1 bg-white/[0.03] border border-border/60 rounded-lg px-1.5 py-1 text-[10px] font-mono text-text outline-none focus:border-accent w-16"
                      placeholder={defaultColors[key]} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] text-dim font-medium mb-2 block">Fonts (optional)</label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] text-muted/60 mb-1">Body</p>
                  <Input value={formBodyFont} onChange={e => setFormBodyFont(e.target.value)} placeholder="Inter" />
                </div>
                <div>
                  <p className="text-[10px] text-muted/60 mb-1">Heading</p>
                  <Input value={formHeadingFont} onChange={e => setFormHeadingFont(e.target.value)} placeholder="Inter" />
                </div>
                <div>
                  <p className="text-[10px] text-muted/60 mb-1">Mono</p>
                  <Input value={formMonoFont} onChange={e => setFormMonoFont(e.target.value)} placeholder="JetBrains Mono" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-dim font-medium mb-2 block">Effects</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formScanlines} onChange={e => setFormScanlines(e.target.checked)} className="sr-only peer" />
                    <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:bg-accent transition-all duration-200 after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all after:duration-200 peer-checked:after:translate-x-4" />
                  </label>
                  <span className="text-[11px] text-dim">Scanlines</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-dim">Border Radius</label>
                  <input type="range" min="0" max="24" value={formRadius} onChange={e => setFormRadius(Number(e.target.value))}
                    className="w-20 accent-accent" />
                  <span className="text-[10px] font-mono text-muted">{formRadius}px</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-border/40 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-text mb-2 flex items-center gap-1.5">
                <Eye size={12} className="text-accent" /> Live Preview
              </h4>
              <MiniPreview colors={formColors} />
            </div>

            <button onClick={handleUpload} disabled={uploading || !formName.trim() || !formAuthor.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer bg-accent text-white hover:brightness-110 shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <Upload size={16} />}
              {uploading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>

          <div className="mt-6 border-t border-border/20 pt-4">
            <h4 className="text-[11px] font-semibold text-text mb-2">How it works</h4>
            <ol className="text-[10px] text-dim space-y-1.5 list-decimal list-inside">
              <li>Create a theme by customizing the colors and settings above</li>
              <li>Upload it to the marketplace for review</li>
              <li>Mods review and approve your theme</li>
              <li>Once approved, it's available for all users</li>
            </ol>
          </div>
        </div>
      )}

      {activeTab === 'mod' && isMod && (
        <div className="space-y-8 max-w-2xl">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-accent" />
              <h2 className="text-base font-semibold text-text">Pending Reviews</h2>
              {pendingThemes.length > 0 && (
                <span className="text-[10px] bg-warning/20 text-warning px-2 py-0.5 rounded-full font-medium">{pendingThemes.length} pending</span>
              )}
            </div>
            {pendingThemes.length === 0 ? (
              <div className="text-center py-10 bg-surface/30 rounded-2xl border border-border/40">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-border flex items-center justify-center mx-auto mb-3">
                  <Check size={18} className="text-success/60" />
                </div>
                <p className="text-sm text-dim font-medium">All caught up!</p>
                <p className="text-xs text-muted/60 mt-1">No themes pending review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingThemes.map(theme => (
                  <PendingThemeCard key={theme.id} theme={theme} onAction={refresh} />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flag size={16} className="text-warning" />
              <h2 className="text-base font-semibold text-text">Flagged Comments</h2>
              {flaggedComments.length > 0 && (
                <span className="text-[10px] bg-error/20 text-error px-2 py-0.5 rounded-full font-medium">{flaggedComments.length} flagged</span>
              )}
            </div>
            {flaggedComments.length === 0 ? (
              <div className="text-center py-10 bg-surface/30 rounded-2xl border border-border/40">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-border flex items-center justify-center mx-auto mb-3">
                  <MessageCircle size={18} className="text-success/60" />
                </div>
                <p className="text-sm text-dim font-medium">No flagged comments</p>
                <p className="text-xs text-muted/60 mt-1">All community comments are clean.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {flaggedComments.map(c => {
                  const parentTheme = getApprovedThemes().concat(getPendingThemes()).find(t => t.id === c.themeId)
                  return (
                    <div key={c.id} className="bg-surface/40 border border-border/50 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-medium text-text">{c.author}</span>
                            {parentTheme && (
                              <span className="text-[10px] text-muted/40">on <span className="text-accent/70">{parentTheme.name}</span></span>
                            )}
                            <span className="text-[9px] text-warning bg-warning/10 px-1.5 py-0.5 rounded font-medium">Flagged</span>
                          </div>
                          <p className="text-[11px] text-dim">{c.text}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => { moderateComment(c.id, false); refresh(); showToast({ msg: 'Comment dismissed', type: 'info' }) }}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-dim hover:text-text hover:bg-white/5 transition-colors cursor-pointer">
                            Dismiss
                          </button>
                          <button onClick={() => { moderateComment(c.id, true); refresh(); showToast({ msg: 'Comment removed', type: 'success' }) }}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-error/70 hover:text-error hover:bg-error/10 transition-colors cursor-pointer">
                            <Trash2 size={10} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PendingThemeCard({ theme, onAction }: { theme: UserTheme; onAction: () => void }) {
  const { showToast } = useStore()
  const [modNotes, setModNotes] = useState('')
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-surface/40 border border-border/50 rounded-xl p-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
          <div className="w-4 h-4 rounded-sm" style={{ background: theme.colors.accent }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-text">{theme.name}</h4>
            <span className="text-[9px] bg-warning/15 text-warning px-1.5 py-0.5 rounded font-medium">Pending</span>
          </div>
          <p className="text-[10px] text-muted/60">by {theme.author} &middot; v{theme.version}</p>
          {theme.description && <p className="text-[11px] text-dim mt-1">{theme.description}</p>}
          <div className="mt-1.5">
            <ColorSwatch colors={theme.colors} />
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)}
          className="p-1 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors cursor-pointer">
          <ChevronRight size={14} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border/30 space-y-3">
          <div className="grid grid-cols-3 gap-1.5">
            {colorLabels.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: theme.colors[key] }} />
                <span className="text-[9px] text-muted/40">{label}</span>
                <span className="text-[9px] font-mono text-dim ml-auto">{theme.colors[key]}</span>
              </div>
            ))}
          </div>

          <div>
            <label className="text-[10px] text-dim font-medium mb-1 block">Mod Notes</label>
            <input value={modNotes} onChange={e => setModNotes(e.target.value)}
              placeholder="Feedback for the author..."
              className="w-full bg-white/[0.03] border border-border/60 rounded-lg px-2.5 py-1.5 text-[11px] text-text placeholder:text-muted/30 outline-none focus:border-accent transition-colors" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { approveTheme(theme.id, modNotes || undefined); onAction(); showToast({ msg: `"${theme.name}" approved`, type: 'success' }) }}
              className="flex items-center gap-1 px-3 py-1.5 bg-success/20 text-success rounded-lg text-[11px] font-semibold hover:brightness-110 transition-all cursor-pointer">
              <Check size={12} /> Approve
            </button>
            <button onClick={() => { rejectTheme(theme.id, modNotes || undefined); onAction(); showToast({ msg: `"${theme.name}" rejected`, type: 'info' }) }}
              className="flex items-center gap-1 px-3 py-1.5 bg-error/20 text-error rounded-lg text-[11px] font-semibold hover:brightness-110 transition-all cursor-pointer">
              <X size={12} /> Reject
            </button>
            <button onClick={() => { deleteTheme(theme.id); onAction(); showToast({ msg: 'Theme deleted', type: 'info' }) }}
              className="flex items-center gap-1 px-3 py-1.5 text-muted/60 hover:text-error hover:bg-error/10 rounded-lg text-[11px] transition-colors cursor-pointer ml-auto">
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

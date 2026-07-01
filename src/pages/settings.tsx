import { useState, useEffect, useRef } from 'react'
import { detectPlayer, getSettings, saveSettings, clearCache } from '../lib/api'
import { useStore } from '../lib/store'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import type { AppSettings, Page, UpdateInfo } from '../lib/types'
import { checkForUpdate } from '../lib/update-check'
import {
  Monitor, Palette, EyeOff, MessageCircle, Folder, Trash2,
  Download, Sparkles, Info,
  Zap, Keyboard, Moon, RotateCcw, Heart, Coffee, Check, Shield,
} from 'lucide-react'

const allSources = [
  '1337x', 'TPB', 'YTS', 'EZTV', 'Nyaa', 'Sukebei', 'AniDex',
  'FitGirl', 'DODI', 'SteamRIP', 'GOG', 'Online-Fix', 'OvaGames', 'XGamesZone',
]

const navItems = [
  { id: 'player', label: 'Player', icon: Monitor },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'content', label: 'Content', icon: EyeOff },
  { id: 'downloads', label: 'Downloads', icon: Download },
  { id: 'about', label: 'About', icon: Info },
] as const

function SectionCard({ icon, title, desc, accent, children }: { icon: React.ReactNode; title: string; desc?: string; accent?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2.5 mb-3 px-1">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${accent || '#7C5CFF'}15` }}>
          <span style={{ color: accent || '#7C5CFF' }}>{icon}</span>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          {desc && <p className="text-[11px] text-muted/60 mt-0.5">{desc}</p>}
        </div>
      </div>
      <div className="bg-gradient-to-br from-base via-surface to-surface rounded-2xl border border-border/60 p-5 shadow-lg shadow-black/10">
        {children}
      </div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:bg-accent transition-all duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:duration-200 peer-checked:after:translate-x-4" />
    </label>
  )
}

export function SettingsPage() {
  const { setSettings: setStoreSettings, showToast, setUpdateInfo: setStoreUpdateInfo, setSettingsDirty, settingsPopup, setSettingsPopup, settingsPopupAction, setSettingsPopupAction, setPage } = useStore()
  const [activeSection, setActiveSection] = useState('player')
  const [player, setPlayer] = useState('checking...')
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [updateResult, setUpdateResult] = useState<UpdateInfo | null>(null)
  const [betaCheck, setBetaCheck] = useState(() => localStorage.getItem('aeth-beta-check') === 'true')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [devCode, setDevCode] = useState('')
  const [isMod, setIsMod] = useState(localStorage.getItem('aeth-is-mod') === 'true')
  const [isOwner, setIsOwner] = useState(localStorage.getItem('aeth-is-owner') === 'true')
  const [settings, setSettings] = useState<AppSettings>({
    use_custom_player: false, download_path: '',
    scrapers_enabled: [...allSources], accent_color: '#7C5CFF',
    show_hentai: false, discord_client_id: '1520908611725820085',
    onboarded: false, theme_mode: 'dark', theme_preset: 'default',
  })
  const initialSettings = useRef<AppSettings | null>(null)
  const hasChanges = initialSettings.current != null && JSON.stringify(settings) !== JSON.stringify(initialSettings.current)

  useEffect(() => {
    detectPlayer().then(setPlayer).catch(() => setPlayer('Not found'))
    getSettings().then(s => { setSettings(s); initialSettings.current = s; setLoading(false) }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    setSettingsDirty(hasChanges && !saving && !saved)
  }, [hasChanges, saving, saved])

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSettings(settings)
      setStoreSettings(settings)
      initialSettings.current = { ...settings }
      setSaved(true)
      setSettingsDirty(false)
      setSettingsPopup(false)
      if (settingsPopupAction && settingsPopupAction !== 'cancel') {
        setPage(settingsPopupAction as Page)
      }
      setSettingsPopupAction(null)
      await new Promise(r => setTimeout(r, 1200))
      setSaved(false)
    } catch {}
    setSaving(false)
  }

  const handleCancel = () => {
    setSettings({ ...initialSettings.current! })
    initialSettings.current = null
    setSettingsDirty(false)
    setSettingsPopup(false)
    if (settingsPopupAction && settingsPopupAction !== 'cancel') {
      setPage(settingsPopupAction as Page)
    }
    setSettingsPopupAction(null)
  }

  const doThemePreset = (preset: 'default' | 'pixelated-space') => {
    const updated = { ...settings, theme_preset: preset }
    setSettings(updated)
    setSettingsDirty(true)
    document.documentElement.setAttribute('data-theme-preset', preset)
  }

  const handleDevCode = () => {
    const code = devCode.trim().toLowerCase()
    if (code === 'owner') {
      localStorage.setItem('aeth-is-owner', 'true')
      localStorage.setItem('aeth-is-mod', 'true')
      setIsOwner(true); setIsMod(true)
      showToast({ msg: 'Owner access granted!', type: 'success' })
    } else if (code === 'mod') {
      localStorage.setItem('aeth-is-mod', 'true')
      setIsMod(true)
      showToast({ msg: 'Mod access granted!', type: 'success' })
    } else {
      showToast({ msg: 'Invalid access code', type: 'error' })
    }
    setDevCode('')
  }

  if (loading) return (
    <div className="flex-1 p-6 animate-fade">
      <div className="mb-6">
        <div className="h-7 w-40 skeleton rounded-lg mb-1" />
        <div className="h-4 w-56 skeleton rounded-lg" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="h-5 w-32 skeleton rounded-lg mb-3" />
            <div className="bg-surface rounded-2xl border border-border p-5">
              <div className="h-10 skeleton rounded-lg w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex-1 pb-6 pt-6 px-6 animate-fade overflow-y-auto thin-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(124,92,255,0.2) transparent' }}>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center">
            <Sparkles size={18} className="text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted/70">Customize your Aeth experience</p>
          </div>
        </div>
        <div className="mt-3 h-px bg-gradient-to-r from-accent/30 via-accent/10 to-transparent" />
      </div>

      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-xl p-0.5 border border-border/30 w-max overflow-x-auto shrink-0">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveSection(item.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
              activeSection === item.id
                ? 'bg-accent text-white shadow-sm'
                : 'text-muted/60 hover:text-text hover:bg-white/5'
            }`}>
            <item.icon size={12} />
            {item.label}
          </button>
        ))}
      </div>

      <main>
          {activeSection === 'player' && (
            <>
            <SectionCard icon={<Monitor size={15} />} title="Player" desc={`Detected: ${player}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text font-medium">Use external player</p>
                  <p className="text-[12px] text-muted/60 mt-0.5">mpv, VLC, or MPC-HC for playback</p>
                </div>
                <Toggle checked={settings.use_custom_player} onChange={v => setSettings(s => ({ ...s, use_custom_player: v }))} />
              </div>
              <div className="mt-4 pt-4 border-t border-border/30">
                <p className="text-[12px] text-dim flex items-center gap-2">
                  <Zap size={13} className="text-accent" />
                  In-app player uses HTML5 &lt;video&gt; with HLS support
                </p>
              </div>
            </SectionCard>
            <SectionCard icon={<MessageCircle size={15} />} title="Discord Rich Presence" desc="Show activity on Discord">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/30">
                <div>
                  <p className="text-sm text-text font-medium">Enable Discord RPC</p>
                  <p className="text-[12px] text-muted/60 mt-0.5">Display what you're watching or playing</p>
                </div>
                <Toggle checked={!!settings.discord_client_id}
                  onChange={v => setSettings(s => ({ ...s, discord_client_id: v ? '1520908611725820085' : '' }))} />
              </div>
              <div>
                <p className="text-[12px] text-dim flex items-center gap-2">
                  <Info size={13} className="text-accent" />
                  Shows movie, series, game, and anime activity with rich presence data
                </p>
              </div>
            </SectionCard>
            </>
          )}

          {activeSection === 'appearance' && (
            <div>
            <SectionCard icon={<Palette size={15} />} title="Appearance" desc="Personalize the look">
              <div className="mb-4">
                <p className="text-sm text-dim mb-3 font-medium">Theme Mode</p>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 w-fit border border-accent/20">
                  <Moon size={14} className="text-accent" />
                  <span className="text-sm font-medium text-accent">Dark</span>
                </div>
              </div>
              <div className="pt-4 border-t border-border/30">
                <p className="text-sm text-dim mb-3 font-medium">Theme Presets</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => doThemePreset('default')}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                      settings.theme_preset === 'default' ? 'border-accent bg-accent/10' : 'border-border bg-surface/50 hover:border-border-hover'
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
                  <button onClick={() => doThemePreset('pixelated-space')}
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
                <div className="mt-3 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <p className="text-[10px] text-amber-400/80 leading-relaxed">
                    Experimental upcoming feature — might break the app, but not as much as how much Bonnie Blue's broke beds. Show puh.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/30">
                <p className="text-sm text-dim mb-3 font-medium">Theme Marketplace</p>
                <div className="space-y-3">
                  <p className="text-xs text-dim">Coming soon: Upload your own themes and browse themes created by the community.</p>
                  <div className="flex flex-col gap-2">
                    <div className="glass rounded-xl p-4 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center border border-border">
                          <Palette size={18} className="text-accent/80" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text">Upload Theme</p>
                          <p className="text-[10px] text-muted/60">Submit your custom theme for review</p>
                        </div>
                        <button onClick={() => showToast({ msg: 'Theme upload will be available in a future update', type: 'info' })}
                          className="ml-auto px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-xs font-medium hover:bg-accent/20 transition-colors cursor-pointer">
                          Upload
                        </button>
                      </div>
                    </div>
                    <div className="glass rounded-xl p-4 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center border border-border">
                          <Shield size={18} className="text-accent/80" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text">Mod Dashboard</p>
                          <p className="text-[10px] text-muted/60">Review themes and moderate comments</p>
                        </div>
                        <button onClick={() => showToast({ msg: 'Mod dashboard coming in a future update', type: 'info' })}
                          className="ml-auto px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-xs font-medium hover:bg-accent/20 transition-colors cursor-pointer">
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-border/20 pt-3">
                    <h4 className="text-[11px] font-semibold text-text mb-2">How it works</h4>
                    <ol className="text-[10px] text-dim space-y-1.5 list-decimal list-inside">
                      <li>Create a theme CSS file following our template</li>
                      <li>Upload it to the marketplace for review</li>
                      <li>Mods review and approve your theme</li>
                      <li>Once approved, it's available for all users</li>
                    </ol>
                  </div>
                </div>
              </div>
            </SectionCard>
            </div>
          )}

          {activeSection === 'content' && (
            <SectionCard icon={<EyeOff size={15} />} title="Content" desc="Content visibility filters">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/30">
                <div>
                  <p className="text-sm text-text font-medium">Show adult content</p>
                  <p className="text-[12px] text-muted/60 mt-0.5">Requires age verification before accessing</p>
                </div>
                <Toggle checked={settings.show_hentai} onChange={v => setSettings(s => ({ ...s, show_hentai: v }))} />
              </div>

            </SectionCard>
          )}



          {activeSection === 'downloads' && (
            <SectionCard icon={<Download size={15} />} title="Downloads" desc="Where to save your files">
              <div>
                <p className="text-sm text-dim mb-2 font-medium">Download path</p>
                <div className="flex gap-2">
                  <Input value={settings.download_path || 'C:/Users/USERNAME/Documents/AethHub'}
                    onChange={e => setSettings(s => ({ ...s, download_path: e.target.value }))}
                    className="flex-1 bg-white/[0.03] border-white/10 focus:border-accent" />
                  <Button variant="outline" size="md" className="border-white/10 hover:bg-white/10">
                    <Folder size={14} /> Browse
                  </Button>
                </div>
                <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text font-medium">Auto-resolve magnets</p>
                      <p className="text-[12px] text-muted/60 mt-0.5">Automatically start resolving on add</p>
                    </div>
                    <Toggle checked={true} onChange={() => {}} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text font-medium">Sequential download</p>
                      <p className="text-[12px] text-muted/60 mt-0.5">Download in order for streaming</p>
                    </div>
                    <Toggle checked={true} onChange={() => {}} />
                  </div>
                </div>
              </div>
            </SectionCard>
          )}



          {activeSection === 'about' && (
            <>
              <SectionCard icon={<Info size={15} />} title="About" desc="Version and information">
                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border/30">
                  <img src="/logos/aeth-withnobg_black.png" alt="Aeth" className="w-12 h-12 rounded-xl brightness-[4]" />
                  <div>
                    <p className="text-sm font-semibold text-text">Aeth Hub</p>
                    <p className="text-[11px] text-muted/60">v0.1.0 — Built with Tauri + React + Rust</p>
                    <p className="text-[11px] text-muted/40">GPL-3.0 License</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text font-medium">Clear scraper cache</p>
                      <p className="text-[12px] text-muted/60 mt-0.5">Scraper results cached for 30 days</p>
                    </div>
                    <Button variant="outline" size="md" onClick={async () => {
                      try { await clearCache(); alert('Cache cleared') } catch { alert('Failed') }
                    }} className="border-white/10 hover:bg-white/10 shrink-0">
                      <Trash2 size={14} /> Clear
                    </Button>
                  </div>
                  <div className="pt-3 border-t border-border/30">
                    <p className="text-sm text-text font-medium mb-2 flex items-center gap-2">
                      <Keyboard size={14} className="text-accent" />
                      Keyboard Shortcuts
                    </p>
                    <div className="text-[12px] text-muted/60 space-y-1">
                      <p><kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[11px] font-mono">Ctrl+K</kbd> Open search</p>
                      <p><kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[11px] font-mono">Esc</kbd> Close modals / panels</p>
                      <p><kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[11px] font-mono">↑↓</kbd> Navigate search results</p>
                      <p><kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[11px] font-mono">Enter</kbd> Select search result</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border/30">
                    <p className="text-sm text-text font-medium mb-2 flex items-center gap-2">
                      <Trash2 size={14} className="text-error" />
                      Activity & History
                    </p>
                    <p className="text-[12px] text-muted/60 mb-3">Aeth automatically tracks your playback progress. Resume from where you left off.</p>
                    <Button variant="outline" size="md" onClick={async () => {
                      try { await clearCache(); alert('Playback history cleared') } catch { alert('Failed') }
                    }} className="border-white/10 hover:bg-white/10 text-error/70 hover:text-error">
                      <Trash2 size={14} /> Clear All History
                    </Button>
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={<RotateCcw size={15} />} title="Updates" accent="#7C5CFF" desc="Check for new versions">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text">Current version: v0.1.0</p>
                    <p className="text-xs text-muted/60 mt-0.5">Check if a newer version is available</p>
                  </div>
                  <button onClick={async () => {
                    setCheckingUpdate(true)
                    setUpdateResult(null)
                    const result = await checkForUpdate(betaCheck)
                    setUpdateResult(result)
                    setStoreUpdateInfo(result)
                    setCheckingUpdate(false)
                  }}
                    className="px-4 py-2 bg-accent/10 text-accent rounded-lg text-sm font-medium hover:bg-accent/20 transition-colors cursor-pointer flex items-center gap-2">
                    <RotateCcw size={14} className={checkingUpdate ? 'animate-spin' : ''} /> {checkingUpdate ? 'Checking...' : 'Check'}
                  </button>
                </div>
                {updateResult?.available ? (
                  <div className="mt-3 p-3 rounded-lg bg-accent/5 border border-accent/10">
                    <p className="text-sm text-accent font-semibold mb-1">Update available: {updateResult.version}</p>
                    {updateResult.published_at && (
                      <p className="text-[11px] text-dim">Released: {new Date(updateResult.published_at).toLocaleDateString()}</p>
                    )}
                    {updateResult.notes && (
                      <div className="mt-2 max-h-[80px] overflow-y-auto custom-scroll">
                        <p className="text-[11px] text-dim/80 leading-relaxed">{updateResult.notes.slice(0, 300)}</p>
                      </div>
                    )}
                    <a href={updateResult.url} target="_blank" rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:brightness-110 transition-all cursor-pointer">
                      <Download size={12} /> Download {updateResult.version}
                    </a>
                  </div>
                ) : updateResult && !updateResult.available ? (
                  <div className="mt-3 p-3 rounded-lg bg-success/5 border border-success/10 text-xs text-dim">
                    You are on the latest version (v0.1.0)
                  </div>
                ) : null}
                <div className="mt-4 pt-4 border-t border-border/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text font-medium">Check for Beta updates</p>
                      <p className="text-[12px] text-muted/60 mt-0.5">Include pre-release versions</p>
                    </div>
                    <Toggle checked={betaCheck} onChange={v => { setBetaCheck(v); localStorage.setItem('aeth-beta-check', v ? 'true' : '') }} />
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={<Heart size={15} />} title="Support the Project" accent="#FF6B6B" desc="Keep Aeth Hub alive">
                <p className="text-xs text-muted/60 mb-4">Aeth Hub is free and open source. Your support keeps it alive.</p>
                <div className="flex flex-col gap-2.5">
                  <a href="https://patreon.com/AethHub" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-sm border border-white/[0.06] hover:border-orange-500/30 hover:bg-orange-500/[0.04] transition-all duration-200 group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                      <Heart size={15} className="text-orange-400" />
                    </div>
                    <span className="text-sm font-medium text-text group-hover:text-orange-300 transition-colors">Support on Patreon</span>
                  </a>
                  <a href="https://ko-fi.com/AethHub" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-sm border border-white/[0.06] hover:border-cyan-500/30 hover:bg-cyan-500/[0.04] transition-all duration-200 group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                      <Coffee size={15} className="text-cyan-400" />
                    </div>
                    <span className="text-sm font-medium text-text group-hover:text-cyan-300 transition-colors">Buy us a Ko-fi</span>
                  </a>
                  <a href="https://discord.gg/DDGbbpexB9" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-sm border border-white/[0.06] hover:border-indigo-500/30 hover:bg-indigo-500/[0.04] transition-all duration-200 group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                      <MessageCircle size={15} className="text-indigo-400" />
                    </div>
                    <span className="text-sm font-medium text-text group-hover:text-indigo-300 transition-colors">Join Discord</span>
                  </a>
                </div>
              </SectionCard>

              <SectionCard icon={<EyeOff size={15} />} title="Support via Ads" accent="#FFB84D" desc="Watch ads to support Aeth Hub">
                <p className="text-xs text-muted/60 mb-4">No donation? No problem. Watch a short ad to support development. Every view helps keep the project alive.</p>
                <div className="flex flex-col gap-2.5">
                  <button onClick={() => { showToast({ msg: 'Ad playing... Thank you for your support!', type: 'info' }) }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-sm border border-white/[0.06] hover:border-yellow-500/30 hover:bg-yellow-500/[0.04] transition-all duration-200 group cursor-pointer w-full text-left">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                      <span className="text-yellow-400 text-lg font-bold">$</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-text group-hover:text-yellow-300 transition-colors">Watch a short ad</span>
                      <p className="text-[10px] text-muted/40 mt-0.5">Propeller Ads — 15 second view</p>
                    </div>
                  </button>
                  <p className="text-[10px] text-muted/30 text-center pt-1">Ads are optional. You can also donate via Patreon or Ko-fi above.</p>
                </div>
              </SectionCard>
              <SectionCard icon={<Zap size={15} />} title="Developer & Mod Access" accent="#FFB84D" desc="Advanced access levels">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted/60 mb-2">Enter an access code to unlock features:</p>
                    <div className="flex gap-2">
                      <input value={devCode} onChange={e => setDevCode(e.target.value)}
                        placeholder="Enter access code..."
                        className="flex-1 bg-surface border border-border/30 rounded-lg px-3 py-2 text-xs text-text font-mono outline-none focus:border-accent/40" />
                      <button onClick={handleDevCode}
                        className="px-3 py-2 bg-accent text-white rounded-lg text-xs font-semibold hover:brightness-110 transition-all cursor-pointer">
                        Unlock
                      </button>
                    </div>
                    <p className="text-[10px] text-muted/40 mt-1.5">Codes: "owner" (full access), "mod" (review themes & comments)</p>
                  </div>
                  {isMod && (
                    <div className="flex items-center gap-2 text-xs text-success">
                      <Check size={14} /> Mod access enabled
                    </div>
                  )}
                  {isOwner && (
                    <div className="flex items-center gap-2 text-xs text-accent">
                      <Zap size={14} /> Owner access enabled
                    </div>
                  )}
                  {(isMod || isOwner) && (
                    <button onClick={() => { localStorage.removeItem('aeth-is-mod'); localStorage.removeItem('aeth-is-owner'); window.location.reload() }}
                      className="text-xs text-error/70 hover:text-error transition-colors cursor-pointer">
                      Revoke access
                    </button>
                  )}
                </div>
              </SectionCard>
            </>
          )}

          {hasChanges && (
            <div className="mt-6 flex items-center gap-3 justify-end">
              <button onClick={handleCancel}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted hover:text-text border border-border/30 hover:border-border-hover transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className={`flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  saved
                    ? 'bg-success/20 text-success border border-success/30'
                    : 'bg-accent text-white hover:brightness-110 shadow-lg shadow-accent/20'
                }`}>
                {saved ? <Check size={16} /> : null}
                {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          )}

          {/* Vencord-style unsaved changes popup */}
          {settingsPopup && (
            <div className="fixed inset-0 z-[400] flex items-center justify-center" onClick={handleCancel}>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <div className="relative glass-modal rounded-2xl border border-accent/20 shadow-[0_16px_48px_rgba(0,0,0,0.6)] p-6 w-[340px] animate-modal-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center">
                    <Sparkles size={15} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text">Unsaved Changes</p>
                    <p className="text-[11px] text-muted/60 mt-0.5">You have unsaved settings</p>
                  </div>
                </div>
                <div className="h-px bg-white/5 mb-4" />
                <p className="text-xs text-dim leading-relaxed mb-5">Save your changes before leaving, or discard them.</p>
                <div className="flex gap-2 justify-end">
                  <button onClick={handleCancel}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-muted hover:text-text border border-border/30 hover:border-border-hover transition-all cursor-pointer">
                    Discard
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-accent text-white hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-accent/20">
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
    </div>
  )
}

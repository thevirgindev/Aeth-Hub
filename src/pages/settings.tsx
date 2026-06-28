import { useState, useEffect } from 'react'
import { detectPlayer, getSettings, saveSettings, clearCache } from '../lib/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import type { AppSettings } from '../lib/types'
import { Monitor, Folder, Palette, Trash2, RefreshCw } from 'lucide-react'

const allScrapers = [
  '1337x', 'TPB', 'YTS', 'EZTV', 'Nyaa', 'Sukebei', 'AniDex',
  'FitGirl', 'DODI', 'SteamRIP', 'GOG', 'Online-Fix',
]

export function SettingsPage() {
  const [player, setPlayer] = useState('checking...')
  const [settings, setSettings] = useState<AppSettings>({
    use_custom_player: false, download_path: '',
    scrapers_enabled: [...allScrapers], accent_color: '#7C5CFF',
  })

  useEffect(() => {
    detectPlayer().then(setPlayer).catch(() => setPlayer('Not found'))
    getSettings().then(s => setSettings(s)).catch(() => {})
  }, [])

  const toggleScraper = (name: string) => {
    setSettings(s => ({
      ...s,
      scrapers_enabled: s.scrapers_enabled.includes(name)
        ? s.scrapers_enabled.filter(x => x !== name)
        : [...s.scrapers_enabled, name],
    }))
  }

  const handleSave = async () => {
    try {
      await saveSettings(settings)
      alert('Settings saved')
    } catch { alert('Failed to save settings') }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-2xl animate-fade">
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2"><Monitor size={18} /> External Player</h2>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-dim">Detected player</span>
            <span className="text-sm text-text font-mono">{player}</span>
          </div>
          <p className="text-[12px] text-muted mt-2">Install mpv or VLC for the best experience. Aeth detects them automatically.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2"><Palette size={18} /> Appearance</h2>
        <div className="glass rounded-xl p-4">
          <label className="text-sm text-dim block mb-2">Accent Color</label>
          <div className="flex items-center gap-3">
            <input type="color" value={settings.accent_color}
              onChange={e => setSettings(s => ({ ...s, accent_color: e.target.value }))}
              className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-border" />
            <span className="text-sm font-mono text-dim">{settings.accent_color}</span>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2"><RefreshCw size={18} /> Scrapers</h2>
        <div className="glass rounded-xl p-4">
          <p className="text-[12px] text-muted mb-3">Enable or disable torrent sources</p>
          <div className="flex flex-wrap gap-2">
            {allScrapers.map(name => {
              const enabled = settings.scrapers_enabled.includes(name)
              return (
                <button key={name} onClick={() => toggleScraper(name)}
                  className={`px-3 py-1.5 text-sm rounded-[14px] transition-all duration-150 cursor-pointer ${
                    enabled ? 'bg-accent text-white' : 'bg-white/10 text-dim hover:bg-white/20'
                  }`}>
                  {name}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2"><Folder size={18} /> Downloads</h2>
        <div className="glass rounded-xl p-4">
          <label className="text-sm text-dim block mb-2">Download path</label>
          <div className="flex gap-2">
            <Input value={settings.download_path || 'C:/Users/user/Downloads/Aeth'}
              onChange={e => setSettings(s => ({ ...s, download_path: e.target.value }))}
              className="flex-1" />
            <Button variant="outline" size="md">Browse</Button>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2"><Trash2 size={18} /> Cache</h2>
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-dim mb-3">Clear cached scraper results to force fresh searches</p>
          <Button variant="outline" size="md" onClick={async () => {
            try { await clearCache(); alert('Cache cleared') } catch { alert('Failed') }
          }}><Trash2 size={14} /> Clear Cache</Button>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text mb-4">About</h2>
        <div className="glass rounded-xl p-4 text-sm text-dim">
          <p>Aeth v0.1.0</p>
          <p className="text-muted mt-1">Built with Tauri + React + Rust</p>
        </div>
      </section>

      <div className="flex justify-end mb-8">
        <Button variant="primary" size="lg" onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  )
}

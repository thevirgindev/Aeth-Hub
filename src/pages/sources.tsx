import { Download, Construction } from 'lucide-react'

export function SourcesPage() {
  return (
    <div className="flex-1 overflow-y-auto pb-6 pt-6 px-6 animate-fade flex flex-col items-center justify-center gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
        <Download size={28} className="text-accent" />
      </div>
      <h1 className="text-xl font-bold text-text">Downloads Hub</h1>
      <p className="text-sm text-muted/70 max-w-md">
        Direct torrent downloads, repack integration, and extraction pipeline will appear here in a future release.
      </p>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-dim text-xs">
        <Construction size={14} />
        Coming soon
      </div>
    </div>
  )
}

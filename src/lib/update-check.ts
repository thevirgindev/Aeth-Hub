import type { UpdateInfo } from './types'

const CURRENT_VERSION = '0.1.0'
const REPO = 'thevirgindev/Aeth-Hub'

function parseVersion(tag: string): string {
  return tag.replace(/^v/, '')
}

function semverCompare(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0
    const nb = pb[i] || 0
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}

export async function checkForUpdate(beta = false): Promise<UpdateInfo> {
  if (import.meta.env.DEV) return { available: false, version: `v${CURRENT_VERSION}`, url: '', notes: '', published_at: '' }
  const fail = (): UpdateInfo => ({
    available: false,
    version: `v${CURRENT_VERSION}`,
    url: '',
    notes: '',
    published_at: '',
  })
  try {
    const url = beta
      ? `https://api.github.com/repos/${REPO}/releases?per_page=1`
      : `https://api.github.com/repos/${REPO}/releases/latest`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return fail()
    let data: any
    if (beta) {
      const releases = await res.json()
      if (!releases.length) return fail()
      data = releases[0]
    } else {
      data = await res.json()
    }
    const latest = parseVersion(data.tag_name)
    const current = parseVersion(CURRENT_VERSION)
    const available = semverCompare(latest, current) > 0
    return {
      available,
      version: data.tag_name,
      url: data.html_url,
      notes: (data.body || '').slice(0, 500),
      published_at: data.published_at || '',
    }
  } catch {
    return fail()
  }
}

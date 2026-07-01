function getInitials(title: string): string {
  const words = title.trim().split(/[\s-]+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return words.slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function initialsUrl(title: string): string {
  const initials = getInitials(title)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#111521"/><stop offset="100%" stop-color="#08080A"/></linearGradient></defs><rect fill="url(#g)" width="200" height="300"/><text fill="#ffffff" font-family="system-ui" font-size="42" font-weight="700" x="50%" y="50%" text-anchor="middle" dy=".35em" opacity="0.5">${initials}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

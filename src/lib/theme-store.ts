import type { UserTheme, ModComment } from './types'

const THEMES_KEY = 'aeth-market-themes'
const COMMENTS_KEY = 'aeth-market-comments'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function getThemes(): UserTheme[] {
  try { return JSON.parse(localStorage.getItem(THEMES_KEY) || '[]') } catch { return [] }
}

export function saveTheme(theme: Omit<UserTheme, 'id' | 'status' | 'submittedAt' | 'downloads'>): UserTheme {
  const themes = getThemes()
  const newTheme: UserTheme = {
    ...theme,
    id: generateId(),
    status: 'pending',
    submittedAt: Date.now(),
    downloads: 0,
  }
  themes.push(newTheme)
  localStorage.setItem(THEMES_KEY, JSON.stringify(themes))
  return newTheme
}

export function updateTheme(id: string, updates: Partial<UserTheme>): void {
  const themes = getThemes().map(t => t.id === id ? { ...t, ...updates } : t)
  localStorage.setItem(THEMES_KEY, JSON.stringify(themes))
}

export function approveTheme(id: string, notes?: string): void {
  const themes = getThemes().map(t => t.id === id ? { ...t, status: 'approved' as const, modNotes: notes } : t)
  localStorage.setItem(THEMES_KEY, JSON.stringify(themes))
}

export function rejectTheme(id: string, notes?: string): void {
  const themes = getThemes().map(t => t.id === id ? { ...t, status: 'rejected' as const, modNotes: notes } : t)
  localStorage.setItem(THEMES_KEY, JSON.stringify(themes))
}

export function deleteTheme(id: string): void {
  const themes = getThemes().filter(t => t.id !== id)
  localStorage.setItem(THEMES_KEY, JSON.stringify(themes))
}

export function incrementDownloads(id: string): void {
  const themes = getThemes().map(t => t.id === id ? { ...t, downloads: t.downloads + 1 } : t)
  localStorage.setItem(THEMES_KEY, JSON.stringify(themes))
}

export function getApprovedThemes(): UserTheme[] {
  return getThemes().filter(t => t.status === 'approved')
}

export function getPendingThemes(): UserTheme[] {
  return getThemes().filter(t => t.status === 'pending')
}

export function getComments(themeId: string): ModComment[] {
  try {
    const all = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]') as ModComment[]
    return all.filter(c => c.themeId === themeId)
  } catch { return [] }
}

export function getAllComments(): ModComment[] {
  try { return JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]') as ModComment[] } catch { return [] }
}

export function addComment(themeId: string, author: string, text: string): ModComment {
  const all: ModComment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]')
  const comment: ModComment = {
    id: generateId(), themeId, author, text,
    createdAt: Date.now(), flagged: false, moderated: false,
  }
  all.push(comment)
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(all))
  return comment
}

export function flagComment(id: string): void {
  const all: ModComment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]')
    .map((c: ModComment) => c.id === id ? { ...c, flagged: true } : c)
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(all))
}

export function moderateComment(id: string, remove: boolean): void {
  let all: ModComment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]')
  if (remove) {
    all = all.filter(c => c.id !== id)
  } else {
    all = all.map((c: ModComment) => c.id === id ? { ...c, moderated: true } : c)
  }
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(all))
}

export function getFlaggedComments(): ModComment[] {
  try {
    const all = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]') as ModComment[]
    return all.filter(c => c.flagged)
  } catch { return [] }
}

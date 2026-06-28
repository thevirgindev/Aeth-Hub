import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Page, StrSrc } from './types'

interface Store {
  page: Page; setPage: (p: Page) => void
  detailId: string | null; setDetailId: (id: string | null) => void
  detailType: string; setDetailType: (t: string) => void
  searchOpen: boolean; setSearchOpen: (v: boolean) => void
  searchResults: StrSrc[]; setSearchResults: (r: StrSrc[]) => void
  searchQuery: string; setSearchQuery: (q: string) => void
  toast: Toast | null; showToast: (t: Omit<Toast, 'id'>) => void
  favs: string[]; setFavs: (f: string[]) => void
}

export interface Toast { id: number; msg: string; type: 'info' | 'success' | 'error' }

const Ctx = createContext<Store>(null!)

let toastId = 0

export function StoreProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>('home')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detailType, setDetailType] = useState('movie')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<StrSrc[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState<Toast | null>(null)
  const [favs, setFavs] = useState<string[]>([])

  const showToast = (t: Omit<Toast, 'id'>) => {
    const id = ++toastId
    setToast({ ...t, id })
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <Ctx.Provider value={{
      page, setPage, detailId, setDetailId, detailType, setDetailType,
      searchOpen, setSearchOpen, searchResults, setSearchResults,
      searchQuery, setSearchQuery, toast, showToast, favs, setFavs
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useStore = () => useContext(Ctx)

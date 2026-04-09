import { create } from 'zustand'

export type AppLocale = 'pt' | 'en'
export type AppUser = {
  uid: string
  email: string | null
}

type AppStoreState = {
  locale: AppLocale
  user: AppUser | null
  isAuthResolved: boolean
  setLocale: (locale: AppLocale) => void
  setUser: (user: AppUser | null) => void
  setAuthResolved: (value: boolean) => void
}

export const useAppStore = create<AppStoreState>((set) => ({
  locale: 'pt',
  user: null,
  isAuthResolved: false,
  setLocale: (locale) => set({ locale }),
  setUser: (user) => set({ user }),
  setAuthResolved: (value) => set({ isAuthResolved: value }),
}))

import { create } from 'zustand'

export type AppLocale = 'pt' | 'en'

type AppStoreState = {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
}

export const useAppStore = create<AppStoreState>((set) => ({
  locale: 'pt',
  setLocale: (locale) => set({ locale }),
}))

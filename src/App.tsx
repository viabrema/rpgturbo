import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSwitch } from './ui/LanguageSwitch.tsx'
import { useAppStore } from './store/appStore.ts'
import { authService } from './services/firebase/authService.ts'
import { LoginPage } from './features/auth/LoginPage.tsx'
import { CampaignListPage } from './features/campaigns/CampaignListPage.tsx'

function App() {
  const { t } = useTranslation()
  const locale = useAppStore((state) => state.locale)
  const user = useAppStore((state) => state.user)
  const isAuthResolved = useAppStore((state) => state.isAuthResolved)
  const setUser = useAppStore((state) => state.setUser)
  const setAuthResolved = useAppStore((state) => state.setAuthResolved)

  useEffect(() => {
    const unsubscribe = authService.observeAuthState((nextUser) => {
      if (nextUser) {
        setUser({ uid: nextUser.uid, email: nextUser.email })
      } else {
        setUser(null)
      }

      setAuthResolved(true)
    })

    return unsubscribe
  }, [setAuthResolved, setUser])

  if (!isAuthResolved) {
    return (
      <div className='relative min-h-screen overflow-hidden bg-canvas px-5 py-8 md:px-10' data-locale={locale}>
        <div className='bg-orb-1' aria-hidden='true' />
        <div className='bg-orb-2' aria-hidden='true' />
        <main className='relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8'>
          <header className='flex items-center justify-between gap-4'>
            <p className='font-display text-2xl font-semibold text-ink md:text-3xl'>{t('app.name')}</p>
            <LanguageSwitch />
          </header>
          <p className='text-sm font-semibold text-ink/70'>{t('app.loading')}</p>
        </main>
      </div>
    )
  }

  return (
    <div className='relative min-h-screen overflow-hidden bg-canvas px-5 py-8 md:px-10' data-locale={locale}>
      <div className='bg-orb-1' aria-hidden='true' />
      <div className='bg-orb-2' aria-hidden='true' />
      <main className='relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8'>
        <header className='flex items-center justify-between gap-4'>
          <p className='font-display text-2xl font-semibold text-ink md:text-3xl'>{t('app.name')}</p>
          <LanguageSwitch />
        </header>

        <Routes>
          <Route path='/' element={<Navigate to={user ? '/campaigns' : '/login'} replace />} />
          <Route path='/login' element={user ? <Navigate to='/campaigns' replace /> : <LoginPage />} />
          <Route path='/campaigns' element={user ? <CampaignListPage /> : <Navigate to='/login' replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

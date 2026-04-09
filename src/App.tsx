import { NavLink, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HomePage } from './features/home/HomePage.tsx'
import { AboutPage } from './features/about/AboutPage.tsx'
import { LanguageSwitch } from './ui/LanguageSwitch.tsx'
import { getNavClassName } from './ui/navLinkClassName.ts'
import { useAppStore } from './store/appStore.ts'

function App() {
  const { t } = useTranslation()
  const locale = useAppStore((state) => state.locale)

  return (
    <div className='relative min-h-screen overflow-hidden bg-canvas px-5 py-8 md:px-10' data-locale={locale}>
      <div className='bg-orb-1' aria-hidden='true' />
      <div className='bg-orb-2' aria-hidden='true' />
      <main className='relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8'>
        <header className='flex flex-wrap items-center justify-between gap-4'>
          <p className='font-display text-2xl font-semibold text-ink md:text-3xl'>{t('app.name')}</p>
          <div className='flex items-center gap-3'>
            <nav className='inline-flex gap-2 rounded-full bg-surface/80 p-1'>
              <NavLink to='/' className={getNavClassName} end>
                {t('nav.home')}
              </NavLink>
              <NavLink to='/about' className={getNavClassName}>
                {t('nav.about')}
              </NavLink>
            </nav>
            <LanguageSwitch />
          </div>
        </header>

        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/about' element={<AboutPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

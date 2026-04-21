import type { ReactNode } from 'react'

type AppLayoutProps = {
  locale: string
  header: ReactNode
  children: ReactNode
}

export function AppLayout({ locale, header, children }: AppLayoutProps) {
  return (
    <div className='relative min-h-screen overflow-hidden bg-canvas px-5 py-8 md:px-10' data-locale={locale}>
      <div className='bg-orb-1' aria-hidden='true' />
      <div className='bg-orb-2' aria-hidden='true' />
      <main className='relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8'>
        {header}
        {children}
      </main>
    </div>
  )
}

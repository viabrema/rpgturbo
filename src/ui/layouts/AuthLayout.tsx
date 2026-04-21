import type { ReactNode } from 'react'

type AuthLayoutProps = {
  children: ReactNode
  locale: string
}

export function AuthLayout({ children, locale }: AuthLayoutProps) {
  return (
    <div className='login-shell relative min-h-screen overflow-hidden px-6 py-6 md:px-10 md:py-8' data-locale={locale}>
      <main className='relative z-10 flex min-h-[calc(100vh-3rem)] w-full flex-col'>
        <div className='flex flex-1 items-end'>{children}</div>
      </main>
    </div>
  )
}

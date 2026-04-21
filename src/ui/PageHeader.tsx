import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { icons } from './icons.ts'

const BackIcon = icons.back

type BreadcrumbItem = {
  label: string
  to?: string
}

type PageHeaderProps = {
  title: string
  backTo?: string
  backLabel: string
  breadcrumbs: BreadcrumbItem[]
  actions?: ReactNode
}

export function PageHeader({ title, backTo, backLabel, breadcrumbs, actions }: PageHeaderProps) {
  const { t } = useTranslation()

  return (
    <header className='space-y-3'>
      <div className='flex flex-wrap items-center gap-3 text-sm text-ink/70'>
        {backTo ? (
          <Link
            to={backTo}
            aria-label={backLabel}
            className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink shadow-sm transition hover:bg-ink/5'
          >
            <BackIcon aria-hidden='true' />
          </Link>
        ) : null}
        <nav aria-label={t('navigation.breadcrumbs')} className='flex flex-wrap items-center gap-2'>
          {breadcrumbs.map((item, index) => (
            <div key={`${item.label}-${index}`} className='flex items-center gap-2'>
              {item.to ? (
                <Link to={item.to} className='font-semibold text-ink/70 transition hover:text-ink'>
                  {item.label}
                </Link>
              ) : (
                <span className='font-semibold text-ink'>{item.label}</span>
              )}
              {index < breadcrumbs.length - 1 ? <span aria-hidden='true'>/</span> : null}
            </div>
          ))}
        </nav>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-4'>
        <h1 className='font-display text-3xl text-ink md:text-4xl'>{title}</h1>
        {actions ? <div className='flex items-center gap-2'>{actions}</div> : null}
      </div>
    </header>
  )
}

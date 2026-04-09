import { useTranslation } from 'react-i18next'

export function HomePage() {
  const { t } = useTranslation()

  return (
    <section className='animate-rise rounded-3xl bg-surface/75 p-8 shadow-xl backdrop-blur md:p-12'>
      <p className='text-xs font-bold uppercase tracking-[0.3em] text-brand'>
        {t('home.kicker')}
      </p>
      <h1 className='mt-4 font-display text-4xl text-ink md:text-6xl'>
        {t('home.title')}
      </h1>
      <p className='mt-6 max-w-2xl text-base text-ink/80 md:text-lg'>
        {t('home.description')}
      </p>
      <div className='mt-8 grid gap-4 md:grid-cols-3'>
        <article className='rounded-2xl bg-brand/10 p-4 text-left'>
          <h2 className='text-sm font-bold uppercase tracking-wider text-brand'>
            {t('home.cardAuthTitle')}
          </h2>
          <p className='mt-2 text-sm text-ink/80'>{t('home.cardAuthBody')}</p>
        </article>
        <article className='rounded-2xl bg-forest/10 p-4 text-left'>
          <h2 className='text-sm font-bold uppercase tracking-wider text-forest'>
            {t('home.cardDbTitle')}
          </h2>
          <p className='mt-2 text-sm text-ink/80'>{t('home.cardDbBody')}</p>
        </article>
        <article className='rounded-2xl bg-sun/20 p-4 text-left'>
          <h2 className='text-sm font-bold uppercase tracking-wider text-ink'>
            {t('home.cardStorageTitle')}
          </h2>
          <p className='mt-2 text-sm text-ink/80'>{t('home.cardStorageBody')}</p>
        </article>
      </div>
    </section>
  )
}

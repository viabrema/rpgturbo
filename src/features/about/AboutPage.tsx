import { useTranslation } from 'react-i18next'

export function AboutPage() {
  const { t } = useTranslation()

  return (
    <section className='animate-rise rounded-3xl bg-surface/75 p-8 shadow-xl backdrop-blur md:p-12'>
      <h1 className='font-display text-4xl text-ink md:text-5xl'>{t('about.title')}</h1>
      <p className='mt-6 max-w-2xl text-base text-ink/80 md:text-lg'>{t('about.description')}</p>
    </section>
  )
}

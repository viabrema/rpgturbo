import { useTranslation } from 'react-i18next'
import { authService } from '../../services/firebase/authService.ts'
import { icons } from '../../ui/icons.ts'

const LogoutIcon = icons.logout

export function CampaignListPage() {
  const { t } = useTranslation()

  return (
    <section className='animate-rise rounded-3xl bg-surface/80 p-8 shadow-xl backdrop-blur md:p-10'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h1 className='font-display text-3xl text-ink md:text-4xl'>{t('campaigns.title')}</h1>
        <button
          type='button'
          onClick={() => void authService.signOut()}
          className='flex items-center gap-2 rounded-xl bg-ink px-4 py-2 font-bold text-surface transition hover:brightness-110'
        >
          <LogoutIcon aria-hidden='true' />
          {t('auth.signOut')}
        </button>
      </div>
    </section>
  )
}

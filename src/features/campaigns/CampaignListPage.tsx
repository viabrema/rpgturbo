import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { authService } from '../../services/firebase/authService.ts'
import { campaignService, type Campaign } from '../../services/firebase/campaignService.ts'
import { useAppStore } from '../../store/appStore.ts'
import { icons } from '../../ui/icons.ts'

const LogoutIcon = icons.logout
const AddIcon = icons.add

export function CampaignListPage() {
  const { t } = useTranslation()
  const user = useAppStore((state) => state.user)
  const userUid = user?.uid ?? ''
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    if (!userUid) {
      return
    }

    return campaignService.observeUserCampaigns(userUid, (nextCampaigns) => {
      setCampaigns(nextCampaigns)
    })
  }, [userUid])

  const campaignCards = useMemo(
    () =>
      [...campaigns].sort((left, right) => right.createdAt - left.createdAt),
    [campaigns],
  )

  return (
    <section className='animate-rise rounded-3xl bg-surface/80 p-8 shadow-xl backdrop-blur md:p-10'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h1 className='font-display text-3xl text-ink md:text-4xl'>{t('campaigns.title')}</h1>
        <div className='relative flex items-center gap-2'>
          <button
            type='button'
            onClick={() => void authService.signOut()}
            className='flex items-center gap-2 rounded-xl bg-ink px-4 py-2 font-bold text-surface transition hover:brightness-110'
          >
            <LogoutIcon aria-hidden='true' />
            {t('auth.signOut')}
          </button>
        </div>
      </div>

      <div className='mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        <Link
          to='/campaigns/new'
          className='flex min-h-52 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand/60 bg-brand/5 p-6 text-center transition hover:bg-brand/10'
        >
          <span className='mb-3 rounded-full bg-brand p-4 text-surface'>
            <AddIcon size={26} aria-hidden='true' />
          </span>
          <p className='font-display text-xl text-ink'>{t('campaigns.newCampaign')}</p>
        </Link>

        {campaignCards.map((campaign) => (
          <Link
            key={campaign.id}
            to={`/campaigns/${campaign.id}/edit`}
            className='group rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
          >
            {campaign.imageUrl ? (
              <img
                src={campaign.imageUrl}
                alt={campaign.name}
                className='h-32 w-full rounded-xl object-cover'
              />
            ) : (
              <div className='h-32 w-full rounded-xl bg-canvas' />
            )}
            <h2 className='mt-4 font-display text-xl text-ink'>{campaign.name}</h2>
            <p className='mt-2 line-clamp-2 text-sm text-ink/75'>
              {campaign.description || t('campaigns.emptyDescription')}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

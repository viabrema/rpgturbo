import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { campaignService, type Campaign } from '../../services/firebase/campaignService.ts'
import { useAppStore } from '../../store/appStore.ts'
import { icons } from '../../ui/icons.ts'
import { PageHeader } from '../../ui/PageHeader.tsx'

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
      <PageHeader
        title={t('campaigns.title')}
        backTo='/'
        backLabel={t('navigation.back')}
        breadcrumbs={[{ label: t('campaigns.title') }]}
      />

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
            to={`/campaigns/${campaign.id}`}
            className='group rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
          >
            <div
              role='img'
              aria-label={campaign.name}
              className='aspect-square w-full rounded-xl bg-canvas bg-cover bg-center'
              style={campaign.imageUrl ? { backgroundImage: `url(${campaign.imageUrl})` } : undefined}
            />
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

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { campaignService, type Campaign } from '../../services/firebase/campaignService.ts'
import { useAppStore } from '../../store/appStore.ts'
import { PageHeader } from '../../ui/PageHeader.tsx'

export function CampaignPage() {
  const { t } = useTranslation()
  const { campaignId } = useParams<{ campaignId: string }>()
  const user = useAppStore((state) => state.user)
  const locale = useAppStore((state) => state.locale)

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [resolvedCampaignId, setResolvedCampaignId] = useState<string | null>(null)

  useEffect(() => {
    if (!campaignId) {
      return
    }

    let isCurrent = true
    void (async () => {
      const nextCampaign = await campaignService.getCampaignById(campaignId)
      if (isCurrent) {
        setCampaign(nextCampaign)
        setResolvedCampaignId(campaignId)
      }
    })()

    return () => {
      isCurrent = false
    }
  }, [campaignId])

  const isLoading = Boolean(campaignId && resolvedCampaignId !== campaignId)
  const canEdit = Boolean(user?.uid && campaign?.ownerUid === user?.uid)

  const formattedCreatedAt = campaign?.createdAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(campaign.createdAt))
    : ''

  const headerTitle = campaign?.name ?? t('campaigns.viewTitle')
  const breadcrumbs = [
    { label: t('campaigns.title'), to: '/campaigns' },
    { label: headerTitle },
  ]

  return (
    <section className='animate-rise rounded-3xl bg-surface/80 p-8 shadow-xl backdrop-blur md:p-10'>
      <PageHeader
        title={headerTitle}
        backTo='/campaigns'
        backLabel={t('navigation.back')}
        breadcrumbs={breadcrumbs}
        actions={
          canEdit ? (
            <Link
              to={`/campaigns/${campaign?.id ?? ''}/edit`}
              className='rounded-lg bg-brand px-3 py-2 text-sm font-bold text-surface transition hover:brightness-110'
            >
              {t('campaigns.editCta')}
            </Link>
          ) : null
        }
      />

      {isLoading ? (
        <p className='mt-6 text-sm text-ink/70'>{t('campaigns.viewLoading')}</p>
      ) : !campaign ? (
        <p className='mt-6 text-sm text-ink/70'>{t('campaigns.viewNotFound')}</p>
      ) : (
        <div className='mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]'>
          <div className='space-y-4'>
            <div className='rounded-2xl bg-white p-5 shadow-sm'>
              <p className='text-xs font-bold uppercase tracking-wider text-ink/70'>
                {t('campaigns.form.description')}
              </p>
              <p className='mt-2 text-base text-ink/80'>
                {campaign.description || t('campaigns.emptyDescription')}
              </p>
            </div>

            <div className='rounded-2xl bg-white p-5 shadow-sm'>
              <p className='text-xs font-bold uppercase tracking-wider text-ink/70'>
                {t('campaigns.createdAt')}
              </p>
              <p className='mt-2 text-sm text-ink/80'>{formattedCreatedAt}</p>
            </div>
          </div>

          <div className='rounded-2xl border border-ink/10 bg-white p-4 shadow-sm'>
            <div className='relative aspect-square w-full overflow-hidden rounded-xl bg-canvas'>
              {campaign.imageUrl ? (
                <img src={campaign.imageUrl} alt={campaign.name} className='h-full w-full object-cover' />
              ) : (
                <div className='flex h-full items-center justify-center p-4'>
                  <p className='text-center font-display text-3xl leading-tight text-ink/75'>
                    {t('campaigns.imagePlaceholder')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { authService } from '../../services/firebase/authService.ts'
import { campaignService, type CampaignInvite } from '../../services/firebase/campaignService.ts'
import { useAppStore } from '../../store/appStore.ts'
import { icons } from '../../ui/icons.ts'

const LogoutIcon = icons.logout
const NotificationsIcon = icons.notifications

export function CampaignListPage() {
  const { t } = useTranslation()
  const user = useAppStore((state) => state.user)
  const userUid = user?.uid ?? ''
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [invites, setInvites] = useState<CampaignInvite[]>([])

  useEffect(() => {
    if (!userUid) {
      return
    }

    return campaignService.observeInvites(userUid, (nextInvites) => {
      setInvites(nextInvites)
    })
  }, [userUid])

  const pendingInvites = useMemo(
    () => invites.filter((invite) => invite.status === 'pending'),
    [invites],
  )

  const handleAcceptInvite = async (invite: CampaignInvite) => {
    await campaignService.acceptInvite(userUid, invite)
  }

  const handleDeclineInvite = async (invite: CampaignInvite) => {
    await campaignService.declineInvite(userUid, invite)
  }

  return (
    <section className='animate-rise rounded-3xl bg-surface/80 p-8 shadow-xl backdrop-blur md:p-10'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h1 className='font-display text-3xl text-ink md:text-4xl'>{t('campaigns.title')}</h1>
        <div className='relative flex items-center gap-2'>
          <button
            type='button'
            onClick={() => setIsPopoverOpen((value) => !value)}
            className='relative flex h-10 w-10 items-center justify-center rounded-xl bg-white text-ink shadow-sm transition hover:bg-ink/5'
            aria-label={t('campaigns.notifications')}
          >
            <NotificationsIcon aria-hidden='true' />
            {pendingInvites.length > 0 ? (
              <span className='absolute -right-1 -top-1 rounded-full bg-brand px-1.5 text-xs font-bold text-surface'>
                {pendingInvites.length}
              </span>
            ) : null}
          </button>

          {isPopoverOpen ? (
            <div className='absolute right-0 top-12 z-10 w-80 rounded-2xl bg-white p-3 shadow-xl'>
              <h2 className='font-display text-lg text-ink'>{t('campaigns.notifications')}</h2>

              {pendingInvites.length === 0 ? (
                <p className='mt-2 text-sm text-ink/70'>{t('campaigns.noNotifications')}</p>
              ) : (
                <ul className='mt-2 space-y-2'>
                  {pendingInvites.map((invite) => (
                    <li key={invite.id} className='rounded-xl bg-canvas p-3'>
                      <p className='text-sm font-semibold text-ink'>
                        {t('campaigns.inviteMessage', {
                          campaignName: invite.campaignName,
                        })}
                      </p>
                      <div className='mt-2 flex gap-2'>
                        <button
                          type='button'
                          onClick={() => void handleAcceptInvite(invite)}
                          className='rounded-lg bg-brand px-3 py-1 text-xs font-bold text-surface'
                        >
                          {t('campaigns.acceptInvite')}
                        </button>
                        <button
                          type='button'
                          onClick={() => void handleDeclineInvite(invite)}
                          className='rounded-lg bg-ink/10 px-3 py-1 text-xs font-bold text-ink'
                        >
                          {t('campaigns.declineInvite')}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

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
    </section>
  )
}

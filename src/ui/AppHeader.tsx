import { useTranslation } from 'react-i18next'
import type { CampaignInvite } from '../services/firebase/campaignService.ts'
import { icons } from './icons.ts'
import { LanguageSwitch } from './LanguageSwitch.tsx'

const LogoutIcon = icons.logout
const NotificationsIcon = icons.notifications

type AppHeaderProps = {
  appName: string
  showUserActions: boolean
  pendingInvites?: CampaignInvite[]
  isPopoverOpen?: boolean
  onTogglePopover?: () => void
  onAcceptInvite?: (invite: CampaignInvite) => void
  onDeclineInvite?: (invite: CampaignInvite) => void
  onSignOut?: () => void
}

export function AppHeader({
  appName,
  showUserActions,
  pendingInvites,
  isPopoverOpen,
  onTogglePopover,
  onAcceptInvite,
  onDeclineInvite,
  onSignOut,
}: AppHeaderProps) {
  const { t } = useTranslation()
  const safePendingInvites = pendingInvites ?? []

  return (
    <header className='flex items-center justify-between gap-4'>
      <p className='font-display text-2xl font-semibold text-ink md:text-3xl'>{appName}</p>
      <div className='flex items-center gap-2'>
        <LanguageSwitch />
        {showUserActions ? (
          <div className='relative flex items-center gap-2'>
            <button
              type='button'
              onClick={onTogglePopover}
              className='relative flex h-10 w-10 items-center justify-center rounded-xl bg-white text-ink shadow-sm transition hover:bg-ink/5'
              aria-label={t('campaigns.notifications')}
            >
              <NotificationsIcon aria-hidden='true' />
              {safePendingInvites.length > 0 ? (
                <span className='absolute -right-1 -top-1 rounded-full bg-brand px-1.5 text-xs font-bold text-surface'>
                  {safePendingInvites.length}
                </span>
              ) : null}
            </button>

            {isPopoverOpen ? (
              <div className='absolute right-0 top-12 z-10 w-80 rounded-2xl bg-white p-3 shadow-xl'>
                <h2 className='font-display text-lg text-ink'>{t('campaigns.notifications')}</h2>

                {safePendingInvites.length === 0 ? (
                  <p className='mt-2 text-sm text-ink/70'>{t('campaigns.noNotifications')}</p>
                ) : (
                  <ul className='mt-2 space-y-2'>
                    {safePendingInvites.map((invite) => (
                      <li key={invite.id} className='rounded-xl bg-canvas p-3'>
                        <p className='text-sm font-semibold text-ink'>
                          {t('campaigns.inviteMessage', {
                            campaignName: invite.campaignName,
                          })}
                        </p>
                        <div className='mt-2 flex gap-2'>
                          <button
                            type='button'
                            onClick={() => onAcceptInvite?.(invite)}
                            className='rounded-lg bg-brand px-3 py-1 text-xs font-bold text-surface'
                          >
                            {t('campaigns.acceptInvite')}
                          </button>
                          <button
                            type='button'
                            onClick={() => onDeclineInvite?.(invite)}
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
              onClick={onSignOut}
              className='flex items-center gap-2 rounded-xl bg-ink px-4 py-2 font-bold text-surface transition hover:brightness-110'
            >
              <LogoutIcon aria-hidden='true' />
              {t('auth.signOut')}
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}

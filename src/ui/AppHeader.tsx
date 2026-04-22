import { useTranslation } from 'react-i18next'
import type { CampaignInvite } from '../services/firebase/campaignService.ts'
import { icons } from './icons.ts'
import { LanguageSwitch } from './LanguageSwitch.tsx'

const NotificationsIcon = icons.notifications

type AppHeaderProps = {
  appName: string
  showUserActions: boolean
  userName?: string | null
  userEmail?: string | null
  pendingInvites?: CampaignInvite[]
  isNotificationsOpen?: boolean
  isUserMenuOpen?: boolean
  onToggleNotifications?: () => void
  onToggleUserMenu?: () => void
  onAcceptInvite?: (invite: CampaignInvite) => void
  onDeclineInvite?: (invite: CampaignInvite) => void
  onProfile?: () => void
  onSignOut?: () => void
}

export function AppHeader({
  appName,
  showUserActions,
  userName,
  userEmail,
  pendingInvites,
  isNotificationsOpen,
  isUserMenuOpen,
  onToggleNotifications,
  onToggleUserMenu,
  onAcceptInvite,
  onDeclineInvite,
  onProfile,
  onSignOut,
}: AppHeaderProps) {
  const { t } = useTranslation()
  const safePendingInvites = pendingInvites ?? []
  const displayName = userName || userEmail || t('user.initialFallback')
  const initial = displayName.trim().slice(0, 1).toUpperCase()

  return (
    <header className='flex items-center justify-between gap-4'>
      <p className='font-display text-2xl font-semibold text-ink md:text-3xl'>{appName}</p>
      <div className='flex items-center gap-2'>
        <LanguageSwitch />
        {showUserActions ? (
          <div className='relative flex items-center gap-2'>
            <button
              type='button'
              onClick={onToggleNotifications}
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

            {isNotificationsOpen ? (
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
              onClick={onToggleUserMenu}
              className='flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-ink shadow-sm transition hover:bg-ink/5'
              aria-label={t('user.menuLabel')}
            >
              {initial}
            </button>

            {isUserMenuOpen ? (
              <div className='absolute right-0 top-12 z-10 w-64 rounded-2xl bg-white p-3 shadow-xl'>
                <p className='font-display text-lg text-ink'>{displayName}</p>
                <div className='mt-3 space-y-2'>
                  <button
                    type='button'
                    onClick={onProfile}
                    className='w-full rounded-lg bg-ink/5 px-3 py-2 text-left text-sm font-semibold text-ink transition hover:bg-ink/10'
                  >
                    {t('user.profile')}
                  </button>
                  <button
                    type='button'
                    onClick={onSignOut}
                    className='w-full rounded-lg bg-ink/90 px-3 py-2 text-left text-sm font-semibold text-surface transition hover:brightness-110'
                  >
                    {t('auth.signOut')}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  )
}

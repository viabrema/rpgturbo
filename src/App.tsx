import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppHeader } from './ui/AppHeader.tsx'
import { AppLayout } from './ui/layouts/AppLayout.tsx'
import { AuthLayout } from './ui/layouts/AuthLayout.tsx'
import { useAppStore } from './store/appStore.ts'
import { authService } from './services/firebase/authService.ts'
import { campaignService, type CampaignInvite } from './services/firebase/campaignService.ts'
import { userProfileService } from './services/firebase/userProfileService.ts'
import { LoginPage } from './features/auth/LoginPage.tsx'
import { CampaignListPage } from './features/campaigns/CampaignListPage.tsx'
import { CampaignEditorPage } from './features/campaigns/CampaignEditorPage.tsx'
import { CampaignPage } from './features/campaigns/CampaignPage.tsx'

function App() {
  const { t } = useTranslation()
  const locale = useAppStore((state) => state.locale)
  const user = useAppStore((state) => state.user)
  const isAuthResolved = useAppStore((state) => state.isAuthResolved)
  const setUser = useAppStore((state) => state.setUser)
  const setAuthResolved = useAppStore((state) => state.setAuthResolved)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [invites, setInvites] = useState<CampaignInvite[]>([])
  const [userNickname, setUserNickname] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = authService.observeAuthState((nextUser) => {
      if (nextUser) {
        setUser({ uid: nextUser.uid, email: nextUser.email })
        void (async () => {
          const profile = await userProfileService.getProfileByUid(nextUser.uid)
          setUserNickname(profile?.nickname ?? null)
        })()
      } else {
        setUser(null)
        setUserNickname(null)
      }

      setAuthResolved(true)
    })

    return unsubscribe
  }, [setAuthResolved, setUser])

  useEffect(() => {
    if (!user?.uid) {
      return
    }

    return campaignService.observeInvites(user.uid, (nextInvites) => {
      setInvites(nextInvites)
    })
  }, [user?.uid])

  const pendingInvites = invites.filter((invite) => invite.status === 'pending')

  const handleAcceptInvite = async (userUid: string, invite: CampaignInvite) => {
    await campaignService.acceptInvite(userUid, invite)
  }

  const handleDeclineInvite = async (userUid: string, invite: CampaignInvite) => {
    await campaignService.declineInvite(userUid, invite)
  }

  const handleProfile = () => {
    setIsUserMenuOpen(false)
  }

  if (!isAuthResolved) {
    return (
      <AppLayout
        locale={locale}
        header={<AppHeader appName={t('app.name')} showUserActions={false} />}
      >
        <p className='text-sm font-semibold text-ink/70'>{t('app.loading')}</p>
      </AppLayout>
    )
  }

  if (!user) {
    return (
      <AuthLayout locale={locale}>
        <Routes>
          <Route path='/' element={<Navigate to='/login' replace />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
      </AuthLayout>
    )
  }

  return (
    <AppLayout
      locale={locale}
      header={
        <AppHeader
          appName={t('app.name')}
          showUserActions
          userName={userNickname}
          userEmail={user.email}
          pendingInvites={pendingInvites}
          isNotificationsOpen={isNotificationsOpen}
          isUserMenuOpen={isUserMenuOpen}
          onToggleNotifications={() => setIsNotificationsOpen((value) => !value)}
          onToggleUserMenu={() => setIsUserMenuOpen((value) => !value)}
          onAcceptInvite={(invite) => void handleAcceptInvite(user.uid, invite)}
          onDeclineInvite={(invite) => void handleDeclineInvite(user.uid, invite)}
          onProfile={handleProfile}
          onSignOut={() => void authService.signOut()}
        />
      }
    >
      <Routes>
        <Route path='/' element={<Navigate to='/campaigns' replace />} />
        <Route path='/login' element={<Navigate to='/campaigns' replace />} />
        <Route path='/campaigns' element={<CampaignListPage />} />
        <Route path='/campaigns/new' element={<CampaignEditorPage />} />
        <Route path='/campaigns/:campaignId' element={<CampaignPage />} />
        <Route path='/campaigns/:campaignId/edit' element={<CampaignEditorPage />} />
        <Route path='*' element={<Navigate to='/campaigns' replace />} />
      </Routes>
    </AppLayout>
  )
}

export default App

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App.tsx'
import i18n from '../i18n.ts'
import { useAppStore } from '../store/appStore.ts'

const {
  observeAuthStateMock,
  signOutMock,
  observeInvitesMock,
  observeUserCampaignsMock,
  acceptInviteMock,
  declineInviteMock,
} = vi.hoisted(() => ({
  observeAuthStateMock: vi.fn(),
  signOutMock: vi.fn(),
  observeInvitesMock: vi.fn(),
  observeUserCampaignsMock: vi.fn(),
  acceptInviteMock: vi.fn(),
  declineInviteMock: vi.fn(),
}))

vi.mock('../services/firebase/authService.ts', () => ({
  authService: {
    observeAuthState: observeAuthStateMock,
    signOut: signOutMock,
  },
}))

vi.mock('../services/firebase/campaignService.ts', () => ({
  campaignService: {
    observeInvites: observeInvitesMock,
    observeUserCampaigns: observeUserCampaignsMock,
    observeCampaignInvites: vi.fn(),
    searchNicknames: vi.fn(),
    createCampaign: vi.fn(),
    updateCampaign: vi.fn(),
    getCampaignById: vi.fn(),
    inviteManyByNicknames: vi.fn(),
    acceptInvite: acceptInviteMock,
    declineInvite: declineInviteMock,
  },
}))

vi.mock('../services/firebase/userProfileService.ts', () => ({
  userProfileService: {
    registerWithEmailPassword: vi.fn(),
    registerWithGoogle: vi.fn(),
    getProfileByUid: vi.fn().mockResolvedValue(null),
  },
}))

describe('App notifications', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt')
    useAppStore.setState({ locale: 'pt', user: null, isAuthResolved: false })
    observeAuthStateMock.mockImplementation(
      (callback: (value: { uid: string; email: string } | null) => void) => {
        callback(null)
        return vi.fn()
      },
    )
    observeInvitesMock.mockImplementation((_: string, onChange: (value: unknown[]) => void) => {
      onChange([])
      return vi.fn()
    })
    observeUserCampaignsMock.mockImplementation((_: string, onChange: (value: unknown[]) => void) => {
      onChange([])
      return vi.fn()
    })
    acceptInviteMock.mockResolvedValue(undefined)
    declineInviteMock.mockResolvedValue(undefined)
  })

  it('accepts and declines campaign invites from notifications popover', async () => {
    const user = userEvent.setup()
    observeAuthStateMock.mockImplementation(
      (callback: (value: { uid: string; email: string } | null) => void) => {
        callback({ uid: 'user-1', email: 'jogador@mesa.com' })
        return vi.fn()
      },
    )
    observeInvitesMock.mockImplementation((_: string, onChange: (value: unknown[]) => void) => {
      onChange([
        {
          id: 'campaign-1',
          campaignId: 'campaign-1',
          campaignName: 'Mesa de Sexta',
          ownerUid: 'owner-1',
          targetUid: 'user-1',
          targetNickname: 'jogador',
          targetNicknameKey: 'jogador',
          status: 'pending',
        },
      ])

      return vi.fn()
    })

    render(
      <MemoryRouter initialEntries={['/campaigns']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Notificacoes' }))
    await user.click(screen.getByRole('button', { name: 'Aceitar' }))
    await user.click(screen.getByRole('button', { name: 'Recusar' }))

    expect(acceptInviteMock).toHaveBeenCalled()
    expect(declineInviteMock).toHaveBeenCalled()
  })

  it('shows empty notifications state in header', async () => {
    const user = userEvent.setup()
    observeAuthStateMock.mockImplementation(
      (callback: (value: { uid: string; email: string | null } | null) => void) => {
        callback({ uid: 'user-2', email: null })
        return vi.fn()
      },
    )
    observeInvitesMock.mockImplementation((_: string, onChange: (value: unknown[]) => void) => {
      onChange([])
      return vi.fn()
    })

    render(
      <MemoryRouter initialEntries={['/campaigns']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Notificacoes' }))

    expect(screen.getByText('Voce nao tem convites pendentes.')).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CampaignListPage } from '../CampaignListPage.tsx'
import { useAppStore } from '../../../store/appStore.ts'

const { signOutMock, observeInvitesMock } = vi.hoisted(() => ({
  signOutMock: vi.fn(),
  observeInvitesMock: vi.fn(),
}))

vi.mock('../../../services/firebase/authService.ts', () => ({
  authService: {
    signOut: signOutMock,
  },
}))

vi.mock('../../../services/firebase/campaignService.ts', () => ({
  campaignService: {
    observeInvites: observeInvitesMock,
    acceptInvite: vi.fn(),
    declineInvite: vi.fn(),
  },
}))

describe('CampaignListPage', () => {
  it('handles unauthenticated state without subscribing and shows empty notifications', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ user: null })

    render(<CampaignListPage />)

    expect(observeInvitesMock).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Notificacoes' }))

    expect(screen.getByText('Voce nao tem convites pendentes.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Sair' }))

    expect(signOutMock).toHaveBeenCalled()
  })
})

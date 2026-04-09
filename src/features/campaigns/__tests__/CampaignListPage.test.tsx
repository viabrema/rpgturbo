import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CampaignListPage } from '../CampaignListPage.tsx'
import { useAppStore } from '../../../store/appStore.ts'

const { signOutMock, observeUserCampaignsMock } = vi.hoisted(() => ({
  signOutMock: vi.fn(),
  observeUserCampaignsMock: vi.fn(),
}))

vi.mock('../../../services/firebase/authService.ts', () => ({
  authService: {
    signOut: signOutMock,
  },
}))

vi.mock('../../../services/firebase/campaignService.ts', () => ({
  campaignService: {
    observeUserCampaigns: observeUserCampaignsMock,
  },
}))

describe('CampaignListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles unauthenticated state and still shows campaign entry points', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ user: null })
    observeUserCampaignsMock.mockImplementation((_: string, onChange: (value: unknown[]) => void) => {
      onChange([])
      return vi.fn()
    })

    render(
      <MemoryRouter>
        <CampaignListPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Nova campanha')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Sair' }))

    expect(signOutMock).toHaveBeenCalled()
  })

  it('renders campaigns cards without invite controls', () => {
    useAppStore.setState({ user: { uid: 'owner-1', email: 'owner@test.com' } })

    observeUserCampaignsMock.mockImplementation((_: string, onChange: (value: unknown[]) => void) => {
      onChange([
        {
          id: 'campaign-1',
          ownerUid: 'owner-1',
          name: 'Mesa Aurora',
          description: '',
          imageUrl: 'https://cdn/mesa.png',
          password: null,
          createdAt: 10,
        },
        {
          id: 'campaign-2',
          ownerUid: 'owner-1',
          name: 'Mesa Nebula',
          description: 'Descricao secundaria',
          imageUrl: null,
          password: null,
          createdAt: 9,
        },
      ])
      return vi.fn()
    })

    render(
      <MemoryRouter>
        <CampaignListPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('img', { name: 'Mesa Aurora' })).toBeInTheDocument()
    expect(screen.getByText('Mesa Nebula')).toBeInTheDocument()
    expect(screen.getByText('Sem descricao cadastrada.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Notificacoes' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Aceitar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Recusar' })).not.toBeInTheDocument()
  })
})

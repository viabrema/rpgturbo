import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CampaignListPage } from '../CampaignListPage.tsx'
import { useAppStore } from '../../../store/appStore.ts'

const { observeUserCampaignsMock } = vi.hoisted(() => ({
  observeUserCampaignsMock: vi.fn(),
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

  it('handles unauthenticated state and still shows campaign entry points', () => {
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
  })

  it('renders campaigns cards', () => {
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
  })
})

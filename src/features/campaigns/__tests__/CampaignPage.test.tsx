import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CampaignPage } from '../CampaignPage.tsx'
import { useAppStore } from '../../../store/appStore.ts'

const { getCampaignByIdMock } = vi.hoisted(() => ({
  getCampaignByIdMock: vi.fn(),
}))

vi.mock('../../../services/firebase/campaignService.ts', () => ({
  campaignService: {
    getCampaignById: getCampaignByIdMock,
  },
}))

describe('CampaignPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAppStore.setState({ user: { uid: 'owner-1', email: 'owner@test.com' }, locale: 'pt' })
  })

  it('renders campaign details with edit button for owner', async () => {
    getCampaignByIdMock.mockResolvedValue({
      id: 'campaign-1',
      ownerUid: 'owner-1',
      name: 'Mesa Aurora',
      description: 'Descricao principal',
      imageUrl: 'https://cdn/mesa-aurora.png',
      password: null,
      createdAt: 1713657600000,
    })

    render(
      <MemoryRouter initialEntries={['/campaigns/campaign-1']}>
        <Routes>
          <Route path='/campaigns/:campaignId' element={<CampaignPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { level: 1, name: 'Mesa Aurora' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Mesa Aurora' })).toBeInTheDocument()
    expect(screen.getByText('Descricao principal')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Editar campanha' })).toBeInTheDocument()

    const formattedDate = new Intl.DateTimeFormat('pt', { dateStyle: 'medium' }).format(
      new Date(1713657600000),
    )
    await waitFor(() => {
      expect(screen.getByText(formattedDate)).toBeInTheDocument()
    })
  })

  it('shows loading state while fetching campaign', async () => {
    let resolveCampaign: ((value: unknown) => void) | undefined
    getCampaignByIdMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCampaign = resolve
        }),
    )

    render(
      <MemoryRouter initialEntries={['/campaigns/campaign-1']}>
        <Routes>
          <Route path='/campaigns/:campaignId' element={<CampaignPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Carregando campanha...')).toBeInTheDocument()

    if (resolveCampaign) {
      resolveCampaign({
        id: 'campaign-1',
        ownerUid: 'owner-1',
        name: 'Mesa Carregada',
        description: '',
        imageUrl: null,
        password: null,
        createdAt: 1713657600000,
      })
    }

    expect(await screen.findByRole('heading', { level: 1, name: 'Mesa Carregada' })).toBeInTheDocument()
  })

  it('hides edit button for non-owner users', async () => {
    useAppStore.setState({ user: { uid: 'player-2', email: 'player@test.com' }, locale: 'pt' })
    getCampaignByIdMock.mockResolvedValue({
      id: 'campaign-1',
      ownerUid: 'owner-1',
      name: 'Mesa Guardada',
      description: '',
      imageUrl: null,
      password: null,
      createdAt: 1713657600000,
    })

    render(
      <MemoryRouter initialEntries={['/campaigns/campaign-1']}>
        <Routes>
          <Route path='/campaigns/:campaignId' element={<CampaignPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { level: 1, name: 'Mesa Guardada' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Editar campanha' })).not.toBeInTheDocument()
  })

  it('shows not found message when campaign does not exist', async () => {
    getCampaignByIdMock.mockResolvedValue(null)

    render(
      <MemoryRouter initialEntries={['/campaigns/campaign-1']}>
        <Routes>
          <Route path='/campaigns/:campaignId' element={<CampaignPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Campanha nao encontrada.')).toBeInTheDocument()
  })

  it('avoids state updates after unmount', async () => {
    let resolveCampaign: ((value: unknown) => void) | undefined
    getCampaignByIdMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCampaign = resolve
        }),
    )

    const { unmount } = render(
      <MemoryRouter initialEntries={['/campaigns/campaign-2']}>
        <Routes>
          <Route path='/campaigns/:campaignId' element={<CampaignPage />} />
        </Routes>
      </MemoryRouter>,
    )

    unmount()

    if (resolveCampaign) {
      resolveCampaign({
        id: 'campaign-2',
        ownerUid: 'owner-2',
        name: 'Mesa Tardia',
        description: 'Descricao atrasada',
        imageUrl: null,
        password: null,
        createdAt: 1713657600000,
      })
    }

    await Promise.resolve()
  })

  it('shows not found message when campaign id is missing', () => {
    render(
      <MemoryRouter initialEntries={['/campaigns']}>
        <Routes>
          <Route path='/campaigns' element={<CampaignPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Campanha' })).toBeInTheDocument()
    expect(screen.getByText('Campanha nao encontrada.')).toBeInTheDocument()
  })

  it('falls back to empty id on edit link when campaign id is missing', async () => {
    getCampaignByIdMock.mockResolvedValue({
      id: undefined as unknown as string,
      ownerUid: 'owner-1',
      name: 'Mesa sem id',
      description: 'Descricao',
      imageUrl: null,
      password: null,
      createdAt: 1713657600000,
    })

    render(
      <MemoryRouter initialEntries={['/campaigns/campaign-1']}>
        <Routes>
          <Route path='/campaigns/:campaignId' element={<CampaignPage />} />
        </Routes>
      </MemoryRouter>,
    )

    const editLink = await screen.findByRole('link', { name: 'Editar campanha' })
    expect(editLink).toHaveAttribute('href', '/campaigns/edit')
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CampaignEditorPage } from '../CampaignEditorPage.tsx'
import { useAppStore } from '../../../store/appStore.ts'

const { getCampaignByIdMock, observeCampaignInvitesMock, searchNicknamesMock } = vi.hoisted(() => ({
  getCampaignByIdMock: vi.fn(),
  observeCampaignInvitesMock: vi.fn(),
  searchNicknamesMock: vi.fn(),
}))

vi.mock('../../../services/firebase/campaignService.ts', () => ({
  campaignService: {
    createCampaign: vi.fn(),
    updateCampaign: vi.fn(),
    getCampaignById: getCampaignByIdMock,
    observeCampaignInvites: observeCampaignInvitesMock,
    searchNicknames: searchNicknamesMock,
    inviteManyByNicknames: vi.fn(),
    removeMember: vi.fn(),
  },
}))

vi.mock('../../../services/firebase/storageService.ts', () => ({
  storageService: {
    uploadCampaignImage: vi.fn(),
  },
}))

describe('CampaignEditorPage breadcrumbs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAppStore.setState({ user: { uid: 'owner-1', email: 'owner@test.com' } })
    getCampaignByIdMock.mockResolvedValue({
      id: 'campaign-1',
      ownerUid: 'owner-1',
      name: '',
      description: '',
      imageUrl: null,
      password: null,
      createdAt: 1,
    })
    observeCampaignInvitesMock.mockImplementation((_: string, onChange: (value: unknown[]) => void) => {
      onChange([])
      return vi.fn()
    })
    searchNicknamesMock.mockResolvedValue([])
  })

  it('uses fallback title in breadcrumb when name is empty', async () => {
    render(
      <MemoryRouter initialEntries={['/campaigns/campaign-1/edit']}>
        <Routes>
          <Route path='/campaigns/:campaignId/edit' element={<CampaignEditorPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Editar campanha' })).toBeInTheDocument()
    })

    const campaignLink = screen.getByRole('link', { name: 'Campanha' })
    expect(campaignLink).toHaveAttribute('href', '/campaigns/campaign-1')
  })
})

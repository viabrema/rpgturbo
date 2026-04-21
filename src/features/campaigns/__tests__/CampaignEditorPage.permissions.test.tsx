import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CampaignEditorPage } from '../CampaignEditorPage.tsx'
import { useAppStore } from '../../../store/appStore.ts'

const { getCampaignByIdMock, observeCampaignInvitesMock, searchNicknamesMock, updateCampaignMock, inviteManyByNicknamesMock } =
  vi.hoisted(() => ({
    getCampaignByIdMock: vi.fn(),
    observeCampaignInvitesMock: vi.fn(),
    searchNicknamesMock: vi.fn(),
    updateCampaignMock: vi.fn(),
    inviteManyByNicknamesMock: vi.fn(),
  }))

vi.mock('../../../services/firebase/campaignService.ts', () => ({
  campaignService: {
    createCampaign: vi.fn(),
    updateCampaign: updateCampaignMock,
    getCampaignById: getCampaignByIdMock,
    observeCampaignInvites: observeCampaignInvitesMock,
    searchNicknames: searchNicknamesMock,
    inviteManyByNicknames: inviteManyByNicknamesMock,
    removeMember: vi.fn(),
  },
}))

vi.mock('../../../services/firebase/storageService.ts', () => ({
  storageService: {
    uploadCampaignImage: vi.fn(),
  },
}))

describe('CampaignEditorPage permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAppStore.setState({ user: { uid: 'player-2', email: 'player@test.com' } })
    getCampaignByIdMock.mockResolvedValue({
      id: 'campaign-1',
      ownerUid: 'owner-1',
      name: 'Mesa do Dono',
      description: 'Descricao do dono',
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

  it('shows read-only mode for non-owner user on campaign edit page', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/campaigns/campaign-1/edit']}>
        <Routes>
          <Route path='/campaigns/:campaignId/edit' element={<CampaignEditorPage />} />
        </Routes>
      </MemoryRouter>,
    )

    const nameInput = await screen.findByLabelText('Nome da campanha')
    const descriptionInput = screen.getByLabelText('Descricao')
    const passwordInput = screen.getByLabelText('Senha (opcional)')
    const imageInput = screen.getByLabelText('Imagem da campanha (opcional)')

    expect(nameInput).toBeDisabled()
    expect(descriptionInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
    expect(imageInput).toBeDisabled()

    expect(screen.getByText('Somente o dono da campanha pode editar, salvar e convidar jogadores.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Salvar campanha' })).not.toBeInTheDocument()
    expect(screen.queryByText('Convites por nickname')).not.toBeInTheDocument()

    await user.type(nameInput, 'Tentativa de edicao')
    expect(updateCampaignMock).not.toHaveBeenCalled()
    expect(inviteManyByNicknamesMock).not.toHaveBeenCalled()
  })
})

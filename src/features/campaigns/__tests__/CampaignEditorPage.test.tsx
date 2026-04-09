import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CampaignEditorPage } from '../CampaignEditorPage.tsx'
import { useAppStore } from '../../../store/appStore.ts'

const {
  createCampaignMock,
  updateCampaignMock,
  getCampaignByIdMock,
  observeCampaignInvitesMock,
  searchNicknamesMock,
  inviteManyByNicknamesMock,
  removeMemberMock,
  uploadCampaignImageMock,
  createObjectURLMock,
  revokeObjectURLMock,
} = vi.hoisted(() => ({
  createCampaignMock: vi.fn(),
  updateCampaignMock: vi.fn(),
  getCampaignByIdMock: vi.fn(),
  observeCampaignInvitesMock: vi.fn(),
  searchNicknamesMock: vi.fn(),
  inviteManyByNicknamesMock: vi.fn(),
  removeMemberMock: vi.fn(),
  uploadCampaignImageMock: vi.fn(),
  createObjectURLMock: vi.fn(),
  revokeObjectURLMock: vi.fn(),
}))

vi.mock('../../../services/firebase/campaignService.ts', () => ({
  campaignService: {
    createCampaign: createCampaignMock,
    updateCampaign: updateCampaignMock,
    getCampaignById: getCampaignByIdMock,
    observeCampaignInvites: observeCampaignInvitesMock,
    searchNicknames: searchNicknamesMock,
    inviteManyByNicknames: inviteManyByNicknamesMock,
    removeMember: removeMemberMock,
  },
}))

vi.mock('../../../services/firebase/storageService.ts', () => ({
  storageService: {
    uploadCampaignImage: uploadCampaignImageMock,
  },
}))

describe('CampaignEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectURLMock,
      revokeObjectURL: revokeObjectURLMock,
    })
    createObjectURLMock.mockReturnValue('blob:campaign-preview')
    useAppStore.setState({ user: { uid: 'owner-1', email: 'owner@test.com' } })
    createCampaignMock.mockResolvedValue('campaign-1')
    updateCampaignMock.mockResolvedValue(undefined)
    getCampaignByIdMock.mockResolvedValue(null)
    observeCampaignInvitesMock.mockImplementation((_: string, onChange: (value: unknown[]) => void) => {
      onChange([])
      return vi.fn()
    })
    searchNicknamesMock.mockResolvedValue([])
    inviteManyByNicknamesMock.mockResolvedValue(undefined)
    removeMemberMock.mockResolvedValue(undefined)
    uploadCampaignImageMock.mockResolvedValue('https://cdn/campaign.png')
  })

  it('creates a new campaign and saves base data', async () => {
    const user = userEvent.setup()
    createObjectURLMock.mockReturnValueOnce('blob:first-preview').mockReturnValueOnce('blob:second-preview')

    render(
      <MemoryRouter initialEntries={['/campaigns/new']}>
        <Routes>
          <Route path='/campaigns/new' element={<CampaignEditorPage />} />
          <Route path='/campaigns/:campaignId/edit' element={<CampaignEditorPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Nome da campanha'), 'Mesa Alpha')
    await user.type(screen.getByLabelText('Descricao'), 'Descricao alpha')
    await user.type(screen.getByLabelText('Senha (opcional)'), 'secreta')
    const fileInput = screen.getByLabelText('Imagem da campanha (opcional)')
    fireEvent.change(fileInput, { target: { files: [] } })
    const file = new File(['image-content'], 'cover.png', { type: 'image/png' })
    const replacementFile = new File(['image-content-2'], 'cover-2.png', { type: 'image/png' })
    await user.upload(fileInput, file)
    await user.upload(fileInput, replacementFile)
    expect(screen.getByRole('img', { name: 'Mesa Alpha' })).toBeInTheDocument()
    expect(screen.queryByText('Convites por nickname')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Convidar jogador por nickname')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Criar campanha' }))

    await waitFor(() => {
      expect(createCampaignMock).toHaveBeenCalledWith('owner-1', {
        name: 'Mesa Alpha',
        description: 'Descricao alpha',
        imageUrl: null,
        password: 'secreta',
      })
    })

    expect(uploadCampaignImageMock).toHaveBeenCalledWith('campaign-1', replacementFile)
    expect(updateCampaignMock).toHaveBeenCalled()
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:first-preview')
  })

  it('edits campaign, invites by nickname and removes member', async () => {
    const user = userEvent.setup()
    getCampaignByIdMock.mockResolvedValue({
      id: 'campaign-1',
      ownerUid: 'owner-1',
      name: 'Mesa Beta',
      description: 'Descricao beta',
      imageUrl: 'https://cdn/mesa-beta.png',
      password: null,
      createdAt: 1,
    })
    observeCampaignInvitesMock.mockImplementation((_: string, onChange: (value: unknown[]) => void) => {
      onChange([
        {
          id: 'user-2',
          campaignId: 'campaign-1',
          campaignName: 'Mesa Beta',
          ownerUid: 'owner-1',
          targetUid: 'user-2',
          targetNickname: 'Jogador2',
          targetNicknameKey: 'jogador2',
          status: 'accepted',
        },
        {
          id: 'user-3',
          campaignId: 'campaign-1',
          campaignName: 'Mesa Beta',
          ownerUid: 'owner-1',
          targetUid: 'user-3',
          targetNickname: 'Ana',
          targetNicknameKey: 'ana',
          status: 'pending',
        },
      ])
      return vi.fn()
    })
    searchNicknamesMock.mockResolvedValue(['Jogador2'])

    render(
      <MemoryRouter initialEntries={['/campaigns/campaign-1/edit']}>
        <Routes>
          <Route path='/campaigns/new' element={<CampaignEditorPage />} />
          <Route path='/campaigns/:campaignId/edit' element={<CampaignEditorPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Mesa Beta')).toBeInTheDocument()
    })
    expect(screen.getByRole('img', { name: 'Mesa Beta' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Convidar jogador por nickname'), 'Jo')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Jogador2' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Jogador2' }))
    await user.click(screen.getByRole('button', { name: 'Remover nickname selecionado' }))
    await user.click(screen.getByRole('button', { name: 'Convidar' }))
    expect(inviteManyByNicknamesMock).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Convidar jogador por nickname'), 'Jo')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Jogador2' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Jogador2' }))
    await user.click(screen.getByRole('button', { name: 'Convidar' }))

    expect(inviteManyByNicknamesMock).toHaveBeenCalledWith({
      ownerUid: 'owner-1',
      campaignId: 'campaign-1',
      campaignName: 'Mesa Beta',
      nicknames: ['Jogador2'],
    })

    const removeButtons = screen.getAllByRole('button', { name: 'Excluir usuario da campanha' })
    await user.click(removeButtons[1])

    expect(removeMemberMock).toHaveBeenCalledWith('campaign-1', 'user-2')
  })

  it('does not save campaign when user is missing', async () => {
    useAppStore.setState({ user: null })

    render(
      <MemoryRouter initialEntries={['/campaigns/new']}>
        <Routes>
          <Route path='/campaigns/new' element={<CampaignEditorPage />} />
        </Routes>
      </MemoryRouter>,
    )

    const form = screen.getByRole('button', { name: 'Criar campanha' }).closest('form')
    if (form) {
      fireEvent.submit(form)
    }

    await waitFor(() => {
      expect(createCampaignMock).not.toHaveBeenCalled()
    })
  })

  it('stops save flow when campaign id is not returned', async () => {
    const user = userEvent.setup()
    createCampaignMock.mockResolvedValue('')

    render(
      <MemoryRouter initialEntries={['/campaigns/new']}>
        <Routes>
          <Route path='/campaigns/new' element={<CampaignEditorPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Nome da campanha'), 'Mesa sem id')
    await user.click(screen.getByRole('button', { name: 'Criar campanha' }))

    await waitFor(() => {
      expect(createCampaignMock).toHaveBeenCalled()
    })

    expect(updateCampaignMock).not.toHaveBeenCalled()
    expect(uploadCampaignImageMock).not.toHaveBeenCalled()
  })

  it('handles edit mode without loaded campaign, validates empty name and avoids duplicate nickname', async () => {
    const user = userEvent.setup()
    getCampaignByIdMock.mockResolvedValue(null)
    searchNicknamesMock.mockResolvedValue(['Jogador2'])

    render(
      <MemoryRouter initialEntries={['/campaigns/campaign-1/edit']}>
        <Routes>
          <Route path='/campaigns/:campaignId/edit' element={<CampaignEditorPage />} />
        </Routes>
      </MemoryRouter>,
    )

    const nameInput = screen.getByLabelText('Nome da campanha')
    await user.type(nameInput, 'Mesa Edicao')
    await user.clear(nameInput)
    await user.click(screen.getByRole('button', { name: 'Salvar campanha' }))
    expect(updateCampaignMock).not.toHaveBeenCalled()

    await user.type(nameInput, 'Mesa Edicao')
    await user.click(screen.getByRole('button', { name: 'Salvar campanha' }))
    await waitFor(() => {
      expect(updateCampaignMock).toHaveBeenCalledWith('campaign-1', {
        name: 'Mesa Edicao',
        description: '',
        imageUrl: null,
        password: null,
      })
    })
    expect(uploadCampaignImageMock).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Convidar jogador por nickname'), 'J')
    expect(searchNicknamesMock).not.toHaveBeenCalledWith('J')

    await user.type(screen.getByLabelText('Convidar jogador por nickname'), 'og')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Jogador2' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Jogador2' }))

    await user.type(screen.getByLabelText('Convidar jogador por nickname'), 'Jog')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Jogador2' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Jogador2' }))
    await user.click(screen.getByRole('button', { name: 'Convidar' }))

    expect(inviteManyByNicknamesMock).toHaveBeenCalledWith({
      ownerUid: 'owner-1',
      campaignId: 'campaign-1',
      campaignName: 'Mesa Edicao',
      nicknames: ['Jogador2'],
    })
  })

  it('cancels nickname suggestion state update on unmount', async () => {
    const user = userEvent.setup()
    let resolveSuggestions: ((value: string[]) => void) | undefined
    searchNicknamesMock.mockImplementation(
      () =>
        new Promise<string[]>((resolve) => {
          resolveSuggestions = resolve
        }),
    )

    const { unmount } = render(
      <MemoryRouter initialEntries={['/campaigns/campaign-1/edit']}>
        <Routes>
          <Route path='/campaigns/:campaignId/edit' element={<CampaignEditorPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Convidar jogador por nickname'), 'Jo')
    unmount()
    if (resolveSuggestions) {
      resolveSuggestions(['Jogador2'])
    }
    await Promise.resolve()

    expect(searchNicknamesMock).toHaveBeenCalledWith('Jo')
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'

const getMock = vi.fn()
const onValueMock = vi.fn()
const pushMock = vi.fn()
const refMock = vi.fn()
const queryMock = vi.fn()
const orderByKeyMock = vi.fn()
const startAtMock = vi.fn()
const endAtMock = vi.fn()
const limitToFirstMock = vi.fn()
const updateMock = vi.fn()

vi.mock('firebase/database', () => ({
  get: getMock,
  onValue: onValueMock,
  push: pushMock,
  ref: refMock,
  query: queryMock,
  orderByKey: orderByKeyMock,
  startAt: startAtMock,
  endAt: endAtMock,
  limitToFirst: limitToFirstMock,
  update: updateMock,
}))

vi.mock('../client.ts', () => ({
  firebaseServices: {
    database: { id: 'database' },
  },
}))

describe('campaignService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    refMock.mockImplementation((_: unknown, path?: string) => path ?? 'root-ref')
    queryMock.mockReturnValue('nickname-query')
    pushMock.mockReturnValue({ key: 'campaign-1' })
    getMock.mockResolvedValue({ exists: () => false, val: () => null })
    updateMock.mockResolvedValue(undefined)
    onValueMock.mockImplementation((_ref: unknown, callback: (snapshot: { val: () => unknown }) => void) => {
      callback({ val: () => null })
      return vi.fn()
    })
  })

  it('creates campaign and owner membership', async () => {
    const { campaignService } = await import('../campaignService.ts')

    const campaignId = await campaignService.createCampaign('owner-1', {
      name: 'Mesa 1',
      description: 'Desc',
      imageUrl: null,
      password: null,
    })

    expect(campaignId).toBe('campaign-1')
    expect(updateMock).toHaveBeenCalled()
  })

  it('throws when campaign id generation fails', async () => {
    pushMock.mockReturnValue({ key: null })
    const { campaignService } = await import('../campaignService.ts')

    await expect(
      campaignService.createCampaign('owner-1', {
        name: 'Mesa 1',
        description: 'Desc',
        imageUrl: null,
        password: null,
      }),
    ).rejects.toThrow('campaign-id-not-generated')
  })

  it('updates and loads campaign by id', async () => {
    getMock.mockResolvedValueOnce({
      exists: () => true,
      val: () => ({ ownerUid: 'owner-1', name: 'Mesa', description: '', imageUrl: null, password: null, createdAt: 1 }),
    })

    const { campaignService } = await import('../campaignService.ts')

    await campaignService.updateCampaign('campaign-1', {
      name: 'Mesa editada',
      description: 'desc',
      imageUrl: null,
      password: null,
    })

    const campaign = await campaignService.getCampaignById('campaign-1')

    expect(updateMock).toHaveBeenCalled()
    expect(campaign?.id).toBe('campaign-1')
  })

  it('returns null campaign when not found', async () => {
    const { campaignService } = await import('../campaignService.ts')

    const campaign = await campaignService.getCampaignById('campaign-missing')

    expect(campaign).toBeNull()
  })

  it('observes owner campaigns', async () => {
    onValueMock.mockImplementationOnce((_ref: unknown, callback: (snapshot: { val: () => unknown }) => void) => {
      callback({
        val: () => ({
          'campaign-1': { ownerUid: 'owner-1', name: 'Mesa A', description: '', imageUrl: null, password: null, createdAt: 2 },
          'campaign-2': { ownerUid: 'owner-2', name: 'Mesa B', description: '', imageUrl: null, password: null, createdAt: 1 },
        }),
      })
      return vi.fn()
    })

    const { campaignService } = await import('../campaignService.ts')
    const onChange = vi.fn()

    campaignService.observeUserCampaigns('owner-1', onChange)

    expect(onChange).toHaveBeenCalledWith([
      {
        id: 'campaign-1',
        ownerUid: 'owner-1',
        name: 'Mesa A',
        description: '',
        imageUrl: null,
        password: null,
        createdAt: 2,
      },
    ])
  })

  it('observes owner campaigns as empty when snapshot is invalid', async () => {
    onValueMock.mockImplementationOnce((_ref: unknown, callback: (snapshot: { val: () => unknown }) => void) => {
      callback({ val: () => null })
      return vi.fn()
    })

    const { campaignService } = await import('../campaignService.ts')
    const onChange = vi.fn()

    campaignService.observeUserCampaigns('owner-1', onChange)

    expect(onChange).toHaveBeenCalledWith([])
  })

  it('searches nickname suggestions', async () => {
    getMock
      .mockResolvedValueOnce({
        exists: () => true,
        val: () => ({ jogador1: 'uid-1' }),
      })
      .mockResolvedValueOnce({
        exists: () => true,
        val: () => ({ nickname: 'Jogador1' }),
      })

    const { campaignService } = await import('../campaignService.ts')

    const suggestions = await campaignService.searchNicknames('Jog')

    expect(orderByKeyMock).toHaveBeenCalled()
    expect(startAtMock).toHaveBeenCalledWith('jog')
    expect(endAtMock).toHaveBeenCalledWith('jog\uf8ff')
    expect(limitToFirstMock).toHaveBeenCalledWith(10)
    expect(suggestions).toEqual(['Jogador1'])
  })

  it('returns empty nickname suggestions when query snapshot is invalid', async () => {
    getMock.mockResolvedValueOnce({ exists: () => true, val: () => null })

    const { campaignService } = await import('../campaignService.ts')
    const suggestions = await campaignService.searchNicknames('Jog')

    expect(suggestions).toEqual([])
  })

  it('ignores nickname suggestions with missing user profile', async () => {
    getMock
      .mockResolvedValueOnce({ exists: () => true, val: () => ({ jogador1: 'uid-1' }) })
      .mockResolvedValueOnce({ exists: () => false, val: () => null })

    const { campaignService } = await import('../campaignService.ts')
    const suggestions = await campaignService.searchNicknames('Jog')

    expect(suggestions).toEqual([])
  })

  it('returns empty search suggestions for blank key', async () => {
    const { campaignService } = await import('../campaignService.ts')

    const suggestions = await campaignService.searchNicknames('  ')

    expect(suggestions).toEqual([])
  })

  it('invites by nickname and updates related paths', async () => {
    getMock
      .mockResolvedValueOnce({ exists: () => true, val: () => 'target-uid' })
      .mockResolvedValueOnce({ exists: () => true, val: () => ({ nickname: 'Jogador X' }) })

    const { campaignService } = await import('../campaignService.ts')

    await campaignService.inviteByNickname({
      ownerUid: 'owner-1',
      campaignId: 'campaign-1',
      campaignName: 'Mesa',
      targetNickname: 'Jogador X',
    })

    expect(updateMock).toHaveBeenCalled()
  })

  it('throws when nickname profile is missing', async () => {
    getMock
      .mockResolvedValueOnce({ exists: () => true, val: () => 'target-uid' })
      .mockResolvedValueOnce({ exists: () => false, val: () => null })

    const { campaignService } = await import('../campaignService.ts')

    await expect(
      campaignService.inviteByNickname({
        ownerUid: 'owner-1',
        campaignId: 'campaign-1',
        campaignName: 'Mesa',
        targetNickname: 'Jogador X',
      }),
    ).rejects.toThrow('profile-not-found')
  })

  it('throws when nickname is not found', async () => {
    getMock.mockResolvedValueOnce({ exists: () => false, val: () => null })
    const { campaignService } = await import('../campaignService.ts')

    await expect(
      campaignService.inviteByNickname({
        ownerUid: 'owner-1',
        campaignId: 'campaign-1',
        campaignName: 'Mesa',
        targetNickname: 'Desconhecido',
      }),
    ).rejects.toThrow('nickname-not-found')
  })

  it('invites many nicknames sequentially', async () => {
    getMock
      .mockResolvedValueOnce({ exists: () => true, val: () => 'uid-a' })
      .mockResolvedValueOnce({ exists: () => true, val: () => ({ nickname: 'NickA' }) })
      .mockResolvedValueOnce({ exists: () => true, val: () => 'uid-b' })
      .mockResolvedValueOnce({ exists: () => true, val: () => ({ nickname: 'NickB' }) })

    const { campaignService } = await import('../campaignService.ts')

    await campaignService.inviteManyByNicknames({
      ownerUid: 'owner-1',
      campaignId: 'campaign-1',
      campaignName: 'Mesa',
      nicknames: ['NickA', 'NickB'],
    })

    expect(updateMock).toHaveBeenCalledTimes(2)
  })

  it('observes invites by campaign and by user', async () => {
    onValueMock
      .mockImplementationOnce((_ref: unknown, callback: (snapshot: { val: () => unknown }) => void) => {
        callback({
          val: () => ({
            'uid-1': {
              campaignId: 'campaign-1',
              campaignName: 'Mesa',
              ownerUid: 'owner-1',
              targetUid: 'uid-1',
              targetNickname: 'Nick1',
              targetNicknameKey: 'nick1',
              status: 'pending',
            },
          }),
        })
        return vi.fn()
      })
      .mockImplementationOnce((_ref: unknown, callback: (snapshot: { val: () => unknown }) => void) => {
        callback({ val: () => null })
        return vi.fn()
      })

    const { campaignService } = await import('../campaignService.ts')
    const campaignChange = vi.fn()
    const userChange = vi.fn()

    campaignService.observeCampaignInvites('campaign-1', campaignChange)
    campaignService.observeInvites('uid-1', userChange)

    expect(campaignChange).toHaveBeenCalledWith([
      {
        id: 'uid-1',
        campaignId: 'campaign-1',
        campaignName: 'Mesa',
        ownerUid: 'owner-1',
        targetUid: 'uid-1',
        targetNickname: 'Nick1',
        targetNicknameKey: 'nick1',
        status: 'pending',
      },
    ])
    expect(userChange).toHaveBeenCalledWith([])
  })

  it('accepts, declines and removes member', async () => {
    const { campaignService } = await import('../campaignService.ts')
    const invite = {
      id: 'campaign-1',
      campaignId: 'campaign-1',
      campaignName: 'Mesa',
      ownerUid: 'owner-1',
      targetUid: 'uid-1',
      targetNickname: 'Nick1',
      targetNicknameKey: 'nick1',
      status: 'pending' as const,
    }

    await campaignService.acceptInvite('uid-1', invite)
    await campaignService.declineInvite('uid-1', invite)
    await campaignService.removeMember('campaign-1', 'uid-1')

    expect(updateMock).toHaveBeenCalledTimes(3)
  })
})

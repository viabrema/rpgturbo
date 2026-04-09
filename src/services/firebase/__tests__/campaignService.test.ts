import { beforeEach, describe, expect, it, vi } from 'vitest'

const getMock = vi.fn()
const pushMock = vi.fn()
const refMock = vi.fn()
const setMock = vi.fn()
const updateMock = vi.fn()
const onValueMock = vi.fn()

vi.mock('firebase/database', () => ({
  get: getMock,
  push: pushMock,
  ref: refMock,
  set: setMock,
  update: updateMock,
  onValue: onValueMock,
}))

vi.mock('../client.ts', () => ({
  firebaseServices: {
    database: { id: 'database' },
  },
}))

describe('campaignService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    refMock.mockImplementation((_: unknown, path?: string) => path ?? 'root')
    pushMock.mockReturnValue('invite-ref')
    setMock.mockResolvedValue(undefined)
    updateMock.mockResolvedValue(undefined)
  })

  it('invites player by nickname', async () => {
    getMock.mockResolvedValue({ exists: () => true, val: () => 'target-uid' })
    const { campaignService } = await import('../campaignService.ts')

    await campaignService.inviteByNickname({
      ownerUid: 'owner-1',
      campaignId: 'campaign-1',
      campaignName: 'Mesa',
      targetNickname: 'Jogador X',
    })

    expect(setMock).toHaveBeenCalledWith('invite-ref', {
      campaignId: 'campaign-1',
      campaignName: 'Mesa',
      ownerUid: 'owner-1',
      targetUid: 'target-uid',
      targetNicknameKey: 'jogador_x',
      status: 'pending',
    })
  })

  it('throws when nickname is missing', async () => {
    getMock.mockResolvedValue({ exists: () => false })
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

  it('observes user invites list', async () => {
    const unsubscribe = vi.fn()
    onValueMock.mockImplementation((_ref: unknown, callback: (snapshot: { val: () => unknown }) => void) => {
      callback({
        val: () => ({
          'invite-1': {
            campaignId: 'campaign-1',
            campaignName: 'Mesa',
            ownerUid: 'owner-1',
            targetUid: 'target-1',
            targetNicknameKey: 'target',
            status: 'pending',
          },
        }),
      })
      return unsubscribe
    })

    const { campaignService } = await import('../campaignService.ts')
    const onChange = vi.fn()

    const receivedUnsubscribe = campaignService.observeInvites('target-1', onChange)

    expect(onChange).toHaveBeenCalledWith([
      {
        id: 'invite-1',
        campaignId: 'campaign-1',
        campaignName: 'Mesa',
        ownerUid: 'owner-1',
        targetUid: 'target-1',
        targetNicknameKey: 'target',
        status: 'pending',
      },
    ])
    expect(receivedUnsubscribe).toBe(unsubscribe)
  })

  it('maps empty invite payload to empty array', async () => {
    onValueMock.mockImplementation((_ref: unknown, callback: (snapshot: { val: () => unknown }) => void) => {
      callback({
        val: () => null,
      })
      return vi.fn()
    })

    const { campaignService } = await import('../campaignService.ts')
    const onChange = vi.fn()

    campaignService.observeInvites('target-1', onChange)

    expect(onChange).toHaveBeenCalledWith([])
  })

  it('accepts invite and grants player access', async () => {
    const { campaignService } = await import('../campaignService.ts')

    await campaignService.acceptInvite('target-1', {
      id: 'invite-1',
      campaignId: 'campaign-1',
      campaignName: 'Mesa',
      ownerUid: 'owner-1',
      targetUid: 'target-1',
      targetNicknameKey: 'target',
      status: 'pending',
    })

    expect(updateMock).toHaveBeenCalled()
  })

  it('declines invite', async () => {
    const { campaignService } = await import('../campaignService.ts')

    await campaignService.declineInvite('target-1', {
      id: 'invite-1',
      campaignId: 'campaign-1',
      campaignName: 'Mesa',
      ownerUid: 'owner-1',
      targetUid: 'target-1',
      targetNicknameKey: 'target',
      status: 'pending',
    })

    expect(updateMock).toHaveBeenCalled()
  })
})

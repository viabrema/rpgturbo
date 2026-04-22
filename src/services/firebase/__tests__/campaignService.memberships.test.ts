import { beforeEach, describe, expect, it, vi } from 'vitest'

const getMock = vi.fn()
const onValueMock = vi.fn()
const refMock = vi.fn()

vi.mock('firebase/database', () => ({
  endAt: vi.fn(),
  get: getMock,
  limitToFirst: vi.fn(),
  onValue: onValueMock,
  orderByKey: vi.fn(),
  push: vi.fn(),
  query: vi.fn(),
  ref: refMock,
  startAt: vi.fn(),
  update: vi.fn(),
}))

vi.mock('../client.ts', () => ({
  firebaseServices: {
    database: { id: 'database' },
  },
}))

describe('campaignService memberships', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    refMock.mockImplementation((_: unknown, path?: string) => path ?? 'root-ref')
    getMock.mockResolvedValue({ exists: () => false, val: () => null })
  })

  it('observes owner campaigns', async () => {
    onValueMock.mockImplementationOnce((_ref: unknown, callback: (snapshot: { val: () => unknown }) => void) => {
      callback({
        val: () => ({
          'campaign-1': { status: 'accepted', role: 'owner' },
          'campaign-2': { status: 'declined', role: 'player' },
        }),
      })
      return vi.fn()
    })
    getMock.mockImplementation((path: string) => {
      if (path === 'campaigns/campaign-1') {
        return Promise.resolve({
          exists: () => true,
          val: () => ({ ownerUid: 'owner-1', name: 'Mesa A', description: '', imageUrl: null, password: null, createdAt: 2 }),
        })
      }

      return Promise.resolve({ exists: () => false, val: () => null })
    })

    const { campaignService } = await import('../campaignService.ts')
    const onChange = vi.fn()

    campaignService.observeUserCampaigns('owner-1', onChange)

    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

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

  it('observes owner campaigns as empty when campaigns snapshot is invalid', async () => {
    onValueMock.mockImplementationOnce((_ref: unknown, callback: (snapshot: { val: () => unknown }) => void) => {
      callback({ val: () => null })
      return vi.fn()
    })

    const { campaignService } = await import('../campaignService.ts')
    const onChange = vi.fn()

    campaignService.observeUserCampaigns('owner-1', onChange)

    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    expect(onChange).toHaveBeenCalledWith([])
  })

  it('observes campaigns where user is accepted member', async () => {
    onValueMock.mockImplementationOnce((_ref: unknown, callback: (snapshot: { val: () => unknown }) => void) => {
      callback({
        val: () => ({
          'campaign-1': { status: 'declined', role: 'player' },
          'campaign-2': { status: 'accepted', role: 'player' },
        }),
      })
      return vi.fn()
    })
    getMock.mockImplementation((path: string) => {
      if (path === 'campaigns/campaign-2') {
        return Promise.resolve({
          exists: () => true,
          val: () => ({ ownerUid: 'owner-2', name: 'Mesa B', description: '', imageUrl: null, password: null, createdAt: 1 }),
        })
      }

      return Promise.resolve({ exists: () => false, val: () => null })
    })

    const { campaignService } = await import('../campaignService.ts')
    const onChange = vi.fn()

    campaignService.observeUserCampaigns('user-1', onChange)

    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    expect(onChange).toHaveBeenLastCalledWith([
      {
        id: 'campaign-2',
        ownerUid: 'owner-2',
        name: 'Mesa B',
        description: '',
        imageUrl: null,
        password: null,
        createdAt: 1,
      },
    ])
  })

  it('unsubscribes campaigns and members observers', async () => {
    const membershipsUnsubscribe = vi.fn()

    onValueMock.mockImplementationOnce((_ref: unknown, callback: (snapshot: { val: () => unknown }) => void) => {
      callback({ val: () => null })
      return membershipsUnsubscribe
    })

    const { campaignService } = await import('../campaignService.ts')
    const unsubscribe = campaignService.observeUserCampaigns('user-1', vi.fn())
    unsubscribe()

    expect(membershipsUnsubscribe).toHaveBeenCalled()
  })
})

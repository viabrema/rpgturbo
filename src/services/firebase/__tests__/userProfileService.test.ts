import { beforeEach, describe, expect, it, vi } from 'vitest'

const runTransactionMock = vi.fn()
const refMock = vi.fn()
const setMock = vi.fn()
const getMock = vi.fn()

const signUpWithEmailPasswordMock = vi.fn()
const signInWithGoogleMock = vi.fn()

vi.mock('firebase/database', () => ({
  runTransaction: runTransactionMock,
  ref: refMock,
  set: setMock,
  get: getMock,
}))

vi.mock('../authService.ts', () => ({
  authService: {
    signUpWithEmailPassword: signUpWithEmailPasswordMock,
    signInWithGoogle: signInWithGoogleMock,
  },
}))

vi.mock('../client.ts', () => ({
  firebaseServices: {
    database: { id: 'database' },
  },
}))

describe('userProfileService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    refMock.mockImplementation((_: unknown, path: string) => path)
    setMock.mockResolvedValue(undefined)
  })

  it('normalizes nickname', async () => {
    const { userProfileService } = await import('../userProfileService.ts')

    expect(userProfileService.normalizeNickname('  Meu Nick  Name ')).toBe('meu_nick_name')
  })

  it('registers with email and password when nickname is available', async () => {
    signUpWithEmailPasswordMock.mockResolvedValue({
      user: { uid: 'uid-1', email: 'mestre@mesa.com' },
    })
    runTransactionMock.mockImplementation(
      async (_path: string, updateFn: (value: string | null) => string | undefined) => {
        expect(updateFn(null)).toBe('uid-1')
        return { committed: true }
      },
    )

    const { userProfileService } = await import('../userProfileService.ts')

    const profile = await userProfileService.registerWithEmailPassword({
      email: 'mestre@mesa.com',
      password: '123456',
      nickname: 'Mestre Turbo',
    })

    expect(profile.nicknameKey).toBe('mestre_turbo')
    expect(setMock).toHaveBeenCalled()
  })

  it('throws when nickname is already in use during register', async () => {
    signUpWithEmailPasswordMock.mockResolvedValue({
      user: { uid: 'uid-2', email: 'mestre@mesa.com' },
    })
    runTransactionMock.mockImplementation(
      async (_path: string, updateFn: (value: string | null) => string | undefined) => {
        expect(updateFn('other-uid')).toBeUndefined()
        return { committed: false }
      },
    )

    const { userProfileService } = await import('../userProfileService.ts')

    await expect(
      userProfileService.registerWithEmailPassword({
        email: 'mestre@mesa.com',
        password: '123456',
        nickname: 'Mestre Turbo',
      }),
    ).rejects.toThrow('nickname-already-in-use')
  })

  it('registers with google and stores profile', async () => {
    signInWithGoogleMock.mockResolvedValue({
      user: { uid: 'uid-google', email: 'google@mesa.com' },
    })
    runTransactionMock.mockImplementation(
      async (_path: string, updateFn: (value: string | null) => string | undefined) => {
        expect(updateFn('uid-google')).toBe('uid-google')
        return { committed: true }
      },
    )

    const { userProfileService } = await import('../userProfileService.ts')

    const profile = await userProfileService.registerWithGoogle('Google Mestre')

    expect(profile.nicknameKey).toBe('google_mestre')
    expect(setMock).toHaveBeenCalled()
  })

  it('returns null when profile does not exist', async () => {
    getMock.mockResolvedValue({ exists: () => false })
    const { userProfileService } = await import('../userProfileService.ts')

    const profile = await userProfileService.getProfileByUid('none')

    expect(profile).toBeNull()
  })

  it('returns profile when it exists', async () => {
    getMock.mockResolvedValue({
      exists: () => true,
      val: () => ({ uid: 'uid-1', email: 'u@test.com', nickname: 'Ari', nicknameKey: 'ari' }),
    })
    const { userProfileService } = await import('../userProfileService.ts')

    const profile = await userProfileService.getProfileByUid('uid-1')

    expect(profile?.nickname).toBe('Ari')
  })
})

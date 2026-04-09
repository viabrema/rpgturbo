import { beforeEach, describe, expect, it, vi } from 'vitest'

const firebaseServicesMock = {
  auth: { id: 'auth' },
  database: { id: 'database' },
  storage: { id: 'storage' },
  googleProvider: { id: 'provider' },
}

const createUserWithEmailAndPasswordMock = vi.fn()
const signInWithEmailAndPasswordMock = vi.fn()
const signInWithPopupMock = vi.fn()
const signOutMock = vi.fn()
const onAuthStateChangedMock = vi.fn()

const refMock = vi.fn()
const childMock = vi.fn()
const getMock = vi.fn()
const setMock = vi.fn()

const uploadBytesMock = vi.fn()
const getDownloadURLMock = vi.fn()

vi.mock('../client.ts', () => ({
  firebaseServices: firebaseServicesMock,
}))

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: createUserWithEmailAndPasswordMock,
  signInWithEmailAndPassword: signInWithEmailAndPasswordMock,
  signInWithPopup: signInWithPopupMock,
  signOut: signOutMock,
  onAuthStateChanged: onAuthStateChangedMock,
}))

vi.mock('firebase/database', () => ({
  ref: refMock,
  child: childMock,
  get: getMock,
  set: setMock,
}))

vi.mock('firebase/storage', () => ({
  ref: refMock,
  uploadBytes: uploadBytesMock,
  getDownloadURL: getDownloadURLMock,
}))

describe('firebase services wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls auth provider methods', async () => {
    const unsubscribe = vi.fn()
    onAuthStateChangedMock.mockReturnValue(unsubscribe)

    const { authService } = await import('../authService.ts')
    const callback = vi.fn()

    authService.signUpWithEmailPassword('mail@test.com', 'secret')
    authService.signInWithEmailPassword('mail@test.com', 'secret')
    authService.signInWithGoogle()
    authService.signOut()
    const receivedUnsubscribe = authService.observeAuthState(callback)

    expect(createUserWithEmailAndPasswordMock).toHaveBeenCalledWith(
      firebaseServicesMock.auth,
      'mail@test.com',
      'secret',
    )
    expect(signInWithEmailAndPasswordMock).toHaveBeenCalledWith(
      firebaseServicesMock.auth,
      'mail@test.com',
      'secret',
    )
    expect(signInWithPopupMock).toHaveBeenCalledWith(
      firebaseServicesMock.auth,
      firebaseServicesMock.googleProvider,
    )
    expect(signOutMock).toHaveBeenCalledWith(firebaseServicesMock.auth)
    expect(onAuthStateChangedMock).toHaveBeenCalledWith(firebaseServicesMock.auth, callback)
    expect(receivedUnsubscribe).toBe(unsubscribe)
  })

  it('reads and writes player profiles in realtime database', async () => {
    const snapshotWithData = {
      exists: () => true,
      val: () => ({ displayName: 'Ari', level: 5 }),
    }
    const snapshotWithoutData = {
      exists: () => false,
      val: () => null,
    }

    refMock.mockReturnValue('root-ref')
    childMock.mockReturnValue('player-ref')
    getMock.mockResolvedValueOnce(snapshotWithData).mockResolvedValueOnce(snapshotWithoutData)

    const { databaseService } = await import('../databaseService.ts')

    const existingProfile = await databaseService.getPlayerProfile('user-1')
    const missingProfile = await databaseService.getPlayerProfile('user-2')

    await databaseService.savePlayerProfile('user-1', {
      displayName: 'Ari',
      level: 5,
    })

    expect(existingProfile).toEqual({ displayName: 'Ari', level: 5 })
    expect(missingProfile).toBeNull()
    expect(setMock).toHaveBeenCalled()
  })

  it('uploads avatar to firebase storage', async () => {
    refMock.mockReturnValue('avatar-ref')
    getDownloadURLMock.mockResolvedValue('https://cdn/avatar.png')

    const { storageService } = await import('../storageService.ts')
    const file = new Blob(['avatar-content'], { type: 'text/plain' })

    const avatarUrl = await storageService.uploadAvatar('user-1', file)

    expect(uploadBytesMock).toHaveBeenCalledWith('avatar-ref', file)
    expect(avatarUrl).toBe('https://cdn/avatar.png')
  })
})

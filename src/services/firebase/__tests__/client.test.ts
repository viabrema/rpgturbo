import { beforeEach, describe, expect, it, vi } from 'vitest'

const getAppsMock = vi.fn()
const getAppMock = vi.fn()
const initializeAppMock = vi.fn()
const getAuthMock = vi.fn()
const getDatabaseMock = vi.fn()
const getStorageMock = vi.fn()
const googleProviderMock = vi.fn()
const getFirebaseConfigMock = vi.fn(() => ({ projectId: 'project-id' }))

vi.mock('firebase/app', () => ({
  getApps: getAppsMock,
  getApp: getAppMock,
  initializeApp: initializeAppMock,
}))

vi.mock('firebase/auth', () => ({
  getAuth: getAuthMock,
  GoogleAuthProvider: googleProviderMock,
}))

vi.mock('firebase/database', () => ({
  getDatabase: getDatabaseMock,
}))

vi.mock('firebase/storage', () => ({
  getStorage: getStorageMock,
}))

vi.mock('../config.ts', () => ({
  getFirebaseConfig: getFirebaseConfigMock,
}))

describe('createFirebaseServices', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('initializes firebase app when there is no existing app', async () => {
    const app = { id: 'new-app' }
    const auth = { id: 'auth' }
    const db = { id: 'db' }
    const storage = { id: 'storage' }
    const provider = { id: 'provider' }

    getAppsMock.mockReturnValue([])
    initializeAppMock.mockReturnValue(app)
    getAuthMock.mockReturnValue(auth)
    getDatabaseMock.mockReturnValue(db)
    getStorageMock.mockReturnValue(storage)
    googleProviderMock.mockImplementation(function MockGoogleProvider() {
      return provider
    })

    const module = await import('../client.ts')
    const services = module.createFirebaseServices()

    expect(getFirebaseConfigMock).toHaveBeenCalled()
    expect(initializeAppMock).toHaveBeenCalledWith({ projectId: 'project-id' })
    expect(services).toEqual({
      app,
      auth,
      database: db,
      storage,
      googleProvider: provider,
    })
  })

  it('reuses existing firebase app when available', async () => {
    const app = { id: 'existing-app' }
    const auth = { id: 'auth' }
    const db = { id: 'db' }
    const storage = { id: 'storage' }
    const provider = { id: 'provider' }

    getAppsMock.mockReturnValue([app])
    getAppMock.mockReturnValue(app)
    getAuthMock.mockReturnValue(auth)
    getDatabaseMock.mockReturnValue(db)
    getStorageMock.mockReturnValue(storage)
    googleProviderMock.mockImplementation(function MockGoogleProvider() {
      return provider
    })

    const module = await import('../client.ts')
    const services = module.createFirebaseServices()

    expect(getAppMock).toHaveBeenCalled()
    expect(initializeAppMock).not.toHaveBeenCalled()
    expect(services.app).toBe(app)
  })
})

import { describe, expect, it } from 'vitest'
import { getFirebaseConfig } from '../config.ts'

describe('getFirebaseConfig', () => {
  it('maps values from environment variables', () => {
    const config = getFirebaseConfig({
      VITE_FIREBASE_API_KEY: 'api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'auth-domain',
      VITE_FIREBASE_DATABASE_URL: 'db-url',
      VITE_FIREBASE_PROJECT_ID: 'project-id',
      VITE_FIREBASE_STORAGE_BUCKET: 'bucket',
      VITE_FIREBASE_MESSAGING_SENDER_ID: 'sender-id',
      VITE_FIREBASE_APP_ID: 'app-id',
    })

    expect(config).toEqual({
      apiKey: 'api-key',
      authDomain: 'auth-domain',
      databaseURL: 'db-url',
      projectId: 'project-id',
      storageBucket: 'bucket',
      messagingSenderId: 'sender-id',
      appId: 'app-id',
    })
  })

  it('uses empty strings when values are missing', () => {
    const config = getFirebaseConfig({})

    expect(config.apiKey).toBe('')
    expect(config.projectId).toBe('')
  })
})

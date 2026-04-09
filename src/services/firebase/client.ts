import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'
import { getFirebaseConfig } from './config.ts'

export type FirebaseServices = ReturnType<typeof createFirebaseServices>

export const createFirebaseServices = () => {
  const app = getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig())

  return {
    app,
    auth: getAuth(app),
    database: getDatabase(app),
    storage: getStorage(app),
    googleProvider: new GoogleAuthProvider(),
  }
}

export const firebaseServices = createFirebaseServices()

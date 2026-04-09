import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { firebaseServices } from './client.ts'

const { auth, googleProvider } = firebaseServices

export const authService = {
  signInWithEmailPassword: (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password),
  signInWithGoogle: () => signInWithPopup(auth, googleProvider),
  signOut: () => signOut(auth),
  observeAuthState: (onChange: (user: User | null) => void) =>
    onAuthStateChanged(auth, onChange),
}

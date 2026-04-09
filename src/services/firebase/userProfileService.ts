import { get, ref, runTransaction, set } from 'firebase/database'
import { authService } from './authService.ts'
import { firebaseServices } from './client.ts'

export type UserProfile = {
  uid: string
  email: string | null
  nickname: string
  nicknameKey: string
}

type RegistrationInput = {
  email: string
  password: string
  nickname: string
}

const userProfilesPath = 'userProfiles'
const nicknamesPath = 'nicknames'

export const normalizeNickname = (nickname: string): string =>
  nickname.trim().toLowerCase().replace(/\s+/g, '_')

const reserveNickname = async (uid: string, nickname: string): Promise<string> => {
  const nicknameKey = normalizeNickname(nickname)
  const nicknameRef = ref(firebaseServices.database, `${nicknamesPath}/${nicknameKey}`)

  const transactionResult = await runTransaction(nicknameRef, (currentUid) => {
    if (currentUid === null || currentUid === uid) {
      return uid
    }

    return
  })

  if (!transactionResult.committed) {
    throw new Error('nickname-already-in-use')
  }

  return nicknameKey
}

const saveUserProfile = (profile: UserProfile) =>
  set(ref(firebaseServices.database, `${userProfilesPath}/${profile.uid}`), profile)

export const userProfileService = {
  normalizeNickname,
  async registerWithEmailPassword({ email, password, nickname }: RegistrationInput): Promise<UserProfile> {
    const credential = await authService.signUpWithEmailPassword(email, password)
    const uid = credential.user.uid
    const nicknameKey = await reserveNickname(uid, nickname)

    const profile: UserProfile = {
      uid,
      email: credential.user.email,
      nickname,
      nicknameKey,
    }

    await saveUserProfile(profile)
    return profile
  },
  async registerWithGoogle(nickname: string): Promise<UserProfile> {
    const credential = await authService.signInWithGoogle()
    const uid = credential.user.uid
    const nicknameKey = await reserveNickname(uid, nickname)

    const profile: UserProfile = {
      uid,
      email: credential.user.email,
      nickname,
      nicknameKey,
    }

    await saveUserProfile(profile)
    return profile
  },
  async getProfileByUid(uid: string): Promise<UserProfile | null> {
    const snapshot = await get(ref(firebaseServices.database, `${userProfilesPath}/${uid}`))

    if (!snapshot.exists()) {
      return null
    }

    return snapshot.val() as UserProfile
  },
}

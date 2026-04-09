import { child, get, ref, set } from 'firebase/database'
import { firebaseServices } from './client.ts'

export type PlayerProfile = {
  displayName: string
  level: number
}

const rootRef = ref(firebaseServices.database)
const playersPath = 'players'

export const databaseService = {
  async getPlayerProfile(userId: string): Promise<PlayerProfile | null> {
    const profileSnapshot = await get(child(rootRef, `${playersPath}/${userId}`))

    if (!profileSnapshot.exists()) {
      return null
    }

    return profileSnapshot.val() as PlayerProfile
  },
  savePlayerProfile(userId: string, profile: PlayerProfile) {
    return set(ref(firebaseServices.database, `${playersPath}/${userId}`), profile)
  },
}

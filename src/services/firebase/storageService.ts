import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { firebaseServices } from './client.ts'

const avatarRoot = 'avatars'

export const storageService = {
  async uploadAvatar(userId: string, file: Blob): Promise<string> {
    const avatarRef = ref(firebaseServices.storage, `${avatarRoot}/${userId}`)
    await uploadBytes(avatarRef, file)
    return getDownloadURL(avatarRef)
  },
}

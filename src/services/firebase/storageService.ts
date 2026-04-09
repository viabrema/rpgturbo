import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { firebaseServices } from './client.ts'

const avatarRoot = 'avatars'
const campaignRoot = 'campaigns'

export const storageService = {
  async uploadAvatar(userId: string, file: Blob): Promise<string> {
    const avatarRef = ref(firebaseServices.storage, `${avatarRoot}/${userId}`)
    await uploadBytes(avatarRef, file)
    return getDownloadURL(avatarRef)
  },
  async uploadCampaignImage(campaignId: string, file: Blob): Promise<string> {
    const campaignImageRef = ref(firebaseServices.storage, `${campaignRoot}/${campaignId}/cover`)
    await uploadBytes(campaignImageRef, file)
    return getDownloadURL(campaignImageRef)
  },
}

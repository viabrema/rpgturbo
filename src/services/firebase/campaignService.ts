import { get, onValue, push, ref, set, update } from 'firebase/database'
import { firebaseServices } from './client.ts'
import { normalizeNickname } from './userProfileService.ts'

export type CampaignInvite = {
  id: string
  campaignId: string
  campaignName: string
  ownerUid: string
  targetUid: string
  targetNicknameKey: string
  status: 'pending' | 'accepted' | 'declined'
}

type InviteParams = {
  ownerUid: string
  campaignId: string
  campaignName: string
  targetNickname: string
}

const campaignInvitesPath = 'campaignInvites'
const campaignMembersPath = 'campaignMembers'
const nicknamesPath = 'nicknames'

const mapInvites = (value: unknown): CampaignInvite[] => {
  if (!value || typeof value !== 'object') {
    return []
  }

  return Object.entries(value as Record<string, Omit<CampaignInvite, 'id'>>).map(([id, invite]) => ({
    id,
    ...invite,
  }))
}

export const campaignService = {
  async inviteByNickname({ ownerUid, campaignId, campaignName, targetNickname }: InviteParams): Promise<void> {
    const targetNicknameKey = normalizeNickname(targetNickname)
    const nicknameSnapshot = await get(ref(firebaseServices.database, `${nicknamesPath}/${targetNicknameKey}`))

    if (!nicknameSnapshot.exists()) {
      throw new Error('nickname-not-found')
    }

    const targetUid = String(nicknameSnapshot.val())
    const inviteRef = push(ref(firebaseServices.database, `${campaignInvitesPath}/${targetUid}`))

    await set(inviteRef, {
      campaignId,
      campaignName,
      ownerUid,
      targetUid,
      targetNicknameKey,
      status: 'pending',
    })
  },
  observeInvites(userUid: string, onChange: (invites: CampaignInvite[]) => void): () => void {
    const userInvitesRef = ref(firebaseServices.database, `${campaignInvitesPath}/${userUid}`)

    return onValue(userInvitesRef, (snapshot) => {
      const invites = mapInvites(snapshot.val())
      onChange(invites)
    })
  },
  async acceptInvite(userUid: string, invite: CampaignInvite): Promise<void> {
    await update(ref(firebaseServices.database), {
      [`${campaignInvitesPath}/${userUid}/${invite.id}/status`]: 'accepted',
      [`${campaignMembersPath}/${invite.campaignId}/${userUid}`]: {
        role: 'player',
        status: 'accepted',
      },
    })
  },
  async declineInvite(userUid: string, invite: CampaignInvite): Promise<void> {
    await update(ref(firebaseServices.database), {
      [`${campaignInvitesPath}/${userUid}/${invite.id}/status`]: 'declined',
    })
  },
}

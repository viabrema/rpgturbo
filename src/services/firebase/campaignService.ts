import {
  endAt,
  get,
  limitToFirst,
  onValue,
  orderByKey,
  push,
  query,
  ref,
  update,
  startAt,
  type Unsubscribe,
} from 'firebase/database'
import { firebaseServices } from './client.ts'
import { normalizeNickname } from './userProfileService.ts'

export type Campaign = {
  id: string
  ownerUid: string
  name: string
  description: string
  imageUrl: string | null
  password: string | null
  createdAt: number
}

export type CampaignInvite = {
  id: string
  campaignId: string
  campaignName: string
  ownerUid: string
  targetUid: string
  targetNickname: string
  targetNicknameKey: string
  status: 'pending' | 'accepted' | 'declined' | 'revoked'
}

type CampaignPayload = {
  name: string
  description: string
  imageUrl: string | null
  password: string | null
}

type InviteByNicknameParams = {
  ownerUid: string
  campaignId: string
  campaignName: string
  targetNickname: string
}

type InviteManyParams = {
  ownerUid: string
  campaignId: string
  campaignName: string
  nicknames: string[]
}

const campaignsPath = 'campaigns'
const campaignInvitesPath = 'campaignInvites'
const campaignInvitesByCampaignPath = 'campaignInvitesByCampaign'
const campaignMembersPath = 'campaignMembers'
const nicknamesPath = 'nicknames'
const userProfilesPath = 'userProfiles'

const mapCampaigns = (value: unknown): Campaign[] => {
  if (!value || typeof value !== 'object') {
    return []
  }

  return Object.entries(value as Record<string, Omit<Campaign, 'id'>>).map(([id, campaign]) => ({
    id,
    ...campaign,
  }))
}

const mapInvites = (value: unknown): CampaignInvite[] => {
  if (!value || typeof value !== 'object') {
    return []
  }

  return Object.entries(value as Record<string, Omit<CampaignInvite, 'id'>>).map(([id, invite]) => ({
    id,
    ...invite,
  }))
}

const createInvitePayload = (input: {
  campaignId: string
  campaignName: string
  ownerUid: string
  targetUid: string
  targetNickname: string
  targetNicknameKey: string
}): Omit<CampaignInvite, 'id'> => ({
  campaignId: input.campaignId,
  campaignName: input.campaignName,
  ownerUid: input.ownerUid,
  targetUid: input.targetUid,
  targetNickname: input.targetNickname,
  targetNicknameKey: input.targetNicknameKey,
  status: 'pending',
})

const readUserByNickname = async (
  nickname: string,
): Promise<{ uid: string; nickname: string; nicknameKey: string }> => {
  const nicknameKey = normalizeNickname(nickname)
  const nicknameSnapshot = await get(ref(firebaseServices.database, `${nicknamesPath}/${nicknameKey}`))

  if (!nicknameSnapshot.exists()) {
    throw new Error('nickname-not-found')
  }

  const uid = String(nicknameSnapshot.val())
  const profileSnapshot = await get(ref(firebaseServices.database, `${userProfilesPath}/${uid}`))

  if (!profileSnapshot.exists()) {
    throw new Error('profile-not-found')
  }

  const profile = profileSnapshot.val() as { nickname: string }

  return {
    uid,
    nickname: profile.nickname,
    nicknameKey,
  }
}

const mapNicknameSuggestions = async (value: unknown): Promise<string[]> => {
  if (!value || typeof value !== 'object') {
    return []
  }

  const entries = Object.entries(value as Record<string, string>)
  const nicknames = await Promise.all(
    entries.map(async ([, uid]) => {
      const profileSnapshot = await get(ref(firebaseServices.database, `${userProfilesPath}/${uid}`))

      if (!profileSnapshot.exists()) {
        return null
      }

      const profile = profileSnapshot.val() as { nickname: string }
      return profile.nickname
    }),
  )

  return nicknames.filter((nickname): nickname is string => Boolean(nickname))
}

export const campaignService = {
  async createCampaign(ownerUid: string, payload: CampaignPayload): Promise<string> {
    const campaignRef = push(ref(firebaseServices.database, campaignsPath))
    const campaignId = campaignRef.key

    if (!campaignId) {
      throw new Error('campaign-id-not-generated')
    }

    await update(ref(firebaseServices.database), {
      [`${campaignsPath}/${campaignId}`]: {
        ownerUid,
        name: payload.name,
        description: payload.description,
        imageUrl: payload.imageUrl,
        password: payload.password,
        createdAt: Date.now(),
      },
      [`${campaignMembersPath}/${campaignId}/${ownerUid}`]: {
        role: 'owner',
        status: 'accepted',
      },
    })

    return campaignId
  },
  async updateCampaign(campaignId: string, payload: CampaignPayload): Promise<void> {
    await update(ref(firebaseServices.database, `${campaignsPath}/${campaignId}`), {
      name: payload.name,
      description: payload.description,
      imageUrl: payload.imageUrl,
      password: payload.password,
    })
  },
  async getCampaignById(campaignId: string): Promise<Campaign | null> {
    const snapshot = await get(ref(firebaseServices.database, `${campaignsPath}/${campaignId}`))

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: campaignId,
      ...(snapshot.val() as Omit<Campaign, 'id'>),
    }
  },
  observeUserCampaigns(userUid: string, onChange: (campaigns: Campaign[]) => void): Unsubscribe {
    return onValue(ref(firebaseServices.database, campaignsPath), (snapshot) => {
      const campaigns = mapCampaigns(snapshot.val()).filter((campaign) => campaign.ownerUid === userUid)

      onChange(campaigns)
    })
  },
  async searchNicknames(search: string): Promise<string[]> {
    const searchKey = normalizeNickname(search)

    if (!searchKey) {
      return []
    }

    const nicknameQuery = query(
      ref(firebaseServices.database, nicknamesPath),
      orderByKey(),
      startAt(searchKey),
      endAt(`${searchKey}\uf8ff`),
      limitToFirst(10),
    )

    const snapshot = await get(nicknameQuery)
    return mapNicknameSuggestions(snapshot.val())
  },
  async inviteByNickname({ ownerUid, campaignId, campaignName, targetNickname }: InviteByNicknameParams): Promise<void> {
    const targetUser = await readUserByNickname(targetNickname)
    const invitePayload = createInvitePayload({
      campaignId,
      campaignName,
      ownerUid,
      targetUid: targetUser.uid,
      targetNickname: targetUser.nickname,
      targetNicknameKey: targetUser.nicknameKey,
    })

    await update(ref(firebaseServices.database), {
      [`${campaignInvitesPath}/${targetUser.uid}/${campaignId}`]: invitePayload,
      [`${campaignInvitesByCampaignPath}/${campaignId}/${targetUser.uid}`]: invitePayload,
      [`${campaignMembersPath}/${campaignId}/${targetUser.uid}`]: {
        role: 'player',
        status: 'pending',
      },
    })
  },
  async inviteManyByNicknames(params: InviteManyParams): Promise<void> {
    for (const nickname of params.nicknames) {
      await this.inviteByNickname({
        ownerUid: params.ownerUid,
        campaignId: params.campaignId,
        campaignName: params.campaignName,
        targetNickname: nickname,
      })
    }
  },
  observeCampaignInvites(campaignId: string, onChange: (invites: CampaignInvite[]) => void): Unsubscribe {
    return onValue(ref(firebaseServices.database, `${campaignInvitesByCampaignPath}/${campaignId}`), (snapshot) => {
      onChange(mapInvites(snapshot.val()))
    })
  },
  observeInvites(userUid: string, onChange: (invites: CampaignInvite[]) => void): Unsubscribe {
    const userInvitesRef = ref(firebaseServices.database, `${campaignInvitesPath}/${userUid}`)

    return onValue(userInvitesRef, (snapshot) => {
      const invites = mapInvites(snapshot.val())
      onChange(invites)
    })
  },
  async acceptInvite(userUid: string, invite: CampaignInvite): Promise<void> {
    await update(ref(firebaseServices.database), {
      [`${campaignInvitesPath}/${userUid}/${invite.id}/status`]: 'accepted',
      [`${campaignInvitesByCampaignPath}/${invite.campaignId}/${userUid}/status`]: 'accepted',
      [`${campaignMembersPath}/${invite.campaignId}/${userUid}/status`]: 'accepted',
      [`${campaignMembersPath}/${invite.campaignId}/${userUid}/role`]: 'player',
    })
  },
  async declineInvite(userUid: string, invite: CampaignInvite): Promise<void> {
    await update(ref(firebaseServices.database), {
      [`${campaignInvitesPath}/${userUid}/${invite.id}/status`]: 'declined',
      [`${campaignInvitesByCampaignPath}/${invite.campaignId}/${userUid}/status`]: 'declined',
      [`${campaignMembersPath}/${invite.campaignId}/${userUid}/status`]: 'declined',
    })
  },
  async removeMember(campaignId: string, targetUid: string): Promise<void> {
    await update(ref(firebaseServices.database), {
      [`${campaignMembersPath}/${campaignId}/${targetUid}`]: null,
      [`${campaignInvitesPath}/${targetUid}/${campaignId}/status`]: 'revoked',
      [`${campaignInvitesByCampaignPath}/${campaignId}/${targetUid}/status`]: 'revoked',
    })
  },
}

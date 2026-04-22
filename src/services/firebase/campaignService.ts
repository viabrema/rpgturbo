import { endAt, get, limitToFirst, onValue, orderByKey, push, query, ref, update, startAt, type Unsubscribe } from 'firebase/database'
import { firebaseServices } from './client.ts'
import type { Campaign, CampaignInvite } from './campaignTypes'
import { normalizeNickname } from './userProfileService.ts'
import {
  campaignsPath,
  campaignInvitesByCampaignPath,
  campaignInvitesPath,
  campaignMembersPath,
  campaignMembershipsByUserPath,
  createInvitePayload,
  fetchCampaignById,
  hasPendingOrAcceptedStatus,
  mapInvites,
  mapMembershipsByCampaign,
  mapNicknameSuggestions,
  nicknamesPath,
  readUserByNickname,
} from './campaignService.helpers.ts'
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

export type { Campaign, CampaignInvite } from './campaignTypes'
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
      [`${campaignMembershipsByUserPath}/${ownerUid}/${campaignId}`]: {
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
    return fetchCampaignById(campaignId)
  },
  observeUserCampaigns(userUid: string, onChange: (campaigns: Campaign[]) => void): Unsubscribe {
    let isActive = true
    let requestId = 0
    const membershipsRef = ref(firebaseServices.database, `${campaignMembershipsByUserPath}/${userUid}`)
    const membershipsUnsubscribe = onValue(membershipsRef, (snapshot) => {
      const memberships = mapMembershipsByCampaign(snapshot.val())
      const acceptedCampaignIds = Object.entries(memberships)
        .filter(([, membership]) => membership?.status === 'accepted')
        .map(([campaignId]) => campaignId)

      const currentRequest = requestId + 1
      requestId = currentRequest

      void (async () => {
        const campaigns = await Promise.all(acceptedCampaignIds.map((campaignId) => fetchCampaignById(campaignId)))
        if (!isActive || requestId !== currentRequest) {
          return
        }

        onChange(campaigns.filter((campaign): campaign is Campaign => Boolean(campaign)))
      })()
    })

    return () => {
      isActive = false
      membershipsUnsubscribe()
    }
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
    const existingInviteSnapshot = await get(ref(firebaseServices.database, `${campaignInvitesByCampaignPath}/${campaignId}/${targetUser.uid}`))

    if (hasPendingOrAcceptedStatus(existingInviteSnapshot.val())) {
      throw new Error('invite-already-exists')
    }

    const existingMemberSnapshot = await get(ref(firebaseServices.database, `${campaignMembersPath}/${campaignId}/${targetUser.uid}`))

    if (hasPendingOrAcceptedStatus(existingMemberSnapshot.val())) {
      throw new Error('member-already-in-campaign')
    }

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
      [`${campaignMembershipsByUserPath}/${targetUser.uid}/${campaignId}`]: {
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
      [`${campaignInvitesPath}/${userUid}/${invite.campaignId}/status`]: 'accepted',
      [`${campaignInvitesByCampaignPath}/${invite.campaignId}/${userUid}/status`]: 'accepted',
      [`${campaignMembersPath}/${invite.campaignId}/${userUid}/status`]: 'accepted',
      [`${campaignMembersPath}/${invite.campaignId}/${userUid}/role`]: 'player',
      [`${campaignMembershipsByUserPath}/${userUid}/${invite.campaignId}/status`]: 'accepted',
      [`${campaignMembershipsByUserPath}/${userUid}/${invite.campaignId}/role`]: 'player',
    })
  },
  async declineInvite(userUid: string, invite: CampaignInvite): Promise<void> {
    await update(ref(firebaseServices.database), {
      [`${campaignInvitesPath}/${userUid}/${invite.campaignId}/status`]: 'declined',
      [`${campaignInvitesByCampaignPath}/${invite.campaignId}/${userUid}/status`]: 'declined',
      [`${campaignMembersPath}/${invite.campaignId}/${userUid}/status`]: 'declined',
      [`${campaignMembershipsByUserPath}/${userUid}/${invite.campaignId}/status`]: 'declined',
      [`${campaignMembershipsByUserPath}/${userUid}/${invite.campaignId}/role`]: 'player',
    })
  },
  async removeMember(campaignId: string, targetUid: string): Promise<void> {
    await update(ref(firebaseServices.database), {
      [`${campaignMembersPath}/${campaignId}/${targetUid}`]: null,
      [`${campaignInvitesPath}/${targetUid}/${campaignId}`]: null,
      [`${campaignInvitesByCampaignPath}/${campaignId}/${targetUid}`]: null,
      [`${campaignMembershipsByUserPath}/${targetUid}/${campaignId}`]: null,
    })
  },
}

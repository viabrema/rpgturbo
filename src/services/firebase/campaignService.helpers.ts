import { get, ref } from 'firebase/database'
import { firebaseServices } from './client.ts'
import { normalizeNickname } from './userProfileService.ts'
import type { Campaign, CampaignInvite } from './campaignTypes'

export const campaignsPath = 'campaigns'
export const campaignInvitesPath = 'campaignInvites'
export const campaignInvitesByCampaignPath = 'campaignInvitesByCampaign'
export const campaignMembersPath = 'campaignMembers'
export const campaignMembershipsByUserPath = 'campaignMembershipsByUser'
export const nicknamesPath = 'nicknames'
export const userProfilesPath = 'userProfiles'
export const userProfilesPublicPath = 'userProfilesPublic'

export const mapInvites = (value: unknown): CampaignInvite[] => {
  if (!value || typeof value !== 'object') {
    return []
  }

  return Object.entries(value as Record<string, Omit<CampaignInvite, 'id'>>).map(([id, invite]) => ({
    id,
    ...invite,
  }))
}

export const mapMembershipsByCampaign = (value: unknown): Record<string, { status?: string; role?: string }> => {
  if (!value || typeof value !== 'object') {
    return {}
  }

  return value as Record<string, { status?: string; role?: string }>
}

export const fetchCampaignById = async (campaignId: string): Promise<Campaign | null> => {
  const snapshot = await get(ref(firebaseServices.database, `${campaignsPath}/${campaignId}`))

  if (!snapshot.exists()) {
    return null
  }

  return {
    id: campaignId,
    ...(snapshot.val() as Omit<Campaign, 'id'>),
  }
}

export const createInvitePayload = (input: {
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

export const readUserByNickname = async (
  nickname: string,
): Promise<{ uid: string; nickname: string; nicknameKey: string }> => {
  const nicknameKey = normalizeNickname(nickname)
  const nicknameSnapshot = await get(ref(firebaseServices.database, `${nicknamesPath}/${nicknameKey}`))

  if (!nicknameSnapshot.exists()) {
    throw new Error('nickname-not-found')
  }

  const uid = String(nicknameSnapshot.val())
  const profileSnapshot = await get(ref(firebaseServices.database, `${userProfilesPublicPath}/${uid}`))

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

export const hasPendingOrAcceptedStatus = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const status = (value as { status?: string }).status
  return status === 'pending' || status === 'accepted'
}

export const mapNicknameSuggestions = async (value: unknown): Promise<string[]> => {
  if (!value || typeof value !== 'object') {
    return []
  }

  const entries = Object.entries(value as Record<string, string>)
  const nicknames = await Promise.all(
    entries.map(async ([, uid]) => {
      const profileSnapshot = await get(ref(firebaseServices.database, `${userProfilesPublicPath}/${uid}`))

      if (!profileSnapshot.exists()) {
        return null
      }

      const profile = profileSnapshot.val() as { nickname: string }
      return profile.nickname
    }),
  )

  return nicknames.filter((nickname): nickname is string => Boolean(nickname))
}

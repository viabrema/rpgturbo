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

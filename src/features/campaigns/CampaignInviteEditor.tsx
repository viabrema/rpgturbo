import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { CampaignInvite } from '../../services/firebase/campaignService.ts'
import { icons } from '../../ui/icons.ts'

const CloseIcon = icons.close

type CampaignInviteEditorProps = {
  inviteQuery: string
  inviteSuggestions: string[]
  selectedNicknames: string[]
  inviteStatusList: CampaignInvite[]
  onInviteQueryChange: (value: string) => void
  onAddNickname: (nickname: string) => void
  onRemoveNickname: (nickname: string) => void
  onInvitePlayers: () => Promise<void>
  onRemoveMember: (invite: CampaignInvite) => Promise<void>
}

export function CampaignInviteEditor({
  inviteQuery,
  inviteSuggestions,
  selectedNicknames,
  inviteStatusList,
  onInviteQueryChange,
  onAddNickname,
  onRemoveNickname,
  onInvitePlayers,
  onRemoveMember,
}: CampaignInviteEditorProps) {
  const { t } = useTranslation()

  const sortedInviteStatusList = useMemo(
    () => [...inviteStatusList].sort((left, right) => left.targetNickname.localeCompare(right.targetNickname)),
    [inviteStatusList],
  )

  return (
    <div className='mt-8 rounded-2xl bg-white p-4'>
      <h2 className='font-display text-xl text-ink'>{t('campaigns.invitesEditorTitle')}</h2>

      <label className='mt-3 block'>
        <span className='mb-1 block text-xs font-bold uppercase tracking-wider text-ink/75'>
          {t('campaigns.form.inviteByNickname')}
        </span>
        <input
          value={inviteQuery}
          onChange={(event) => onInviteQueryChange(event.target.value)}
          className='w-full rounded-xl border border-ink/10 bg-white px-4 py-2 text-ink outline-none ring-brand/40 focus:ring'
        />
      </label>

      {inviteSuggestions.length > 0 ? (
        <ul className='mt-2 rounded-xl bg-canvas p-2'>
          {inviteSuggestions.map((nickname) => (
            <li key={nickname}>
              <button
                type='button'
                onClick={() => onAddNickname(nickname)}
                className='w-full rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-white'
              >
                {nickname}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className='mt-3 flex flex-wrap gap-2'>
        {selectedNicknames.map((nickname) => (
          <span key={nickname} className='inline-flex items-center gap-1 rounded-full bg-brand/15 px-3 py-1 text-sm text-ink'>
            {nickname}
            <button type='button' onClick={() => onRemoveNickname(nickname)} aria-label={t('campaigns.removeSelectedNickname')}>
              <CloseIcon />
            </button>
          </span>
        ))}
      </div>

      <button
        type='button'
        onClick={() => void onInvitePlayers()}
        className='mt-3 rounded-xl bg-brand px-4 py-2 text-sm font-bold text-surface'
      >
        {t('campaigns.sendInvites')}
      </button>

      <ul className='mt-4 space-y-2'>
        {sortedInviteStatusList.map((invite) => (
          <li key={`${invite.campaignId}-${invite.targetUid}`} className='flex items-center justify-between rounded-xl bg-canvas p-3'>
            <div>
              <p className='text-sm font-semibold text-ink'>{invite.targetNickname}</p>
              <p className='text-xs text-ink/70'>{t(`campaigns.status.${invite.status}`)}</p>
            </div>
            <button
              type='button'
              onClick={() => void onRemoveMember(invite)}
              className='rounded-lg bg-ink/10 p-2 text-ink transition hover:bg-ink/15'
              aria-label={t('campaigns.removeMember')}
            >
              <CloseIcon aria-hidden='true' />
            </button>
          </li>
        ))}
        {sortedInviteStatusList.length === 0 ? (
          <li className='text-sm text-ink/70'>{t('campaigns.noInviteStatus')}</li>
        ) : null}
      </ul>
    </div>
  )
}

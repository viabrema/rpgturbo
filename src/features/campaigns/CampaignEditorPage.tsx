import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { campaignService, type CampaignInvite } from '../../services/firebase/campaignService.ts'
import { storageService } from '../../services/firebase/storageService.ts'
import { useAppStore } from '../../store/appStore.ts'
import { CampaignImagePanel } from './CampaignImagePanel.tsx'
import { CampaignInviteEditor } from './CampaignInviteEditor.tsx'

type EditorForm = {
  name: string
  description: string
  password: string
  imageUrl: string | null
}

const emptyForm: EditorForm = {
  name: '',
  description: '',
  password: '',
  imageUrl: null,
}

export function CampaignEditorPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { campaignId } = useParams<{ campaignId: string }>()
  const user = useAppStore((state) => state.user)
  const isEditing = Boolean(campaignId)

  const [form, setForm] = useState<EditorForm>(emptyForm)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [inviteQuery, setInviteQuery] = useState('')
  const [inviteSuggestions, setInviteSuggestions] = useState<string[]>([])
  const [selectedNicknames, setSelectedNicknames] = useState<string[]>([])
  const [inviteStatusList, setInviteStatusList] = useState<CampaignInvite[]>([])

  useEffect(() => {
    if (!campaignId) {
      setForm(emptyForm)
      setSelectedFile(null)
      setPreviewUrl(null)
      return
    }

    void (async () => {
      const campaign = await campaignService.getCampaignById(campaignId)

      if (!campaign) {
        return
      }

      setForm({
        name: campaign.name,
        description: campaign.description,
        password: campaign.password ?? '',
        imageUrl: campaign.imageUrl,
      })
    })()
  }, [campaignId])

  useEffect(
    () => () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    },
    [previewUrl],
  )

  useEffect(() => {
    if (!campaignId) {
      setInviteStatusList([])
      return
    }

    return campaignService.observeCampaignInvites(campaignId, (invites) => {
      setInviteStatusList(invites)
    })
  }, [campaignId])

  useEffect(() => {
    if (!inviteQuery || inviteQuery.trim().length < 2) {
      setInviteSuggestions([])
      return
    }

    let isCurrent = true

    void (async () => {
      const suggestions = await campaignService.searchNicknames(inviteQuery)
      if (isCurrent) {
        setInviteSuggestions(suggestions)
      }
    })()

    return () => {
      isCurrent = false
    }
  }, [inviteQuery])

  const updateField = (field: keyof EditorForm, value: string | null) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null
    setSelectedFile(nextFile)

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null)
  }

  const handleSaveCampaign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!user || !form.name.trim()) {
      return
    }

    setIsSaving(true)

    try {
      let currentCampaignId = campaignId
      let imageUrl = form.imageUrl

      if (!currentCampaignId) {
        currentCampaignId = await campaignService.createCampaign(user.uid, {
          name: form.name.trim(),
          description: form.description.trim(),
          imageUrl,
          password: form.password.trim() || null,
        })
      }

      if (!currentCampaignId) {
        return
      }

      if (selectedFile) {
        imageUrl = await storageService.uploadCampaignImage(currentCampaignId, selectedFile)
      }

      await campaignService.updateCampaign(currentCampaignId, {
        name: form.name.trim(),
        description: form.description.trim(),
        imageUrl,
        password: form.password.trim() || null,
      })

      setForm((current) => ({
        ...current,
        imageUrl,
      }))
      setSelectedFile(null)

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(null)

      navigate(`/campaigns/${currentCampaignId}/edit`, { replace: true })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddNickname = (nickname: string) => {
    if (!selectedNicknames.includes(nickname)) {
      setSelectedNicknames((current) => [...current, nickname])
    }

    setInviteQuery('')
    setInviteSuggestions([])
  }

  const handleRemoveNickname = (nickname: string) => {
    setSelectedNicknames((current) => current.filter((item) => item !== nickname))
  }

  const handleInvitePlayers = async () => {
    if (!user || !campaignId || selectedNicknames.length === 0) {
      return
    }

    await campaignService.inviteManyByNicknames({
      ownerUid: user.uid,
      campaignId,
      campaignName: form.name.trim(),
      nicknames: selectedNicknames,
    })

    setSelectedNicknames([])
    setInviteSuggestions([])
    setInviteQuery('')
  }

  const handleRemoveMember = async (invite: CampaignInvite) => {
    await campaignService.removeMember(campaignId as string, invite.targetUid)
  }

  const imagePreviewSrc = previewUrl ?? form.imageUrl
  const imagePreviewAlt = form.name.trim() || t('campaigns.imagePreviewAlt')

  return (
    <section className='animate-rise rounded-3xl bg-surface/80 p-8 shadow-xl backdrop-blur md:p-10'>
      <div className='flex items-center justify-between gap-4'>
        <h1 className='font-display text-3xl text-ink md:text-4xl'>
          {isEditing ? t('campaigns.editTitle') : t('campaigns.createTitle')}
        </h1>
        <Link to='/campaigns' className='rounded-lg bg-ink/10 px-3 py-2 text-sm font-bold text-ink'>
          {t('campaigns.backToList')}
        </Link>
      </div>

      <form onSubmit={handleSaveCampaign} className='mt-6 space-y-4'>
        <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem] xl:grid-cols-[minmax(0,1fr)_17rem]'>
          <div className='space-y-4'>
            <label className='block'>
              <span className='mb-1 block text-xs font-bold uppercase tracking-wider text-ink/75'>
                {t('campaigns.form.name')}
              </span>
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className='w-full rounded-xl border border-ink/10 bg-white px-4 py-2 text-ink outline-none ring-brand/40 focus:ring'
                required
              />
            </label>

            <label className='block'>
              <span className='mb-1 block text-xs font-bold uppercase tracking-wider text-ink/75'>
                {t('campaigns.form.description')}
              </span>
              <textarea
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                className='w-full rounded-xl border border-ink/10 bg-white px-4 py-2 text-ink outline-none ring-brand/40 focus:ring'
                rows={4}
              />
            </label>

            <label className='block'>
              <span className='mb-1 block text-xs font-bold uppercase tracking-wider text-ink/75'>
                {t('campaigns.form.password')}
              </span>
              <input
                type='password'
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                className='w-full rounded-xl border border-ink/10 bg-white px-4 py-2 text-ink outline-none ring-brand/40 focus:ring'
              />
            </label>
          </div>

          <CampaignImagePanel
            imageLabel={t('campaigns.form.image')}
            imageHint={t('campaigns.form.imageHint')}
            placeholderText={t('campaigns.imagePlaceholder')}
            previewSrc={imagePreviewSrc}
            previewAlt={imagePreviewAlt}
            onSelectImage={handleImageSelect}
          />
        </div>

        <button
          type='submit'
          disabled={isSaving}
          className='rounded-xl bg-brand px-4 py-2 font-bold text-surface transition hover:brightness-110 disabled:opacity-70'
        >
          {isEditing ? t('campaigns.form.save') : t('campaigns.form.create')}
        </button>
      </form>

      {isEditing ? (
        <CampaignInviteEditor
          inviteQuery={inviteQuery}
          inviteSuggestions={inviteSuggestions}
          selectedNicknames={selectedNicknames}
          inviteStatusList={inviteStatusList}
          onInviteQueryChange={setInviteQuery}
          onAddNickname={handleAddNickname}
          onRemoveNickname={handleRemoveNickname}
          onInvitePlayers={handleInvitePlayers}
          onRemoveMember={handleRemoveMember}
        />
      ) : null}
    </section>
  )
}

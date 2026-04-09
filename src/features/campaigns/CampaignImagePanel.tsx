import { useId } from 'react'
import type { ChangeEvent } from 'react'

type CampaignImagePanelProps = {
  imageLabel: string
  imageHint: string
  placeholderText: string
  previewSrc: string | null
  previewAlt: string
  onSelectImage: (event: ChangeEvent<HTMLInputElement>) => void
}

export function CampaignImagePanel({
  imageLabel,
  imageHint,
  placeholderText,
  previewSrc,
  previewAlt,
  onSelectImage,
}: CampaignImagePanelProps) {
  const inputId = useId()

  return (
    <div className='rounded-xl border border-ink/20 bg-canvas p-3'>
      <label htmlFor={inputId} className='block cursor-pointer'>
        <div className='relative aspect-square w-full overflow-hidden rounded-lg border border-ink/20 bg-surface/80 transition hover:brightness-95'>
          {previewSrc ? (
            <img src={previewSrc} alt={previewAlt} className='h-full w-full object-cover' />
          ) : (
            <div className='flex h-full items-center justify-center p-4'>
              <p className='text-center font-display text-3xl leading-tight text-ink/75'>{placeholderText}</p>
            </div>
          )}
        </div>
      </label>
      <input
        id={inputId}
        type='file'
        accept='image/*'
        onChange={onSelectImage}
        className='sr-only'
        aria-label={imageLabel}
        data-testid='campaign-image-input'
      />

      <p className='mt-2 text-xs text-ink/70'>{imageHint}</p>
    </div>
  )
}

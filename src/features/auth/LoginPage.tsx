import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { authService } from '../../services/firebase/authService.ts'
import { userProfileService } from '../../services/firebase/userProfileService.ts'
import { icons } from '../../ui/icons.ts'

const EmailIcon = icons.email
const GoogleIcon = icons.google
type AuthMode = 'sign-in' | 'sign-up'

export function LoginPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleAuthWithEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      if (mode === 'sign-up') {
        await userProfileService.registerWithEmailPassword({ email, password, nickname })
      } else {
        await authService.signInWithEmailPassword(email, password)
      }
    } catch {
      setErrorMessage(mode === 'sign-up' ? t('auth.signUpError') : t('auth.invalidCredentials'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthWithGoogle = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      if (mode === 'sign-up') {
        await userProfileService.registerWithGoogle(nickname)
      } else {
        await authService.signInWithGoogle()
      }
    } catch {
      setErrorMessage(mode === 'sign-up' ? t('auth.signUpGoogleError') : t('auth.googleSignInError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className='animate-rise mx-auto w-full max-w-md rounded-3xl bg-surface/80 p-8 shadow-xl backdrop-blur'>
      <h1 className='font-display text-3xl text-ink'>{t('auth.title')}</h1>
      <p className='mt-2 text-sm text-ink/80'>{t('auth.subtitle')}</p>

      <div className='mt-6 inline-flex rounded-full bg-white p-1'>
        <button
          type='button'
          onClick={() => setMode('sign-in')}
          className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${
            mode === 'sign-in' ? 'bg-brand text-surface' : 'text-ink'
          }`}
        >
          {t('auth.tabSignIn')}
        </button>
        <button
          type='button'
          onClick={() => setMode('sign-up')}
          className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${
            mode === 'sign-up' ? 'bg-brand text-surface' : 'text-ink'
          }`}
        >
          {t('auth.tabSignUp')}
        </button>
      </div>

      <form className='mt-4 space-y-4' onSubmit={handleAuthWithEmail}>
        {mode === 'sign-up' ? (
          <label className='block'>
            <span className='mb-1 block text-xs font-bold uppercase tracking-wider text-ink/75'>
              {t('auth.nicknameLabel')}
            </span>
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className='w-full rounded-xl border border-ink/10 bg-white px-4 py-2 text-ink outline-none ring-brand/40 focus:ring'
              placeholder={t('auth.nicknamePlaceholder')}
              required
              minLength={3}
            />
          </label>
        ) : null}

        <label className='block'>
          <span className='mb-1 block text-xs font-bold uppercase tracking-wider text-ink/75'>
            {t('auth.emailLabel')}
          </span>
          <input
            value={email}
            type='email'
            onChange={(event) => setEmail(event.target.value)}
            className='w-full rounded-xl border border-ink/10 bg-white px-4 py-2 text-ink outline-none ring-brand/40 focus:ring'
            placeholder={t('auth.emailPlaceholder')}
            required
          />
        </label>

        <label className='block'>
          <span className='mb-1 block text-xs font-bold uppercase tracking-wider text-ink/75'>
            {t('auth.passwordLabel')}
          </span>
          <input
            value={password}
            type='password'
            onChange={(event) => setPassword(event.target.value)}
            className='w-full rounded-xl border border-ink/10 bg-white px-4 py-2 text-ink outline-none ring-brand/40 focus:ring'
            placeholder={t('auth.passwordPlaceholder')}
            required
          />
        </label>

        <button
          type='submit'
          disabled={isLoading}
          className='flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-bold text-surface transition hover:brightness-110 disabled:opacity-70'
        >
          <EmailIcon aria-hidden='true' />
          {mode === 'sign-up' ? t('auth.signUpWithEmail') : t('auth.signInWithEmail')}
        </button>
      </form>

      <button
        type='button'
        onClick={() => void handleAuthWithGoogle()}
        disabled={isLoading}
        className='mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-ink/15 bg-white px-4 py-3 font-bold text-ink transition hover:bg-ink/5 disabled:opacity-70'
      >
        <GoogleIcon aria-hidden='true' />
        {mode === 'sign-up' ? t('auth.signUpWithGoogle') : t('auth.signInWithGoogle')}
      </button>

      {errorMessage ? <p className='mt-4 text-sm font-semibold text-red-700'>{errorMessage}</p> : null}
    </section>
  )
}

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App.tsx'
import i18n from '../i18n.ts'
import { useAppStore } from '../store/appStore.ts'

const {
  observeAuthStateMock,
  signInWithEmailPasswordMock,
  signUpWithEmailPasswordMock,
  signInWithGoogleMock,
  signOutMock,
  registerWithEmailPasswordMock,
  registerWithGoogleMock,
  observeInvitesMock,
  acceptInviteMock,
  declineInviteMock,
} = vi.hoisted(() => ({
  observeAuthStateMock: vi.fn(),
  signInWithEmailPasswordMock: vi.fn(),
  signUpWithEmailPasswordMock: vi.fn(),
  signInWithGoogleMock: vi.fn(),
  signOutMock: vi.fn(),
  registerWithEmailPasswordMock: vi.fn(),
  registerWithGoogleMock: vi.fn(),
  observeInvitesMock: vi.fn(),
  acceptInviteMock: vi.fn(),
  declineInviteMock: vi.fn(),
}))

vi.mock('../services/firebase/authService.ts', () => ({
  authService: {
    observeAuthState: observeAuthStateMock,
    signInWithEmailPassword: signInWithEmailPasswordMock,
    signUpWithEmailPassword: signUpWithEmailPasswordMock,
    signInWithGoogle: signInWithGoogleMock,
    signOut: signOutMock,
  },
}))

vi.mock('../services/firebase/userProfileService.ts', () => ({
  userProfileService: {
    registerWithEmailPassword: registerWithEmailPasswordMock,
    registerWithGoogle: registerWithGoogleMock,
  },
}))

vi.mock('../services/firebase/campaignService.ts', () => ({
  campaignService: {
    observeInvites: observeInvitesMock,
    acceptInvite: acceptInviteMock,
    declineInvite: declineInviteMock,
  },
}))

describe('App', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt')
    useAppStore.setState({ locale: 'pt', user: null, isAuthResolved: false })
    observeAuthStateMock.mockImplementation(
      (callback: (user: { uid: string; email: string } | null) => void) => {
        callback(null)
        return vi.fn()
      },
    )
    signInWithEmailPasswordMock.mockResolvedValue(undefined)
    signUpWithEmailPasswordMock.mockResolvedValue(undefined)
    signInWithGoogleMock.mockResolvedValue(undefined)
    signOutMock.mockResolvedValue(undefined)
    registerWithEmailPasswordMock.mockResolvedValue(undefined)
    registerWithGoogleMock.mockResolvedValue(undefined)
    observeInvitesMock.mockImplementation((_: string, onChange: (value: unknown[]) => void) => {
      onChange([])
      return vi.fn()
    })
    acceptInviteMock.mockResolvedValue(undefined)
    declineInviteMock.mockResolvedValue(undefined)
  })

  it('renders login screen as initial route when user is unauthenticated', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Entrar na sua mesa',
      }),
    ).toBeInTheDocument()
  })

  it('signs in with email and password', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Email'), 'jogador@mesa.com')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.click(screen.getByRole('button', { name: 'Entrar com email' }))

    expect(signInWithEmailPasswordMock).toHaveBeenCalledWith('jogador@mesa.com', '123456')
  })

  it('signs in with google', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Entrar com Google' }))

    expect(signInWithGoogleMock).toHaveBeenCalled()
  })

  it('shows error when email sign in fails', async () => {
    const user = userEvent.setup()
    signInWithEmailPasswordMock.mockRejectedValueOnce(new Error('invalid'))

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Email'), 'jogador@mesa.com')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.click(screen.getByRole('button', { name: 'Entrar com email' }))

    expect(screen.getByText('Nao foi possivel entrar com email e senha.')).toBeInTheDocument()
  })

  it('shows error when google sign in fails', async () => {
    const user = userEvent.setup()
    signInWithGoogleMock.mockRejectedValueOnce(new Error('google-error'))

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Entrar com Google' }))

    expect(screen.getByText('Nao foi possivel entrar com Google.')).toBeInTheDocument()
  })

  it('registers with email and unique nickname', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))
    await user.type(screen.getByLabelText('Nickname'), 'MestreTurbo')
    await user.type(screen.getByLabelText('Email'), 'mestre@mesa.com')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.click(screen.getByRole('button', { name: 'Cadastrar com email' }))

    expect(registerWithEmailPasswordMock).toHaveBeenCalledWith({
      email: 'mestre@mesa.com',
      password: '123456',
      nickname: 'MestreTurbo',
    })
  })

  it('shows sign up error when nickname is not unique', async () => {
    const user = userEvent.setup()
    registerWithEmailPasswordMock.mockRejectedValueOnce(new Error('nickname-already-in-use'))

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))
    await user.type(screen.getByLabelText('Nickname'), 'Duplicado')
    await user.type(screen.getByLabelText('Email'), 'mestre@mesa.com')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.click(screen.getByRole('button', { name: 'Cadastrar com email' }))

    expect(screen.getByText('Nao foi possivel cadastrar. Verifique email, senha e nickname unico.')).toBeInTheDocument()
  })

  it('registers with google and nickname', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))
    await user.type(screen.getByLabelText('Nickname'), 'GoogleMestre')
    await user.click(screen.getByRole('button', { name: 'Cadastrar com Google' }))

    expect(registerWithGoogleMock).toHaveBeenCalledWith('GoogleMestre')
  })

  it('shows sign up google error and can switch tab back to sign in', async () => {
    const user = userEvent.setup()
    registerWithGoogleMock.mockRejectedValueOnce(new Error('nickname-conflict'))

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))
    await user.type(screen.getByLabelText('Nickname'), 'OutroNick')
    await user.click(screen.getByRole('button', { name: 'Cadastrar com Google' }))

    expect(screen.getByText('Nao foi possivel cadastrar com Google. Verifique nickname unico.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(screen.queryByLabelText('Nickname')).not.toBeInTheDocument()
  })

  it('shows campaigns as initial route when user is authenticated and allows sign out', async () => {
    const user = userEvent.setup()
    observeAuthStateMock.mockImplementation(
      (callback: (value: { uid: string; email: string } | null) => void) => {
        callback({ uid: '1', email: 'mestre@mesa.com' })
        return vi.fn()
      },
    )

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Minhas campanhas',
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Sair' }))

    expect(signOutMock).toHaveBeenCalled()
  })

  it('accepts and declines campaign invites from notifications popover', async () => {
    const user = userEvent.setup()
    observeAuthStateMock.mockImplementation(
      (callback: (value: { uid: string; email: string } | null) => void) => {
        callback({ uid: 'user-1', email: 'jogador@mesa.com' })
        return vi.fn()
      },
    )
    observeInvitesMock.mockImplementation((_: string, onChange: (value: unknown[]) => void) => {
      onChange([
        {
          id: 'invite-1',
          campaignId: 'campaign-1',
          campaignName: 'Mesa de Sexta',
          ownerUid: 'owner-1',
          targetUid: 'user-1',
          targetNicknameKey: 'jogador',
          status: 'pending',
        },
      ])

      return vi.fn()
    })

    render(
      <MemoryRouter initialEntries={['/campaigns']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Notificacoes' }))
    await user.click(screen.getByRole('button', { name: 'Aceitar' }))
    await user.click(screen.getByRole('button', { name: 'Recusar' }))

    expect(acceptInviteMock).toHaveBeenCalled()
    expect(declineInviteMock).toHaveBeenCalled()
  })

  it('updates store locale when switching language', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'EN' }))

    expect(useAppStore.getState().locale).toBe('en')
  })
})

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
  signInWithGoogleMock,
  signOutMock,
} = vi.hoisted(() => ({
  observeAuthStateMock: vi.fn(),
  signInWithEmailPasswordMock: vi.fn(),
  signInWithGoogleMock: vi.fn(),
  signOutMock: vi.fn(),
}))

vi.mock('../services/firebase/authService.ts', () => ({
  authService: {
    observeAuthState: observeAuthStateMock,
    signInWithEmailPassword: signInWithEmailPasswordMock,
    signInWithGoogle: signInWithGoogleMock,
    signOut: signOutMock,
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
    signInWithGoogleMock.mockResolvedValue(undefined)
    signOutMock.mockResolvedValue(undefined)
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

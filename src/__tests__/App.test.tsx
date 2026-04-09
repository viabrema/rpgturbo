import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App.tsx'
import i18n from '../i18n.ts'
import { useAppStore } from '../store/appStore.ts'
import { getNavClassName } from '../ui/navLinkClassName.ts'

describe('App', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt')
    useAppStore.setState({ locale: 'pt' })
  })

  it('renders the home screen in portuguese', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Frontend pronto para escalar com Firebase',
      }),
    ).toBeInTheDocument()
  })

  it('switches language to english and updates global store', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/about']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'EN' }))

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Starting architecture',
      }),
    ).toBeInTheDocument()

    expect(useAppStore.getState().locale).toBe('en')
  })

  it('switches language back to portuguese', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/about']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'EN' }))
    await user.click(screen.getByRole('button', { name: 'PT' }))

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Arquitetura de partida',
      }),
    ).toBeInTheDocument()
  })

  it('returns different nav classes for active and inactive links', () => {
    const activeClass = getNavClassName({ isActive: true })
    const inactiveClass = getNavClassName({ isActive: false })

    expect(activeClass).toContain('bg-brand')
    expect(inactiveClass).toContain('hover:bg-surface')
  })
})

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import i18n from '../../i18n.ts'
import { PageHeader } from '../PageHeader.tsx'

describe('PageHeader', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt')
  })

  it('renders breadcrumbs, back button and actions', () => {
    render(
      <MemoryRouter>
        <PageHeader
          title='Pagina interna'
          backTo='/campanhas'
          backLabel='Voltar'
          breadcrumbs={[
            { label: 'Minhas campanhas', to: '/campanhas' },
            { label: 'Detalhes' },
          ]}
          actions={<button type='button'>Acao</button>}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Pagina interna' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Minhas campanhas' })).toBeInTheDocument()
    expect(screen.getByText('Detalhes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Acao' })).toBeInTheDocument()
  })

  it('renders breadcrumbs without back button and actions', () => {
    render(
      <MemoryRouter>
        <PageHeader
          title='Outra pagina'
          backLabel='Voltar'
          breadcrumbs={[{ label: 'Unico' }]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Outra pagina' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Voltar' })).not.toBeInTheDocument()
    expect(screen.getByText('Unico')).toBeInTheDocument()
  })
})

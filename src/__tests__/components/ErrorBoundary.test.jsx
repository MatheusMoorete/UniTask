import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../../components/ErrorBoundary'

function ErrorComponent() {
  throw new Error('Erro de teste')
}

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error

  beforeEach(() => {
    console.error = vi.fn()
  })

  afterEach(() => {
    console.error = originalConsoleError
  })

  it('deve renderizar children quando não há erro', () => {
    render(
      <ErrorBoundary>
        <div>Conteúdo normal</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Conteúdo normal')).toBeInTheDocument()
  })

  it('deve mostrar mensagem de erro quando ocorre um erro', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Oops! Algo deu errado')).toBeInTheDocument()
    expect(screen.getByText('Tentar Novamente')).toBeInTheDocument()
  })

  it('deve mostrar botão de recarregar página', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )

    // Verifica se a mensagem de erro está presente
    expect(screen.getByText('Oops! Algo deu errado')).toBeInTheDocument()

    // Verifica se o botão de recarregar página está presente
    expect(screen.getByText('Recarregar Página')).toBeInTheDocument()
  })
}) 
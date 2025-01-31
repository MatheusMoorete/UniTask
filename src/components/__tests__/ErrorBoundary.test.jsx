import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from '../ErrorBoundary'

// Componente que lança erro para testar
const ThrowError = () => {
  throw new Error('Erro de teste')
  return null
}

// Mock do console.error para evitar logs durante os testes
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
})

describe('ErrorBoundary', () => {
  it('deve renderizar children quando não há erro', () => {
    render(
      <ErrorBoundary>
        <div>Conteúdo teste</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Conteúdo teste')).toBeInTheDocument()
  })

  it('deve mostrar mensagem de erro quando ocorre um erro', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Oops! Algo deu errado')).toBeInTheDocument()
    expect(screen.getByText(/Ocorreu um erro inesperado/)).toBeInTheDocument()
  })

  it('deve ter um botão para recarregar a página', () => {
    // Mock da função window.location.reload
    const reloadMock = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true
    })

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    const reloadButton = screen.getByText('Recarregar Página')
    fireEvent.click(reloadButton)
    
    expect(reloadMock).toHaveBeenCalled()
  })

  it('deve mostrar stack trace em ambiente de desenvolvimento', () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/Erro de teste/)).toBeInTheDocument()

    // Restaura o NODE_ENV
    process.env.NODE_ENV = originalNodeEnv
  })
}) 
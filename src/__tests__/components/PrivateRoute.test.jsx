import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PrivateRoute } from '../../components/PrivateRoute'
import { useAuth } from '../../contexts/AuthContext'

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

describe('PrivateRoute', () => {
  it('deve mostrar loading quando está carregando', () => {
    useAuth.mockReturnValue({ loading: true, user: null })

    render(
      <MemoryRouter>
        <PrivateRoute>
          <div>Conteúdo protegido</div>
        </PrivateRoute>
      </MemoryRouter>
    )

    const loadingElement = screen.getByTestId('loading-spinner')
    expect(loadingElement).toBeInTheDocument()
    expect(loadingElement).toHaveClass('animate-spin')
  })

  it('deve redirecionar para login quando não há usuário', () => {
    useAuth.mockReturnValue({ loading: false, user: null })

    const { container } = render(
      <MemoryRouter>
        <PrivateRoute>
          <div>Conteúdo protegido</div>
        </PrivateRoute>
      </MemoryRouter>
    )

    expect(container.innerHTML).not.toContain('Conteúdo protegido')
  })

  it('deve renderizar o conteúdo quando há usuário autenticado', () => {
    useAuth.mockReturnValue({ loading: false, user: { id: '1', name: 'Test User' } })

    render(
      <MemoryRouter>
        <PrivateRoute>
          <div>Conteúdo protegido</div>
        </PrivateRoute>
      </MemoryRouter>
    )

    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument()
  })
}) 
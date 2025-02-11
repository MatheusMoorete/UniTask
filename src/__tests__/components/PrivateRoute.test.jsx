import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PrivateRoute } from '../PrivateRoute'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

// Mock dos hooks
vi.mock('@/contexts/AuthContext')
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}))

// Mock do componente Loading
vi.mock('@/components/ui/loading', () => ({
  Loading: () => <div role="progressbar">Loading...</div>
}))

describe('PrivateRoute', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useNavigate.mockReturnValue(mockNavigate)
  })

  it('deve renderizar o Loading quando está carregando', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true
    })

    render(
      <PrivateRoute>
        <div>Conteúdo protegido</div>
      </PrivateRoute>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument()
  })

  it('deve redirecionar para login quando não há usuário autenticado', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false
    })

    render(
      <PrivateRoute>
        <div>Conteúdo protegido</div>
      </PrivateRoute>
    )

    expect(mockNavigate).toHaveBeenCalledWith('/login')
    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument()
  })

  it('deve renderizar o conteúdo quando há usuário autenticado', () => {
    useAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com' },
      loading: false
    })

    render(
      <PrivateRoute>
        <div>Conteúdo protegido</div>
      </PrivateRoute>
    )

    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
}) 
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LogoutButton from '../LogoutButton'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

// Mock dos hooks
vi.mock('@/contexts/AuthContext')
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}))

// Mock do console.error para testes de erro
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
  vi.clearAllMocks()
})

describe('LogoutButton', () => {
  const mockLogout = vi.fn()
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({ logout: mockLogout })
    useNavigate.mockReturnValue(mockNavigate)
  })

  it('deve renderizar o botão de logout', () => {
    render(<LogoutButton />)
    const button = screen.getByRole('button', { name: /sair/i })
    expect(button).toBeInTheDocument()
  })

  it('deve chamar logout e navegar para login ao clicar', async () => {
    mockLogout.mockResolvedValueOnce()
    
    render(<LogoutButton />)
    const button = screen.getByRole('button', { name: /sair/i })
    
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled()
    })
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('deve tratar erro durante o logout', async () => {
    const error = new Error('Erro ao fazer logout')
    mockLogout.mockRejectedValueOnce(error)
    
    render(<LogoutButton />)
    const button = screen.getByRole('button', { name: /sair/i })
    
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled()
    })
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Falha ao fazer logout:', error)
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
}) 
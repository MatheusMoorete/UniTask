import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NotificationButton } from '../NotificationButton'

describe('NotificationButton', () => {
  it('deve renderizar o botão de notificações', () => {
    render(<NotificationButton />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('deve mostrar o popover ao clicar no botão', () => {
    render(<NotificationButton />)
    
    // Verifica se o conteúdo não está visível inicialmente
    expect(screen.queryByText('Ferramenta em desenvolvimento')).not.toBeInTheDocument()
    
    // Clica no botão
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Verifica se o conteúdo está visível
    expect(screen.getByText('Ferramenta em desenvolvimento')).toBeInTheDocument()
    expect(screen.getByText(/Em breve você poderá receber notificações importantes aqui/)).toBeInTheDocument()
  })

  it('deve fechar o popover ao clicar novamente', () => {
    render(<NotificationButton />)
    
    // Abre o popover
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(screen.getByText('Ferramenta em desenvolvimento')).toBeInTheDocument()
    
    // Fecha o popover
    fireEvent.click(button)
    expect(screen.queryByText('Ferramenta em desenvolvimento')).not.toBeInTheDocument()
  })

  it('deve ter o texto correto no popover', () => {
    render(<NotificationButton />)
    
    // Abre o popover
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Verifica o conteúdo
    const title = screen.getByText('Ferramenta em desenvolvimento')
    const description = screen.getByText(/Em breve você poderá receber notificações importantes aqui/)
    
    expect(title).toBeInTheDocument()
    expect(description).toBeInTheDocument()
  })
}) 
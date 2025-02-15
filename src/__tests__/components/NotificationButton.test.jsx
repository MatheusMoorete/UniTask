import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { NotificationButton } from '../../components/NotificationButton'

vi.mock('../../components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

describe('NotificationButton', () => {
  const originalNotification = window.Notification

  beforeEach(() => {
    window.Notification = {
      permission: 'default',
      requestPermission: vi.fn(),
    }
  })

  afterEach(() => {
    window.Notification = originalNotification
  })

  it('deve renderizar o botão com ícone de notificação desativada inicialmente', () => {
    render(<NotificationButton />)
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Ativar notificações')
  })

  it('deve solicitar permissão quando clicado', async () => {
    window.Notification.requestPermission.mockResolvedValue('granted')
    render(<NotificationButton />)
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button'))
    })
    
    expect(window.Notification.requestPermission).toHaveBeenCalled()
  })

  it('deve mostrar ícone de notificação ativada quando permissão é concedida', async () => {
    window.Notification.permission = 'granted'
    render(<NotificationButton />)
    
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Notificações ativadas')
  })

  it('deve desabilitar o botão quando permissão é negada', () => {
    window.Notification.permission = 'denied'
    render(<NotificationButton />)
    
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Notificações bloqueadas')
  })
}) 
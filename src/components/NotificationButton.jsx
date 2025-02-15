import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { Button } from './ui/button'
import { useToast } from './ui/use-toast'

export function NotificationButton() {
  const [permission, setPermission] = useState('default')
  const { toast } = useToast()

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Erro',
        description: 'Seu navegador não suporta notificações',
        variant: 'destructive',
      })
      return
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      
      if (result === 'granted') {
        toast({
          title: 'Sucesso',
          description: 'Notificações ativadas com sucesso!',
        })
      } else if (result === 'denied') {
        toast({
          title: 'Permissão Negada',
          description: 'Você precisa permitir as notificações nas configurações do navegador',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível solicitar permissão para notificações',
        variant: 'destructive',
      })
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={requestPermission}
      disabled={permission === 'denied'}
      title={
        permission === 'granted'
          ? 'Notificações ativadas'
          : permission === 'denied'
          ? 'Notificações bloqueadas'
          : 'Ativar notificações'
      }
    >
      {permission === 'granted' ? (
        <Bell className="h-4 w-4" />
      ) : (
        <BellOff className="h-4 w-4" />
      )}
    </Button>
  )
} 
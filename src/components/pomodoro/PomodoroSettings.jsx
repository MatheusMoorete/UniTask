import { useState, useEffect } from 'react'
import { Settings2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useGlobalPomodoro } from '../../contexts/PomodoroContext'
import { Switch } from '../ui/switch'
import { Separator } from '../ui/separator'
import { Bell, Moon, Volume2 } from 'lucide-react'

const defaultSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  sessionsUntilLongBreak: 4,
  soundEnabled: true,
  notificationsEnabled: true,
  dndEnabled: false,
  volume: 50
}

export function PomodoroSettings() {
  const { settings, updateSettings } = useGlobalPomodoro()
  const [open, setOpen] = useState(false)
  const [tempSettings, setTempSettings] = useState(defaultSettings)

  // Atualiza tempSettings quando settings mudar
  useEffect(() => {
    if (settings) {
      setTempSettings(settings)
    }
  }, [settings])

  const handleSubmit = (e) => {
    e.preventDefault()
    updateSettings(tempSettings)
    setOpen(false)
  }

  const handleVolumeChange = (e) => {
    setTempSettings({
      ...tempSettings,
      volume: parseInt(e.target.value)
    })
  }

  const handleDndChange = (checked) => {
    setTempSettings({
      ...tempSettings,
      dndEnabled: checked
    })

    // Se DND estiver ativado, solicitar permissão do sistema
    if (checked && "Notification" in window) {
      Notification.requestPermission()
    }
  }

  if (!settings) return null // Não renderiza nada se settings ainda não estiver disponível

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-4 right-4"
        >
          <Settings2 className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações do Timer</DialogTitle>
          <DialogDescription>
            Ajuste as configurações do seu timer Pomodoro
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tempos */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Tempos</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="focusTime">Tempo de Foco (minutos)</Label>
                <Input
                  id="focusTime"
                  type="number"
                  min="1"
                  max="60"
                  value={tempSettings.focusTime}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    focusTime: parseInt(e.target.value)
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortBreakTime">Pausa Curta (minutos)</Label>
                <Input
                  id="shortBreakTime"
                  type="number"
                  min="1"
                  max="30"
                  value={tempSettings.shortBreakTime}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    shortBreakTime: parseInt(e.target.value)
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longBreakTime">Pausa Longa (minutos)</Label>
                <Input
                  id="longBreakTime"
                  type="number"
                  min="1"
                  max="60"
                  value={tempSettings.longBreakTime}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    longBreakTime: parseInt(e.target.value)
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionsUntilLongBreak">
                  Sessões até Pausa Longa
                </Label>
                <Input
                  id="sessionsUntilLongBreak"
                  type="number"
                  min="1"
                  max="10"
                  value={tempSettings.sessionsUntilLongBreak}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    sessionsUntilLongBreak: parseInt(e.target.value)
                  })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notificações e Som */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Notificações e Som</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificações
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações ao terminar cada sessão
                </p>
              </div>
              <Switch
                id="notifications"
                checked={tempSettings.notificationsEnabled}
                onCheckedChange={(checked) => 
                  setTempSettings({
                    ...tempSettings,
                    notificationsEnabled: checked
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound" className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Som
                </Label>
                <p className="text-sm text-muted-foreground">
                  Ativar som ao terminar cada sessão
                </p>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tempSettings.volume}
                  onChange={handleVolumeChange}
                  className="w-24"
                  disabled={!tempSettings.soundEnabled}
                />
                <Switch
                  id="sound"
                  checked={tempSettings.soundEnabled}
                  onCheckedChange={(checked) => 
                    setTempSettings({
                      ...tempSettings,
                      soundEnabled: checked
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dnd" className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Não Perturbe
                </Label>
                <p className="text-sm text-muted-foreground">
                  Ativar modo não perturbe durante o foco
                </p>
              </div>
              <Switch
                id="dnd"
                checked={tempSettings.dndEnabled}
                onCheckedChange={handleDndChange}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
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

const defaultSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  sessionsUntilLongBreak: 4,
  soundEnabled: true
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
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound">Som de Notificação</Label>
              <p className="text-sm text-muted-foreground">
                Ativar som ao terminar cada sessão
              </p>
            </div>
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

          <div className="flex justify-end gap-2">
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
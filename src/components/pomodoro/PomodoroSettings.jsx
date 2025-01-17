import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Settings2 } from 'lucide-react'

const PomodoroSettings = ({ settings, onSave, onClose }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const newSettings = {
      focusTime: parseInt(formData.get('focusTime')),
      shortBreakTime: parseInt(formData.get('shortBreakTime')),
      longBreakTime: parseInt(formData.get('longBreakTime')),
      sessionsUntilLongBreak: parseInt(formData.get('sessionsUntilLongBreak')),
    }
    onSave(newSettings)
    onClose()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Configurações do Timer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="focusTime">
              Tempo de Foco (minutos)
            </Label>
            <Input
              id="focusTime"
              name="focusTime"
              type="number"
              defaultValue={settings.focusTime}
              min="1"
              max="60"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="shortBreakTime">
              Pausa Curta (minutos)
            </Label>
            <Input
              id="shortBreakTime"
              name="shortBreakTime"
              type="number"
              defaultValue={settings.shortBreakTime}
              min="1"
              max="30"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="longBreakTime">
              Pausa Longa (minutos)
            </Label>
            <Input
              id="longBreakTime"
              name="longBreakTime"
              type="number"
              defaultValue={settings.longBreakTime}
              min="1"
              max="60"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sessionsUntilLongBreak">
              Sessões até Pausa Longa
            </Label>
            <Input
              id="sessionsUntilLongBreak"
              name="sessionsUntilLongBreak"
              type="number"
              defaultValue={settings.sessionsUntilLongBreak}
              min="1"
              max="10"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Salvar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default PomodoroSettings 
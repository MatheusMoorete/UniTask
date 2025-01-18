import { Timer } from "lucide-react"
import PomodoroTimer from '../components/pomodoro/PomodoroTimer'
import PomodoroReport from '../components/pomodoro/PomodoroReport'

const Pomodoro = () => {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timer Pomodoro</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seu tempo de estudo com o método Pomodoro
          </p>
        </div>

        <div className="flex justify-center">
          <PomodoroTimer />
        </div>
      </div>

      <div className="flex-1 mt-6">
        <PomodoroReport />
      </div>
    </div>
  )
}

export default Pomodoro 
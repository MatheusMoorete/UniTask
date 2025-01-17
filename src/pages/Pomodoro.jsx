import { Timer } from "lucide-react"
import PomodoroTimer from '../components/pomodoro/PomodoroTimer'
import PomodoroReport from '../components/pomodoro/PomodoroReport'

const Pomodoro = () => {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timer Pomodoro</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seu tempo de estudo com o método Pomodoro
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Timer className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="flex-1 grid gap-4 lg:grid-cols-[400px,1fr]">
        <div className="flex items-center justify-center">
          <PomodoroTimer />
        </div>
        <div className="overflow-auto">
          <PomodoroReport />
        </div>
      </div>
    </div>
  )
}

export default Pomodoro 
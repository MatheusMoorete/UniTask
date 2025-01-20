import { useState, useEffect } from 'react'
import { Timer } from "lucide-react"
import PomodoroTimer from '../components/pomodoro/PomodoroTimer'
import PomodoroReport from '../components/pomodoro/PomodoroReport'

const Pomodoro = () => {
  const [showReport, setShowReport] = useState(true)

  useEffect(() => {
    const handleResize = () => {
      setShowReport(window.innerWidth > 640) // 640px é o breakpoint sm do Tailwind
    }

    handleResize() // Checar tamanho inicial
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center gap-8">
        <PomodoroTimer />
        {showReport && <PomodoroReport />}
      </div>
    </div>
  )
}

export default Pomodoro 
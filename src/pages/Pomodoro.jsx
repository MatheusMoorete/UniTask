import { useState, useEffect } from 'react'
import { Timer } from "lucide-react"
import PomodoroTimer from '../components/pomodoro/PomodoroTimer'
import PomodoroReport from '../components/pomodoro/PomodoroReport'
import { motion } from 'framer-motion'

const Pomodoro = () => {
  const [showReport, setShowReport] = useState(true)

  useEffect(() => {
    const handleResize = () => {
      setShowReport(window.innerWidth > 1024) // Mudando para breakpoint lg
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <motion.div 
      className="space-y-6 max-w-full p-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Cabeçalho */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        variants={itemVariants}
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Pomodoro Timer
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie seu tempo e aumente sua produtividade
          </p>
        </div>
      </motion.div>

      {/* Layout Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6">
        <motion.div 
          variants={itemVariants}
          className="w-full max-w-[400px] mx-auto lg:mx-0"
        >
          <PomodoroTimer />
        </motion.div>

        {showReport && (
          <motion.div 
            variants={itemVariants}
            className="w-full"
          >
            <PomodoroReport />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default Pomodoro 
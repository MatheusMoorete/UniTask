import { motion } from "framer-motion"

export function DropIndicator({ active, over }) {
  if (!active || !over || active.id === over.id) return null

  const isTask = active.data.current?.type === 'task'
  const isColumn = active.data.current?.type === 'column'

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: isTask ? 4 : 8 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full bg-primary/20 rounded-full"
    />
  )
} 
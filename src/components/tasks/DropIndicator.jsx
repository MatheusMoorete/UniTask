import { motion } from "framer-motion"

export function DropIndicator({ isOver, type = "task" }) {
  if (!isOver) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: type === "task" ? "4px" : "8px" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full bg-primary/20 rounded-full"
    />
  )
} 
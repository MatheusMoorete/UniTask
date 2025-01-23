import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card"
import { Badge } from "../ui/badge"
import { motion } from "framer-motion"

export function DragPreview({ item, type }) {
  if (!item) return null

  if (type === 'column') {
    return (
      <motion.div
        initial={{ scale: 1.05 }}
        animate={{ scale: 1.05 }}
        className="w-80 opacity-80 rotate-3 pointer-events-none"
      >
        <div className="flex flex-col bg-muted/50 rounded-lg border-2 border-primary">
          <div className="p-4 border-b border-muted">
            <h3 className="font-semibold">{item.title}</h3>
          </div>
          <div className="p-4 flex-1 min-h-[100px] bg-muted/30" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ scale: 1.05 }}
      animate={{ scale: 1.05 }}
      className="w-[calc(100%-2rem)] max-w-sm opacity-80 rotate-3 pointer-events-none"
    >
      <Card className="border-2 border-primary shadow-lg">
        <CardHeader className="p-3">
          <CardTitle className="text-base">{item.title}</CardTitle>
          {item.description && (
            <CardDescription className="leading-snug">
              {item.description}
            </CardDescription>
          )}
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {item.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  style={{ 
                    backgroundColor: tag.color,
                    color: 'white'
                  }}
                  className="text-xs px-2 py-0"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>
    </motion.div>
  )
} 
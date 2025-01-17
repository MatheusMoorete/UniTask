import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "../../lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    variant?: "default" | "success" | "warning" | "destructive"
    value?: number
    max?: number
  }
>(({ className, value, max = 100, variant = "default", ...props }, ref) => {
  const percentage = (value || 0) / max * 100

  const getProgressColor = () => {
    if (percentage >= 100) return "bg-destructive"
    if (percentage >= 75) return "bg-destructive/90"
    if (percentage >= 50) return "bg-destructive/75"
    if (percentage >= 25) return "bg-warning"
    return "bg-success"
  }

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "progress relative h-4 w-full overflow-hidden bg-muted",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-500",
          getProgressColor()
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress } 
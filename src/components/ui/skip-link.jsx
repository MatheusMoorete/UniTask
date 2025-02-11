import * as React from "react"
import { cn } from "../../lib/utils"

const SkipLink = React.forwardRef(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-4 focus:text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
      className
    )}
    {...props}
  />
))
SkipLink.displayName = "SkipLink"

export { SkipLink } 
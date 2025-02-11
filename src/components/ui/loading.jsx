import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useEffect, useState } from 'react'

export function Loading({ 
  className, 
  size = 'default', 
  fullScreen = false,
  delay = 300, // Delay para evitar flash de loading em carregamentos rápidos
  message = 'Carregando...',
  showMessage = true
}) {
  const [shouldRender, setShouldRender] = useState(!delay)

  useEffect(() => {
    if (delay) {
      const timer = setTimeout(() => setShouldRender(true), delay)
      return () => clearTimeout(timer)
    }
  }, [delay])

  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  if (!shouldRender) return null

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 
            className={cn(
              "animate-spin text-primary", 
              sizeClasses[size], 
              className
            )} 
          />
          {showMessage && (
            <p className="text-sm text-muted-foreground animate-pulse">
              {message}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-2">
      <Loader2 
        className={cn(
          "animate-spin text-primary", 
          sizeClasses[size], 
          className
        )} 
      />
      {showMessage && (
        <p className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  )
} 
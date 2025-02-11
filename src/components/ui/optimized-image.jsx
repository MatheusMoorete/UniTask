import { useState, useEffect } from 'react'
import { cn } from '../../lib/utils'

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  loading = 'lazy',
  sizes = '100vw',
  quality = 75,
  ...props
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (priority) {
      const img = new Image()
      img.src = src
      img.onload = () => setLoaded(true)
      img.onerror = () => setError(true)
    }
  }, [src, priority])

  if (error) {
    return (
      <div
        className={cn(
          'bg-muted flex items-center justify-center',
          className
        )}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        <span className="text-muted-foreground text-sm">Erro ao carregar imagem</span>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      {!loaded && !priority && (
        <div
          className="absolute inset-0 bg-muted animate-pulse"
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        sizes={sizes}
        className={cn(
          'object-cover transition-opacity duration-300',
          !loaded && !priority && 'opacity-0',
          loaded && 'opacity-100'
        )}
        {...props}
      />
    </div>
  )
} 
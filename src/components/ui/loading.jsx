import { cn } from '../../lib/utils'
import PropTypes from 'prop-types'
import { LoadingSpinner } from './loading-spinner'

export function Loading({ fullScreen = false, message = 'Carregando...', className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-4',
        fullScreen && 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
        className
      )}
    >
      <LoadingSpinner />
      {message && (
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  )
}

Loading.propTypes = {
  fullScreen: PropTypes.bool,
  message: PropTypes.string,
  className: PropTypes.string
}

Loading.defaultProps = {
  fullScreen: false,
  message: 'Carregando...'
}

Loading.displayName = 'Loading' 
import { cn } from '../../lib/utils'
import PropTypes from 'prop-types'

export function LoadingSpinner({ className }) {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div
        className={cn(
          "inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
          className
        )}
        role="status"
      >
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Carregando...
        </span>
      </div>
    </div>
  )
}

LoadingSpinner.propTypes = {
  className: PropTypes.string
}

LoadingSpinner.displayName = 'LoadingSpinner' 
import { Moon, Sun } from 'lucide-react'
import { Button } from './ui/button'
import { useTheme } from '../contexts/ThemeContext'
import { Tooltip } from './ui/tooltip'
import PropTypes from 'prop-types'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleDarkMode } = useTheme()
  const isDarkMode = theme.mode === 'dark'

  return (
    <Tooltip content={isDarkMode ? 'Mudar para tema claro (padrão)' : 'Mudar para tema noturno suave'}>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        className={`${className} relative`}
        aria-label={isDarkMode ? 'Mudar para tema claro (padrão)' : 'Mudar para tema noturno suave'}
      >
        {/* Ícone do Sol (tema claro) */}
        <Sun 
          className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
            isDarkMode ? 'rotate-0 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`} 
        />
        
        {/* Ícone da Lua (tema escuro) */}
        <Moon 
          className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
            isDarkMode ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
          }`} 
        />
        
        <span className="sr-only">
          {isDarkMode ? 'Mudar para tema claro (padrão)' : 'Mudar para tema noturno suave'}
        </span>
      </Button>
    </Tooltip>
  )
}

ThemeToggle.propTypes = {
  className: PropTypes.string
} 
import { Moon, Sun } from 'lucide-react'
import { Button } from './ui/button'
import { useTheme } from '../contexts/ThemeContext'
import { Tooltip } from './ui/tooltip'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleDarkMode } = useTheme()
  const isDarkMode = theme.mode === 'dark'

  return (
    <Tooltip content={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        className={className}
        aria-label={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      >
        {isDarkMode ? (
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        ) : (
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        )}
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Alternar tema</span>
      </Button>
    </Tooltip>
  )
} 
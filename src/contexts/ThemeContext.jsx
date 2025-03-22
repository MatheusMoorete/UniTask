import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext({})

const defaultTheme = {
  name: 'default',
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  mode: 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('app-theme')
    
    // Verifica se deve usar o tema escuro baseado nas preferências do sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const defaultMode = prefersDark ? 'dark' : 'light'
    
    return savedTheme 
      ? JSON.parse(savedTheme) 
      : { ...defaultTheme, mode: defaultMode }
  })

  useEffect(() => {
    localStorage.setItem('app-theme', JSON.stringify(theme))
    
    // Aplicar tema claro ou escuro
    if (theme.mode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Atualiza as variáveis CSS
    if (theme.name === 'custom') {
      document.documentElement.style.setProperty('--primary', theme.primary)
      document.documentElement.style.setProperty('--secondary', theme.secondary)
      document.documentElement.style.setProperty('--accent', theme.accent)
    } else {
      document.documentElement.style.removeProperty('--primary')
      document.documentElement.style.removeProperty('--secondary')
      document.documentElement.style.removeProperty('--accent')
    }
  }, [theme])

  const updateTheme = (newTheme) => {
    setTheme(prev => ({
      ...prev,
      ...newTheme
    }))
  }
  
  const toggleDarkMode = () => {
    setTheme(prev => ({
      ...prev,
      mode: prev.mode === 'dark' ? 'light' : 'dark'
    }))
  }

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 
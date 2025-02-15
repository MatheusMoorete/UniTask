import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext({})

const defaultTheme = {
  name: 'default',
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('app-theme')
    return savedTheme ? JSON.parse(savedTheme) : defaultTheme
  })

  useEffect(() => {
    localStorage.setItem('app-theme', JSON.stringify(theme))
    
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

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
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
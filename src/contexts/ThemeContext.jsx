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
    
    // Definindo o tema padrão como claro, independente das preferências do sistema
    // Verificamos apenas se o usuário já configurou manualmente anteriormente
    if (savedTheme) {
      return JSON.parse(savedTheme)
    } else {
      return defaultTheme // Sempre inicia com tema claro
    }
  })

  // Função para aplicar o tema ao documento
  const applyThemeToDocument = (themeMode) => {
    // Aplicar tema claro ou escuro
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Forçar um reflow para garantir que as alterações de CSS sejam aplicadas
    document.body.style.display = 'none'
    document.body.offsetHeight // Forçar reflow
    document.body.style.display = ''
    
    // Log para debug em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.log(`[UniTask Theme] Tema alterado para: ${themeMode}`)
    }
  }

  useEffect(() => {
    localStorage.setItem('app-theme', JSON.stringify(theme))
    
    // Aplicar tema usando a função auxiliar
    applyThemeToDocument(theme.mode)
    
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
    const newMode = theme.mode === 'dark' ? 'light' : 'dark'
    
    // Aplicar imediatamente para feedback mais rápido
    applyThemeToDocument(newMode)
    
    setTheme(prev => ({
      ...prev,
      mode: newMode
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
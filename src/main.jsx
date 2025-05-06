import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'

// Importando estilos
import './index.css'
import './styles/globals.css'
import './styles/calendar.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Garante que a aplicação inicie com tema claro por padrão
// Este script roda antes da renderização da aplicação
(function initializeDefaultTheme() {
  // Verifica se já existe uma configuração salva
  const savedTheme = localStorage.getItem('app-theme');
  
  if (!savedTheme) {
    // Se não houver tema salvo, definimos o padrão como claro
    // E removemos qualquer classe 'dark' que possa existir
    document.documentElement.classList.remove('dark');
    
    // Salvamos a preferência no localStorage
    localStorage.setItem('app-theme', JSON.stringify({
      name: 'default',
      primary: 'hsl(var(--primary))',
      secondary: 'hsl(var(--secondary))',
      accent: 'hsl(var(--accent))',
      mode: 'light'
    }));
  } else {
    // Se houver tema salvo, aplicamos conforme a preferência do usuário
    try {
      const theme = JSON.parse(savedTheme);
      if (theme.mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      // Em caso de erro, garantimos o tema claro
      document.documentElement.classList.remove('dark');
      console.error('Erro ao analisar tema:', e);
    }
  }
})();

// Previne o comportamento de zoom em inputs em dispositivos móveis
const preventZoom = (e) => {
  if (e.touches.length > 1) {
    e.preventDefault()
  }
}

document.addEventListener('touchmove', preventZoom, { passive: false })

// Desabilita o duplo toque para zoom em dispositivos móveis
document.addEventListener('dblclick', (e) => {
  e.preventDefault()
}, { passive: false })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
)

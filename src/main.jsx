import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import './index.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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

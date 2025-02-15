import { toast } from 'sonner'

// Estilos base para os toasts
const toastStyles = {
  success: {
    style: {
      backgroundColor: '#dcfce7',
      border: '1px solid #86efac',
      color: '#166534'
    }
  },
  error: {
    style: {
      backgroundColor: '#fee2e2',
      border: '1px solid #fca5a5',
      color: '#991b1b'
    }
  },
  info: {
    style: {
      backgroundColor: '#e0f2fe',
      border: '1px solid #7dd3fc',
      color: '#075985'
    }
  }
}

// Função utilitária para mostrar toasts
export const showToast = {
  success: (message) => {
    toast.success(message, {
      style: toastStyles.success.style,
      className: 'success-toast'
    })
  },
  error: (message) => {
    toast.error(message, {
      style: toastStyles.error.style,
      className: 'error-toast'
    })
  },
  info: (message, options = {}) => {
    toast(message, {
      style: toastStyles.info.style,
      className: 'info-toast',
      ...options
    })
  },
  custom: (render) => {
    toast.custom(render, {
      duration: 4000,
      position: 'top-center'
    })
  }
}

// Configuração global do toast
export const toastConfig = {
  position: 'top-center',
  expand: false,
  closeButton: true,
  theme: 'light',
  style: {
    border: '1px solid var(--border)',
    borderRadius: '6px'
  }
} 
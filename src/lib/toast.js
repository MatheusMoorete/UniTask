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
    // Verificar se a mensagem existe e não está vazia
    if (!message || typeof message !== 'string' || message.trim() === '') {
      console.warn('Tentativa de mostrar toast de sucesso com mensagem vazia')
      message = 'Operação realizada com sucesso'
    }
    
    toast.success(message, {
      style: toastStyles.success.style,
      className: 'success-toast',
      duration: 4000
    })
  },
  error: (message) => {
    // Verificar se a mensagem existe e não está vazia
    if (!message || typeof message !== 'string' || message.trim() === '') {
      console.warn('Tentativa de mostrar toast de erro com mensagem vazia')
      message = 'Ocorreu um erro na operação'
    }
    
    toast.error(message, {
      style: toastStyles.error.style,
      className: 'error-toast',
      duration: 5000
    })
  },
  info: (message, options = {}) => {
    // Verificar se a mensagem existe e não está vazia
    if (!message || typeof message !== 'string' || message.trim() === '') {
      console.warn('Tentativa de mostrar toast informativo com mensagem vazia')
      message = 'Informação do sistema'
    }
    
    toast(message, {
      style: toastStyles.info.style,
      className: 'info-toast',
      duration: 4000,
      ...options
    })
  },
  custom: (render, options = {}) => {
    if (!render) {
      console.warn('Tentativa de mostrar toast customizado sem conteúdo')
      return null
    }
    
    return toast.custom(render, {
      duration: 5000,
      position: 'top-center',
      ...options
    })
  },
  dismiss: (toastId) => {
    if (toastId) {
      toast.dismiss(toastId)
    } else {
      toast.dismiss()
    }
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
  },
  richColors: true,
  duration: 4000
} 
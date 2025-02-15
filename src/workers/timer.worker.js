let timerId = null
let currentTime = 0

self.onmessage = (e) => {
  const { type, timeLeft, interval } = e.data

  if (type === 'start') {
    currentTime = timeLeft
    
    // Limpa o timer anterior se existir
    if (timerId) {
      clearInterval(timerId)
    }

    // Inicia um novo timer
    timerId = setInterval(() => {
      currentTime = Math.max(0, currentTime - 1)
      
      // Envia o tempo atual para o componente principal
      self.postMessage({ type: 'tick', timeLeft: currentTime })

      // Se o timer chegou a zero, notifica o componente principal
      if (currentTime === 0) {
        clearInterval(timerId)
        self.postMessage({ type: 'complete' })
      }
    }, interval)
  } else if (type === 'stop') {
    // Para o timer
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }
} 
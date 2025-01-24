import { useRef, useCallback } from 'react'

export function useSound(soundUrl, { volume = 1, startTime = 3, duration = 2 } = {}) {
  const audio = useRef(new Audio(soundUrl))

  const play = useCallback(() => {
    const sound = audio.current
    sound.volume = volume
    
    // Define o ponto de início do som (em segundos)
    sound.currentTime = startTime

    // Toca o som
    sound.play().catch(error => {
      console.error('Erro ao tocar som:', error)
    })

    // Para o som após 2 segundos
    const stopTimeout = setTimeout(() => {
      sound.pause()
      sound.currentTime = startTime // Reset para o ponto inicial
    }, duration * 1000) // Converte duração para milissegundos

    // Limpa o timeout se o componente for desmontado
    return () => clearTimeout(stopTimeout)
  }, [volume, startTime, duration])

  return { play }
} 
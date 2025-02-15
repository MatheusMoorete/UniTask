import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useFirestore } from '../contexts/FirestoreContext'
import { useTimeFilter } from '../contexts/TimeFilterContext'
import {
  collection,
  query,
  addDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  orderBy
} from 'firebase/firestore'

const STORAGE_KEY = 'pomodoro_sessions'

const usePomodoroSound = (soundEnabled = true, volume = 50) => {
  const [audio] = useState(() => new Audio('/sounds/alarmclock-bell-ringing-clear-windingdown-000212_0029s3_d-095-099-031-042-35592.mp3'))

  useEffect(() => {
    audio.volume = volume / 100
  }, [volume, audio])

  const playSoundSafely = useCallback(() => {
    if (soundEnabled) {
      try {
        audio.currentTime = 0 // Reinicia o áudio
        audio.volume = volume / 100 // Define o volume inicial
        audio.play()
        
        // Implementa fade out suave nos últimos 400ms
        const fadeOutDuration = 400 // duração do fade em ms
        const fadeOutStart = 3000 // quando começar o fade (3.4s - 0.4s)
        const fadeOutInterval = 10 // intervalo de atualização do fade em ms
        
        // Timer para iniciar o fade out
        setTimeout(() => {
          const initialVolume = audio.volume
          const steps = fadeOutDuration / fadeOutInterval
          const volumeStep = initialVolume / steps
          
          const fadeInterval = setInterval(() => {
            if (audio.volume > volumeStep) {
              audio.volume -= volumeStep
            } else {
              audio.volume = 0
              clearInterval(fadeInterval)
              audio.pause()
              audio.currentTime = 0
              // Restaura o volume original para a próxima vez
              audio.volume = volume / 100
            }
          }, fadeOutInterval)
          
          // Garante que o intervalo seja limpo
          setTimeout(() => {
            clearInterval(fadeInterval)
          }, fadeOutDuration + 100)
        }, fadeOutStart)

        // Timer final para garantir que o som pare
        setTimeout(() => {
          audio.pause()
          audio.currentTime = 0
          audio.volume = volume / 100 // Restaura o volume original
        }, 3400) // Tempo total de 3.4 segundos
      } catch (error) {
        console.error('Erro ao tocar som:', error)
      }
    }
  }, [soundEnabled, audio, volume])

  // Limpa o áudio quando o componente é desmontado
  useEffect(() => {
    return () => {
      audio.pause()
      audio.currentTime = 0
    }
  }, [audio])

  return playSoundSafely
}

export function usePomodoro() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const auth = useAuth()
  const { db } = useFirestore()
  const { timeFilter } = useTimeFilter()

  const user = auth?.user

  // Carregar dados do localStorage e Firestore
  useEffect(() => {
    if (!user?.uid) return

    // Carregar dados do localStorage primeiro
    const localSessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    setSessions(localSessions)

    // Referência para a coleção de sessões do usuário
    const sessionsRef = collection(db, 'users', user.uid, 'pomodoro_sessions')
    const sessionsQuery = query(
      sessionsRef,
      orderBy('startedAt', 'desc')
    )

    // Ouvir mudanças no Firestore
    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      const firestoreSessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startedAt: doc.data().startedAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate()
      }))

      // Mesclar dados do Firestore com localStorage
      const mergedSessions = [...firestoreSessions]
      
      // Atualizar localStorage e state
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedSessions))
      setSessions(mergedSessions)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, db])

  // Adicionar nova sessão
  const addSession = async (sessionData) => {
    if (!user?.uid) return

    try {
      const sessionsRef = collection(db, 'users', user.uid, 'pomodoro_sessions')
      const newSession = {
        ...sessionData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        startedAt: Timestamp.fromDate(sessionData.startedAt),
        completedAt: Timestamp.fromDate(sessionData.completedAt)
      }

      // Adicionar ao Firestore
      const docRef = await addDoc(sessionsRef, newSession)
      const sessionWithId = { ...newSession, id: docRef.id }

      // Atualizar localStorage
      const updatedSessions = [sessionWithId, ...sessions]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions))
      setSessions(updatedSessions)

      return docRef.id
    } catch (error) {
      console.error('Erro ao adicionar sessão:', error)
      throw error
    }
  }

  // Funções auxiliares
  const getFilteredSessions = () => {
    const now = new Date()
    let startDate = new Date()

    switch (timeFilter) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'semester':
        startDate.setMonth(now.getMonth() - 6)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    return sessions.filter(session => 
      session.completedAt >= startDate && 
      session.completedAt <= now
    )
  }

  // Funções de cálculo de estatísticas
  const getTotalFocusTime = () => {
    const filteredSessions = getFilteredSessions()
    return filteredSessions.reduce((total, session) => {
      if (session.type === 'focus' && session.duration) {
        return total + session.duration
      }
      return total
    }, 0)
  }

  const getAccessDays = () => {
    const filteredSessions = getFilteredSessions()
    const uniqueDays = new Set(
      filteredSessions.map(session => 
        new Date(session.completedAt).toDateString()
      )
    )
    return uniqueDays.size
  }

  const getStreak = () => {
    if (sessions.length === 0) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let currentStreak = 0
    let date = today

    while (true) {
      const hasSessionOnDay = sessions.some(session => {
        const sessionDate = new Date(session.completedAt)
        sessionDate.setHours(0, 0, 0, 0)
        return sessionDate.getTime() === date.getTime()
      })

      if (!hasSessionOnDay) break
      
      currentStreak++
      date = new Date(date.getTime() - 24 * 60 * 60 * 1000)
    }

    return currentStreak
  }

  const getDailyAverage = () => {
    const filteredSessions = getFilteredSessions()
    const totalTime = filteredSessions.reduce((total, session) => {
      if (session.type === 'focus' && session.duration) {
        return total + session.duration
      }
      return total
    }, 0)

    const uniqueDays = new Set(
      filteredSessions.map(session => 
        new Date(session.completedAt).toDateString()
      )
    )

    return uniqueDays.size > 0 ? totalTime / uniqueDays.size : 0
  }

  const getProductivityTrend = () => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const currentWeekTime = sessions.reduce((total, session) => {
      if (
        session.type === 'focus' &&
        session.completedAt >= oneWeekAgo &&
        session.completedAt <= now
      ) {
        return total + session.duration
      }
      return total
    }, 0)

    const previousWeekTime = sessions.reduce((total, session) => {
      if (
        session.type === 'focus' &&
        session.completedAt >= twoWeeksAgo &&
        session.completedAt < oneWeekAgo
      ) {
        return total + session.duration
      }
      return total
    }, 0)

    if (previousWeekTime === 0) return 0
    return Math.round(((currentWeekTime - previousWeekTime) / previousWeekTime) * 100)
  }

  const getDistributionData = () => {
    const filteredSessions = getFilteredSessions()
    const focusTime = filteredSessions.reduce((total, session) => {
      if (session.type === 'focus') return total + session.duration
      return total
    }, 0)

    const shortBreakTime = filteredSessions.reduce((total, session) => {
      if (session.type === 'shortBreak') return total + session.duration
      return total
    }, 0)

    const longBreakTime = filteredSessions.reduce((total, session) => {
      if (session.type === 'longBreak') return total + session.duration
      return total
    }, 0)

    return [
      { name: 'Foco', value: Math.round(focusTime / 60) },
      { name: 'Pausa Curta', value: Math.round(shortBreakTime / 60) },
      { name: 'Pausa Longa', value: Math.round(longBreakTime / 60) }
    ]
  }

  const getWeeklyChartData = () => {
    const data = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(date.getDate() + 1)

      const hoursOnDay = sessions.reduce((total, session) => {
        if (
          session.type === 'focus' &&
          session.completedAt >= date &&
          session.completedAt < nextDate
        ) {
          return total + (session.duration / 3600)
        }
        return total
      }, 0)

      data.push({
        name: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        hours: Number(hoursOnDay.toFixed(1))
      })
    }

    return data
  }

  const getMonthlyChartData = () => {
    const data = []
    const today = new Date()
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    
    for (let i = 0; i < daysInMonth; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i + 1)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(date.getDate() + 1)

      const hoursOnDay = sessions.reduce((total, session) => {
        if (
          session.type === 'focus' &&
          session.completedAt >= date &&
          session.completedAt < nextDate
        ) {
          return total + (session.duration / 3600)
        }
        return total
      }, 0)

      data.push({
        name: date.getDate().toString(),
        hours: Number(hoursOnDay.toFixed(1))
      })
    }

    return data
  }

  const getSemesterChartData = () => {
    const data = []
    const today = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0)
      monthStart.setHours(0, 0, 0, 0)
      monthEnd.setHours(23, 59, 59, 999)

      const hoursInMonth = sessions.reduce((total, session) => {
        if (
          session.type === 'focus' &&
          session.completedAt >= monthStart &&
          session.completedAt <= monthEnd
        ) {
          return total + (session.duration / 3600)
        }
        return total
      }, 0)

      data.push({
        name: monthStart.toLocaleDateString('pt-BR', { month: 'short' }),
        hours: Number(hoursInMonth.toFixed(1))
      })
    }

    return data
  }

  const getTodayFocusTime = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return sessions.reduce((total, session) => {
      const sessionDate = new Date(session.completedAt)
      sessionDate.setHours(0, 0, 0, 0)
      
      if (session.type === 'focus' && sessionDate.getTime() === today.getTime()) {
        return total + (session.duration || 0)
      }
      return total
    }, 0)
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return {
    sessions,
    loading,
    addSession,
    getTotalFocusTime,
    getAccessDays,
    getStreak,
    getDailyAverage,
    getProductivityTrend,
    getDistributionData,
    getWeeklyChartData,
    getMonthlyChartData,
    getSemesterChartData,
    getTodayFocusTime,
    formatTime
  }
}

export { usePomodoroSound } 
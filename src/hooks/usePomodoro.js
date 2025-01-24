import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useFirestore } from '../contexts/FirestoreContext'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  addDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore'

export function usePomodoro() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { db } = useFirestore()

  // Carrega as sessões do Firestore
  useEffect(() => {
    if (!user) {
      setSessions([])
      setLoading(false)
      return
    }

    try {
      // Query ordenada por data de criação, limitada aos últimos 6 meses
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const q = query(
        collection(db, 'pomodoro_sessions'),
        where('userId', '==', user.uid),
        where('createdAt', '>=', Timestamp.fromDate(sixMonthsAgo)),
        orderBy('createdAt', 'desc')
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const sessionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          startedAt: doc.data().startedAt?.toDate(),
          completedAt: doc.data().completedAt?.toDate()
        }))
        setSessions(sessionsData)
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error('Erro ao carregar sessões:', error)
      setLoading(false)
    }
  }, [user, db])

  // Adiciona uma nova sessão ao Firestore
  const addSession = async (sessionData) => {
    if (!user) return

    try {
      await addDoc(collection(db, 'pomodoro_sessions'), {
        ...sessionData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        startedAt: Timestamp.fromDate(sessionData.startedAt),
        completedAt: Timestamp.fromDate(sessionData.completedAt)
      })
    } catch (error) {
      console.error('Erro ao adicionar sessão:', error)
      throw error
    }
  }

  // Calcula o tempo total focado
  const getTotalFocusTime = () => {
    return sessions
      .filter(session => session.type === 'focus')
      .reduce((total, session) => total + (session.duration || 0), 0)
  }

  // Calcula o tempo total focado na semana atual
  const getWeeklyFocusTime = () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setHours(0, 0, 0, 0)
    startOfWeek.setDate(now.getDate() - now.getDay())

    return sessions
      .filter(session => 
        session.type === 'focus' &&
        session.createdAt >= startOfWeek
      )
      .reduce((total, session) => total + (session.duration || 0), 0)
  }

  // Calcula o tempo focado hoje
  const getTodayFocusTime = () => {
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)

    return sessions
      .filter(session => 
        session.type === 'focus' &&
        session.createdAt >= startOfDay
      )
      .reduce((total, session) => total + (session.duration || 0), 0)
  }

  // Retorna o número de dias únicos em que o usuário estudou
  const getAccessDays = () => {
    const uniqueDays = new Set(
      sessions
        .filter(session => session.type === 'focus')
        .map(session => {
          const date = session.createdAt
          return date ? date.toDateString() : null
        })
        .filter(Boolean)
    )
    return uniqueDays.size
  }

  // Calcula a sequência atual de dias estudando
  const getStreak = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const studyDays = new Set(
      sessions
        .filter(session => session.type === 'focus')
        .map(session => session.createdAt?.toDateString())
        .filter(Boolean)
    )

    let streak = 0
    let currentDate = new Date(today)

    while (studyDays.has(currentDate.toDateString())) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    }

    return streak
  }

  // Gera dados para o gráfico semanal
  const getWeeklyChartData = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setHours(0, 0, 0, 0)
    startOfWeek.setDate(now.getDate() - now.getDay())

    return days.map((day, index) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + index)
      const nextDate = new Date(date)
      nextDate.setDate(date.getDate() + 1)

      const hours = sessions
        .filter(session => 
          session.type === 'focus' &&
          session.createdAt >= date &&
          session.createdAt < nextDate
        )
        .reduce((total, session) => total + (session.duration || 0), 0) / 3600

      return {
        name: day,
        hours: Number(hours.toFixed(1))
      }
    })
  }

  // Gera dados para o gráfico mensal
  const getMonthlyChartData = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const days = []

    for (let date = new Date(startOfMonth); date <= endOfMonth; date.setDate(date.getDate() + 1)) {
      const nextDate = new Date(date)
      nextDate.setDate(date.getDate() + 1)

      const hours = sessions
        .filter(session => 
          session.type === 'focus' &&
          session.createdAt >= date &&
          session.createdAt < nextDate
        )
        .reduce((total, session) => total + (session.duration || 0), 0) / 3600

      days.push({
        name: date.getDate(),
        hours: Number(hours.toFixed(1))
      })
    }

    return days
  }

  // Gera dados para o gráfico semestral
  const getSemesterChartData = () => {
    const now = new Date()
    const months = []
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

    // Considera os últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      const hours = sessions
        .filter(session => 
          session.type === 'focus' &&
          session.createdAt >= month &&
          session.createdAt < nextMonth
        )
        .reduce((total, session) => total + (session.duration || 0), 0) / 3600

      months.push({
        name: monthNames[month.getMonth()],
        hours: Number(hours.toFixed(1))
      })
    }

    return months
  }

  // Formata o tempo em horas e minutos
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`
    }
    return `${minutes}min`
  }

  return {
    sessions,
    loading,
    addSession,
    getTotalFocusTime,
    getWeeklyFocusTime,
    getTodayFocusTime,
    getAccessDays,
    getStreak,
    getWeeklyChartData,
    getMonthlyChartData,
    getSemesterChartData,
    formatTime
  }
} 
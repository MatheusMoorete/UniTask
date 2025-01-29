import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PomodoroProvider } from './contexts/PomodoroContext'
import PrivateRoute from './components/auth/PrivateRoute'
import RootLayout from './components/layout/RootLayout'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/Dashboard'
import TaskList from './pages/TaskList'
import Calendar from './pages/Calendar'
import Pomodoro from './pages/Pomodoro'
import Attendance from './pages/Attendance'
import { GoogleCalendarProvider } from './contexts/GoogleCalendarContext'
import Notebook from './pages/Notebook'
import { CadernoVirtual } from './pages/CadernoVirtual'
import { FirestoreProvider } from './contexts/FirestoreContext'
import { BoardProvider } from './contexts/BoardContext'
import StudyRoom from './pages/StudyRoom'
import ErrorBoundary from './components/ErrorBoundary'
import { Toaster } from 'sonner'
import Flashcards from './pages/Flashcards'
import Landing from './pages/Landing'
import { useEffect } from 'react'

const defaultSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  sessionsUntilLongBreak: 4,
}

// Função para logs seguros em produção
const logInfo = (message, data = {}) => {
  const sensitiveKeys = ['token', 'key', 'password', 'secret']
  const safeData = { ...data }
  
  // Remove dados sensíveis
  Object.keys(safeData).forEach(key => {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      safeData[key] = '[REDACTED]'
    }
  })
  
  console.log(`[UniTask] ${message}`, safeData)
}

function AppRoutes() {
  const location = useLocation()

  useEffect(() => {
    logInfo('Route changed', { 
      path: location.pathname,
      search: location.search,
      hash: location.hash
    })
  }, [location])

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route element={
        <PrivateRoute>
          <RootLayout />
        </PrivateRoute>
      }>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/caderno-virtual" element={<CadernoVirtual />} />
        <Route path="/study-room" element={<StudyRoom />} />
        <Route path="/flashcards" element={<Flashcards />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

export default function App() {
  useEffect(() => {
    logInfo('App initialized', {
      env: import.meta.env.MODE,
      buildTime: import.meta.env.VITE_BUILD_TIME || 'unknown',
      version: import.meta.env.VITE_VERSION || '1.0.0'
    })
  }, [])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <FirestoreProvider>
          <GoogleCalendarProvider>
            <BoardProvider>
              <PomodoroProvider defaultSettings={defaultSettings}>
                <Toaster 
                  position="top-center"
                  expand={true}
                  richColors
                />
                <AppRoutes />
              </PomodoroProvider>
            </BoardProvider>
          </GoogleCalendarProvider>
        </FirestoreProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

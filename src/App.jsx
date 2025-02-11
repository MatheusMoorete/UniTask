import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { PomodoroProvider } from './contexts/PomodoroContext'
import { GoogleCalendarProvider } from './contexts/GoogleCalendarContext'
import { FirestoreProvider } from './contexts/FirestoreContext'
import { BoardProvider } from './contexts/BoardContext'
import ErrorBoundary from './components/ErrorBoundary'
import { Toaster } from 'sonner'
import { Loading } from './components/ui/loading'
import PrivateRoute from './components/auth/PrivateRoute'
import * as LazyRoutes from './routes/lazyRoutes'
import { toastConfig } from './lib/toast'

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

// Componente para envolver rotas com Suspense
const SuspenseRoute = ({ children }) => {
  return (
    <Suspense fallback={<Loading fullScreen message="Carregando página..." />}>
      {children}
    </Suspense>
  )
}
SuspenseRoute.displayName = 'SuspenseRoute'

// Componente para envolver rotas protegidas
const ProtectedRoute = ({ children }) => {
  return (
    <PrivateRoute>
      <SuspenseRoute>{children}</SuspenseRoute>
    </PrivateRoute>
  )
}
ProtectedRoute.displayName = 'ProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/landing"
        element={
          <SuspenseRoute>
            <LazyRoutes.Landing />
          </SuspenseRoute>
        }
      />
      <Route
        path="/login"
        element={
          <SuspenseRoute>
            <LazyRoutes.Login />
          </SuspenseRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <SuspenseRoute>
            <LazyRoutes.Signup />
          </SuspenseRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <SuspenseRoute>
            <LazyRoutes.ResetPassword />
          </SuspenseRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <LazyRoutes.RootLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={
            <SuspenseRoute>
              <LazyRoutes.Dashboard />
            </SuspenseRoute>
          }
        />
        <Route
          path="/todo"
          element={
            <SuspenseRoute>
              <LazyRoutes.TodoList />
            </SuspenseRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <SuspenseRoute>
              <LazyRoutes.Calendar />
            </SuspenseRoute>
          }
        />
        <Route
          path="/pomodoro"
          element={
            <SuspenseRoute>
              <LazyRoutes.Pomodoro />
            </SuspenseRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <SuspenseRoute>
              <LazyRoutes.Attendance />
            </SuspenseRoute>
          }
        />
        <Route
          path="/caderno-virtual"
          element={
            <SuspenseRoute>
              <LazyRoutes.CadernoVirtual />
            </SuspenseRoute>
          }
        />
        <Route
          path="/study-room"
          element={
            <SuspenseRoute>
              <LazyRoutes.StudyRoom />
            </SuspenseRoute>
          }
        />
        <Route
          path="/flashcards"
          element={
            <SuspenseRoute>
              <LazyRoutes.Flashcards />
            </SuspenseRoute>
          }
        />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <FirestoreProvider>
          <PomodoroProvider>
            <GoogleCalendarProvider>
              <BoardProvider>
                <AppRoutes />
                <Toaster {...toastConfig} />
              </BoardProvider>
            </GoogleCalendarProvider>
          </PomodoroProvider>
        </FirestoreProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

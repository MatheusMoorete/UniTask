import { Routes, Route, Navigate } from 'react-router-dom'
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

const defaultSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  sessionsUntilLongBreak: 4,
}

export default function App() {
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
                <Routes>
                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Protected Routes */}
                  <Route element={
                    <PrivateRoute>
                      <RootLayout />
                    </PrivateRoute>
                  }>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/tasks" element={<TaskList />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/pomodoro" element={<Pomodoro />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/caderno-virtual" element={<CadernoVirtual />} />
                    <Route path="/study-room" element={<StudyRoom />} />
                    <Route path="/flashcards" element={<Flashcards />} />
                  </Route>

                  {/* Fallback Route */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </PomodoroProvider>
            </BoardProvider>
          </GoogleCalendarProvider>
        </FirestoreProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

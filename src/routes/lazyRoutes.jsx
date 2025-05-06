import { lazy } from 'react'

// Páginas públicas
export const Landing = lazy(() => import('../pages/Landing'))
export const Login = lazy(() => import('../pages/auth/Login'))
export const Signup = lazy(() => import('../pages/auth/Signup'))
export const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'))

// Páginas protegidas
export const Dashboard = lazy(() => import('../pages/Dashboard'))
export const Calendar = lazy(() => import('../pages/Calendar'))
export const Pomodoro = lazy(() => import('../pages/Pomodoro'))
export const Attendance = lazy(() => import('../pages/Attendance'))
export const CadernoVirtual = lazy(() => import('../pages/CadernoVirtual'))
export const StudyRoom = lazy(() => import('../pages/StudyRoom'))
export const Flashcards = lazy(() => import('../pages/Flashcards'))
export const GradeCalculator = lazy(() => import('../pages/GradeCalculator'))

// Componentes principais
export const TodoList = lazy(() => import('../components/todo/TodoList'))
export const RootLayout = lazy(() => import('../components/layout/RootLayout')) 
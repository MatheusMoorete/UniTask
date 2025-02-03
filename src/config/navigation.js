import { LayoutDashboard, ListTodo, Calendar, Timer, GraduationCap, Book, BookOpen, Brain } from 'lucide-react'

export const navigationItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: ListTodo, label: 'Lista de Tarefas', href: '/todo' },
  { icon: Calendar, label: 'Calendário', href: '/calendar' },
  { icon: Timer, label: 'Timer Pomodoro', href: '/pomodoro' },
  { icon: GraduationCap, label: 'Faltômetro', href: '/attendance' },
  { icon: Book, label: 'Caderno Virtual', href: '/caderno-virtual' },
  { icon: BookOpen, label: 'Sala de Estudos', href: '/study-room' },
  { icon: Brain, label: 'Flashcards', href: '/flashcards' }
] 
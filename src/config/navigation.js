import {
  LayoutDashboard,
  Calendar,
  Clock,
  GraduationCap,
  BookOpen,
  Brain,
  CheckSquare,
  CalendarRange
} from 'lucide-react'

export const navigationItems = [
  {
    title: null, // Seção principal sem título
    items: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/'
      }
    ]
  },
  {
    title: 'ORGANIZAÇÃO',
    items: [
      {
        label: 'Calendário',
        icon: CalendarRange,
        href: '/calendar'
      },
      {
        label: 'Tarefas',
        icon: CheckSquare,
        href: '/todo'
      },
      {
        label: 'Faltômetro',
        icon: Calendar,
        href: '/attendance'
      }
    ]
  },
  {
    title: 'PRODUTIVIDADE',
    items: [
      {
        label: 'Pomodoro',
        icon: Clock,
        href: '/pomodoro'
      },
      {
        label: 'Sala de Estudos',
        icon: GraduationCap,
        href: '/study-room'
      }
    ]
  },
  {
    title: 'MATERIAIS',
    items: [
      {
        label: 'Cadernos',
        icon: BookOpen,
        href: '/notebooks'
      },
      {
        label: 'Flashcards',
        icon: Brain,
        href: '/flashcards'
      }
    ]
  }
] 
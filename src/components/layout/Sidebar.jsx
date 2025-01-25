import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ListTodo, Calendar, Timer, GraduationCap, Book, BookOpen } from 'lucide-react'
import { cn } from '../../lib/utils'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: ListTodo, label: 'Lista de Tarefas', href: '/tasks' },
  { icon: Calendar, label: 'Calendário', href: '/calendar' },
  { icon: Timer, label: 'Timer Pomodoro', href: '/pomodoro' },
  { icon: GraduationCap, label: 'Faltômetro', href: '/attendance' },
  { icon: Book, label: 'Caderno Virtual', href: '/caderno-virtual' },
  { icon: BookOpen, label: 'Sala de Estudos', href: '/study-room' }
]

const Sidebar = ({ className }) => {
  const location = useLocation()
  console.log("Sidebar sendo renderizada, pathname:", location.pathname)
  console.log("Items do menu:", navItems)

  return (
    <div className={cn("pb-12 min-h-screen bg-card border-r", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mb-6 px-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-float">
              UniTask
            </h2>
            <p className="text-sm text-muted-foreground">
              Seu assistente acadêmico
            </p>
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href
              console.log(`Item ${item.label}: href=${item.href}, isActive=${isActive}`)
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 ease-in-out",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-accent/5 hover:text-accent",
                    "group relative overflow-hidden"
                  )}
                >
                  <div className="relative z-10 flex items-center gap-3">
                    <item.icon className={cn(
                      "h-4 w-4 transition-transform duration-300 ease-in-out",
                      isActive ? "text-primary" : "group-hover:text-accent",
                      "group-hover:scale-105"
                    )} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {isActive && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar 
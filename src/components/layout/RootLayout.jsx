import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'
import LogoutButton from '../auth/LogoutButton'
import {
  LayoutDashboard,
  ListTodo,
  Calendar as CalendarIcon,
  Timer,
  GraduationCap,
  User,
  Bell
} from 'lucide-react'
import { Button } from '../ui/button'

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Tarefas', to: '/tasks', icon: ListTodo },
  { name: 'Calendário', to: '/calendar', icon: CalendarIcon },
  { name: 'Pomodoro', to: '/pomodoro', icon: Timer },
  { name: 'Faltômetro', to: '/attendance', icon: GraduationCap },
]

export default function RootLayout() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 w-64 flex flex-col border-r bg-card z-50">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            UniTask
          </span>
        </div>
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out relative',
                  'hover:bg-muted/50 hover:text-foreground',
                  isActive 
                    ? 'text-primary bg-primary/5' 
                    : 'text-muted-foreground',
                  'group'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative z-10 flex items-center gap-2">
                    <item.icon className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      "group-hover:scale-110"
                    )} />
                    <span>{item.name}</span>
                  </div>
                  <div className={cn(
                    "absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full transition-transform duration-200",
                    "transform origin-left",
                    isActive ? "scale-y-100" : "scale-y-0"
                  )} />
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-lg bg-accent/10 px-3 py-2 card-hover">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20">
              <User className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1 truncate">
              <div className="text-sm font-medium">
                {user?.displayName || 'Usuário'}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {user?.email}
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>
      <main className="flex-1 ml-64">
        <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-6">
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              Bem-vindo, {user?.displayName?.split(' ')[0] || 'Usuário'}!
            </h1>
            <p className="text-sm text-muted-foreground">
              Organize seus estudos e alcance seus objetivos
            </p>
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-white">
              3
            </span>
          </Button>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
} 
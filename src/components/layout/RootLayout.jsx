import { useState } from 'react'
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
  Bell,
  Menu,
  X,
  Book
} from 'lucide-react'
import { Button } from '../ui/button'

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Tarefas', to: '/tasks', icon: ListTodo },
  { name: 'Calendário', to: '/calendar', icon: CalendarIcon },
  { name: 'Pomodoro', to: '/pomodoro', icon: Timer },
  { name: 'Faltômetro', to: '/attendance', icon: GraduationCap },
  { name: 'Caderno Virtual', to: '/caderno-virtual', icon: Book },
]

export default function RootLayout() {
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar para Desktop */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col border-r bg-card z-50">
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

      {/* Menu Mobile */}
      <div className={cn(
        "fixed inset-0 z-50 bg-background md:hidden transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between border-b px-6">
          <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            UniTask
          </span>
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="mt-4 px-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-accent/5 hover:text-accent'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <div className="flex items-center gap-3 rounded-lg bg-accent/10 px-3 py-2">
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
      </div>

      <main className="flex-1 md:ml-64">
        <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-6 w-6" />
          </Button>
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
        <div className="p-2 sm:p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
} 
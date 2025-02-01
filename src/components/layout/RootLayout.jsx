import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'
import { Menu, X } from 'lucide-react'
import { Button } from '../ui/button'
import { NotificationProvider } from '../../contexts/NotificationContext'
import { NotificationButton } from '../NotificationButton'
import { Toaster } from 'sonner'
import Sidebar from './Sidebar'
import { navigationItems } from '../../config/navigation'

export default function RootLayout() {
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <NotificationProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col" />

        {/* Menu Mobile */}
        <div className={cn(
          "fixed inset-0 z-50 bg-background md:hidden transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex h-16 items-center justify-between border-b px-6">
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              UniTask
            </span>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="mt-4 px-4 space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
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
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <main className="flex-1 md:ml-64">
          <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-6">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
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
            <NotificationButton />
          </div>
          <div className="p-2 sm:p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster richColors closeButton position="top-center" />
    </NotificationProvider>
  )
} 
import { Link, useLocation } from 'react-router-dom'
import { User } from 'lucide-react'
import { cn } from '../../lib/utils'
import { navigationItems } from '../../config/navigation'
import { useAuth } from '../../contexts/AuthContext'
import LogoutButton from '../auth/LogoutButton'

const Sidebar = ({ className }) => {
  const location = useLocation()
  const { user } = useAuth()

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
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href
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
  )
}

export default Sidebar 
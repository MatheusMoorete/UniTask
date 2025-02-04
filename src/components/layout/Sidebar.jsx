import { Link, useLocation } from 'react-router-dom'
import { User } from 'lucide-react'
import { cn } from '../../lib/utils'
import { navigationItems } from '../../config/navigation'
import { useAuth } from '../../contexts/AuthContext'
import LogoutButton from '../auth/LogoutButton'

const Sidebar = ({ className, isMobile, onNavigate }) => {
  const location = useLocation()
  const { user } = useAuth()

  return (
    <div className={cn(
      "pb-12 min-h-screen bg-card border-r",
      isMobile ? "w-full" : "w-64",
      className
    )}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className={cn(
            "mb-6 px-4",
            isMobile && "hidden"
          )}>
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
                  onClick={() => isMobile && onNavigate?.()}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 ease-in-out",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-accent/5 hover:text-accent",
                    "group relative overflow-hidden",
                    isMobile && "py-3"
                  )}
                >
                  <div className="relative z-10 flex items-center gap-3">
                    <item.icon className={cn(
                      "transition-transform duration-300 ease-in-out",
                      isActive ? "text-primary" : "group-hover:text-accent",
                      "group-hover:scale-105",
                      isMobile ? "h-5 w-5" : "h-4 w-4"
                    )} />
                    <span className={cn(
                      "font-medium",
                      isMobile && "text-base"
                    )}>{item.label}</span>
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
      <div className={cn(
        "border-t p-4",
        isMobile ? "relative mt-auto" : "absolute bottom-0 left-0 right-0"
      )}>
        <div className="flex items-center gap-3 rounded-lg bg-accent/10 px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20">
            <User className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 truncate">
            <div className={cn(
              "font-medium truncate",
              isMobile ? "text-base" : "text-sm"
            )}>
              {user?.displayName || 'Usuário'}
            </div>
            <div className={cn(
              "text-muted-foreground truncate",
              isMobile ? "text-sm" : "text-xs"
            )}>
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
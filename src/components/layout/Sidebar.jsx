import { useState, memo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { User, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { navigationItems } from '../../config/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { Tooltip } from '../ui/tooltip'
import LogoutButton from '../auth/LogoutButton'
import PropTypes from 'prop-types'

const NavigationItem = memo(({ item, isActive, isMobile, isCollapsed, onNavigate }) => {
  return (
    <Tooltip
      content={isCollapsed ? item.label : null}
      side="right"
      delayDuration={0}
    >
      <Link
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
        role="menuitem"
        aria-current={isActive ? "page" : undefined}
      >
        <div className="relative z-10 flex items-center gap-3">
          <item.icon className={cn(
            "transition-transform duration-300 ease-in-out",
            isActive ? "text-primary" : "group-hover:text-accent",
            "group-hover:scale-105",
            isMobile ? "h-5 w-5" : "h-4 w-4"
          )} />
          {!isCollapsed && (
            <span className={cn(
              "font-medium transition-opacity duration-300",
              isMobile && "text-base"
            )}>
              {item.label}
            </span>
          )}
        </div>
        {isActive && (
          <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full" />
        )}
      </Link>
    </Tooltip>
  )
})

const NavigationSection = memo(({ section, isCollapsed, isMobile, location, onNavigate }) => {
  return (
    <div className="space-y-0.5">
      {section.title && (
        <h4 className={cn(
          "px-4 py-1.5 text-xs font-semibold text-muted-foreground/70",
          isCollapsed && "opacity-0"
        )}>
          {section.title}
        </h4>
      )}
      {section.items.map((item) => (
        <NavigationItem
          key={item.href}
          item={item}
          isActive={location.pathname === item.href}
          isMobile={isMobile}
          isCollapsed={isCollapsed}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  )
})

NavigationItem.displayName = 'NavigationItem'
NavigationSection.displayName = 'NavigationSection'

const Sidebar = ({ className, isMobile, onClose }) => {
  const location = useLocation()
  const { user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn(
      "pb-12 min-h-screen bg-card border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className={cn(
            "mb-6 px-4 flex items-center justify-between",
            isMobile && "hidden"
          )}>
            {!isCollapsed && (
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-float">
                  UniTask
                </h2>
                <p className="text-sm text-muted-foreground">
                  Seu assistente acadêmico
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8"
              aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          <motion.div 
            className="space-y-4"
            role="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {navigationItems.map((section, index) => (
              <NavigationSection
                key={section.title || index}
                section={section}
                isCollapsed={isCollapsed}
                isMobile={isMobile}
                location={location}
                onNavigate={onClose}
              />
            ))}
          </motion.div>
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
          {!isCollapsed && (
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
          )}
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

NavigationSection.propTypes = {
  section: PropTypes.shape({
    title: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        icon: PropTypes.elementType.isRequired,
        href: PropTypes.string.isRequired
      })
    ).isRequired
  }).isRequired,
  isCollapsed: PropTypes.bool,
  isMobile: PropTypes.bool,
  location: PropTypes.object.isRequired,
  onNavigate: PropTypes.func
}

NavigationItem.propTypes = {
  item: PropTypes.shape({
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    href: PropTypes.string.isRequired
  }).isRequired,
  isActive: PropTypes.bool,
  isMobile: PropTypes.bool,
  isCollapsed: PropTypes.bool,
  onNavigate: PropTypes.func
}

Sidebar.propTypes = {
  className: PropTypes.string,
  isMobile: PropTypes.bool,
  onClose: PropTypes.func
}

export default Sidebar 
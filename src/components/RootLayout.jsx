import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useGoogleCalendar } from '../contexts/GoogleCalendarContext'

export function RootLayout() {
  const { user } = useAuth()
  const { isAuthenticated } = useGoogleCalendar()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* ... resto do código sem os console.log ... */}
    </div>
  )
} 
import { createContext, useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const TimeFilterContext = createContext(null)

const STORAGE_KEY = 'timeFilter'

export function TimeFilterProvider({ children }) {
  const [timeFilter, setTimeFilter] = useState(() => {
    const savedFilter = localStorage.getItem(STORAGE_KEY)
    return savedFilter || 'week' // 'week', 'month', 'semester'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, timeFilter)
  }, [timeFilter])

  const value = { timeFilter, setTimeFilter }

  return (
    <TimeFilterContext.Provider value={value}>
      {children}
    </TimeFilterContext.Provider>
  )
}

TimeFilterProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export function useTimeFilter() {
  const context = useContext(TimeFilterContext)
  if (context === null || context === undefined) {
    throw new Error('useTimeFilter must be used within a TimeFilterProvider')
  }
  return context
} 
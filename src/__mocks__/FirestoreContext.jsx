import { createContext, useContext } from 'react'
import PropTypes from 'prop-types'
import { vi } from 'vitest'

const FirestoreContext = createContext()

export function useFirestore() {
  const context = useContext(FirestoreContext)
  if (!context) {
    throw new Error('useFirestore must be used within a FirestoreProvider')
  }
  return context
}

export function FirestoreProvider({ children }) {
  const mockDb = {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
        update: vi.fn(),
        onSnapshot: vi.fn()
      }))
    }))
  }

  const value = {
    db: mockDb
  }

  return (
    <FirestoreContext.Provider value={value}>
      {children}
    </FirestoreContext.Provider>
  )
}

FirestoreProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export default FirestoreContext 
import { Suspense } from 'react'
import { TodoList } from './lazyRoutes'
import { LoadingSpinner } from '../components/ui/loading-spinner'

export const routes = [
  {
    path: '/todo',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <TodoList />
      </Suspense>
    )
  }
] 
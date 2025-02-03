import { TodoList } from '../components/todo/TodoList'
import { TaskBoard } from '../components/tasks/board'

export const routes = [
  {
    path: '/tasks',
    element: <TaskBoard />
  },
  {
    path: '/todo',
    element: <TodoList />
  }
] 
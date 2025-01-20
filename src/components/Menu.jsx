import { Book, Calendar, CheckSquare, Clock, House, UserList } from 'phosphor-react'
import { Link } from 'react-router-dom'

function Menu() {
  console.log("Menu component renderizado") // Log para debug
  
  return (
    <nav className="flex flex-col gap-4">
      <Link to="/" className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800">
        <House size={24} />
        <span>Dashboard</span>
      </Link>
      <Link to="/tasks" className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800">
        <CheckSquare size={24} />
        <span>Tarefas</span>
      </Link>
      <Link to="/calendar" className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800">
        <Calendar size={24} />
        <span>Calendário</span>
      </Link>
      <Link to="/pomodoro" className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800">
        <Clock size={24} />
        <span>Pomodoro</span>
      </Link>
      <Link to="/attendance" className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800">
        <UserList size={24} />
        <span>Faltômetro</span>
      </Link>
      <Link to="/caderno-virtual" className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800">
        <Book size={24} />
        <span>Caderno Virtual</span>
      </Link>
    </nav>
  )
}

export default Menu 
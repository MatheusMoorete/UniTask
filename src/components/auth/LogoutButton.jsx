import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Falha ao fazer logout:', error)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLogout}
      title="Sair"
      className="h-8 w-8 rounded-full"
    >
      <LogOut className="h-4 w-4" />
    </Button>
  )
} 
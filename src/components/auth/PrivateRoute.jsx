import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  console.log("PrivateRoute - user:", user?.uid, "loading:", loading)

  if (loading) {
    console.log("PrivateRoute - Carregando...")
    return <div>Carregando...</div>
  }

  if (!user) {
    console.log("PrivateRoute - Usuário não autenticado, redirecionando...")
    return <Navigate to="/login" />
  }

  console.log("PrivateRoute - Renderizando conteúdo protegido")
  return children
}

export default PrivateRoute 
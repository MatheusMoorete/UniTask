import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Loading } from '../ui/loading'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  console.log("PrivateRoute - user:", user?.uid, "loading:", loading)

  if (loading) {
    console.log("PrivateRoute - Carregando...")
    return <Loading fullScreen message="Verificando autenticação..." />
  }

  if (!user) {
    console.log("PrivateRoute - Usuário não autenticado, redirecionando...")
    return <Navigate to="/login" replace />
  }

  console.log("PrivateRoute - Renderizando conteúdo protegido")
  return children
}

PrivateRoute.displayName = 'PrivateRoute'

export default PrivateRoute
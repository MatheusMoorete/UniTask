import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  console.log("PrivateRoute - user:", user?.uid, "loading:", loading)

  if (loading) {
    console.log("PrivateRoute - Carregando...")
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!user) {
    console.log("PrivateRoute - Usuário não autenticado, redirecionando...")
    return <Navigate to="/login" replace />
  }

  console.log("PrivateRoute - Renderizando conteúdo protegido")
  return children
}

export default PrivateRoute
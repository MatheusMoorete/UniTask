import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { LogIn, GraduationCap, Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { GoogleIcon } from '../../components/ui/google-icon'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setError('')
      setLoading(true)
      await login(email, password)
      navigate('/dashboard')
    } catch (error) {
      setError('Falha ao fazer login. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    try {
      setError('')
      setLoading(true)
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (error) {
      setError('Falha ao fazer login com Google.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      {/* Left Side - Hero/Branding */}
      <div className="hidden sm:flex sm:w-1/2 lg:w-2/3 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="relative max-w-2xl text-white space-y-8">
          <GraduationCap className="h-16 w-16 text-white/90" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            Bem-vindo ao UniTask
          </h1>
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
            Organize seus estudos, acompanhe seu progresso e alcance seus objetivos acadêmicos.
          </p>

        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full sm:w-1/2 lg:w-1/3 flex items-center justify-center p-4 sm:p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo - Only visible on small screens */}
          <div className="flex flex-col items-center gap-4 sm:hidden mb-8">
            <GraduationCap className="h-16 w-16 text-blue-500" />
            <h1 className="text-3xl font-bold text-center">UniTask</h1>
          </div>

          <div className="space-y-4 text-center sm:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Entrar</h2>
            <p className="text-base text-muted-foreground">
              Entre com seu e-mail e senha para acessar sua conta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    to="/reset-password"
                    className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base bg-blue-500 hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Entrar
                </>
              )}
            </Button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-4 text-muted-foreground">
                  ou continue com
                </span>
              </div>
            </div>

            <Button 
              type="button"
              variant="outline" 
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 text-base"
            >
              <GoogleIcon className="mr-2" />
              Google
            </Button>

            <p className="text-center text-base text-muted-foreground mt-8">
              Não tem uma conta?{' '}
              <Link to="/signup" className="text-blue-500 hover:text-blue-600 hover:underline font-medium">
                Criar conta
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
} 
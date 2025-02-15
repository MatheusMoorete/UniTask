import { Component } from 'react'
import PropTypes from 'prop-types'
import { AlertTriangle } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Log para serviço de monitoramento (se existir)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implementar log para serviço de monitoramento
    }
  }

  render() {
    if (this.state.hasError) {
      const isChunkError = this.state.error?.message?.includes('Loading chunk') || 
                          this.state.error?.message?.includes('Loading CSS chunk') ||
                          this.state.error?.message?.includes('Failed to fetch dynamically imported module')

      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full p-6 text-center">
            <div className="mb-6 flex justify-center">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-destructive mb-4">
              {isChunkError ? 'Erro de Carregamento' : 'Oops! Algo deu errado'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {isChunkError 
                ? 'Houve um problema ao carregar alguns recursos. Isso pode acontecer devido a uma conexão instável ou uma atualização recente.'
                : 'Ocorreu um erro inesperado. Por favor, tente recarregar a página.'}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className={cn(
                "text-sm text-left bg-muted p-4 rounded-md overflow-auto mb-6",
                "max-h-[200px] scrollbar-thin scrollbar-thumb-border scrollbar-track-muted"
              )}>
                <code className="text-xs">
                  {this.state.error.toString()}
                </code>
              </pre>
            )}
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Tentar Novamente
              </Button>
              <Button
                variant="default"
                onClick={() => window.location.reload()}
              >
                Recarregar Página
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
}

export default ErrorBoundary
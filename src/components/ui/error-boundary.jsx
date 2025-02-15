import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './button'
import PropTypes from 'prop-types'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Ops! Algo deu errado
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Desculpe, ocorreu um erro inesperado. Nossa equipe foi notificada e 
              está trabalhando na solução.
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Recarregar Página
              </Button>
              <Button 
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                }}
              >
                Tentar Novamente
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
  children: PropTypes.node.isRequired
} 
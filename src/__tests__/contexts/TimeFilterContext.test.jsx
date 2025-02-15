import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { TimeFilterProvider, useTimeFilter } from '../../contexts/TimeFilterContext'

// Mock do localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

// Componente de teste para usar o hook
const TestComponent = () => {
  const { timeFilter, setTimeFilter } = useTimeFilter()
  return (
    <div>
      <span data-testid="current-filter">{timeFilter}</span>
      <button onClick={() => setTimeFilter('week')}>Semana</button>
      <button onClick={() => setTimeFilter('month')}>Mês</button>
      <button onClick={() => setTimeFilter('semester')}>Semestre</button>
    </div>
  )
}

describe('TimeFilterContext', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    localStorageMock.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const renderWithProvider = (Component) => {
    return render(
      <TimeFilterProvider>
        {Component}
      </TimeFilterProvider>
    )
  }

  describe('TimeFilterProvider', () => {
    it('deve renderizar children corretamente', () => {
      renderWithProvider(<div data-testid="test-child">Test Child</div>)
      expect(screen.getByTestId('test-child')).toBeInTheDocument()
    })

    it('deve inicializar com o filtro padrão (week)', () => {
      renderWithProvider(<TestComponent />)
      expect(screen.getByTestId('current-filter')).toHaveTextContent('week')
    })
  })

  describe('useTimeFilter', () => {
    it('deve permitir mudar o filtro para mês', () => {
      renderWithProvider(<TestComponent />)
      
      fireEvent.click(screen.getByText('Mês'))
      expect(screen.getByTestId('current-filter')).toHaveTextContent('month')
    })

    it('deve permitir mudar o filtro para semestre', () => {
      renderWithProvider(<TestComponent />)
      
      fireEvent.click(screen.getByText('Semestre'))
      expect(screen.getByTestId('current-filter')).toHaveTextContent('semester')
    })

    it('deve permitir voltar para o filtro de semana', () => {
      renderWithProvider(<TestComponent />)
      
      // Muda para mês primeiro
      fireEvent.click(screen.getByText('Mês'))
      // Depois volta para semana
      fireEvent.click(screen.getByText('Semana'))
      
      expect(screen.getByTestId('current-filter')).toHaveTextContent('week')
    })

    it('deve lançar erro se usado fora do Provider', () => {
      const consoleSpy = vi.spyOn(console, 'error')
      consoleSpy.mockImplementation(() => {})

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useTimeFilter must be used within a TimeFilterProvider')

      consoleSpy.mockRestore()
    })
  })

  describe('Persistência', () => {
    it('deve persistir o filtro selecionado no localStorage', () => {
      renderWithProvider(<TestComponent />)
      
      fireEvent.click(screen.getByText('Mês'))
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('timeFilter', 'month')
    })

    it('deve recuperar o filtro do localStorage ao inicializar', () => {
      localStorageMock.getItem.mockReturnValue('semester')
      
      renderWithProvider(<TestComponent />)
      
      expect(screen.getByTestId('current-filter')).toHaveTextContent('semester')
    })

    it('deve usar o valor padrão se não houver filtro no localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      renderWithProvider(<TestComponent />)
      
      expect(screen.getByTestId('current-filter')).toHaveTextContent('week')
    })
  })
}) 
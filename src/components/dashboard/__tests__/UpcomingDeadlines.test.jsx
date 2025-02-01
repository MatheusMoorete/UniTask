import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import UpcomingDeadlines from '../UpcomingDeadlines'

describe('UpcomingDeadlines', () => {
  const mockEvents = [
    {
      id: '1',
      summary: 'Prova de Matemática',
      start: {
        dateTime: '2024-02-15T10:00:00',
      },
      calendarColor: '#4285f4',
      calendarSummary: 'Faculdade'
    },
    {
      id: '2',
      summary: 'Entrega do Trabalho',
      start: {
        dateTime: '2024-02-16T14:00:00',
      },
      calendarColor: '#34a853',
      calendarSummary: 'Estudos'
    }
  ]

  it('deve renderizar o título corretamente', () => {
    render(<UpcomingDeadlines events={[]} />)
    expect(screen.getByText('Prazos Próximos')).toBeInTheDocument()
  })

  it('deve mostrar mensagem quando não há eventos', () => {
    render(<UpcomingDeadlines events={[]} />)
    expect(screen.getByText('Nenhum prazo próximo encontrado')).toBeInTheDocument()
  })

  it('deve renderizar a lista de eventos corretamente', () => {
    render(<UpcomingDeadlines events={mockEvents} />)
    
    // Verifica se os títulos dos eventos estão presentes
    expect(screen.getByText('Prova de Matemática')).toBeInTheDocument()
    expect(screen.getByText('Entrega do Trabalho')).toBeInTheDocument()

    // Verifica se os nomes dos calendários estão presentes
    expect(screen.getByText(/Faculdade/)).toBeInTheDocument()
    expect(screen.getByText(/Estudos/)).toBeInTheDocument()
  })

  it('deve aplicar cores de fundo aos eventos', () => {
    render(<UpcomingDeadlines events={mockEvents} />)
    
    const eventElements = screen.getAllByRole('generic').filter(
      element => element.style.backgroundColor !== ''
    )
    
    expect(eventElements[0]).toHaveStyle({ backgroundColor: '#4285f4' })
    expect(eventElements[1]).toHaveStyle({ backgroundColor: '#34a853' })
  })

  it('deve usar cor de texto apropriada baseada na cor de fundo', () => {
    render(<UpcomingDeadlines events={mockEvents} />)
    
    const eventTexts = screen.getAllByText(/Prova de Matemática|Entrega do Trabalho/)
    eventTexts.forEach(text => {
      expect(text).toHaveClass(/text-white|text-foreground/)
    })
  })
}) 
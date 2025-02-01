import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SubjectCard from '../SubjectCard'

describe('SubjectCard', () => {
  const mockSubject = {
    name: 'Matemática',
    totalHours: 60,
    totalClasses: 30,
    maxAbsencePercentage: 25,
    absences: 0
  }

  const mockOnUpdate = vi.fn()
  const mockOnDelete = vi.fn()

  it('deve renderizar as informações da matéria corretamente', () => {
    render(
      <SubjectCard
        subject={mockSubject}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('Matemática')).toBeInTheDocument()
    expect(screen.getByText('60h • 30 aulas')).toBeInTheDocument()
    expect(screen.getByText('Faltas: 0 de 7 permitidas')).toBeInTheDocument()
  })

  it('deve adicionar uma falta quando o botão de adicionar é clicado', () => {
    render(
      <SubjectCard
        subject={mockSubject}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    const addButton = screen.getByText(/adicionar falta/i)
    fireEvent.click(addButton)

    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockSubject,
      absences: 1
    })
    expect(screen.getByText('Faltas: 1 de 7 permitidas')).toBeInTheDocument()
  })

  it('deve remover uma falta quando o botão de remover é clicado', () => {
    const subjectWithAbsence = { ...mockSubject, absences: 1 }
    
    render(
      <SubjectCard
        subject={subjectWithAbsence}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    const removeButton = screen.getByText(/remover falta/i)
    fireEvent.click(removeButton)

    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...subjectWithAbsence,
      absences: 0
    })
    expect(screen.getByText('Faltas: 0 de 7 permitidas')).toBeInTheDocument()
  })

  it('deve desabilitar o botão de remover quando não há faltas', () => {
    render(
      <SubjectCard
        subject={mockSubject}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    const removeButton = screen.getByText(/remover falta/i)
    expect(removeButton).toBeDisabled()
  })

  it('deve desabilitar o botão de adicionar quando atingir o limite de faltas', () => {
    const subjectWithMaxAbsences = {
      ...mockSubject,
      absences: 7 // Limite máximo de faltas (25% de 30 aulas)
    }

    render(
      <SubjectCard
        subject={subjectWithMaxAbsences}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    const addButton = screen.getByText(/adicionar falta/i)
    expect(addButton).toBeDisabled()
  })

  it('deve mostrar alerta quando o percentual de faltas for alto', () => {
    const subjectWithHighAbsences = {
      ...mockSubject,
      absences: 6 // Mais de 70% do limite
    }

    render(
      <SubjectCard
        subject={subjectWithHighAbsences}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    const alertIcon = screen.getByLabelText('Alerta de faltas')
    expect(alertIcon).toBeInTheDocument()
    expect(alertIcon).toHaveClass('text-destructive')
  })
}) 
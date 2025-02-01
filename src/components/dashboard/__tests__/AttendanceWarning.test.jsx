import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AttendanceWarning } from '../AttendanceWarning'
import { useSubjects } from '../../../hooks/useSubjects'
import * as router from 'react-router-dom'

// Mock dos hooks
vi.mock('react-router-dom')
vi.mock('../../../hooks/useSubjects')

describe('AttendanceWarning', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockNavigate)
  })

  it('deve mostrar mensagem quando não há matérias', () => {
    useSubjects.mockReturnValue({ subjects: [] })
    render(<AttendanceWarning />)
    expect(screen.getByText('Nenhuma matéria cadastrada')).toBeInTheDocument()
  })

  it('deve mostrar matérias em risco de reprovação', () => {
    const mockSubjects = [{
      id: '1',
      name: 'Matemática',
      type1: { absences: 15 },
      maxAbsences: { type1: 20 },
      hasMultipleTypes: false
    }]

    useSubjects.mockReturnValue({ subjects: mockSubjects })
    render(<AttendanceWarning />)

    expect(screen.getByText('Matemática')).toBeInTheDocument()
    expect(screen.getByText('15/20 faltas')).toBeInTheDocument()
    expect(screen.getByText('Risco de reprovação por faltas!')).toBeInTheDocument()
  })

  it('deve mostrar aviso de atenção para faltas moderadas', () => {
    const mockSubjects = [{
      id: '1',
      name: 'Física',
      type1: { absences: 10 },
      maxAbsences: { type1: 20 },
      hasMultipleTypes: false
    }]

    useSubjects.mockReturnValue({ subjects: mockSubjects })
    render(<AttendanceWarning />)

    expect(screen.getByText('Física')).toBeInTheDocument()
    expect(screen.getByText('10/20 faltas')).toBeInTheDocument()
    expect(screen.getByText('Atenção ao número de faltas!')).toBeInTheDocument()
  })

  it('deve lidar com matérias com múltiplos tipos de aula', () => {
    const mockSubjects = [{
      id: '1',
      name: 'Química',
      type1: { absences: 5 },
      type2: { absences: 3 },
      maxAbsences: { type1: 10, type2: 5 },
      hasMultipleTypes: true
    }]

    useSubjects.mockReturnValue({ subjects: mockSubjects })
    render(<AttendanceWarning />)

    expect(screen.getByText('Química')).toBeInTheDocument()
    expect(screen.getByText('8/15 faltas')).toBeInTheDocument()
  })

  it('deve navegar para a página de frequência ao clicar', () => {
    useSubjects.mockReturnValue({ subjects: [] })
    render(<AttendanceWarning />)

    const card = screen.getByText('Controle de Faltas').closest('div.rounded-lg')
    fireEvent.click(card)

    expect(mockNavigate).toHaveBeenCalledWith('/attendance')
  })

  it('deve mostrar contador de matérias adicionais', () => {
    const mockSubjects = Array(5).fill(null).map((_, i) => ({
      id: String(i),
      name: `Matéria ${i}`,
      type1: { absences: 15 },
      maxAbsences: { type1: 20 },
      hasMultipleTypes: false
    }))

    useSubjects.mockReturnValue({ subjects: mockSubjects })
    render(<AttendanceWarning />)

    expect(screen.getByText('+ outras matérias')).toBeInTheDocument()
    expect(screen.getByText('+3 matérias em risco')).toBeInTheDocument()
  })
}) 
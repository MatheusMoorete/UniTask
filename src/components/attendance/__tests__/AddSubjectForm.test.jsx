import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddSubjectForm from '../AddSubjectForm'

describe('AddSubjectForm', () => {
  const mockOnAdd = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar o formulário corretamente', () => {
    render(<AddSubjectForm onAdd={mockOnAdd} onClose={mockOnClose} />)

    expect(screen.getByText('Adicionar Matéria')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome da Matéria')).toBeInTheDocument()
    expect(screen.getByLabelText('Carga Horária Total')).toBeInTheDocument()
    expect(screen.getByLabelText('Número Total de Aulas')).toBeInTheDocument()
    expect(screen.getByLabelText(/porcentagem máxima de faltas/i)).toBeInTheDocument()
  })

  it('deve preencher e submeter o formulário corretamente', async () => {
    const user = userEvent.setup()
    render(<AddSubjectForm onAdd={mockOnAdd} onClose={mockOnClose} />)

    await act(async () => {
      // Preenche os campos
      await user.type(screen.getByLabelText('Nome da Matéria'), 'Matemática')
      await user.type(screen.getByLabelText('Carga Horária Total'), '60')
      await user.type(screen.getByLabelText('Número Total de Aulas'), '30')
      
      // O campo de porcentagem já vem preenchido com 25%

      // Submete o formulário
      const submitButton = screen.getByRole('button', { name: /adicionar/i })
      await user.click(submitButton)
    })

    // Verifica se a função onAdd foi chamada com os dados corretos
    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith({
        name: 'Matemática',
        totalHours: 60,
        totalClasses: 30,
        maxAbsencePercentage: 25,
        absences: 0
      })
    })

    // Verifica se o formulário foi fechado
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('deve validar campos obrigatórios', async () => {
    const user = userEvent.setup()
    render(<AddSubjectForm onAdd={mockOnAdd} onClose={mockOnClose} />)

    await act(async () => {
      // Tenta submeter o formulário sem preencher os campos
      const submitButton = screen.getByRole('button', { name: /adicionar/i })
      await user.click(submitButton)
    })

    // Verifica se onAdd não foi chamada
    expect(mockOnAdd).not.toHaveBeenCalled()

    // Verifica as mensagens de validação do navegador
    const nameInput = screen.getByLabelText('Nome da Matéria')
    expect(nameInput).toBeInvalid()
  })

  it('deve fechar o formulário ao clicar em cancelar', async () => {
    const user = userEvent.setup()
    render(<AddSubjectForm onAdd={mockOnAdd} onClose={mockOnClose} />)

    await act(async () => {
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await user.click(cancelButton)
    })

    expect(mockOnClose).toHaveBeenCalled()
    expect(mockOnAdd).not.toHaveBeenCalled()
  })

  it('deve validar valores numéricos mínimos', async () => {
    const user = userEvent.setup()
    render(<AddSubjectForm onAdd={mockOnAdd} onClose={mockOnClose} />)

    await act(async () => {
      // Tenta inserir valores inválidos
      await user.type(screen.getByLabelText('Carga Horária Total'), '-1')
      await user.type(screen.getByLabelText('Número Total de Aulas'), '0')
      await user.type(screen.getByLabelText(/porcentagem máxima de faltas/i), '-10')

      const submitButton = screen.getByRole('button', { name: /adicionar/i })
      await user.click(submitButton)
    })

    expect(mockOnAdd).not.toHaveBeenCalled()
  })

  it('deve converter valores para números ao submeter', async () => {
    const user = userEvent.setup()
    render(<AddSubjectForm onAdd={mockOnAdd} onClose={mockOnClose} />)

    await act(async () => {
      // Preenche os campos
      await user.type(screen.getByLabelText('Nome da Matéria'), 'Física')
      await user.clear(screen.getByLabelText('Carga Horária Total'))
      await user.type(screen.getByLabelText('Carga Horária Total'), '40')
      await user.clear(screen.getByLabelText('Número Total de Aulas'))
      await user.type(screen.getByLabelText('Número Total de Aulas'), '20')
      await user.clear(screen.getByLabelText(/porcentagem máxima de faltas/i))
      await user.type(screen.getByLabelText(/porcentagem máxima de faltas/i), '30')

      // Submete o formulário
      const submitButton = screen.getByRole('button', { name: /adicionar/i })
      await user.click(submitButton)
    })

    // Aguarda a atualização do estado
    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith({
        name: 'Física',
        totalHours: 40,
        totalClasses: 20,
        maxAbsencePercentage: 30,
        absences: 0
      })
    })
  })
}) 
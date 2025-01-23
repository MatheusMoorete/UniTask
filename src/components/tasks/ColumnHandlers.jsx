export function useColumnHandlers({ addColumn, updateColumn, deleteColumn, setError }) {
  const handleAddColumn = async (title) => {
    if (title.length > 20) {
      setError('O título da coluna não pode ter mais de 20 caracteres')
      return
    }
    try {
      await addColumn(title)
    } catch (error) {
      console.error('Erro ao adicionar coluna:', error)
      setError('Houve um erro ao adicionar a coluna. Tente novamente.')
    }
  }

  const handleDeleteColumn = async (columnId) => {
    try {
      await deleteColumn(columnId)
    } catch (error) {
      console.error('Erro ao deletar coluna:', error)
      setError?.('Houve um erro ao deletar a coluna. Tente novamente.')
    }
  }

  const handleUpdateColumn = async (columnId, title) => {
    if (title.length > 20) {
      setError('O título da coluna não pode ter mais de 20 caracteres')
      return
    }
    try {
      await updateColumn(columnId, { title })
    } catch (error) {
      console.error('Erro ao atualizar coluna:', error)
      setError('Houve um erro ao atualizar a coluna. Tente novamente.')
    }
  }

  return {
    handleAddColumn,
    handleDeleteColumn,
    handleUpdateColumn
  }
} 
import { useState } from 'react'

export function useTaskForm({ 
  addTask, 
  updateTask, 
  deleteTask, 
  addTag,
  setError,
  columnId
}) {
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    moreInfo: '',
    tags: [],
    columnId: columnId || null
  })
  const [editingTask, setEditingTask] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError?.(null)

    if (!newTask?.title?.trim()) {
      setError?.('O título da tarefa é obrigatório')
      return
    }

    if (!newTask?.tags?.length) {
      setError?.('Adicione pelo menos uma tag à tarefa')
      return
    }

    if (!newTask?.columnId) {
      setError?.('Selecione uma coluna para a tarefa')
      return
    }

    try {
      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description?.trim() || '',
        moreInfo: newTask.moreInfo?.trim() || '',
        tags: newTask.tags || [],
        columnId: newTask.columnId
      }

      if (editingTask) {
        await updateTask(editingTask.id, taskData)
        setEditingTask(null)
      } else {
        await addTask(taskData)
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
      setError?.('Houve um erro ao salvar a tarefa. Tente novamente.')
    }
  }

  const handleEdit = async (taskId, updates) => {
    try {
      await updateTask(taskId, updates)
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
      setError?.('Houve um erro ao atualizar a tarefa. Tente novamente.')
    }
  }

  const handleDelete = async (taskId) => {
    setError?.(null)
    try {
      await deleteTask(taskId)
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error)
      setError?.(error.message)
    }
  }

  const handleCreateTag = async (tagName, color) => {
    try {
      const newTag = await addTag(tagName, color)
      if (newTag) {
        setNewTask(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }))
        return newTag
      }
    } catch (error) {
      console.error('Erro ao criar tag:', error)
      throw error
    }
  }

  const resetForm = () => {
    setNewTask({ 
      title: '', 
      description: '', 
      moreInfo: '', 
      tags: [],
      columnId: columnId || null
    })
    setEditingTask(null)
  }

  return {
    newTask,
    setNewTask,
    editingTask,
    setEditingTask,
    isDialogOpen,
    setIsDialogOpen,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleCreateTag,
    resetForm
  }
} 
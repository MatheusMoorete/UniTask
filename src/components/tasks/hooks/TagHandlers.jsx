import { useState } from 'react'

export function useTagHandlers({ 
  newTask, 
  setNewTask, 
  updateTask, 
  deleteTag, 
  setError,
  tasks,
  setTagToDelete
}) {
  const handleTagSelect = (tag) => {
    setNewTask(prev => {
      // Se a tag já existe, remove ela
      if (prev.tags?.some(t => t.id === tag.id)) {
        return {
          ...prev,
          tags: prev.tags.filter(t => t.id !== tag.id)
        }
      }
      // Se não existe, adiciona ela
      return {
        ...prev,
        tags: [...(prev.tags || []), tag]
      }
    })
  }

  const handleRemoveTag = (tagToRemove) => {
    setNewTask(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag.id !== tagToRemove.id) || []
    }))
  }

  const handleDeleteTag = async (tag) => {
    try {
      const updatedTasks = tasks.map(task => ({
        ...task,
        tags: task.tags.filter(t => t.id !== tag.id)
      }))
      
      // Update tasks
      await Promise.all(updatedTasks.map(task => updateTask(task.id, task)))

      // Remove tag from tags list
      await deleteTag(tag.id)
      setTagToDelete(null)
    } catch (error) {
      console.error('Erro ao deletar tag:', error)
      setError('Houve um erro ao deletar a tag. Tente novamente.')
    }
  }

  return {
    handleTagSelect,
    handleRemoveTag,
    handleDeleteTag
  }
} 
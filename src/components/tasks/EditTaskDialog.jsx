import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { X } from "lucide-react"
import { useTaskBoard } from "../../contexts/BoardContext"

// Função auxiliar para garantir que o valor seja uma string
const getTagName = (tag) => {
  if (typeof tag === 'string') return tag
  if (typeof tag.name === 'string') return tag.name
  return ''
}

export function EditTaskDialog({ task, open, onOpenChange, onEdit }) {
  const { tags = [] } = useTaskBoard()
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description || '',
    moreInfo: task.moreInfo || '',
    tags: task.tags || []
  })
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (!editedTask.title.trim()) {
        setError('O título é obrigatório')
        return
      }

      await onEdit(task.id, editedTask)
      onOpenChange(false)
      setError(null)
    } catch (error) {
      setError('Ocorreu um erro ao salvar as alterações. Tente novamente.')
    }
  }

  const handleTagSelect = (tag) => {
    if (!editedTask.tags.some(t => t.id === tag.id)) {
      setEditedTask(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const handleRemoveTag = (tagId) => {
    setEditedTask(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t.id !== tagId)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da tarefa abaixo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={editedTask.title}
                onChange={(e) => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Digite o título da tarefa"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={editedTask.description}
                onChange={(e) => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Digite a descrição da tarefa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moreInfo">Mais Informações</Label>
              <textarea
                id="moreInfo"
                value={editedTask.moreInfo}
                onChange={(e) => setEditedTask(prev => ({ ...prev, moreInfo: e.target.value }))}
                placeholder="Adicione informações adicionais sobre a tarefa"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {editedTask.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                    style={{ backgroundColor: tag.color }}
                  >
                    {getTagName(tag)}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag.id)}
                      className="ml-1 rounded-full hover:bg-background/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(tags || []).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="cursor-pointer"
                    style={{ 
                      borderColor: tag.color,
                      color: tag.color,
                      backgroundColor: editedTask.tags.some(t => t.id === tag.id) ? tag.color : 'transparent',
                    }}
                    onClick={() => handleTagSelect(tag)}
                  >
                    {getTagName(tag)}
                  </Badge>
                ))}
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
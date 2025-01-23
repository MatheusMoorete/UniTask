import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { useEffect, useState } from "react"
import { cn } from "../../lib/utils"

export function TaskDialog({ 
  isOpen, 
  onOpenChange, 
  task, 
  editingTask,
  onSubmit,
  onChange,
  tags,
  onTagSelect,
  error,
  resetForm
}) {
  const isEditing = !!editingTask
  const [tagError, setTagError] = useState(false)

  useEffect(() => {
    if (editingTask && isOpen) {
      onChange({
        title: editingTask.title || '',
        description: editingTask.description || '',
        moreInfo: editingTask.moreInfo || '',
        tags: editingTask.tags || [],
        columnId: editingTask.columnId
      })
    }
  }, [editingTask, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!task.tags?.length) {
      setTagError(true)
      return
    }
    setTagError(false)
    onSubmit(e)
  }

  useEffect(() => {
    if (task.tags?.length) {
      setTagError(false)
    }
  }, [task.tags])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm?.()
        setTagError(false)
      }
      onOpenChange(open)
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para {isEditing ? 'editar a' : 'criar uma nova'} tarefa
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={task.title}
                onChange={(e) => onChange({ ...task, title: e.target.value })}
                placeholder="Digite o título da tarefa"
                maxLength={20}
                required
              />
              <p className="text-xs text-muted-foreground">
                {task.title?.length || 0}/20 caracteres
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={task.description}
                onChange={(e) => onChange({ ...task, description: e.target.value })}
                placeholder="Digite a descrição da tarefa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moreInfo">Mais Informações</Label>
              <textarea
                id="moreInfo"
                value={task.moreInfo}
                onChange={(e) => onChange({ ...task, moreInfo: e.target.value })}
                placeholder="Adicione informações adicionais sobre a tarefa"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Tags
                <span className="text-sm text-muted-foreground">
                  (obrigatório)
                </span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-colors",
                      task.tags?.some(t => t.id === tag.id) && "bg-primary text-primary-foreground",
                      "hover:bg-accent",
                      tagError && "ring-2 ring-red-500"
                    )}
                    style={{
                      backgroundColor: task.tags?.some(t => t.id === tag.id) ? tag.color : 'transparent',
                      borderColor: tag.color,
                      color: task.tags?.some(t => t.id === tag.id) ? '#fff' : 'inherit'
                    }}
                    onClick={() => onTagSelect(tag)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
              {tagError && (
                <p className="text-sm text-red-500 mt-1">
                  Por favor, selecione pelo menos uma tag para a tarefa
                </p>
              )}
            </div>
            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">
              {isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
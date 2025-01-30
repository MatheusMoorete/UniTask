import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { useEffect, useState } from "react"
import { cn } from "../../lib/utils"
import { Plus, Settings, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

const tagColors = [
  // Vermelhos
  '#ef4444', '#dc2626', '#b91c1c', '#f87171',
  // Laranjas/Âmbar
  '#f97316', '#fb923c', '#f59e0b', '#fbbf24',
  // Verdes
  '#22c55e', '#16a34a', '#84cc16', '#4ade80',
  // Azuis
  '#0ea5e9', '#2563eb', '#1d4ed8', '#60a5fa',
  // Roxos/Rosas
  '#a855f7', '#9333ea', '#ec4899', '#f472b6',
  // Neutros
  '#64748b', '#475569', '#6b7280', '#94a3b8',
]

function CreateTagDialog({ isOpen, onOpenChange, onCreateTag }) {
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(tagColors[0])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await onCreateTag(newTagName.trim(), selectedColor)
      setNewTagName('')
      setSelectedColor(tagColors[0])
      onOpenChange(false)
    } catch (error) {
      // O erro será tratado pelo componente pai
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Tag</DialogTitle>
          <DialogDescription>
            Crie uma nova tag para organizar suas tarefas
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome da Tag</Label>
            <Input
              placeholder="Digite o nome da tag"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">
              {newTagName.length}/20 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label>Cor da Tag</Label>
            <div className="grid grid-cols-8 gap-2">
              {tagColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-all hover:scale-110",
                    selectedColor === color ? "ring-2 ring-offset-2 ring-ring" : ""
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!newTagName.trim()}
            >
              Criar Tag
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function TaskDialog({ 
  isOpen, 
  onOpenChange, 
  task, 
  editingTask,
  onSubmit,
  onChange,
  tags,
  onTagSelect,
  onTagCreate,
  setTagToDelete,
  error,
  resetForm
}) {
  const isEditing = !!editingTask
  const [newTagName, setNewTagName] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)
  const [tagError, setTagError] = useState('')
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false)

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
      setTagError('Por favor, selecione pelo menos uma tag para a tarefa')
      return
    }
    setTagError('')
    onSubmit(e)
  }

  useEffect(() => {
    if (task.tags?.length) {
      setTagError('')
    }
  }, [task.tags])

  const handleCreateTag = async (e) => {
    e.preventDefault()
    if (!newTagName.trim()) {
      setTagError('Digite um nome para a tag')
      return
    }
    try {
      await onTagCreate(newTagName.trim(), selectedColor)
      setNewTagName('')
      setShowTagInput(false)
      setTagError('')
    } catch (error) {
      setTagError('Erro ao criar tag')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm?.()
        setTagError('')
        setShowTagInput(false)
        setNewTagName('')
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
              <Label className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  Tags
                  <span className="text-sm text-muted-foreground">
                    (obrigatório)
                  </span>
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Gerenciar Tags
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsCreateTagOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Tag
                    </DropdownMenuItem>
                    {tags.map((tag) => (
                      <DropdownMenuItem
                        key={tag.id}
                        className="flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setTagToDelete(tag)
                          }}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </Label>

              {showTagInput && (
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Nome da nova tag"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateTag}
                  >
                    Criar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowTagInput(false)
                      setNewTagName('')
                      setTagError('')
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
              {tagError && (
                <p className="text-sm text-red-500 mt-1">
                  {tagError}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-colors",
                      task.tags?.some(t => t.id === tag.id) && "bg-primary text-primary-foreground",
                      "hover:bg-accent"
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

      <CreateTagDialog
        isOpen={isCreateTagOpen}
        onOpenChange={setIsCreateTagOpen}
        onCreateTag={onTagCreate}
      />
    </Dialog>
  )
} 
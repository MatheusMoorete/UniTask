import { useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useTags } from '../hooks/useTags'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Checkbox } from '../components/ui/checkbox'
import { Badge } from '../components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog'
import { Plus, Trash2, Pencil, Loader2, Tag, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// Cores predefinidas para tags
const tagColors = [
  '#ef4444', // Vermelho
  '#f97316', // Laranja
  '#f59e0b', // Âmbar
  '#84cc16', // Verde Lima
  '#22c55e', // Verde
  '#14b8a6', // Teal
  '#0ea5e9', // Azul Claro
  '#6366f1', // Índigo
  '#a855f7', // Roxo
  '#ec4899', // Rosa
  '#64748b', // Cinza Azulado
]

export default function TaskList() {
  const { user } = useAuth()
  const { tasks, loading, addTask, updateTask, deleteTask, toggleTaskStatus, addTagToTask, removeTagFromTask } = useTasks()
  const { tags, addTag, deleteTag } = useTags()
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    moreInfo: '',
    tags: [] 
  })
  const [editingTask, setEditingTask] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(tagColors[0])
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      if (editingTask) {
        await updateTask(editingTask.id, newTask)
      } else {
        await addTask(newTask)
      }
      setNewTask({ title: '', description: '', moreInfo: '', tags: [] })
      setEditingTask(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
      setError('Houve um erro ao salvar a tarefa. Tente novamente.')
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setNewTask({
      title: task.title,
      description: task.description,
      moreInfo: task.moreInfo || '',
      tags: task.tags || []
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (taskId) => {
    setError(null)
    try {
      await deleteTask(taskId)
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error)
      setError('Houve um erro ao deletar a tarefa. Tente novamente.')
    }
  }

  const handleAddTag = async () => {
    if (!newTagName.trim()) return

    try {
      await addTag(newTagName.trim(), selectedColor)
      setNewTagName('')
      setSelectedColor(tagColors[0])
      setShowTagInput(false)
    } catch (error) {
      setError('Erro ao criar tag')
    }
  }

  const handleTagSelect = (tag) => {
    if (!newTask.tags.some(t => t.id === tag.id)) {
      setNewTask(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const handleRemoveTag = (tagId) => {
    setNewTask(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag.id !== tagId)
    }))
  }

  const handleDeleteTag = async (tagId) => {
    try {
      await deleteTag(tagId)
    } catch (error) {
      setError('Erro ao deletar tag')
    }
  }

  if (!user) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="text-muted-foreground">Faça login para ver suas tarefas</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tarefas</h2>
          <p className="text-muted-foreground">
            Gerencie suas tarefas e acompanhe seu progresso
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
              </DialogTitle>
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
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Digite o título da tarefa"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Digite a descrição da tarefa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moreInfo">Mais Informações</Label>
                  <textarea
                    id="moreInfo"
                    value={newTask.moreInfo}
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        moreInfo: e.target.value,
                      }))
                    }
                    placeholder="Adicione informações adicionais sobre a tarefa"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {newTask.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
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
                  <div className="flex items-center gap-2 mt-2">
                    {showTagInput ? (
                      <div className="space-y-2 w-full">
                        <div className="flex gap-2">
                          <Input
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="Nome da tag"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddTag}
                          >
                            Adicionar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowTagInput(false)
                              setNewTagName('')
                              setSelectedColor(tagColors[0])
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1 p-2 bg-muted/50 rounded-lg">
                          {tagColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`w-6 h-6 rounded-full transition-transform ${
                                selectedColor === color ? 'scale-125 ring-2 ring-primary ring-offset-2' : 'hover:scale-110'
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => setSelectedColor(color)}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTagInput(true)}
                        className="flex-1"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Tag
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <div key={tag.id} className="flex items-center gap-1">
                        <Badge
                          variant="secondary"
                          className="cursor-pointer"
                          style={{ backgroundColor: tag.color }}
                          onClick={() => handleTagSelect(tag)}
                        >
                          {tag.name}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => handleDeleteTag(tag.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
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
                  {editingTask ? 'Salvar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-500">
            {error}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader className="space-y-1">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="line-clamp-1">{task.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {task.description}
                  </CardDescription>
                  {task.moreInfo && (
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-3">
                      {task.moreInfo}
                    </div>
                  )}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(task)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={(checked) =>
                    toggleTaskStatus(task.id, checked)
                  }
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Concluída
                </label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <h3 className="text-lg font-medium">Nenhuma tarefa</h3>
            <p className="text-sm text-muted-foreground">
              Comece adicionando uma nova tarefa
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 
import { Search, X, Plus, Pencil, Trash2, Info, Settings } from "lucide-react"
import { Input } from "../../ui/input"
import { Badge } from "../../ui/badge"
import { useTaskBoard } from "../../../contexts/BoardContext"
import { cn } from "../../../lib/utils"
import { useState } from "react"
import { Button } from "../../ui/button"
import { AnimatePresence, motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui/popover"
import { Label } from "../../ui/label"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "../../ui/alert-dialog"
import { TagManager } from "../tag/TagManager"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Cores predefinidas para tags
const tagColors = [
  // Vermelhos
  '#ef4444', // Vermelho
  '#dc2626', // Vermelho escuro
  '#b91c1c', // Vermelho mais escuro
  '#f87171', // Vermelho claro

  // Laranjas/Âmbar
  '#f97316', // Laranja
  '#fb923c', // Laranja claro
  '#f59e0b', // Âmbar
  '#fbbf24', // Âmbar claro

  // Verdes
  '#22c55e', // Verde
  '#16a34a', // Verde escuro
  '#84cc16', // Verde Lima
  '#4ade80', // Verde claro

  // Azuis
  '#0ea5e9', // Azul claro
  '#2563eb', // Azul
  '#1d4ed8', // Azul escuro
  '#60a5fa', // Azul mais claro

  // Roxos/Rosas
  '#a855f7', // Roxo
  '#9333ea', // Roxo escuro
  '#ec4899', // Rosa
  '#f472b6', // Rosa claro

  // Neutros
  '#64748b', // Cinza Azulado
  '#475569', // Cinza escuro
  '#6b7280', // Cinza
  '#94a3b8', // Cinza claro
]

// Primeiro, vamos criar um novo componente para o Dialog de criação de tag
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

export function BoardHeader({ onSearch, onManageTags }) {
  const { 
    tags = [], 
    addTag,
    deleteTag,
    filterTags = [],
    setFilterTags,
    setError
  } = useTaskBoard()
  
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(tagColors[0])
  const [tagToDelete, setTagToDelete] = useState(null)
  const [searchText, setSearchText] = useState("")
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false)

  const handleTagClick = (tag) => {
    setFilterTags(prev => {
      const isSelected = prev.some(t => t.id === tag.id)
      if (isSelected) {
        return prev.filter(t => t.id !== tag.id)
      } else {
        return [...prev, tag]
      }
    })
  }

  const handleSearch = (value) => {
    setSearchText(value)
    onSearch(value)
  }

  const handleCreateTag = async (name, color) => {
    if (!name.trim()) {
      setError?.('Digite um nome para a tag')
      return
    }
    try {
      await addTag(name.trim(), color)
    } catch (error) {
      setError?.('Erro ao criar tag')
      throw error
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-background border-b">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Quadro de Tarefas</h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-5 w-5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-sm">
                  <p className="font-semibold">Como usar a Lista de Tarefas:</p>
                  <ul className="list-disc ml-4 mt-2 text-sm">
                    <li>Arraste e solte tarefas entre colunas</li>
                    <li>Use tags para organizar e filtrar tarefas</li>
                    <li>Pesquise tarefas por título ou descrição</li>
                    <li>Crie novas colunas para seu fluxo de trabalho</li>
                    <li>Integre com Google Calendar para sincronizar prazos</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-muted-foreground">Organize e gerencie suas tarefas</p>
        </div>
        <div className="flex items-center gap-4">
          <motion.div 
            className="flex items-center gap-2"
            layout
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="flex items-center">
              {isSearchOpen ? (
                <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                  <Input
                    type="text"
                    placeholder="Buscar tarefas..."
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-[200px]"
                    autoFocus
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setIsSearchOpen(false)
                      setSearchText("")
                      handleSearch("")
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </div>

            <motion.div layout>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setIsTagManagerOpen(true)}
              >
                <Settings className="h-4 w-4" />
                Gerenciar Tags
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
  className="flex flex-wrap gap-2"
  layout
  transition={{ duration: 0.2, ease: "easeInOut" }}
>
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" size="sm">
        Filtrar Tags
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-60">
      <div className="space-y-2">
        <p className="font-semibold">Selecione as Tags:</p>
        {tags.map((tag) => (
          <div key={tag.id} className="flex items-center">
            <input
              type="checkbox"
              checked={filterTags.some(t => t.id === tag.id)}
              onChange={() => handleTagClick(tag)}
              className="mr-2"
            />
            <span>{tag.name}</span>
          </div>
        ))}
      </div>
    </PopoverContent>
  </Popover>
</motion.div>
        </div>
      </div>

      {/* Dialog de Gerenciamento de Tags */}
      <Dialog open={isTagManagerOpen} onOpenChange={setIsTagManagerOpen}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Gerenciar Tags</DialogTitle>
            <DialogDescription>
              Crie, visualize e exclua tags para organizar suas tarefas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden">
            <div className="flex justify-between items-center sticky top-0 bg-background z-10 pb-2">
              <h4 className="text-sm font-medium">Tags Disponíveis</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateTagOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Nova Tag
              </Button>
            </div>

            <div 
              className="space-y-2 overflow-y-auto pr-2" 
              style={{ 
                maxHeight: 'calc(min(60vh, 400px))',
                paddingRight: '8px',
                marginRight: '-8px'
              }}
            >
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-2 rounded-md border bg-card"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span>{tag.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTagToDelete(tag)}
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Criação de Tag */}
      <CreateTagDialog
        isOpen={isCreateTagOpen}
        onOpenChange={setIsCreateTagOpen}
        onCreateTag={handleCreateTag}
      />

      {/* Dialog de confirmação para excluir tag */}
      <AlertDialog open={!!tagToDelete} onOpenChange={() => setTagToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tag?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A tag será removida de todas as tarefas que a utilizam.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (tagToDelete) {
                  deleteTag(tagToDelete.id)
                  setTagToDelete(null)
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
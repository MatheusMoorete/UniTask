import { Search, X, Plus, Pencil, Trash2, Info } from "lucide-react"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { useTaskBoard } from "../../contexts/BoardContext"
import { cn } from "../../lib/utils"
import { useState } from "react"
import { Button } from "../ui/button"
import { AnimatePresence, motion } from "framer-motion"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Label } from "../ui/label"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "../ui/alert-dialog"
import { TagManager } from "./TagManager"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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

export function BoardHeader({ onSearch }) {
  const { 
    tags = [], 
    addTag,
    deleteTag,
    filterTags = [],
    setFilterTags,
  } = useTaskBoard()
  
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(tagColors[0])
  const [tagToDelete, setTagToDelete] = useState(null)
  const [searchText, setSearchText] = useState("")

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

  const handleAddTag = async () => {
    if (!newTagName.trim()) return
    
    if (newTagName.length > 20) {
      return
    }

    await addTag(newTagName.trim(), selectedColor)
    setNewTagName('')
    setSelectedColor(tagColors[0])
    setShowTagInput(false)
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
              <Popover open={showTagInput} onOpenChange={setShowTagInput}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Gerenciar Tags
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nova Tag</Label>
                      <Input
                        placeholder="Nome da tag"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        maxLength={20}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {newTagName.length}/20 caracteres
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Cor</Label>
                      <div className="flex flex-wrap gap-1">
                        {tagColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={cn(
                              "w-6 h-6 rounded-full transition-all",
                              selectedColor === color ? "ring-2 ring-offset-2 ring-ring" : ""
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowTagInput(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddTag}
                        disabled={!newTagName.trim()}
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
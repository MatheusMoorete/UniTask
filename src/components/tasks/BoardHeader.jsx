import { Search, X } from "lucide-react"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { useTaskBoard } from "../../contexts/BoardContext"
import { cn } from "../../lib/utils"
import { useState } from "react"
import { Button } from "../ui/button"
import { AnimatePresence, motion } from "framer-motion"

export function BoardHeader() {
  const { 
    tags = [], 
    searchQuery = '', 
    setSearchQuery, 
    selectedTags = [], 
    setSelectedTags 
  } = useTaskBoard()
  
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const handleTagClick = (tag) => {
    setSelectedTags(prev => {
      const isSelected = prev.some(t => t.id === tag.id)
      if (isSelected) {
        return prev.filter(t => t.id !== tag.id)
      } else {
        return [...prev, tag]
      }
    })
  }

  const handleSearchClose = () => {
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="space-y-4">
      {/* Título e Subtítulo */}
      <div>
        <h1 className="text-2xl font-bold">Quadro de Tarefas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Organize e gerencie suas tarefas
        </p>
      </div>

      {/* Barra de Pesquisa e Tags */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center">
          <AnimatePresence>
            {isSearchOpen ? (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "300px", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex items-center"
              >
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                  placeholder="Buscar tarefas..."
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1"
                  onClick={handleSearchClose}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  className="hover:bg-accent"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap gap-2">
          {(tags || []).map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className={cn(
                "cursor-pointer transition-colors",
                selectedTags.some(t => t.id === tag.id) && "bg-primary text-primary-foreground"
              )}
              onClick={() => handleTagClick(tag)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
} 
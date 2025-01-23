import { useState } from 'react'
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Plus, Trash2 } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Label } from "../ui/label"
import { useTaskBoard } from "../../contexts/BoardContext"

const tagColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#a855f7', // purple
  '#ec4899', // pink
]

export function TagManager() {
  const { 
    tags, 
    selectedTags, 
    addTag, 
    deleteTag,
    setSelectedTags,
    error,
    setError 
  } = useTaskBoard()
  
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(tagColors[0])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!newTagName.trim()) {
      setError('Digite um nome para a tag')
      return
    }

    try {
      await addTag(newTagName.trim(), selectedColor)
      setNewTagName('')
      setSelectedColor(tagColors[0])
    } catch (error) {
      setError('Erro ao criar tag')
    }
  }

  const handleTagSelect = (tag) => {
    setSelectedTags(prev => {
      const isSelected = prev.some(t => t.id === tag.id)
      if (isSelected) {
        return prev.filter(t => t.id !== tag.id)
      }
      return [...prev, tag]
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            style={{ backgroundColor: tag.color }}
            className={`cursor-pointer transition-all hover:scale-105 ${
              selectedTags.some(t => t.id === tag.id) ? 'ring-2 ring-offset-2' : ''
            }`}
            onClick={() => handleTagSelect(tag)}
          >
            {tag.name}
          </Badge>
        ))}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Tag</Label>
              <Input
                id="name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Digite o nome da tag..."
              />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="grid grid-cols-5 gap-2">
                {tagColors.map((color) => (
                  <div
                    key={color}
                    style={{ backgroundColor: color }}
                    className={`w-8 h-8 rounded-full cursor-pointer transition-all hover:scale-110 ${
                      selectedColor === color ? 'ring-2 ring-offset-2' : ''
                    }`}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full">
              Criar Tag
            </Button>
          </form>
        </PopoverContent>
      </Popover>

      <div className="space-y-2">
        <Label>Gerenciar Tags</Label>
        <div className="space-y-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between group"
            >
              <Badge
                style={{ backgroundColor: tag.color }}
                className="text-white"
              >
                {tag.name}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteTag(tag)}
              >
                <Trash2 className="h-3 w-3 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 
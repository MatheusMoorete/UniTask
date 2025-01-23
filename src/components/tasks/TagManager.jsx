import { useState } from 'react'
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Plus, Trash2, X } from "lucide-react"
import { cn } from "../../lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Label } from "../ui/label"

export function TagManager({ 
  tags, 
  selectedTags, 
  onTagSelect, 
  onTagDelete, 
  onTagAdd,
  onTagRemove,
  tagColors 
}) {
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(tagColors[0])

  // Filtra as tags que ainda não foram selecionadas
  const availableTags = tags.filter(
    tag => !selectedTags.some(selectedTag => selectedTag.id === tag.id)
  )

  const handleAddTag = async () => {
    if (!newTagName.trim()) return
    
    if (newTagName.length > 20) {
      return
    }

    await onTagAdd(newTagName.trim(), selectedColor)
    setNewTagName('')
    setSelectedColor(tagColors[0])
    setShowTagInput(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Label>Tags Selecionadas</Label>
        <div className="flex flex-wrap gap-2 min-h-[32px] p-2 rounded-md border border-input">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              style={{ backgroundColor: tag.color }}
              className="text-white flex items-center gap-1"
            >
              {tag.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-black/20"
                onClick={() => onTagRemove(tag.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {availableTags.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6"
                >
                  Adicionar Tag
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <div className="space-y-1">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      style={{ backgroundColor: tag.color }}
                      className="w-full justify-center text-white cursor-pointer hover:opacity-90"
                      onClick={() => onTagSelect(tag)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Label>Gerenciar Tags</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTagInput(prev => !prev)}
          className="h-8 px-2"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {showTagInput && (
        <div className="space-y-2 p-4 rounded-md border border-input">
          <Input
            placeholder="Nome da tag"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="h-8"
            maxLength={20}
          />
          <div className="flex gap-1 flex-wrap">
            {tagColors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "w-6 h-6 rounded-full transition-all",
                  selectedColor === color ? "ring-2 ring-offset-2 ring-ring scale-110" : ""
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
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
            <Button
              size="sm"
              onClick={handleAddTag}
              disabled={!newTagName.trim()}
            >
              Adicionar
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center justify-between group px-2 py-1 rounded-md hover:bg-muted/50"
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
              onClick={() => onTagDelete(tag)}
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
} 
import { useState } from 'react'
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Settings, Plus, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"

export function TagManager({ 
  isOpen, 
  onOpenChange, 
  tags, 
  onTagCreate, 
  onTagDelete,
  error,
  setError 
}) {
  const [newTagName, setNewTagName] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)

  const handleCreateTag = async (e) => {
    e.preventDefault()
    if (!newTagName.trim()) {
      setError?.('Digite um nome para a tag')
      return
    }
    try {
      await onTagCreate(newTagName.trim())
      setNewTagName('')
      setShowTagInput(false)
    } catch (error) {
      setError?.('Erro ao criar tag')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Tags</DialogTitle>
          <DialogDescription>
            Crie, visualize e exclua tags para organizar suas tarefas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Tags Disponíveis</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTagInput(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Nova Tag
            </Button>
          </div>

          {showTagInput && (
            <div className="flex items-center gap-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Nome da nova tag"
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={handleCreateTag}
              >
                Criar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTagInput(false)
                  setNewTagName('')
                }}
              >
                Cancelar
              </Button>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <div className="space-y-2">
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
                  onClick={() => onTagDelete(tag)}
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
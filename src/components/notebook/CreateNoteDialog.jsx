import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Editor } from './Editor'
import { useNotebook } from '../../hooks/useNotebook'

export function CreateNoteDialog({ open, onOpenChange }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const { createNote } = useNotebook()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createNote({ title, content })
      onOpenChange(false)
      setTitle('')
      setContent('')
    } catch (error) {
      console.error('Erro ao criar nota:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Nova Nota</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da nota..."
            />
          </div>
          <div className="space-y-2">
            <Label>Conteúdo</Label>
            <Editor value={content} onChange={setContent} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar Nota</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
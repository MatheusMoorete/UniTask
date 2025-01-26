import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

export function AddMateriaDialog({ open, onOpenChange, onAdd }) {
  const [nomeMateria, setNomeMateria] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (nomeMateria.trim()) {
      onAdd(nomeMateria.trim())
      setNomeMateria('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Matéria</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Matéria</Label>
            <Input
              id="nome"
              value={nomeMateria}
              onChange={(e) => setNomeMateria(e.target.value)}
              placeholder="Digite o nome da matéria..."
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
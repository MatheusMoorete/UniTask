import { Button } from "../../ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"

export function AddColumnButton({ isOpen, onOpenChange, title, onTitleChange, onAdd }) {
  const handleAdd = async () => {
    try {
      await onAdd(title?.toString() || '')
      onTitleChange('')
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao adicionar coluna:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex-shrink-0 w-[350px] h-full min-h-[200px] border-2 border-dashed 
                     border-muted-foreground/20 hover:border-muted-foreground/30 
                     hover:bg-muted/30 transition-all"
        >
          <Plus className="h-8 w-8 mr-2" />
          Adicionar Coluna
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Coluna</DialogTitle>
          <DialogDescription>
            Digite o nome da nova coluna abaixo
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="columnTitle">Nome da Coluna</Label>
            <Input
              id="columnTitle"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Digite o nome da coluna"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleAdd}
            disabled={!title.trim()}
          >
            Criar Coluna
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
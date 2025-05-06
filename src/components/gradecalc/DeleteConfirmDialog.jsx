import { Button } from '../../components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "../../components/ui/dialog"

export function DeleteConfirmDialog({ 
  isOpen, 
  onOpenChange, 
  type = 'subject', 
  onConfirm
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </div>
          <DialogDescription className="pt-3">
            {type === 'subject' 
              ? 'Esta ação excluirá permanentemente a matéria e todas as suas notas associadas. Esta ação não pode ser desfeita.'
              : 'Esta ação excluirá permanentemente a nota selecionada. Esta ação não pode ser desfeita.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm}>
            {type === 'subject' ? 'Excluir Matéria' : 'Excluir Nota'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
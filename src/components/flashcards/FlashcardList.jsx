import { useState } from 'react'
import { useFlashcards } from '../../hooks/useFlashcards'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'

export function FlashcardList({ deckId }) {
  const { flashcards, deleteFlashcard } = useFlashcards(deckId)
  const [flashcardToDelete, setFlashcardToDelete] = useState(null)

  const handleDelete = async (id) => {
    try {
      await deleteFlashcard(id)
      setFlashcardToDelete(null)
    } catch (error) {
      console.error('Erro ao deletar flashcard:', error)
    }
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h3 className="text-xl font-medium mb-2">Nenhum flashcard criado</h3>
        <p className="text-muted-foreground">
          Comece criando seu primeiro flashcard usando o botão acima
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {flashcards.map((flashcard) => (
        <Card key={flashcard.id} className="relative group">
          <CardContent className="p-6">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setFlashcardToDelete(flashcard)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Frente</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {flashcard.front}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Verso</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {flashcard.back}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                Próxima revisão: {new Date(flashcard.repetitionData.nextReview).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={!!flashcardToDelete} onOpenChange={() => setFlashcardToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir flashcard?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => flashcardToDelete && handleDelete(flashcardToDelete.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 
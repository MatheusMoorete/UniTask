import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useFlashcards } from '../../hooks/useFlashcards'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { APIKeyDialog } from './APIKeyDialog'
import { Settings, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '../ui/alert'
import { generateFlashcards } from '../../services/flashcardService'

const FLASHCARD_QUANTITIES = [5, 10, 15, 20]

export function GenerateAIFlashcardsDialog({ open, onOpenChange, deckId }) {
  const [content, setContent] = useState('')
  const [provider, setProvider] = useState('deepseek')
  const [quantity, setQuantity] = useState(5)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAPIKeyDialogOpen, setIsAPIKeyDialogOpen] = useState(false)
  const [storedKeys] = useLocalStorage('ai_api_keys', {})
  const { createFlashcard } = useFlashcards(deckId)

  // Verifica se tem chave API configurada
  const hasApiKey = Boolean(storedKeys[provider])

  const handleGenerate = async (e) => {
    e.preventDefault()
    
    if (!content.trim()) {
      toast.error('Insira o conteúdo do material de estudo')
      return
    }

    if (!hasApiKey) {
      toast.error('Configure sua chave API primeiro')
      setIsAPIKeyDialogOpen(true)
      return
    }

    setIsGenerating(true)
    try {
      const flashcards = await generateFlashcards(
        content.trim(),
        Number(quantity),
        storedKeys[provider],
        provider
      )
      
      // Criar os flashcards no banco de dados
      for (const flashcard of flashcards) {
        await createFlashcard({
          front: flashcard.front,
          back: flashcard.back,
          deckId
        })
      }

      toast.success(`${flashcards.length} flashcards gerados com sucesso!`)
      onOpenChange(false)
      setContent('')
    } catch (error) {
      console.error('Erro ao gerar flashcards:', error)
      toast.error(error.message || 'Erro ao gerar flashcards')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Flashcards com IA</DialogTitle>
          </DialogHeader>

          {!hasApiKey && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Configure sua chave API primeiro
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-[1fr,1fr,40px] gap-4 items-end">
              <div className="space-y-2">
                <Label>Provedor de IA</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o provedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deepseek">Deepseek</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Select value={quantity} onValueChange={setQuantity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Quantidade de cards" />
                  </SelectTrigger>
                  <SelectContent>
                    {FLASHCARD_QUANTITIES.map(qty => (
                      <SelectItem key={qty} value={qty}>
                        {qty} flashcards
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="button" 
                variant={hasApiKey ? "outline" : "destructive"}
                size="icon"
                onClick={() => setIsAPIKeyDialogOpen(true)}
                className="h-10"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo do Material</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ex: Cole aqui o conteúdo do seu material de estudo..."
                className="h-40"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isGenerating}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isGenerating || !hasApiKey}
              >
                {isGenerating ? 'Gerando...' : 'Gerar Flashcards'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <APIKeyDialog
        open={isAPIKeyDialogOpen}
        onOpenChange={setIsAPIKeyDialogOpen}
      />
    </>
  )
}

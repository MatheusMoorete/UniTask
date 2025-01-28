import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Loader2, Sparkles, Key } from 'lucide-react'
import { toast } from 'sonner'
import { useFlashcards } from '../../hooks/useFlashcards'
import { useApiKey } from '../../hooks/useApiKey'

export function AICardGenerator({ open, onOpenChange, deckId }) {
  const [content, setContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { createFlashcard } = useFlashcards(deckId)
  const { apiKey, isLoading: isLoadingKey, saveApiKey } = useApiKey()
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [tempApiKey, setTempApiKey] = useState('')

  const handleSaveApiKey = async () => {
    try {
      await saveApiKey(tempApiKey)
      toast.success('Chave API salva com sucesso!')
      setShowApiKeyInput(false)
    } catch (error) {
      toast.error('Erro ao salvar chave API')
    }
  }

  const generateCards = async () => {
    if (!apiKey) {
      toast.error('Configure sua chave API do Deepseek primeiro')
      setShowApiKeyInput(true)
      return
    }

    if (!content.trim()) {
      toast.error('Digite algum conteúdo para gerar os flashcards')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey
        },
        body: JSON.stringify({ content })
      })

      if (!response.ok) {
        throw new Error('Falha na API do Deepseek')
      }

      const data = await response.json()
      const responseContent = data.choices[0].message.content
        .replace(/```json\n/, '')
        .replace(/```/, '')
        .trim()
      const flashcards = JSON.parse(responseContent)

      // Cria os flashcards gerados
      for (const card of flashcards) {
        await createFlashcard({
          front: card.front,
          back: card.back,
          deckId: deckId,
          repetitionData: {
            interval: 0,
            repetitions: 0,
            easeFactor: 2.5,
            nextReview: new Date(),
          }
        })
      }

      toast.success(`${flashcards.length} flashcards gerados com sucesso!`)
      onOpenChange(false)
      setContent('')
    } catch (error) {
      console.error('Erro ao gerar flashcards:', error)
      toast.error('Erro ao gerar flashcards')
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoadingKey) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Gerar Flashcards com IA</DialogTitle>
        </DialogHeader>
        
        {!apiKey || showApiKeyInput ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Chave API do Deepseek</Label>
              <Input
                type="password"
                placeholder="Insira sua chave API"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Obtenha sua chave em{' '}
                <a 
                  href="https://platform.deepseek.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  platform.deepseek.com
                </a>
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowApiKeyInput(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveApiKey}>
                <Key className="h-4 w-4 mr-2" />
                Salvar Chave API
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Cole seu texto ou conteúdo</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKeyInput(true)}
              >
                <Key className="h-4 w-4 mr-2" />
                Alterar Chave API
              </Button>
            </div>
            <Textarea
              placeholder="Ex: Cole aqui o conteúdo do seu material de estudo..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={generateCards} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Flashcards
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 
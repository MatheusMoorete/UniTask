//Estrutura da interface de geração de flashcards com IA

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Loader2, Sparkles, Key } from 'lucide-react'
import { showToast } from '../../lib/toast'
import { useFlashcards } from '../../hooks/useFlashcards'
import { useApiKey } from '../../hooks/useApiKey'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { generateFlashcards } from '../../services/flashcardService'

export default function AICardGenerator({ open, onOpenChange, deckId }) {
  const [content, setContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { createFlashcard } = useFlashcards(deckId)
  const { apiKeys, isLoading: isLoadingKey, saveApiKey } = useApiKey()
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [tempApiKey, setTempApiKey] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('deepseek')

  const handleSaveApiKey = async () => {
    try {
      await saveApiKey(selectedProvider, tempApiKey)
      showToast.success('Chave API salva com sucesso!')
      setShowApiKeyInput(false)
    } catch (error) {
      showToast.error('Erro ao salvar chave API')
    }
  }

  const handleGenerateCards = async () => {
    const currentApiKey = apiKeys[selectedProvider]
    if (!currentApiKey) {
      showToast.error(`Configure sua chave API do ${selectedProvider === 'openai' ? 'OpenAI' : 'Deepseek'} primeiro`)
      setShowApiKeyInput(true)
      return
    }

    if (!content.trim()) {
      showToast.error('Digite algum conteúdo para gerar os flashcards')
      return
    }

    setIsGenerating(true)
    try {
      const flashcards = await generateFlashcards(content.trim(), 10, currentApiKey, selectedProvider)

      // Cria os flashcards gerados
      for (const card of flashcards) {
        if (!card.front || !card.back) {
          console.warn('Flashcard inválido:', card)
          continue
        }
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

      showToast.success(`${flashcards.length} flashcards gerados com sucesso!`)
      onOpenChange(false)
      setContent('')
    } catch (error) {
      console.error('Erro ao gerar flashcards:', error)
      showToast.error('Erro ao gerar flashcards')
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
          <DialogDescription>
            Cole o conteúdo do seu material de estudo e a IA irá gerar flashcards automaticamente.
          </DialogDescription>
        </DialogHeader>
        
        {(!apiKeys[selectedProvider] || showApiKeyInput) ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Selecione o Provedor de IA</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI GPT-3.5</SelectItem>
                  <SelectItem value="deepseek">Deepseek</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Chave API do {selectedProvider === 'openai' ? 'OpenAI' : 'Deepseek'}</Label>
              <Input
                type="password"
                placeholder="Insira sua chave API"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                aria-describedby="api-key-description"
              />
              <p id="api-key-description" className="text-sm text-muted-foreground">
                Obtenha sua chave em{' '}
                <a 
                  href={selectedProvider === 'openai' ? 'https://platform.openai.com/api-keys' : 'https://platform.deepseek.com/'}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {selectedProvider === 'openai' ? 'platform.openai.com' : 'platform.deepseek.com'}
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
              <div className="space-y-2">
                <Label>Provedor de IA</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI GPT-3.5</SelectItem>
                    <SelectItem value="deepseek">Deepseek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              aria-describedby="content-description"
            />
            <p id="content-description" className="sr-only">
              Cole o texto do seu material de estudo para gerar flashcards automaticamente usando inteligência artificial
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGenerateCards} disabled={isGenerating}>
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
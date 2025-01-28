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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

export function AICardGenerator({ open, onOpenChange, deckId }) {
  const [content, setContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { createFlashcard } = useFlashcards(deckId)
  const { apiKeys, isLoading: isLoadingKey, saveApiKey } = useApiKey()
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [tempApiKey, setTempApiKey] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('deepseek')

  const API_URL = import.meta.env.DEV 
    ? 'http://localhost:3001/api/generate-flashcards'
    : `${window.location.origin}/api/generate-flashcards`

  const handleSaveApiKey = async () => {
    try {
      await saveApiKey(selectedProvider, tempApiKey)
      toast.success('Chave API salva com sucesso!')
      setShowApiKeyInput(false)
    } catch (error) {
      toast.error('Erro ao salvar chave API')
    }
  }

  const generateCards = async () => {
    const currentApiKey = apiKeys[selectedProvider]
    if (!currentApiKey) {
      toast.error(`Configure sua chave API do ${selectedProvider === 'openai' ? 'OpenAI' : 'Deepseek'} primeiro`)
      setShowApiKeyInput(true)
      return
    }

    if (!content.trim()) {
      toast.error('Digite algum conteúdo para gerar os flashcards')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': currentApiKey,
          'X-PROVIDER': selectedProvider
        },
        body: JSON.stringify({ content: content.trim() })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Erro response text:', errorText)
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          console.error('Erro ao parsear resposta:', e)
          errorData = { error: errorText || 'Erro desconhecido' }
        }
        
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (!data?.choices?.[0]?.message?.content) {
        throw new Error('Resposta inválida da API')
      }

      const responseContent = data.choices[0].message.content
      const flashcards = JSON.parse(responseContent)

      if (!Array.isArray(flashcards) || flashcards.length === 0) {
        throw new Error('Nenhum flashcard foi gerado')
      }

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
              />
              <p className="text-sm text-muted-foreground">
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
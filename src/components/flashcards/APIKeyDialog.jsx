import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { toast } from 'sonner'

export function APIKeyDialog({ open, onOpenChange }) {
  const [provider, setProvider] = useState('openai')
  const [apiKey, setApiKey] = useState('')
  const [storedKeys, setStoredKeys] = useLocalStorage('ai_api_keys', {})

  useEffect(() => {
    if (open && storedKeys[provider]) {
      setApiKey(storedKeys[provider])
    }
  }, [open, provider, storedKeys])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!apiKey.trim()) {
      toast.error('Insira uma chave API válida')
      return
    }

    // Salva a chave no localStorage
    setStoredKeys(prev => ({
      ...prev,
      [provider]: apiKey
    }))

    toast.success('Chave API salva com sucesso!')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurar Chave API</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provedor</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o provedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">openai</SelectItem>
                <SelectItem value="deepseek">deepseek</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">Chave API</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Insira sua chave API do ${provider === 'openai' ? 'OpenAI' : 'Deepseek'}`}
            />
            <p className="text-sm text-muted-foreground">
              {provider === 'openai' 
                ? 'Encontre sua chave API em: https://platform.openai.com/api-keys'
                : 'Encontre sua chave API em: https://platform.deepseek.com/api-keys'}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

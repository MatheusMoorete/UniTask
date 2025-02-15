import { useState, useEffect } from 'react'
import { useStudyRoom } from '../../hooks/useStudyRoom'
import { X, Plus, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { ScrollArea } from '../ui/scroll-area'
import { useToast } from '../ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import PropTypes from 'prop-types'

CreateStudyTopicDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  topicToEdit: PropTypes.object,
  mode: PropTypes.oneOf(['create', 'edit'])
}

export function CreateStudyTopicDialog({ open, onOpenChange, topicToEdit, mode = "create" }) {
  const { createTopic, updateTopic } = useStudyRoom()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: '',
    examDate: '',
    topics: []
  })

  const [newTopic, setNewTopic] = useState('')
  const [bulkTopics, setBulkTopics] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (topicToEdit && mode === "edit") {
      setFormData(topicToEdit)
    }
  }, [topicToEdit, mode])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Limpa o erro do campo quando ele é modificado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleAddTopic = () => {
    if (!newTopic.trim()) return

    const topicsToAdd = [newTopic.trim()]
    addTopicsToForm(topicsToAdd)
    setNewTopic('')
    
    toast({
      description: "Tópico adicionado com sucesso!",
      className: "bg-green-50 border-green-500 text-green-900",
    })
  }

  const handleBulkAdd = () => {
    if (!bulkTopics.trim()) return

    const topicsToAdd = bulkTopics
      .split(/[;\n,]/)
      .map(topic => topic.trim())
      .filter(topic => topic.length > 0)

    if (topicsToAdd.length === 0) return

    addTopicsToForm(topicsToAdd)
    setBulkTopics('')
    
    toast({
      description: `${topicsToAdd.length} tópicos adicionados com sucesso!`,
      className: "bg-green-50 border-green-500 text-green-900",
    })
  }

  const addTopicsToForm = (topicsToAdd) => {
    setFormData(prev => ({
      ...prev,
      topics: [
        ...prev.topics,
        ...topicsToAdd.map(topic => ({
          id: crypto.randomUUID(),
          title: topic,
          completed: false,
          needsRevision: false
        }))
      ]
    }))
  }

  const handleRemoveTopic = (topicId) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter(t => t.id !== topicId)
    }))
  }

  const moveTopic = (index, direction) => {
    const newTopics = [...formData.topics]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex >= 0 && newIndex < newTopics.length) {
      [newTopics[index], newTopics[newIndex]] = [newTopics[newIndex], newTopics[index]]
      setFormData(prev => ({ ...prev, topics: newTopics }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'O nome da prova é obrigatório'
    }
    
    if (formData.topics.length === 0) {
      newErrors.topics = 'Adicione pelo menos um tópico'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    try {
      if (mode === "edit") {
        await updateTopic(topicToEdit.id, formData)
        toast({
          description: "Prova atualizada com sucesso!",
          className: "bg-green-50 border-green-500 text-green-900",
        })
      } else {
        await createTopic(formData)
        toast({
          description: "Prova criada com sucesso!",
          className: "bg-green-50 border-green-500 text-green-900",
        })
      }
      onOpenChange(false)
      setFormData({
        title: '',
        examDate: '',
        topics: []
      })
    } catch (error) {
      console.error(`Erro ao ${mode === "edit" ? "editar" : "criar"} tópico:`, error)
      toast({
        title: "Erro",
        description: `Erro ao ${mode === "edit" ? "editar" : "criar"} a prova. Tente novamente.`,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] p-4 sm:p-6 overflow-hidden flex flex-col">
        <DialogHeader className="mb-4">
          <DialogTitle>
            {mode === "edit" ? "Editar Prova" : "Nova Prova"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-1">
                Nome da Prova
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Prova de Farmacologia"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="examDate">Data da Prova (opcional)</Label>
              <Input
                type="date"
                id="examDate"
                name="examDate"
                value={formData.examDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 min-h-0">
            <div className="space-y-2">
              <div className="space-y-2 mb-4">
                <Label>Adicionar Tópicos</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="Digite um tópico"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic())}
                  />
                  <Button type="button" onClick={handleAddTopic}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adicionar Vários Tópicos</Label>
                <div className="flex flex-col gap-2">
                  <textarea
                    value={bulkTopics}
                    onChange={(e) => setBulkTopics(e.target.value)}
                    placeholder="Cole sua lista de tópicos aqui (separados por vírgula, ponto e vírgula ou nova linha)"
                    className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Button 
                    type="button" 
                    onClick={handleBulkAdd}
                    variant="secondary"
                    className="w-full"
                  >
                    Processar Lista de Tópicos
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2 flex flex-col min-h-0">
              <Label className="flex items-center gap-1">
                Tópicos Adicionados
                <span className="text-destructive">*</span>
              </Label>
              {errors.topics && (
                <p className="text-sm text-destructive">{errors.topics}</p>
              )}
              <ScrollArea className="flex-1 rounded-md border p-2">
                <div className="space-y-2">
                  {formData.topics.map((topic, index) => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50"
                    >
                      <span className="flex-1 text-sm">{topic.title}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => moveTopic(index, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => moveTopic(index, 'down')}
                          disabled={index === formData.topics.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveTopic(topic.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === "edit" ? "Salvar Alterações" : "Criar Prova"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
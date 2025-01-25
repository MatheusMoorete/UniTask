import { useState, useEffect } from 'react'
import { useStudyRoom } from '../../hooks/useStudyRoom'
import { X, Plus, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { ScrollArea } from '../ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'

export function CreateStudyTopicDialog({ open, onOpenChange, topicToEdit, mode = "create" }) {
  const { createTopic, updateTopic } = useStudyRoom()
  const [formData, setFormData] = useState({
    title: '',
    examDate: '',
    topics: []
  })

  const [newTopic, setNewTopic] = useState('')

  useEffect(() => {
    if (topicToEdit && mode === "edit") {
      setFormData(topicToEdit)
    }
  }, [topicToEdit, mode])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddTopic = () => {
    if (!newTopic.trim()) return

    setFormData(prev => ({
      ...prev,
      topics: [...prev.topics, {
        id: crypto.randomUUID(),
        title: newTopic.trim(),
        completed: false,
        needsRevision: false
      }]
    }))
    setNewTopic('')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title) {
      console.error('Título é obrigatório')
      return
    }
    try {
      if (mode === "edit") {
        await updateTopic(topicToEdit.id, formData)
      } else {
        await createTopic(formData)
      }
      onOpenChange(false)
      setFormData({
        title: '',
        examDate: '',
        topics: []
      })
    } catch (error) {
      console.error(`Erro ao ${mode === "edit" ? "editar" : "criar"} tópico:`, error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Prova" : "Nova Prova"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Nome da Prova</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Prova de Anatomia"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="examDate">Data da Prova</Label>
            <Input
              id="examDate"
              name="examDate"
              type="date"
              value={formData.examDate}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Tópicos para Estudar</Label>
            <div className="flex gap-2 mb-4">
              <Input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Adicione um tópico..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic())}
              />
              <Button 
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddTopic}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[200px] rounded-md border p-2">
              <div className="space-y-2">
                {formData.topics.map((topic, index) => (
                  <div
                    key={topic.id}
                    className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 group"
                  >
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => moveTopic(index, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => moveTopic(index, 'down')}
                        disabled={index === formData.topics.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-sm flex-1">{topic.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                      onClick={() => handleRemoveTopic(topic.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="w-full sm:w-auto"
            >
              {mode === "edit" ? "Salvar" : "Criar Prova"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'

const defaultSubject = {
  name: '',
  hasMultipleTypes: false,
  totalHours: '',
  maxAbsencePercentage: '25',
  type1: {
    name: 'Teórica',
    hours: '',
    hoursPerClass: ''
  },
  type2: {
    name: 'Prática',
    hours: '',
    hoursPerClass: ''
  }
}

export function CreateSubjectDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  subjectToEdit = null 
}) {
  const [newSubject, setNewSubject] = useState(defaultSubject)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (subjectToEdit) {
      setNewSubject(subjectToEdit)
    } else {
      setNewSubject(defaultSubject)
    }
  }, [subjectToEdit])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    try {
      // Validações
      if (!newSubject.name.trim()) {
        throw new Error('O nome da matéria é obrigatório')
      }

      if (newSubject.hasMultipleTypes) {
        if (!newSubject.type1.hours || !newSubject.type1.hoursPerClass) {
          throw new Error('Preencha a carga horária e horas por aula das aulas teóricas')
        }
        if (!newSubject.type2.hours || !newSubject.type2.hoursPerClass) {
          throw new Error('Preencha a carga horária e horas por aula das aulas práticas')
        }
      } else {
        if (!newSubject.totalHours || !newSubject.type1.hoursPerClass) {
          throw new Error('Preencha a carga horária total e horas por aula')
        }
      }

      onSubmit(newSubject)
      onOpenChange(false)
      setNewSubject(defaultSubject)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {subjectToEdit ? 'Editar Matéria' : 'Nova Matéria'}
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes da matéria abaixo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Matéria</Label>
              <Input
                id="name"
                value={newSubject.name}
                onChange={(e) =>
                  setNewSubject((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ex: Cálculo I"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasMultipleTypes"
                checked={newSubject.hasMultipleTypes}
                onCheckedChange={(checked) =>
                  setNewSubject((prev) => ({ 
                    ...prev, 
                    hasMultipleTypes: checked,
                    totalHours: checked ? '' : prev.totalHours
                  }))
                }
              />
              <label
                htmlFor="hasMultipleTypes"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Esta matéria tem diferentes tipos de aula (ex: teórica e prática)
              </label>
            </div>

            {newSubject.hasMultipleTypes ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Aulas Teóricas</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={newSubject.type1.name}
                      onChange={(e) =>
                        setNewSubject((prev) => ({
                          ...prev,
                          type1: { ...prev.type1, name: e.target.value }
                        }))
                      }
                      placeholder="Nome do tipo"
                      className="col-span-1"
                    />
                    <Input
                      type="number"
                      value={newSubject.type1.hours}
                      onChange={(e) =>
                        setNewSubject((prev) => ({
                          ...prev,
                          type1: { ...prev.type1, hours: e.target.value }
                        }))
                      }
                      placeholder="Carga horária total"
                      className="col-span-1"
                      required
                    />
                    <Input
                      type="number"
                      value={newSubject.type1.hoursPerClass}
                      onChange={(e) =>
                        setNewSubject((prev) => ({
                          ...prev,
                          type1: { ...prev.type1, hoursPerClass: e.target.value }
                        }))
                      }
                      placeholder="Horas por aula"
                      className="col-span-1"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Aulas Práticas</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={newSubject.type2.name}
                      onChange={(e) =>
                        setNewSubject((prev) => ({
                          ...prev,
                          type2: { ...prev.type2, name: e.target.value }
                        }))
                      }
                      placeholder="Nome do tipo"
                      className="col-span-1"
                    />
                    <Input
                      type="number"
                      value={newSubject.type2.hours}
                      onChange={(e) =>
                        setNewSubject((prev) => ({
                          ...prev,
                          type2: { ...prev.type2, hours: e.target.value }
                        }))
                      }
                      placeholder="Carga horária total"
                      className="col-span-1"
                      required
                    />
                    <Input
                      type="number"
                      value={newSubject.type2.hoursPerClass}
                      onChange={(e) =>
                        setNewSubject((prev) => ({
                          ...prev,
                          type2: { ...prev.type2, hoursPerClass: e.target.value }
                        }))
                      }
                      placeholder="Horas por aula"
                      className="col-span-1"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totalHours">Carga Horária Total (horas)</Label>
                  <Input
                    id="totalHours"
                    type="number"
                    value={newSubject.totalHours}
                    onChange={(e) =>
                      setNewSubject((prev) => ({ ...prev, totalHours: e.target.value }))
                    }
                    placeholder="Ex: 60"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type1Hours">Horas por Aula</Label>
                  <Input
                    id="type1Hours"
                    type="number"
                    value={newSubject.type1.hoursPerClass}
                    onChange={(e) =>
                      setNewSubject((prev) => ({
                        ...prev,
                        type1: { ...prev.type1, hoursPerClass: e.target.value }
                      }))
                    }
                    placeholder="Ex: 2"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="maxAbsencePercentage">
                Porcentagem Máxima de Faltas (%)
              </Label>
              <Input
                id="maxAbsencePercentage"
                type="number"
                value={newSubject.maxAbsencePercentage}
                onChange={(e) =>
                  setNewSubject((prev) => ({ 
                    ...prev, 
                    maxAbsencePercentage: e.target.value 
                  }))
                }
                placeholder="Ex: 25"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit">
              {subjectToEdit ? 'Salvar Alterações' : 'Criar Matéria'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
import { useState } from 'react'
import { useSubjects } from '../hooks/useSubjects'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Checkbox } from '../components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog'
import { Progress } from '../components/ui/progress'
import { Plus, Trash2, Pencil, Loader2, MinusCircle, PlusCircle } from 'lucide-react'

export default function Attendance() {
  const { subjects, loading, addSubject, updateSubject, deleteSubject, addAbsence, removeAbsence } = useSubjects()
  const [newSubject, setNewSubject] = useState({
    name: '',
    totalHours: '',
    hasMultipleTypes: false,
    type1: {
      name: 'Teórica',
      hours: '',
      hoursPerClass: '',
    },
    type2: {
      name: 'Prática',
      hours: '',
      hoursPerClass: '',
    },
    maxAbsencePercentage: ''
  })
  const [editingSubject, setEditingSubject] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      // Validação dos campos
      const formData = {
        ...newSubject,
        type1: {
          ...newSubject.type1,
          hours: parseInt(newSubject.type1.hours) || 0
        },
        type2: {
          ...newSubject.type2,
          hours: parseInt(newSubject.type2.hours) || 0
        }
      }

      // Se tem dois tipos de aula
      if (formData.hasMultipleTypes) {
        // Valida campos dos dois tipos
        if (!formData.type1.hours || !formData.type2.hours || 
            !formData.type1.hoursPerClass || !formData.type2.hoursPerClass) {
          setError('Preencha todos os campos de carga horária')
          return
        }
        if (formData.type1.hours <= 0 || formData.type2.hours <= 0 ||
            formData.type1.hoursPerClass <= 0 || formData.type2.hoursPerClass <= 0) {
          setError('As cargas horárias devem ser maiores que zero')
          return
        }
        // Valida se as horas por aula são compatíveis com o total
        if (formData.type1.hoursPerClass > formData.type1.hours ||
            formData.type2.hoursPerClass > formData.type2.hours) {
          setError('As horas por aula não podem ser maiores que a carga horária total')
          return
        }
        // Calcula a carga horária total
        formData.totalHours = Number(formData.type1.hours) + Number(formData.type2.hours)
      } else {
        // Valida campos para tipo único
        if (!formData.totalHours) {
          setError('Informe a carga horária total')
          return
        }
        if (formData.totalHours <= 0) {
          setError('A carga horária total deve ser maior que zero')
          return
        }
        if (!formData.type1.hoursPerClass) {
          setError('Informe a carga horária por aula')
          return
        }
        if (formData.type1.hoursPerClass <= 0) {
          setError('A carga horária por aula deve ser maior que zero')
          return
        }
        // Valida se a carga horária por aula é compatível com o total
        if (formData.type1.hoursPerClass > formData.totalHours) {
          setError('A carga horária por aula não pode ser maior que a carga horária total')
          return
        }
        // Define a carga horária total do tipo1 igual à carga horária total
        formData.type1.hours = formData.totalHours
      }

      // Validação da porcentagem de faltas
      if (!formData.maxAbsencePercentage) {
        setError('Informe a porcentagem máxima de faltas')
        return
      }

      if (formData.maxAbsencePercentage <= 0 || formData.maxAbsencePercentage > 100) {
        setError('A porcentagem máxima de faltas deve estar entre 1 e 100')
        return
      }

      // Salva os dados
      if (editingSubject) {
        await updateSubject(editingSubject.id, formData)
      } else {
        await addSubject(formData)
      }

      // Reseta o formulário
      setNewSubject({
        name: '',
        totalHours: '',
        hasMultipleTypes: false,
        type1: {
          name: 'Teórica',
          hours: '',
          hoursPerClass: '',
        },
        type2: {
          name: 'Prática',
          hours: '',
          hoursPerClass: '',
        },
        maxAbsencePercentage: ''
      })
      setEditingSubject(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Erro ao salvar matéria:', error)
      setError('Houve um erro ao salvar a matéria. Tente novamente.')
    }
  }

  const handleEdit = (subject) => {
    setEditingSubject(subject)
    setNewSubject({
      name: subject.name,
      totalHours: subject.totalHours.toString(),
      hasMultipleTypes: subject.hasMultipleTypes,
      type1: {
        name: subject.type1?.name || 'Teórica',
        hours: subject.type1?.hours?.toString() || '',
        hoursPerClass: subject.type1?.hoursPerClass?.toString() || '',
      },
      type2: {
        name: subject.type2?.name || 'Prática',
        hours: subject.type2?.hours?.toString() || '',
        hoursPerClass: subject.type2?.hoursPerClass?.toString() || '',
      },
      maxAbsencePercentage: subject.maxAbsencePercentage.toString()
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (subjectId) => {
    setError(null)
    try {
      await deleteSubject(subjectId)
    } catch (error) {
      console.error('Erro ao deletar matéria:', error)
      setError('Houve um erro ao deletar a matéria. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Faltômetro</h2>
          <p className="text-muted-foreground">
            Gerencie suas faltas e acompanhe o limite por matéria
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Matéria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSubject ? 'Editar Matéria' : 'Nova Matéria'}
              </DialogTitle>
              <DialogDescription>
                Preencha os detalhes da matéria abaixo
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
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
                  <Label htmlFor="maxAbsencePercentage">Porcentagem Máxima de Faltas (%)</Label>
                  <Input
                    id="maxAbsencePercentage"
                    type="number"
                    value={newSubject.maxAbsencePercentage}
                    onChange={(e) =>
                      setNewSubject((prev) => ({ ...prev, maxAbsencePercentage: e.target.value }))
                    }
                    placeholder="Ex: 25"
                    required
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-500">
                    {error}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingSubject ? 'Salvar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-500">
            {error}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <Card key={subject.id}>
            <CardHeader className="space-y-1">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="line-clamp-1">{subject.name}</CardTitle>
                  <CardDescription>
                    {subject.totalHours}h • 
                    {subject.hasMultipleTypes ? (
                      <>
                        {subject.type1?.name || 'Teórica'}: {subject.type1?.hours || 0}h, 
                        {subject.type2?.name || 'Prática'}: {subject.type2?.hours || 0}h
                      </>
                    ) : (
                      `${subject.type1?.hours || 0}h por aula`
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(subject)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(subject.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {subject.hasMultipleTypes ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Faltas Teóricas: {subject.type1.absences || 0} aulas ({(subject.type1.absences || 0) * subject.type1.hoursPerClass}h)</span>
                      <span>Máximo: {subject.maxAbsences.type1} aulas ({subject.maxAbsences.type1 * subject.type1.hoursPerClass}h)</span>
                    </div>
                    <Progress
                      value={(subject.type1.absences || 0) / subject.maxAbsences.type1 * 100}
                      className="h-2"
                    />
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeAbsence(subject.id, 'type1')}
                        disabled={!subject.type1.absences}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => addAbsence(subject.id, 'type1')}
                        disabled={subject.type1.absences >= subject.maxAbsences.type1}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Faltas Práticas: {subject.type2.absences || 0} aulas ({(subject.type2.absences || 0) * subject.type2.hoursPerClass}h)</span>
                      <span>Máximo: {subject.maxAbsences.type2} aulas ({subject.maxAbsences.type2 * subject.type2.hoursPerClass}h)</span>
                    </div>
                    <Progress
                      value={(subject.type2.absences || 0) / subject.maxAbsences.type2 * 100}
                      className="h-2"
                    />
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeAbsence(subject.id, 'type2')}
                        disabled={!subject.type2.absences}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => addAbsence(subject.id, 'type2')}
                        disabled={subject.type2.absences >= subject.maxAbsences.type2}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground border-t pt-2">
                    <p>Total de faltas: {((subject.type1.absences || 0) * subject.type1.hoursPerClass) + ((subject.type2.absences || 0) * subject.type2.hoursPerClass)}h de {subject.maxAbsences.totalHours}h permitidas</p>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Faltas: {subject.type1.absences || 0} aulas ({(subject.type1.absences || 0) * subject.type1.hoursPerClass}h)</span>
                    <span>Máximo: {subject.maxAbsences.type1} aulas ({subject.maxAbsences.type1 * subject.type1.hoursPerClass}h)</span>
                  </div>
                  <Progress
                    value={(subject.type1.absences || 0) / subject.maxAbsences.type1 * 100}
                    className="h-2"
                  />
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeAbsence(subject.id, 'type1')}
                      disabled={!subject.type1.absences}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => addAbsence(subject.id, 'type1')}
                      disabled={subject.type1.absences >= subject.maxAbsences.type1}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {subjects.length === 0 && (
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <h3 className="text-lg font-medium">Nenhuma matéria cadastrada</h3>
            <p className="text-sm text-muted-foreground">
              Comece adicionando uma nova matéria
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 
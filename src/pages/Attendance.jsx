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
    },
    type2: {
      name: 'Prática',
      hours: '',
    }
  })
  const [editingSubject, setEditingSubject] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validação dos campos
    const formData = {
      ...newSubject,
      totalHours: parseInt(newSubject.totalHours),
      type1: {
        ...newSubject.type1,
        hours: parseInt(newSubject.type1.hours) || 0
      },
      type2: {
        ...newSubject.type2,
        hours: parseInt(newSubject.type2.hours) || 0
      }
    }

    if (formData.totalHours <= 0) {
      setError('A carga horária total deve ser maior que zero')
      return
    }

    if (formData.hasMultipleTypes) {
      if (!formData.type1.hours || !formData.type2.hours) {
        setError('Informe a carga horária para ambos os tipos de aula')
        return
      }
      if (formData.type1.hours <= 0 || formData.type2.hours <= 0) {
        setError('A carga horária por aula deve ser maior que zero')
        return
      }
    } else {
      if (!formData.type1.hours) {
        setError('Informe a carga horária por aula')
        return
      }
      if (formData.type1.hours <= 0) {
        setError('A carga horária por aula deve ser maior que zero')
        return
      }
    }

    if (!formData.maxAbsencePercentage) {
      setError('Informe a porcentagem máxima de faltas')
      return
    }

    if (formData.maxAbsencePercentage <= 0 || formData.maxAbsencePercentage > 100) {
      setError('A porcentagem máxima de faltas deve estar entre 1 e 100')
      return
    }

    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, formData)
      } else {
        await addSubject(formData)
      }
      setNewSubject({
        name: '',
        totalHours: '',
        hasMultipleTypes: false,
        type1: {
          name: 'Teórica',
          hours: '',
        },
        type2: {
          name: 'Prática',
          hours: '',
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
      },
      type2: {
        name: subject.type2?.name || 'Prática',
        hours: subject.type2?.hours?.toString() || '',
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

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasMultipleTypes"
                    checked={newSubject.hasMultipleTypes}
                    onCheckedChange={(checked) =>
                      setNewSubject((prev) => ({ ...prev, hasMultipleTypes: checked }))
                    }
                  />
                  <label
                    htmlFor="hasMultipleTypes"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Esta matéria tem diferentes tipos de aula (ex: teórica e prática)
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      {newSubject.hasMultipleTypes ? "Aulas Teóricas" : "Horas por Aula"}
                    </Label>
                    <div className="flex gap-2">
                      {newSubject.hasMultipleTypes && (
                        <Input
                          value={newSubject.type1.name}
                          onChange={(e) =>
                            setNewSubject((prev) => ({
                              ...prev,
                              type1: { ...prev.type1, name: e.target.value }
                            }))
                          }
                          placeholder="Nome do tipo"
                          className="w-1/2"
                        />
                      )}
                      <Input
                        type="number"
                        value={newSubject.type1.hours}
                        onChange={(e) =>
                          setNewSubject((prev) => ({
                            ...prev,
                            type1: { ...prev.type1, hours: e.target.value }
                          }))
                        }
                        placeholder="Horas"
                        className={newSubject.hasMultipleTypes ? "w-1/2" : "w-full"}
                        required
                      />
                    </div>
                  </div>

                  {newSubject.hasMultipleTypes && (
                    <div className="space-y-2">
                      <Label>Aulas Práticas</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newSubject.type2.name}
                          onChange={(e) =>
                            setNewSubject((prev) => ({
                              ...prev,
                              type2: { ...prev.type2, name: e.target.value }
                            }))
                          }
                          placeholder="Nome do tipo"
                          className="w-1/2"
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
                          placeholder="Horas"
                          className="w-1/2"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

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
                        {subject.type1.name}: {subject.type1.hours}h, 
                        {subject.type2.name}: {subject.type2.hours}h
                      </>
                    ) : (
                      `${subject.type1.hours}h por aula`
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
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Faltas: {subject.absences || 0} aulas ({(subject.absences || 0) * (subject.hasMultipleTypes ? Math.max(subject.type1.hours, subject.type2.hours) : subject.type1.hours)}h)</span>
                  <span>Máximo: {subject.maxAbsences} aulas ({subject.maxAbsences * (subject.hasMultipleTypes ? Math.max(subject.type1.hours, subject.type2.hours) : subject.type1.hours)}h)</span>
                </div>
                <Progress
                  value={(subject.absences || 0) / subject.maxAbsences * 100}
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground">
                  Ainda pode faltar {Math.max(0, subject.maxAbsences - (subject.absences || 0))} aulas ({Math.max(0, (subject.maxAbsences - (subject.absences || 0)) * (subject.hasMultipleTypes ? Math.max(subject.type1.hours, subject.type2.hours) : subject.type1.hours))}h)
                </div>
              </div>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeAbsence(subject.id)}
                  disabled={!subject.absences}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => addAbsence(subject.id)}
                  disabled={subject.absences >= subject.maxAbsences}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
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
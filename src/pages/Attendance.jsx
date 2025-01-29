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
import { Plus, Trash2, Pencil, Loader2, MinusCircle, PlusCircle, Clock } from 'lucide-react'
import { cn } from '../lib/utils'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

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

  const handleDelete = async (subjectId, subjectName) => {
    toast.promise(
      new Promise((resolve, reject) => {
        toast.custom((t) => (
          <div className="flex flex-col gap-3 bg-background border rounded-lg p-4 shadow-lg">
            <div className="space-y-1">
              <h3 className="font-medium">Confirmar exclusão</h3>
              <p className="text-sm text-muted-foreground">
                Deseja excluir a disciplina "{subjectName}"? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  toast.dismiss(t)
                  reject()
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  toast.dismiss(t)
                  resolve()
                }}
              >
                Excluir
              </Button>
            </div>
          </div>
        ), { duration: Infinity })
      })
        .then(async () => {
          await deleteSubject(subjectId)
          return 'Disciplina excluída com sucesso'
        })
        .catch(() => {
          throw 'Exclusão cancelada'
        }),
      {
        loading: 'Excluindo disciplina...',
        success: (message) => message,
        error: (message) => message,
      }
    )
  }

  // Função para calcular a porcentagem de faltas utilizada
  const calculateAttendancePercentage = (subject) => {
    if (!subject || !subject.type1 || !subject.maxAbsences) return 0

    if (subject.hasMultipleTypes && subject.type2) {
      // Para disciplinas com dois tipos de aula
      const currentType1Absences = subject.type1.absences || 0
      const currentType2Absences = subject.type2.absences || 0
      const maxType1Absences = subject.maxAbsences.type1 || 0
      const maxType2Absences = subject.maxAbsences.type2 || 0

      // Total de faltas atuais e máximas
      const totalCurrentAbsences = currentType1Absences + currentType2Absences
      const totalMaxAbsences = maxType1Absences + maxType2Absences

      // Calcula a porcentagem
      return totalMaxAbsences > 0 
        ? (totalCurrentAbsences / totalMaxAbsences) * 100 
        : 0
    } else {
      // Para disciplinas com um tipo de aula
      const currentAbsences = subject.type1.absences || 0
      const maxAbsences = subject.maxAbsences.type1 || 0

      // Calcula a porcentagem
      return maxAbsences > 0 
        ? (currentAbsences / maxAbsences) * 100 
        : 0
    }
  }

  // Função para calcular faltas restantes
  const calculateRemainingAbsences = (subject) => {
    if (!subject || !subject.type1 || !subject.maxAbsences) return 0

    if (subject.hasMultipleTypes && subject.type2) {
      // Para disciplinas com dois tipos de aula
      const maxType1Absences = subject.maxAbsences.type1 || 0
      const maxType2Absences = subject.maxAbsences.type2 || 0
      const currentType1Absences = subject.type1.absences || 0
      const currentType2Absences = subject.type2.absences || 0

      // Total de faltas permitidas (soma dos dois tipos)
      const totalAllowedAbsences = maxType1Absences + maxType2Absences
      // Total de faltas já utilizadas
      const totalUsedAbsences = currentType1Absences + currentType2Absences
      
      // Retorna a diferença entre permitidas e utilizadas
      return Math.max(0, totalAllowedAbsences - totalUsedAbsences)
    } else {
      // Para disciplinas com um tipo de aula
      const maxAbsences = subject.maxAbsences.type1 || 0
      const currentAbsences = subject.type1.absences || 0
      
      // Retorna a diferença entre permitidas e utilizadas
      return Math.max(0, maxAbsences - currentAbsences)
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
        {subjects.map((subject) => {
          if (!subject?.type1) return null
          
          const percentage = calculateAttendancePercentage(subject)
          const remainingAbsences = calculateRemainingAbsences(subject)

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              key={subject.id}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{subject.name}</CardTitle>
                      <CardDescription className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {subject.totalHours}h
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(subject)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(subject.id, subject.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-end text-sm text-muted-foreground">
                      <span>{subject.type1.absences || 0} de {subject.maxAbsences.type1} faltas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeAbsence(subject.id, 'type1')}
                        disabled={subject.type1.absences <= 0}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <Progress 
                        value={(subject.type1.absences / subject.maxAbsences.type1) * 100} 
                        className="flex-grow h-2"
                        indicatorClassName={cn(
                          "transition-all duration-300",
                          percentage >= 75 ? "bg-red-500" :
                          percentage >= 50 ? "bg-yellow-500" :
                          "bg-green-500"
                        )}
                      />
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => addAbsence(subject.id, 'type1')}
                        disabled={remainingAbsences <= 0}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <span className="text-sm text-muted-foreground">Utilização</span>
                        <p className={cn(
                          "text-2xl font-bold",
                          percentage >= 75 ? "text-red-500" :
                          percentage >= 50 ? "text-yellow-500" :
                          "text-green-500"
                        )}>{percentage.toFixed(1)}%</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Faltas Restantes</span>
                        <p className="text-2xl font-bold">{remainingAbsences}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
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
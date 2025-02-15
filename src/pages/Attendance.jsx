import { useState, useMemo } from 'react'
import { useSubjects } from '../hooks/useSubjects'
import { useSubjectsWithStats } from '../hooks/useSubjectsWithStats'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Plus, Search, Filter, LayoutGrid, LayoutList } from 'lucide-react'
import { cn } from '../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../components/ui/use-toast'
import { SubjectCard } from '../components/attendance/SubjectCard'
import { CreateSubjectDialog } from '../components/attendance/CreateSubjectDialog'

export default function Attendance() {
  const { subjects, loading, addSubject, updateSubject, deleteSubject, addAbsence, removeAbsence } = useSubjects()
  const { filterAndSort } = useSubjectsWithStats(subjects)
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState('grid')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)

  // Filtragem e ordenação de disciplinas
  const filteredSubjects = useMemo(() => {
    return filterAndSort(searchQuery, filterStatus, sortBy)
  }, [filterAndSort, searchQuery, filterStatus, sortBy])

  const handleEdit = (subject) => {
    setEditingSubject(subject)
    setIsDialogOpen(true)
  }

  const handleNewSubject = () => {
    setEditingSubject(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Tem certeza que deseja excluir a matéria "${name}"?`)) {
      try {
        await deleteSubject(id)
        toast({
          title: "Matéria excluída",
          description: `A matéria "${name}" foi excluída com sucesso.`,
          variant: "default",
        })
      } catch (error) {
        toast({
          title: "Erro ao excluir matéria",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }

  const handleSubmit = async (data) => {
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, data)
        toast({
          title: "Matéria atualizada",
          description: `A matéria "${data.name}" foi atualizada com sucesso.`,
          variant: "default",
        })
      } else {
        await addSubject(data)
        toast({
          title: "Matéria criada",
          description: `A matéria "${data.name}" foi criada com sucesso.`,
          variant: "default",
        })
      }
      setIsDialogOpen(false)
      setEditingSubject(null)
    } catch (error) {
      toast({
        title: "Erro ao salvar matéria",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="text-center">
          <h3 className="text-lg font-medium">Carregando...</h3>
          <p className="text-sm text-muted-foreground">
            Aguarde enquanto carregamos suas matérias
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-6 max-w-full p-2 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Cabeçalho */}
      <motion.div 
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Faltômetro
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie suas faltas e acompanhe o limite por matéria
          </p>
        </div>
        <Button 
          onClick={handleNewSubject} 
          size="lg"
          className="w-full sm:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Matéria
        </Button>
      </motion.div>

      {/* Filtros e Controles */}
      <motion.div 
        className="flex flex-col gap-4 sm:flex-row sm:items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar matérias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-10"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px] h-10">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="risk">Em Risco</SelectItem>
              <SelectItem value="warning">Atenção</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px] h-10">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="percentage">Porcentagem</SelectItem>
              <SelectItem value="remaining">Faltas Restantes</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 col-span-2 sm:col-span-1 justify-end sm:justify-start">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-10 w-10"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-10 w-10"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Lista de Matérias */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.3 }}
          className={cn(
            'grid gap-4',
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
              : 'grid-cols-1'
          )}
        >
          {filteredSubjects.map((subject, index) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <SubjectCard
                subject={subject}
                viewMode={viewMode}
                onEdit={() => handleEdit(subject)}
                onDelete={() => handleDelete(subject.id, subject.name)}
                onAddAbsence={() => addAbsence(subject.id, 'type1')}
                onRemoveAbsence={() => removeAbsence(subject.id, 'type1')}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {subjects.length === 0 && (
        <motion.div 
          className="flex h-[200px] items-center justify-center rounded-lg border border-dashed p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div>
            <h3 className="text-lg font-medium">Nenhuma matéria cadastrada</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Comece adicionando uma nova matéria
            </p>
            <Button 
              onClick={handleNewSubject}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Matéria
            </Button>
          </div>
        </motion.div>
      )}

      <CreateSubjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        subjectToEdit={editingSubject}
      />
    </motion.div>
  )
}
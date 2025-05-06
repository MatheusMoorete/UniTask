import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Calculator, GraduationCap, Calendar } from 'lucide-react'
import { Badge } from '../components/ui/badge'

// Hooks personalizados
import { useGradeManager } from '../hooks/useGradeManager'
import { useGradeCalculator } from '../hooks/useGradeCalculator'
import { useSemester } from '../contexts/SemesterContext'

// Componentes da calculadora
import { SubjectsList } from '../components/gradecalc/SubjectsList'
import { SubjectDetail } from '../components/gradecalc/SubjectDetail'
import { FinalGradeCalculator } from '../components/gradecalc/FinalGradeCalculator'
import { SubjectDialog } from '../components/gradecalc/SubjectDialog'
import { GradeDialog } from '../components/gradecalc/GradeDialog'
import { DeleteConfirmDialog } from '../components/gradecalc/DeleteConfirmDialog'
import { SemesterSelector } from '../components/dashboard/SemesterSelector'

export default function GradeCalculator() {
  // Estado da interface
  const [selectedSubject, setSelectedSubject] = useState(null)
  
  // Estado para diálogos
  const [isAddSubjectDialogOpen, setIsAddSubjectDialogOpen] = useState(false)
  const [isAddGradeDialogOpen, setIsAddGradeDialogOpen] = useState(false)
  const [isEditSubjectDialogOpen, setIsEditSubjectDialogOpen] = useState(false)
  const [isEditGradeDialogOpen, setIsEditGradeDialogOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  
  // Estado para formulários
  const [newSubject, setNewSubject] = useState({ name: '', semester: '', minGrade: '6.0' })
  const [newGrade, setNewGrade] = useState({ title: '', value: '', weight: '1' })
  const [editingSubject, setEditingSubject] = useState(null)
  const [editingGrade, setEditingGrade] = useState(null)
  const [deletingItem, setDeletingItem] = useState({ type: '', id: '', subjectId: '' })

  // Hooks de contexto
  const { currentSemester } = useSemester()

  // Hooks personalizados
  const { 
    subjects, 
    loading, 
    addSubject,
    updateSubject,
    deleteSubject,
    addGrade,
    updateGrade,
    deleteGrade,
    calculateSubjectAverage
  } = useGradeManager()

  const {
    // Estado
    calcGrades,
    weightedAverage,
    isCalculating,
    examGrades,
    finalExamWeight,
    minPassingGrade,
    finalGradeNeeded,
    
    // Setters
    setFinalExamWeight,
    setMinPassingGrade,
    
    // Funções
    addCalcGrade,
    removeCalcGrade,
    updateCalcGrade,
    addExamGrade,
    removeExamGrade,
    updateExamGrade,
    resetAverageForm,
    resetExamForm,
    calculateAverage,
    calculateFinalGrade
  } = useGradeCalculator()

  // Obter a matéria selecionada
  const selectedSubjectData = subjects.find(s => s.id === selectedSubject)

  // Funções de manipulação da UI
  const handleViewSubject = (subjectId) => {
    setSelectedSubject(subjectId)
  }

  const handleEditSubject = (subject) => {
    setEditingSubject({
      id: subject.id,
      name: subject.name,
      semester: subject.semester,
      minGrade: subject.minGrade || '6.0'
    })
    setIsEditSubjectDialogOpen(true)
  }

  const handleConfirmDelete = (type, id, subjectId = null) => {
    setDeletingItem({ type, id, subjectId })
    setIsDeleteConfirmOpen(true)
  }

  // Função para iniciar a edição de uma nota
  const handleEditGrade = (grade) => {
    setEditingGrade({
      id: grade.id,
      title: grade.title,
      value: grade.value.toString(),
      weight: grade.weight.toString(),
      subjectId: grade.subjectId
    })
    setIsEditGradeDialogOpen(true)
  }

  // Manipuladores dos formulários
  const handleNewSubjectChange = (updated) => {
    setNewSubject(updated)
  }

  const handleEditingSubjectChange = (updated) => {
    setEditingSubject(updated)
  }

  const handleNewGradeChange = (updated) => {
    setNewGrade(updated)
  }

  const handleEditingGradeChange = (updated) => {
    setEditingGrade(updated)
  }

  // Submissões de formulários
  const handleDeleteConfirm = async () => {
    if (deletingItem.type === 'subject') {
      await deleteSubject(deletingItem.id)
      if (selectedSubject === deletingItem.id) {
        setSelectedSubject(null)
      }
    } else if (deletingItem.type === 'grade') {
      await deleteGrade(deletingItem.id, deletingItem.subjectId)
    }
    
    setDeletingItem({ type: '', id: '', subjectId: '' })
    setIsDeleteConfirmOpen(false)
  }

  // Props da calculadora para o SubjectDetail
  const calculatorProps = {
    grades: calcGrades,
    average: weightedAverage,
    isCalculating,
    onAddGrade: addCalcGrade,
    onRemoveGrade: removeCalcGrade,
    onUpdateGrade: updateCalcGrade,
    onReset: resetAverageForm,
    onCalculate: calculateAverage
  }

  // Função para processar fechamento de diálogos com submissão
  const handleAddSubjectDialogClose = async (open) => {
    if (!open && newSubject.name.trim()) {
      await addSubject(newSubject)
      setNewSubject({ name: '', semester: '', minGrade: '6.0' })
    }
    setIsAddSubjectDialogOpen(open)
  }

  const handleEditSubjectDialogClose = async (open) => {
    if (!open && editingSubject && editingSubject.name.trim()) {
      await updateSubject(editingSubject.id, {
        name: editingSubject.name,
        semester: editingSubject.semester,
        minGrade: editingSubject.minGrade
      })
    }
    if (!open) {
      setEditingSubject(null)
    }
    setIsEditSubjectDialogOpen(open)
  }

  const handleAddGradeDialogClose = async (open) => {
    if (!open && selectedSubject && newGrade.title.trim() && newGrade.value.trim()) {
      await addGrade(selectedSubject, newGrade)
      setNewGrade({ title: '', value: '', weight: '1' })
    }
    setIsAddGradeDialogOpen(open)
  }

  const handleEditGradeDialogClose = async (open) => {
    if (!open && editingGrade && editingGrade.title.trim() && editingGrade.value.trim()) {
      await updateGrade(editingGrade.id, editingGrade)
    }
    if (!open) {
      setEditingGrade(null)
    }
    setIsEditGradeDialogOpen(open)
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 space-y-8">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col gap-6 px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calculator className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Calculadora de Médias</h1>
              <p className="text-muted-foreground">
                Gerencie suas notas e calcule médias facilmente
              </p>
            </div>
          </div>
        </motion.div>

        {/* Seletor de Semestre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <SemesterSelector />
          {currentSemester && (
            <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Você está visualizando dados do semestre <Badge variant="outline">{currentSemester.name}</Badge></span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tabs defaultValue="subjects" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="subjects" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Matérias
              </TabsTrigger>
              <TabsTrigger value="final" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Prova Final
              </TabsTrigger>
            </TabsList>
            
            {/* Tab 1: Matérias */}
            <TabsContent value="subjects" className="space-y-4">
              {selectedSubject ? (
                <SubjectDetail
                  subject={selectedSubjectData}
                  onBack={() => setSelectedSubject(null)}
                  onAddGrade={() => setIsAddGradeDialogOpen(true)}
                  onDeleteGrade={(gradeId) => handleConfirmDelete('grade', gradeId, selectedSubject)}
                  onEditGrade={handleEditGrade}
                  calculator={calculatorProps}
                />
              ) : (
                <SubjectsList
                  subjects={subjects}
                  loading={loading}
                  onViewSubject={handleViewSubject}
                  onEditSubject={handleEditSubject}
                  onDeleteSubject={(_, id) => handleConfirmDelete('subject', id)}
                  onAddSubject={() => setIsAddSubjectDialogOpen(true)}
                />
              )}
            </TabsContent>

            {/* Tab 2: Prova Final */}
            <TabsContent value="final" className="space-y-4">
              <FinalGradeCalculator
                grades={examGrades}
                finalExamWeight={finalExamWeight}
                minPassingGrade={minPassingGrade}
                finalGradeNeeded={finalGradeNeeded}
                isCalculating={isCalculating}
                onAddGrade={addExamGrade}
                onRemoveGrade={removeExamGrade}
                onUpdateGrade={updateExamGrade}
                onSetFinalExamWeight={setFinalExamWeight}
                onSetMinPassingGrade={setMinPassingGrade}
                onReset={resetExamForm}
                onCalculate={calculateFinalGrade}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Diálogos */}
      <SubjectDialog
        isOpen={isAddSubjectDialogOpen}
        onOpenChange={handleAddSubjectDialogClose}
        mode="add"
        subject={newSubject}
        onSubmit={handleNewSubjectChange}
      />

      <SubjectDialog
        isOpen={isEditSubjectDialogOpen}
        onOpenChange={handleEditSubjectDialogClose}
        mode="edit"
        subject={editingSubject || { name: '', semester: '', minGrade: '6.0' }}
        onSubmit={handleEditingSubjectChange}
      />

      <GradeDialog
        isOpen={isAddGradeDialogOpen}
        onOpenChange={handleAddGradeDialogClose}
        grade={newGrade}
        onSubmit={handleNewGradeChange}
        mode="add"
      />

      <GradeDialog
        isOpen={isEditGradeDialogOpen}
        onOpenChange={handleEditGradeDialogClose}
        grade={editingGrade || { title: '', value: '', weight: '' }}
        onSubmit={handleEditingGradeChange}
        mode="edit"
      />

      <DeleteConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        type={deletingItem.type}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
} 
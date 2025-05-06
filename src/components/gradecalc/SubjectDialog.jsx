import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "../../components/ui/dialog"
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'

export function SubjectDialog({ 
  isOpen, 
  onOpenChange, 
  mode = 'add', 
  subject = { name: '', semester: '', minGrade: '6.0' }, 
  onSubmit
}) {
  const [localSubject, setLocalSubject] = useState(subject)
  const [formErrors, setFormErrors] = useState({})
  
  // Atualizar o estado local quando as props mudarem
  useEffect(() => {
    setLocalSubject(subject)
  }, [subject])

  const handleChange = (field, value) => {
    setLocalSubject(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpar erro quando o campo for editado
    if (formErrors[field]) {
      setFormErrors(prev => ({...prev, [field]: null}))
    }
  }
  
  const validateForm = () => {
    const errors = {}
    
    if (!localSubject.name.trim()) {
      errors.name = 'O nome da matéria é obrigatório'
    }
    
    if (!localSubject.semester.trim()) {
      errors.semester = 'O semestre é obrigatório'
    }
    
    const minGradeNum = parseFloat(localSubject.minGrade.replace(',', '.'))
    if (isNaN(minGradeNum) || minGradeNum < 0 || minGradeNum > 10) {
      errors.minGrade = 'A média mínima deve ser um número entre 0 e 10'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const handleSubmit = () => {
    if (validateForm()) {
      // Formatar números para garantir valores consistentes
      const formattedSubject = {
        ...localSubject,
        minGrade: parseFloat(localSubject.minGrade.replace(',', '.'))
      }
      
      onSubmit(formattedSubject)
      onOpenChange(false)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Adicionar Matéria' : 'Editar Matéria'}</DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Informe os dados da matéria que deseja adicionar.' 
              : 'Modifique os dados da matéria.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="subject-name">Nome da Matéria</Label>
            <Input
              id="subject-name"
              value={localSubject.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Cálculo I"
              aria-invalid={!!formErrors.name}
            />
            {formErrors.name && (
              <p className="text-sm text-destructive">{formErrors.name}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject-semester">Semestre</Label>
            <Input
              id="subject-semester"
              value={localSubject.semester}
              onChange={(e) => handleChange('semester', e.target.value)}
              placeholder="Ex: 2023.2"
              aria-invalid={!!formErrors.semester}
            />
            {formErrors.semester && (
              <p className="text-sm text-destructive">{formErrors.semester}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject-min-grade">Média Mínima para Aprovação</Label>
            <Input
              id="subject-min-grade"
              type="text"
              inputMode="decimal"
              value={localSubject.minGrade}
              onChange={(e) => handleChange('minGrade', e.target.value)}
              placeholder="Ex: 6.0"
              aria-invalid={!!formErrors.minGrade}
            />
            {formErrors.minGrade && (
              <p className="text-sm text-destructive">{formErrors.minGrade}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>
            {mode === 'add' ? 'Adicionar' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

SubjectDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['add', 'edit']),
  subject: PropTypes.shape({
    name: PropTypes.string,
    semester: PropTypes.string,
    minGrade: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  onSubmit: PropTypes.func.isRequired
}; 
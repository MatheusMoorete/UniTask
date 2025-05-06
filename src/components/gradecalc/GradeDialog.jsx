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

export function GradeDialog({ 
  isOpen, 
  onOpenChange, 
  grade = { title: '', value: '', weight: '1' }, 
  onSubmit,
  mode = 'add' // 'add' ou 'edit'
}) {
  const isEditMode = mode === 'edit'
  const [localGrade, setLocalGrade] = useState(grade)
  const [formErrors, setFormErrors] = useState({})
  
  // Atualizar o estado local quando as props mudarem
  useEffect(() => {
    setLocalGrade(grade)
  }, [grade])

  const handleChange = (field, value) => {
    setLocalGrade(prev => ({
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
    
    if (!localGrade.title.trim()) {
      errors.title = 'Informe o título da avaliação'
    }
    
    const valueNum = parseFloat(localGrade.value.replace(',', '.'))
    if (isNaN(valueNum) || valueNum < 0 || valueNum > 10) {
      errors.value = 'A nota deve ser um número entre 0 e 10'
    }
    
    const weightNum = parseFloat(localGrade.weight.replace(',', '.'))
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 10) {
      errors.weight = 'O peso deve ser um número entre 0.1 e 10'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const handleSubmit = () => {
    if (validateForm()) {
      // Formatar números para garantir valores consistentes
      const formattedGrade = {
        ...localGrade,
        value: parseFloat(localGrade.value.replace(',', '.')),
        weight: parseFloat(localGrade.weight.replace(',', '.'))
      }
      
      onSubmit(formattedGrade)
      onOpenChange(false)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Nota' : 'Adicionar Nota'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Modifique os dados da avaliação.' 
              : 'Informe os dados da avaliação.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="grade-title">Título da Avaliação</Label>
            <Input
              id="grade-title"
              value={localGrade.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Prova 1"
              aria-invalid={!!formErrors.title}
            />
            {formErrors.title && (
              <p className="text-sm text-destructive">{formErrors.title}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="grade-value">Nota</Label>
            <Input
              id="grade-value"
              value={localGrade.value}
              onChange={(e) => handleChange('value', e.target.value)}
              placeholder="Ex: 8.5"
              inputMode="decimal"
              aria-invalid={!!formErrors.value}
            />
            {formErrors.value && (
              <p className="text-sm text-destructive">{formErrors.value}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="grade-weight">Peso</Label>
            <Input
              id="grade-weight"
              value={localGrade.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              placeholder="Ex: 1"
              inputMode="decimal"
              aria-invalid={!!formErrors.weight}
            />
            {formErrors.weight && (
              <p className="text-sm text-destructive">{formErrors.weight}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>
            {isEditMode ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

GradeDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  grade: PropTypes.shape({
    title: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  onSubmit: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['add', 'edit'])
}; 
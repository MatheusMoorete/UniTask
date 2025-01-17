import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'

const AddSubjectForm = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    totalHours: '',
    totalClasses: '',
    maxAbsencePercentage: '25',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd({
      ...formData,
      totalHours: parseInt(formData.totalHours),
      totalClasses: parseInt(formData.totalClasses),
      maxAbsencePercentage: parseInt(formData.maxAbsencePercentage),
      absences: 0,
    })
    onClose()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Adicionar Matéria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome da Matéria</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="totalHours">Carga Horária Total</Label>
            <Input
              id="totalHours"
              name="totalHours"
              type="number"
              min="1"
              value={formData.totalHours}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="totalClasses">Número Total de Aulas</Label>
            <Input
              id="totalClasses"
              name="totalClasses"
              type="number"
              min="1"
              value={formData.totalClasses}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="maxAbsencePercentage">
              Porcentagem Máxima de Faltas (%)
            </Label>
            <Input
              id="maxAbsencePercentage"
              name="maxAbsencePercentage"
              type="number"
              min="0"
              max="100"
              value={formData.maxAbsencePercentage}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Adicionar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default AddSubjectForm 
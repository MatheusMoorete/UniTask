import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Calculator, Plus, Minus, RotateCcw } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../../components/ui/card'
import { motion } from 'framer-motion'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Separator } from '../../components/ui/separator'

export function FinalGradeCalculator({ 
  grades, 
  finalExamWeight,
  minPassingGrade,
  finalGradeNeeded,
  isCalculating,
  onAddGrade,
  onRemoveGrade,
  onUpdateGrade,
  onSetFinalExamWeight,
  onSetMinPassingGrade,
  onReset,
  onCalculate
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader>
          <CardTitle>Cálculo para Prova Final</CardTitle>
          <CardDescription>
            Verifique qual nota você precisa tirar na prova final para ser aprovado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground">
            <div className="col-span-6">Nota</div>
            <div className="col-span-5">Peso</div>
            <div className="col-span-1"></div>
          </div>
          
          {grades.map((grade, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-6">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={grade.grade}
                  onChange={(e) => onUpdateGrade(index, 'grade', e.target.value)}
                  placeholder="0.0"
                />
              </div>
              <div className="col-span-5">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={grade.weight}
                  onChange={(e) => onUpdateGrade(index, 'weight', e.target.value)}
                  placeholder="1"
                />
              </div>
              <div className="col-span-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveGrade(index)}
                  disabled={grades.length <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <div className="grid grid-cols-1 gap-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onAddGrade}
              disabled={grades.length >= 10}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Nota
            </Button>
          </div>
          
          <Separator className="my-2" />
          
          <div className="grid gap-4">
            <div>
              <Label htmlFor="final-exam-weight">Peso da Prova Final</Label>
              <Input
                id="final-exam-weight"
                type="text"
                inputMode="decimal"
                value={finalExamWeight}
                onChange={(e) => onSetFinalExamWeight(e.target.value)}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="min-passing-grade">Nota Mínima para Aprovação</Label>
              <Input
                id="min-passing-grade"
                type="text"
                inputMode="decimal"
                value={minPassingGrade}
                onChange={(e) => onSetMinPassingGrade(e.target.value)}
                placeholder="6.0"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button 
            variant="outline" 
            onClick={onReset}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar
          </Button>
          <div className="flex items-center gap-4">
            {finalGradeNeeded !== null && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Nota Necessária:</span>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {finalGradeNeeded}
                </Badge>
              </div>
            )}
            <Button 
              onClick={onCalculate}
              disabled={isCalculating}
            >
              <Calculator className="h-4 w-4 mr-2" />
              {isCalculating ? 'Calculando...' : 'Calcular'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// Animações
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
}; 
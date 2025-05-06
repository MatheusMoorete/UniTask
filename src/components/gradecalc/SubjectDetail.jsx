import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { ArrowLeft, Plus, Trash2, Calculator, RotateCcw, Minus, Edit } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card'
import { motion } from 'framer-motion'
import { Input } from '../../components/ui/input'
import { Separator } from '../../components/ui/separator'

export function SubjectDetail({ 
  subject, 
  onBack, 
  onAddGrade, 
  onDeleteGrade,
  onEditGrade,
  calculator = null // Props do calculador de média (opcional)
}) {
  if (!subject) return null;

  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>
              {subject.name}
            </CardTitle>
            <CardDescription>
              Semestre: {subject.semester || 'Atual'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Notas</h3>
              <Button variant="outline" size="sm" onClick={onAddGrade}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Nota
              </Button>
            </div>
            
            {subject.grades?.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground">
                  <div className="col-span-5">Avaliação</div>
                  <div className="col-span-3">Nota</div>
                  <div className="col-span-2">Peso</div>
                  <div className="col-span-2 text-right">Ações</div>
                </div>
                
                {subject.grades.map(grade => (
                  <div key={grade.id} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5">{grade.title}</div>
                    <div className="col-span-3">
                      <Badge variant="outline" className="px-3 py-1">
                        {parseFloat(grade.value).toFixed(2).replace('.', ',')}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <Badge variant="secondary" className="px-3 py-1">
                        {parseFloat(grade.weight).toFixed(1).replace('.', ',')}
                      </Badge>
                    </div>
                    <div className="col-span-2 flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditGrade(grade)}
                        title="Editar nota"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteGrade('grade', grade.id)}
                        title="Excluir nota"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Separator className="my-4" />
                
                {(() => {
                  if (subject.grades?.length > 0) {
                    let totalWeight = 0;
                    let weightedSum = 0;
                    
                    subject.grades.forEach(grade => {
                      const value = parseFloat(grade.value);
                      const weight = parseFloat(grade.weight);
                      
                      if (!isNaN(value) && !isNaN(weight)) {
                        totalWeight += weight;
                        weightedSum += value * weight;
                      }
                    });
                    
                    if (totalWeight > 0) {
                      const average = (weightedSum / totalWeight).toFixed(2);
                      const minGrade = parseFloat(subject.minGrade || '6.0');
                      const isAboveMin = parseFloat(average) >= minGrade;
                      
                      return (
                        <div className="flex justify-end items-center gap-4">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold">Média Atual:</span>
                            <Badge 
                              className={`text-lg px-4 py-2 ${
                                isAboveMin ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                              }`}
                            >
                              {average.replace('.', ',')}
                            </Badge>
                            <span className="text-xs text-muted-foreground mt-1">
                              {isAboveMin ? 'Acima da média mínima' : 'Abaixo da média mínima'}
                            </span>
                          </div>
                        </div>
                      );
                    }
                  }
                  return null;
                })()}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma nota cadastrada ainda.</p>
                <p className="mt-1">Clique em &quot;Adicionar Nota&quot; para começar.</p>
              </div>
            )}
          </div>
          
          {calculator && (
            <div className="pt-4">
              <h3 className="text-lg font-semibold mb-4">Calculadora de Média</h3>
              <Card className="bg-muted/40">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground mb-2">
                    <div className="col-span-6">Nota</div>
                    <div className="col-span-5">Peso</div>
                    <div className="col-span-1"></div>
                  </div>
                  
                  {calculator.grades.map((grade, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-center mb-2">
                      <div className="col-span-6">
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={grade.grade}
                          onChange={(e) => calculator.onUpdateGrade(index, 'grade', e.target.value)}
                          placeholder="0.0"
                        />
                      </div>
                      <div className="col-span-5">
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={grade.weight}
                          onChange={(e) => calculator.onUpdateGrade(index, 'weight', e.target.value)}
                          placeholder="1"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => calculator.onRemoveGrade(index)}
                          disabled={calculator.grades.length <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="grid grid-cols-1 gap-4 mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={calculator.onAddGrade}
                      disabled={calculator.grades.length >= 10}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Nota
                    </Button>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button 
                      variant="outline" 
                      onClick={calculator.onReset}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Limpar
                    </Button>
                    <div className="flex items-center gap-4">
                      {calculator.average !== null && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Média:</span>
                          <Badge variant="outline" className="text-lg px-3 py-1">
                            {calculator.average}
                          </Badge>
                        </div>
                      )}
                      <Button 
                        onClick={calculator.onCalculate}
                        disabled={calculator.isCalculating}
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        {calculator.isCalculating ? 'Calculando...' : 'Calcular'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
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
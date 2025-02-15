import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Card, CardContent, CardTitle } from '../ui/card'
import { MinusCircle, PlusCircle, Pencil, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import PropTypes from 'prop-types'

export function SubjectCard({ 
  subject, 
  viewMode, 
  onEdit, 
  onDelete, 
  onAddAbsence, 
  onRemoveAbsence 
}) {
  const { percentage, remainingAbsences, status } = subject.stats

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className={cn(
        "overflow-hidden relative",
        viewMode === 'list' && "flex flex-col sm:flex-row items-center"
      )}>
        {/* Ações - Posição condicional baseada no viewMode */}
        <div className={cn(
          "flex gap-2 z-10",
          viewMode === 'grid' 
            ? "absolute top-4 right-4" 
            : "absolute bottom-4 right-4"
        )}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-background/80"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-background/80"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className={cn(
          "p-4 sm:p-6 w-full",
          viewMode === 'list' && "flex flex-col sm:flex-row items-center gap-4 sm:gap-8"
        )}>
          {/* Informações da Matéria */}
          <div className={cn(
            "space-y-4 sm:space-y-6 w-full",
            viewMode === 'list' && "flex flex-col sm:flex-row items-center gap-4 sm:gap-8 flex-1 sm:space-y-0"
          )}>
            {/* Nome e Carga Horária */}
            <div className={cn(
              "space-y-1 w-full",
              viewMode === 'grid' && "pr-20", // Padding apenas no modo grid
              viewMode === 'list' && "sm:w-[200px] md:w-[250px] lg:w-[300px] sm:min-w-[200px]"
            )}>
              <CardTitle className="text-xl truncate">{subject.name}</CardTitle>
              <p className="text-sm text-muted-foreground truncate">
                {subject.hasMultipleTypes && subject.type2 ? (
                  <>
                    {subject.type1.hours}h ({subject.type1.name}) + {subject.type2.hours}h ({subject.type2.name})
                  </>
                ) : (
                  <>{subject.totalHours}h totais</>
                )}
              </p>
            </div>

            {/* Barra de Progresso e Controles */}
            <div className={cn(
              "space-y-2 w-full",
              viewMode === 'list' && "sm:flex-1 sm:space-y-0 sm:flex items-center gap-4"
            )}>
              <div className={cn(
                "flex items-center gap-2",
                viewMode === 'list' && "flex-1"
              )}>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onRemoveAbsence}
                  disabled={subject.type1.absences <= 0}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <div className="flex-1 space-y-1">
                  <Progress 
                    value={percentage}
                    className="h-2"
                    indicatorClassName={cn(
                      "transition-all duration-300",
                      status === 'risk' ? "bg-red-500" :
                      status === 'warning' ? "bg-yellow-500" :
                      "bg-green-500"
                    )}
                  />
                  <div className="flex items-center justify-end text-sm text-muted-foreground">
                    <span>{subject.type1.absences || 0} de {subject.maxAbsences.type1} faltas</span>
                  </div>
                </div>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onAddAbsence}
                  disabled={remainingAbsences <= 0}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Estatísticas */}
            <div className={cn(
              "grid grid-cols-2 gap-4 pt-4 border-t",
              viewMode === 'list' && "sm:flex items-center sm:gap-8 sm:pt-0 sm:border-0 w-full sm:w-[180px] lg:w-[200px] sm:min-w-[180px] pb-16" // Adicionado padding-bottom para os botões
            )}>
              <div>
                <span className="text-sm text-muted-foreground">Utilização</span>
                <p className={cn(
                  "text-2xl font-bold",
                  status === 'risk' ? "text-red-500" :
                  status === 'warning' ? "text-yellow-500" :
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
}

SubjectCard.propTypes = {
  subject: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    hasMultipleTypes: PropTypes.bool.isRequired,
    totalHours: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    type1: PropTypes.shape({
      name: PropTypes.string.isRequired,
      hours: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]),
      hoursPerClass: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]).isRequired,
      absences: PropTypes.number.isRequired
    }).isRequired,
    type2: PropTypes.shape({
      name: PropTypes.string,
      hours: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]),
      hoursPerClass: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ])
    }),
    maxAbsences: PropTypes.shape({
      type1: PropTypes.number.isRequired,
      type2: PropTypes.number
    }).isRequired,
    stats: PropTypes.shape({
      percentage: PropTypes.number.isRequired,
      remainingAbsences: PropTypes.number.isRequired,
      status: PropTypes.oneOf(['normal', 'warning', 'risk']).isRequired,
      totalAbsences: PropTypes.number.isRequired,
      maxAbsences: PropTypes.number.isRequired
    }).isRequired
  }).isRequired,
  viewMode: PropTypes.oneOf(['grid', 'list']).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onAddAbsence: PropTypes.func.isRequired,
  onRemoveAbsence: PropTypes.func.isRequired
} 
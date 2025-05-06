import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Pencil } from 'lucide-react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { format, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import PropTypes from 'prop-types'

StudyTopicItem.propTypes = {
  topic: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subject: PropTypes.string,
    description: PropTypes.string,
    examDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    progress: PropTypes.number.isRequired
  }).isRequired
}

export function StudyTopicItem({ topic }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Formatar a data da prova de forma consistente
  const getFormattedDate = (examDate) => {
    if (!examDate) return 'Data não definida';

    let examDay;
    if (typeof examDate === 'string') {
      // Garantir que a string da data está no formato ISO
      if (examDate.includes('T')) {
        examDay = startOfDay(new Date(examDate));
      } else {
        // Se não tiver informação de hora, é uma data simples (YYYY-MM-DD)
        examDay = startOfDay(new Date(`${examDate}T00:00:00`));
      }
    } else {
      examDay = startOfDay(examDate);
    }

    return format(examDay, "d 'de' MMMM", { locale: ptBR });
  };

  const formattedDate = getFormattedDate(topic.examDate);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-4 relative group"
    >
      <div className="flex items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:text-primary"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">{topic.title}</h4>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground mb-2">
            <span className="font-medium">{topic.subject}</span>
            <span className="mx-2">•</span>
            <span>Prova: {formattedDate}</span>
          </div>

          {topic.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {topic.description}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Progress value={topic.progress} className="flex-1" />
            <span className="text-sm font-medium">
              {topic.progress}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
} 
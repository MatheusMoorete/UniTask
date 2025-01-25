import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Pencil } from 'lucide-react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

  const formattedDate = topic.examDate ? 
    format(new Date(topic.examDate), "d 'de' MMMM", { locale: ptBR }) : 
    'Data não definida'

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
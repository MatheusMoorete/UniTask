import { useState } from 'react'
import { Progress } from '../ui/progress'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { 
  ChevronDown, 
  ChevronUp,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  CalendarRange
} from 'lucide-react'
import { Card, CardHeader, CardContent } from '../ui/card'
import { cn } from '../../lib/utils'
import { GenerateRevisionButton } from './GenerateRevisionButton'
import { format, startOfDay } from 'date-fns'
import { Separator } from '../ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"

export function StudyTopicProgress({ topic, onProgressUpdate, onDelete, onEdit }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const handleTopicToggle = (topicId, checked) => {
    const updatedTopics = topic.topics.map(t => 
      t.id === topicId ? { ...t, completed: checked } : t
    )
    
    const completedCount = updatedTopics.filter(t => t.completed).length
    const newProgress = Math.round((completedCount / updatedTopics.length) * 100)
    
    onProgressUpdate(topic.id, {
      topics: updatedTopics,
      progress: newProgress
    })
  }

  const handleRevisionToggle = (topicId) => {
    const updatedTopics = topic.topics.map(t => 
      t.id === topicId 
        ? { ...t, needsRevision: !t.needsRevision }
        : t
    )
    
    onProgressUpdate(topic.id, {
      topics: updatedTopics
    })
  }

  return (
    <Card className={cn(
      "overflow-hidden",
      !isExpanded && "min-h-[120px]",
      isExpanded && "min-h-[200px]"
    )}>
      <CardHeader className="p-4 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              className="p-1"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <div>
              <h4 className="font-medium text-lg">{topic.title}</h4>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mt-1">
                {topic.examDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {typeof topic.examDate === 'string' && topic.examDate.includes('T') ? 
                      format(startOfDay(new Date(topic.examDate)), "dd/MM/yyyy") :
                      typeof topic.examDate === 'string' ? 
                        format(startOfDay(new Date(`${topic.examDate}T00:00:00`)), "dd/MM/yyyy") :
                        format(startOfDay(topic.examDate), "dd/MM/yyyy")
                    }
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {topic.progress}% concluído
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {topic.examDate && (
                  <>
                    <DropdownMenuItem onClick={() => document.getElementById(`generate-revision-${topic.id}`)?.click()}>
                      <CalendarRange className="h-4 w-4 mr-2" />
                      Gerar Cronograma
                    </DropdownMenuItem>
                    <Separator className="my-2" />
                  </>
                )}
                <DropdownMenuItem onClick={() => onEdit(topic)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <Progress value={topic.progress} className="h-2" />
        
        {isExpanded && topic.topics?.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3 min-h-[100px] max-h-[60vh] sm:max-h-[40vh] overflow-y-auto pr-2">
              {topic.topics.map((topicItem) => (
                <div 
                  key={topicItem.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    "hover:bg-muted/50 group",
                    topicItem.completed && "bg-muted/30"
                  )}
                >
                  <Checkbox
                    id={topicItem.id}
                    checked={topicItem.completed}
                    onCheckedChange={(checked) => 
                      handleTopicToggle(topicItem.id, checked)
                    }
                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <label 
                    htmlFor={topicItem.id}
                    className={cn(
                      "text-sm flex-1 cursor-pointer break-words transition-colors",
                      topicItem.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {topicItem.title}
                  </label>
                  <Button
                    variant={topicItem.needsRevision ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-7 px-2 gap-1.5 min-w-[105px] justify-center",
                      !topicItem.completed && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => handleRevisionToggle(topicItem.id)}
                    disabled={!topicItem.completed}
                  >
                    <BookOpen className={cn(
                      "h-3 w-3 transition-colors",
                      topicItem.needsRevision && "text-primary-foreground"
                    )} />
                    {topicItem.needsRevision ? "Revisar" : "Não Revisar"}
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tópico</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este tópico? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(topic.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="hidden">
        <GenerateRevisionButton 
          topic={topic} 
          id={`generate-revision-${topic.id}`}
        />
      </div>
    </Card>
  )
} 
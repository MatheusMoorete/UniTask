import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../components/ui/button'
import { StudyTopicsList } from '../components/study/StudyTopicsList'
import { CreateStudyTopicDialog } from '../components/study/CreateStudyTopicDialog'

export default function StudyRoom() {
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false)

  return (
    <div className="space-y-4 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Sala de Estudos</h2>
          <p className="text-muted-foreground">
            Organize suas provas, tópicos de estudo e acompanhe seu progresso
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateTopicOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Prova
        </Button>
      </div>

      <StudyTopicsList />

      <CreateStudyTopicDialog 
        open={isCreateTopicOpen}
        onOpenChange={setIsCreateTopicOpen}
      />
    </div>
  )
} 
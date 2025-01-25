import { useStudyRoom } from '../../hooks/useStudyRoom'
import { StudyTopicProgress } from './StudyTopicProgress'
import { CreateStudyTopicDialog } from './CreateStudyTopicDialog'
import { useState } from 'react'
import { StudyStats } from './StudyStats'

export function StudyTopicsList() {
  const { topics, loading, updateTopicProgress, deleteTopic, updateTopic } = useStudyRoom()
  const [editingTopic, setEditingTopic] = useState(null)

  const handleEdit = (topic) => {
    setEditingTopic(topic)
  }

  const handleDelete = async (topicId) => {
    try {
      await deleteTopic(topicId)
    } catch (error) {
      console.error('Erro ao deletar tópico:', error)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 animate-pulse px-2 sm:px-0">
        {[1,2,3].map(i => (
          <div key={i} className="h-32 bg-muted rounded-lg" />
        ))}
      </div>
    )
  }

  if (topics.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-card mx-2 sm:mx-0">
        <p className="text-muted-foreground">
          Nenhum tópico de estudo criado ainda.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex gap-4">
        <div className="grid grid-cols-1 gap-4 px-2 sm:px-0 w-full sm:w-[70%] self-start">
          {topics.map((topic) => (
            <StudyTopicProgress
              key={topic.id}
              topic={topic}
              onProgressUpdate={updateTopicProgress}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>

        <StudyStats />
      </div>

      <CreateStudyTopicDialog
        open={!!editingTopic}
        onOpenChange={(open) => !open && setEditingTopic(null)}
        topicToEdit={editingTopic}
        mode="edit"
      />
    </>
  )
} 
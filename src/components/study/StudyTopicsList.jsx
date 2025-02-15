import { useStudyRoom } from '../../hooks/useStudyRoom'
import { StudyTopicProgress } from './StudyTopicProgress'
import { CreateStudyTopicDialog } from './CreateStudyTopicDialog'
import { useState, useMemo } from 'react'
import { StudyStats } from './StudyStats'
import { motion, AnimatePresence } from 'framer-motion'

export function StudyTopicsList({ searchQuery = '', filterStatus = 'all', sortBy = 'date' }) {
  const { topics, loading, updateTopicProgress, deleteTopic, updateTopic } = useStudyRoom()
  const [editingTopic, setEditingTopic] = useState(null)

  // Filtragem e ordenação dos tópicos
  const filteredAndSortedTopics = useMemo(() => {
    let filtered = [...topics]

    // Aplicar pesquisa
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(topic => 
        topic.title.toLowerCase().includes(query) ||
        topic.topics.some(t => t.title.toLowerCase().includes(query))
      )
    }

    // Aplicar filtro de status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(topic => {
        switch (filterStatus) {
          case 'pending':
            return topic.progress === 0
          case 'in-progress':
            return topic.progress > 0 && topic.progress < 100
          case 'completed':
            return topic.progress === 100
          default:
            return true
        }
      })
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.examDate || '9999-12-31') - new Date(b.examDate || '9999-12-31')
        case 'progress':
          return b.progress - a.progress
        case 'topics':
          return b.topics.length - a.topics.length
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt)
        default:
          return 0
      }
    })

    return filtered
  }, [topics, searchQuery, filterStatus, sortBy])

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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 border rounded-lg bg-card mx-2 sm:mx-0"
      >
        <p className="text-muted-foreground">
          Nenhum tópico de estudo criado ainda.
        </p>
      </motion.div>
    )
  }

  if (filteredAndSortedTopics.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 border rounded-lg bg-card mx-2 sm:mx-0"
      >
        <p className="text-muted-foreground">
          Nenhum tópico encontrado com os filtros atuais.
        </p>
      </motion.div>
    )
  }

  return (
    <>
      <div className="flex gap-4">
        <div className="grid grid-cols-1 gap-4 px-2 sm:px-0 w-full sm:w-[70%] self-start">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedTopics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <StudyTopicProgress
                  topic={topic}
                  onProgressUpdate={updateTopicProgress}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <StudyStats filteredTopics={filteredAndSortedTopics} />
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
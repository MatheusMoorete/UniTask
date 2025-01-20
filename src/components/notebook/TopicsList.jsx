import { ScrollArea } from '../ui/ScrollArea'
import { Button } from '../ui/button'
import { Folder, FolderOpen, Plus, Trash2 } from 'lucide-react'
import { useNotebook } from '../../hooks/useNotebook'
import { cn } from '../../lib/utils'

export function TopicsList() {
  const { 
    topics, 
    selectedTopic, 
    setSelectedTopic,
    deleteTopic 
  } = useNotebook()

  return (
    <ScrollArea className="h-[calc(100vh-180px)]">
      <div className="space-y-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2",
            !selectedTopic && "bg-accent/10 text-accent"
          )}
          onClick={() => setSelectedTopic(null)}
        >
          <FolderOpen className="h-4 w-4" />
          Todas as Notas
        </Button>
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="group flex items-center"
          >
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                selectedTopic === topic.id && "bg-accent/10 text-accent"
              )}
              onClick={() => setSelectedTopic(topic.id)}
            >
              <Folder className="h-4 w-4" />
              {topic.name}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteTopic(topic.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
} 
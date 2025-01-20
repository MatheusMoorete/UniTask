import { useState } from 'react'
import { Search, Plus, FolderPlus } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { CreateNoteDialog } from './CreateNoteDialog'
import { CreateTopicDialog } from './CreateTopicDialog'
import { TopicsList } from './TopicsList'

export function NotebookLayout({ children }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false)
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false)

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-64 border-r p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Tópicos</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsCreateTopicOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <TopicsList />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="border-b">
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar notas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Button 
              size="sm"
              onClick={() => setIsCreateNoteOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Nota
            </Button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </div>

      <CreateNoteDialog 
        open={isCreateNoteOpen} 
        onOpenChange={setIsCreateNoteOpen} 
      />
      <CreateTopicDialog 
        open={isCreateTopicOpen} 
        onOpenChange={setIsCreateTopicOpen}
      />
    </div>
  )
} 
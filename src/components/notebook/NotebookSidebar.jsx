import { useState } from 'react'
import { Search, Plus, FileText } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export function NotebookSidebar() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="w-64 border-r bg-card p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Minhas Matérias</h2>
        <Button variant="ghost" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar matéria..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        {/* Lista de matérias virá aqui */}
      </div>
    </div>
  )
} 
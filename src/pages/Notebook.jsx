import { NotebookLayout } from '../components/notebook/NotebookLayout'
import { useNotebook } from '../hooks/useNotebook'
import { Card } from '../components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Folder, FileText, Book } from 'lucide-react'

export default function Notebook() {
  const { notes, loading } = useNotebook()

  if (loading) {
    return (
      <NotebookLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </NotebookLayout>
    )
  }

  return (
    <NotebookLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <Card 
            key={note.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-medium">{note.title}</h3>
              </div>
              {note.topic && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Folder className="h-3 w-3" />
                  <span>{note.topic}</span>
                </div>
              )}
            </div>
            <div 
              className="mt-2 text-sm text-muted-foreground line-clamp-3"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Criado em {format(new Date(note.createdAt), "d 'de' MMMM", { locale: ptBR })}
              </span>
              {note.tags && note.tags.length > 0 && (
                <div className="flex gap-1">
                  {note.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-1 rounded-full bg-primary/10 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}

        {notes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center h-[60vh] text-center">
            <Book className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Seu caderno está vazio</h3>
            <p className="text-muted-foreground">
              Comece criando uma nova nota ou tópico usando os botões acima
            </p>
          </div>
        )}
      </div>
    </NotebookLayout>
  )
} 
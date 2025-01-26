import { FileText, Trash2 } from 'lucide-react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'

export function MaterialCard({ material, onRemove }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="font-medium">{material.title}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onRemove(material)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        {material.type === 'file' && (
          <a 
            href={`${import.meta.env.VITE_SUPABASE_PUBLIC_BUCKET_URL}/${material.fileUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Baixar arquivo
          </a>
        )}
      </div>
    </Card>
  )
} 
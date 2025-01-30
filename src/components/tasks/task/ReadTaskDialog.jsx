import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Label } from "../../ui/label"
import { Badge } from "../../ui/badge"

export function ReadTaskDialog({ task, onClose }) {
  if (!task) return null

  return (
    <Dialog open={!!task} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>
            {task.description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {task.moreInfo && (
            <div className="text-sm space-y-2">
              <Label>Mais Informações</Label>
              <div className="prose prose-sm max-w-none">
                {task.moreInfo.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}
          {task.tags && task.tags.length > 0 && (
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose()}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
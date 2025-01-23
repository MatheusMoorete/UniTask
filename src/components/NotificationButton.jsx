import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from './ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover'
import { cn } from '../lib/utils'

export function NotificationButton() {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mb-3" />
          <h4 className="font-medium mb-2">Ferramenta em desenvolvimento</h4>
          <p className="text-sm text-muted-foreground">
            Em breve você poderá receber notificações importantes aqui
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
} 
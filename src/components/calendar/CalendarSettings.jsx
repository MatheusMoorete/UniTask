import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '../ui/dialog'
import { Settings } from 'lucide-react'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { useGoogleCalendar } from '../../contexts/GoogleCalendarContext'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"

export function CalendarSettings() {
  const { 
    calendars, 
    visibleCalendars, 
    toggleCalendarVisibility,
    dashboardCalendars,
    toggleDashboardVisibility
  } = useGoogleCalendar()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="p-3 text-gray-500 hover:text-gray-900">
          <Settings className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurações do Calendário</DialogTitle>
        </DialogHeader>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="calendars">
            <AccordionTrigger className="text-sm">
              Filtro de Agendas Google
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {calendars.map((calendar) => (
                  <div key={calendar.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`calendar-${calendar.id}`}
                      checked={visibleCalendars.includes(calendar.id)}
                      onCheckedChange={() => toggleCalendarVisibility(calendar.id)}
                    />
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: calendar.backgroundColor }}
                    />
                    <Label 
                      htmlFor={`calendar-${calendar.id}`}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {calendar.summary}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="dashboard">
            <AccordionTrigger className="text-sm">
              Filtro de Eventos do Dashboard
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {calendars.map((calendar) => (
                  <div key={calendar.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dashboard-${calendar.id}`}
                      checked={dashboardCalendars.includes(calendar.id)}
                      onCheckedChange={() => toggleDashboardVisibility(calendar.id)}
                    />
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: calendar.backgroundColor }}
                    />
                    <Label 
                      htmlFor={`dashboard-${calendar.id}`}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {calendar.summary}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="view">
            <AccordionTrigger className="text-sm">
              Opções de Visualização
            </AccordionTrigger>
            <AccordionContent>
              {/* Adicione aqui outras opções de visualização */}
              <div className="text-sm text-gray-500 py-2">
                Mais opções em breve...
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="notifications">
            <AccordionTrigger className="text-sm">
              Notificações
            </AccordionTrigger>
            <AccordionContent>
              {/* Adicione aqui opções de notificação */}
              <div className="text-sm text-gray-500 py-2">
                Configurações de notificação em desenvolvimento...
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  )
} 
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function UpcomingDeadlines({ events = [] }) {
  // Função para formatar a data do evento
  const formatEventDate = (event) => {
    const date = new Date(event.start.dateTime || event.start.date)
    return format(date, "d 'de' MMMM", { locale: ptBR })
  }

  // Função para determinar a cor do texto baseada na cor do calendário
  const getTextColor = (backgroundColor) => {
    if (!backgroundColor) return 'text-foreground'
    
    // Remove o # se existir e converte para RGB
    const hex = backgroundColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    // Calcula a luminosidade
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    
    // Retorna branco para cores escuras e preto para cores claras
    return luminance > 0.5 ? 'text-foreground' : 'text-white'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prazos Próximos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Nenhum prazo próximo encontrado
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="flex flex-col space-y-1"
              >
                <div 
                  className="rounded-md p-2"
                  style={{
                    backgroundColor: event.calendarColor || 'transparent',
                  }}
                >
                  <p className={`font-medium ${getTextColor(event.calendarColor)}`}>
                    {event.summary}
                  </p>
                  <div className={`text-sm ${getTextColor(event.calendarColor)}`}>
                    {formatEventDate(event)}
                    <span className="mx-1">•</span>
                    {event.calendarSummary}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
} 
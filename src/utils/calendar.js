import { saveAs } from 'file-saver'
import { format } from 'date-fns'

export function formatDateForICS(date) {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function createICSFile(event) {
  // Formatar datas para o formato ICS (UTCString)
  const formatToUTC = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '')
  }

  // Dados do evento
  const startDate = formatToUTC(event.start)
  const endDate = formatToUTC(event.end)
  const now = formatToUTC(new Date())
  const title = event.title || 'Evento sem título'
  const description = event.description || ''
  const location = event.location || ''

  // Criar conteúdo do arquivo ICS
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UniTask//Calendar//PT-BR',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Math.random().toString(36).substring(2)}@unitask.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  // Criar e salvar o arquivo
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${format(new Date(event.start), 'yyyy-MM-dd')}.ics`
  
  saveAs(blob, filename)
}

// Função para ler e interpretar arquivos ICS
export function parseICSFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = function(e) {
      try {
        const content = e.target.result
        const events = []
        
        // Dividir o conteúdo por eventos
        const eventBlocks = content.split('BEGIN:VEVENT')
        
        // Ignorar o primeiro bloco (cabeçalho do calendário)
        for (let i = 1; i < eventBlocks.length; i++) {
          const eventBlock = eventBlocks[i]
          if (!eventBlock.includes('END:VEVENT')) continue
          
          // Extrair propriedades do evento
          const event = {}
          
          // Extrair título (SUMMARY)
          const summaryMatch = eventBlock.match(/SUMMARY:(.*?)(?:\r\n|\r|\n)/i)
          if (summaryMatch) {
            event.title = summaryMatch[1].trim()
          }
          
          // Extrair descrição (DESCRIPTION)
          const descriptionMatch = eventBlock.match(/DESCRIPTION:(.*?)(?:\r\n|\r|\n)/i)
          if (descriptionMatch) {
            event.description = descriptionMatch[1].trim()
          }
          
          // Extrair local (LOCATION)
          const locationMatch = eventBlock.match(/LOCATION:(.*?)(?:\r\n|\r|\n)/i)
          if (locationMatch) {
            event.location = locationMatch[1].trim()
          }
          
          // Extrair data de início (DTSTART)
          const startMatch = eventBlock.match(/DTSTART(?:;[^:]*)?:(.*?)(?:\r\n|\r|\n)/i)
          if (startMatch) {
            const startDate = parseICSDate(startMatch[1].trim())
            if (startDate) {
              event.start = startDate
            }
          }
          
          // Extrair data de fim (DTEND)
          const endMatch = eventBlock.match(/DTEND(?:;[^:]*)?:(.*?)(?:\r\n|\r|\n)/i)
          if (endMatch) {
            const endDate = parseICSDate(endMatch[1].trim())
            if (endDate) {
              event.end = endDate
            }
          }
          
          // Verificar se é um evento de dia inteiro
          event.allDay = isAllDayEvent(event.start, event.end)
          
          // Adicionar o evento à lista apenas se tiver título e datas válidas
          if (event.title && event.start && event.end) {
            events.push(event)
          }
        }
        
        resolve(events)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = function() {
      reject(new Error('Erro ao ler o arquivo ICS'))
    }
    
    reader.readAsText(file)
  })
}

// Função auxiliar para converter data do formato ICS para JavaScript Date
function parseICSDate(icsDate) {
  if (!icsDate) return null
  
  try {
    // Remover 'Z' indicador de UTC se presente
    const dateStr = icsDate.endsWith('Z') ? icsDate.slice(0, -1) : icsDate
    
    // Formato: YYYYMMDDTHHMMSS
    const year = parseInt(dateStr.slice(0, 4))
    const month = parseInt(dateStr.slice(4, 6)) - 1 // Meses em JS começam em 0
    const day = parseInt(dateStr.slice(6, 8))
    
    let hours = 0, minutes = 0, seconds = 0
    
    // Se contém informação de hora (tem 'T')
    if (dateStr.includes('T')) {
      const timeStr = dateStr.split('T')[1]
      hours = parseInt(timeStr.slice(0, 2))
      minutes = parseInt(timeStr.slice(2, 4))
      seconds = timeStr.length >= 6 ? parseInt(timeStr.slice(4, 6)) : 0
    }
    
    const date = new Date(year, month, day, hours, minutes, seconds)
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      console.error('Data inválida:', icsDate)
      return null
    }
    
    return date
  } catch (error) {
    console.error('Erro ao converter data:', error)
    return null
  }
}

// Função auxiliar para verificar se é um evento de dia inteiro
function isAllDayEvent(start, end) {
  if (!start || !end) return false
  
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  // Verificar se as horas são 00:00:00 e 23:59:59
  const isStartMidnight = startDate.getHours() === 0 && 
                         startDate.getMinutes() === 0 && 
                         startDate.getSeconds() === 0
  
  const isEndMidnight = endDate.getHours() === 23 && 
                       endDate.getMinutes() === 59 && 
                       endDate.getSeconds() === 59
  
  return isStartMidnight && isEndMidnight
} 
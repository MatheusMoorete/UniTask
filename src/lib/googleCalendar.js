// Credenciais do OAuth 2.0
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  'https://www.googleapis.com/discovery/v1/apis/oauth2/v2/rest'
]
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email'

let tokenClient = null
let gapiInited = false
let gisInited = false

// Calendários que queremos mostrar no dashboard
const DASHBOARD_CALENDARS = [
  'Provas 111',
  'prazos!',
  'MedUfes 111'
]

// Função para salvar o token no localStorage
function saveToken(token) {
  if (token) {
    try {
      localStorage.setItem('googleCalendarToken', JSON.stringify(token))
    } catch (error) {
      console.error('Erro ao salvar token:', error)
    }
  } else {
    localStorage.removeItem('googleCalendarToken')
  }
}

// Função para recuperar o token do localStorage
function loadToken() {
  try {
    const savedToken = localStorage.getItem('googleCalendarToken')
    return savedToken ? JSON.parse(savedToken) : null
  } catch (error) {
    console.error('Erro ao carregar token:', error)
    return null
  }
}

// Função para inicializar o token client
function initTokenClient() {
  if (!window.google?.accounts?.oauth2) {
    console.error('Google Identity Services não está disponível')
    return null
  }

  try {
    console.log('Inicializando token client...')
    return window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // Definido na hora do uso
      error_callback: (err) => {
        console.error('Erro no token client:', err)
      }
    })
  } catch (error) {
    console.error('Erro ao inicializar token client:', error)
    return null
  }
}

export async function initializeGoogleCalendar() {
  return new Promise((resolve, reject) => {
    // Primeiro, carregamos a API do Google
    const loadGapi = new Promise((resolveGapi, rejectGapi) => {
      if (window.gapi) {
        console.log('GAPI já está carregado')
        resolveGapi()
        return
      }

      console.log('Carregando GAPI...')
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.async = true
      script.defer = true
      script.onload = () => {
        console.log('Script GAPI carregado, inicializando cliente...')
        window.gapi.load('client', async () => {
          try {
            console.log('Inicializando cliente GAPI...')
            await window.gapi.client.init({
              discoveryDocs: DISCOVERY_DOCS,
            })
            console.log('Cliente GAPI inicializado com sucesso')
            
            // Tenta restaurar o token salvo
            const savedToken = loadToken()
            if (savedToken) {
              console.log('Token encontrado no localStorage, restaurando...')
              window.gapi.client.setToken(savedToken)
            }
            
            gapiInited = true
            resolveGapi()
          } catch (err) {
            console.error('Erro ao inicializar GAPI client:', err)
            rejectGapi(err)
          }
        })
      }
      script.onerror = (error) => {
        console.error('Erro ao carregar script GAPI:', error)
        rejectGapi(new Error('Falha ao carregar script do GAPI'))
      }
      document.head.appendChild(script)
    })

    // Depois, carregamos o cliente de autenticação
    const loadGis = new Promise((resolveGis, rejectGis) => {
      if (window.google?.accounts?.oauth2) {
        console.log('GIS já está carregado')
        tokenClient = initTokenClient() // Inicializa o token client aqui também
        if (tokenClient) {
          gisInited = true
          resolveGis()
          return
        }
      }

      console.log('Carregando GIS...')
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        try {
          console.log('Script GIS carregado, inicializando token client...')
          tokenClient = initTokenClient()
          if (!tokenClient) {
            throw new Error('Falha ao inicializar token client')
          }
          console.log('Token client inicializado com sucesso')
          gisInited = true
          resolveGis()
        } catch (err) {
          console.error('Erro ao inicializar token client:', err)
          rejectGis(err)
        }
      }
      script.onerror = (error) => {
        console.error('Erro ao carregar script GIS:', error)
        rejectGis(new Error('Falha ao carregar script do GIS'))
      }
      document.head.appendChild(script)
    })

    // Aguardamos ambos os carregamentos
    Promise.all([loadGapi, loadGis])
      .then(() => {
        if (!tokenClient) {
          // Tenta inicializar o token client uma última vez
          tokenClient = initTokenClient()
          if (!tokenClient) {
            throw new Error('Token client não pôde ser inicializado')
          }
        }
        console.log('Ambos os clientes (GAPI e GIS) foram inicializados com sucesso')
        resolve()
      })
      .catch((err) => {
        console.error('Erro durante a inicialização:', err)
        reject(err)
      })
  })
}

export async function authenticateAndGetEvents() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      // Tenta inicializar o token client uma última vez
      tokenClient = initTokenClient()
      if (!tokenClient) {
        console.error('Token client não inicializado e não foi possível inicializá-lo')
        reject(new Error('Token client não inicializado'))
        return
      }
    }

    try {
      console.log('Iniciando processo de autenticação...')
      tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
          console.error('Erro na resposta do token:', resp)
          reject(resp)
          return
        }
        try {
          console.log('Autenticação bem-sucedida, salvando token...')
          const token = window.gapi.client.getToken()
          console.log('Token obtido:', { ...token, access_token: 'REDACTED' })
          saveToken(token)

          console.log('Buscando eventos e calendários...')
          const [events, calendars] = await Promise.all([
            listUpcomingEvents(),
            listCalendars()
          ])
          console.log('Dados obtidos com sucesso')
          resolve({ events, calendars })
        } catch (err) {
          console.error('Erro ao processar autenticação:', err)
          reject(err)
        }
      }

      // Se já temos um token válido, não precisamos solicitar novamente
      const currentToken = window.gapi?.client?.getToken()
      if (currentToken && !currentToken.error) {
        console.log('Token válido encontrado, usando-o...')
        tokenClient.callback({ access_token: currentToken.access_token })
      } else {
        console.log('Solicitando novo token...')
        tokenClient.requestAccessToken({
          prompt: 'consent'
        })
      }
    } catch (err) {
      console.error('Erro durante autenticação:', err)
      reject(err)
    }
  })
}

// Função para verificar se o token ainda é válido
export async function checkSession() {
  try {
    console.log('Verificando sessão...')
    const token = window.gapi?.client?.getToken()
    if (!token) {
      console.log('Nenhum token encontrado')
      return false
    }

    console.log('Token encontrado, verificando validade...')
    // Tenta fazer uma chamada simples para verificar se o token é válido
    await window.gapi.client.oauth2.userinfo.get()
    console.log('Sessão válida')
    return true
  } catch (error) {
    console.error('Erro ao verificar sessão:', error)
    // Se houver erro, limpa o token
    saveToken(null)
    if (window.gapi?.client) {
      window.gapi.client.setToken('')
    }
    return false
  }
}

async function listCalendars() {
  if (!window.gapi?.client?.calendar) {
    throw new Error('API do Calendar não inicializada')
  }

  try {
    console.log('Buscando lista de calendários...')
    const response = await window.gapi.client.calendar.calendarList.list()
    console.log('Lista de calendários obtida:', response.result.items)
    return response.result.items || []
  } catch (err) {
    console.error('Erro ao buscar lista de calendários:', err)
    throw err
  }
}

async function listUpcomingEvents() {
  if (!window.gapi?.client?.calendar) {
    throw new Error('API do Calendar não inicializada')
  }

  try {
    // Primeiro, obtém a lista de calendários
    const calendars = await listCalendars()
    
    // Filtra apenas os calendários que queremos mostrar no dashboard
    const dashboardCalendars = calendars.filter(cal => 
      DASHBOARD_CALENDARS.includes(cal.summary)
    )

    // Define o início como hoje
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Define o fim como 30 dias a partir de hoje
    const thirtyDaysFromNow = new Date(today)
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    // Busca eventos de cada calendário selecionado
    const allEvents = await Promise.all(
      dashboardCalendars.map(async calendar => {
        const request = {
          calendarId: calendar.id,
          timeMin: today.toISOString(),
          timeMax: thirtyDaysFromNow.toISOString(),
          showDeleted: false,
          singleEvents: true,
          maxResults: 10,
          orderBy: 'startTime'
        }

        try {
          const response = await window.gapi.client.calendar.events.list(request)
          return response.result.items.map(event => ({
            ...event,
            calendarSummary: calendar.summary,
            calendarColor: calendar.backgroundColor
          }))
        } catch (error) {
          console.error(`Erro ao buscar eventos do calendário ${calendar.summary}:`, error)
          return []
        }
      })
    )

    // Combina todos os eventos em uma única lista e ordena por data
    const events = allEvents
      .flat()
      .sort((a, b) => new Date(a.start.dateTime || a.start.date) - new Date(b.start.dateTime || b.start.date))

    console.log(`Total de eventos encontrados: ${events.length}`)
    return events
  } catch (err) {
    console.error('Erro ao buscar eventos:', err)
    throw err
  }
}

export async function addEventToCalendar(event) {
  try {
    const response = await gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': event
    })
    return response.result
  } catch (err) {
    console.error(err)
    throw err
  }
} 
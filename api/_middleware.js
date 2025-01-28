export default function middleware(req) {
  const headers = new Headers(req.headers)
  
  headers.set('Access-Control-Allow-Credentials', 'true')
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  headers.set('Access-Control-Allow-Headers', 
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-KEY, X-PROVIDER')

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  return new Response(req.body, {
    status: req.status,
    headers
  })
} 
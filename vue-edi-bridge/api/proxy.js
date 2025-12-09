addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Handle OPTIONS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',  // Or your specific origin: 'https://your-app.vercel.app'
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Requested-With',
        'Access-Control-Max-Age': '86400'  // Cache preflight for 24 hours
      }
    })
  }

  // Only handle POST requests to /api/proxy (or adjust path as needed)
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',  // Change to specific origin for production
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Expose-Headers': 'Content-Length'
  }

  try {
    // Forward the request to xAI
    const targetUrl = 'https://api.x.ai/v1/chat/completions'
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json'
      },
      body: request.body
    })

    // Clone the response to add CORS headers
    const newResponse = new Response(response.body, response)
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value)
    })

    // Append Vary header for caching
    newResponse.headers.append('Vary', 'Origin')

    return newResponse
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders
    })
  }
}
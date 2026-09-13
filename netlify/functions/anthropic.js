// netlify/functions/anthropic.js
//
// Server-side proxy for the Anthropic API. The browser calls this function,
// this function calls Anthropic with the key. The key never reaches the client.
//
// Set ANTHROPIC_API_KEY in Netlify:
//   Site configuration > Environment variables > Add a variable
//
// Never commit the key to the repository.

const ALLOWED_ORIGINS = [
  'https://work.rashadmorgan.com',
  'http://localhost:8888', // netlify dev
];

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}

export default async (req) => {
  const origin = req.headers.get('origin') || '';
  const headers = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers,
    });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: 'Server is not configured.' }), {
      status: 500, headers,
    });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400, headers,
    });
  }

  // Only accept the shape this site actually sends. This keeps the function
  // from becoming an open relay for arbitrary API calls if the URL leaks.
  const prompt = typeof payload.prompt === 'string' ? payload.prompt : '';
  if (!prompt || prompt.length > 12000) {
    return new Response(JSON.stringify({ error: 'Missing or oversized prompt.' }), {
      status: 400, headers,
    });
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('Anthropic API error', res.status, detail);
      return new Response(JSON.stringify({ error: 'Upstream request failed.' }), {
        status: 502, headers,
      });
    }

    const data = await res.json();
    const text = (data.content || [])
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim();

    return new Response(JSON.stringify({ text }), { status: 200, headers });
  } catch (err) {
    console.error('Proxy error', err);
    return new Response(JSON.stringify({ error: 'Request failed.' }), {
      status: 500, headers,
    });
  }
};

export const config = { path: '/api/anthropic' };

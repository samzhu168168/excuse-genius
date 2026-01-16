// /api/generate.js
// 使用最传统的 CommonJS 格式（Vercel 默认且最稳定的方式）

module.exports = async function handler(req, res) {
  // CORS 支持
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 🔑 读取环境变量
  const apiKey = process.env.ANY_ROUTER_KEY;
  
  // 详细的调试日志
  console.log('[DEBUG] Environment:', process.env.VERCEL_ENV);
  console.log('[DEBUG] API Key exists:', !!apiKey);
  console.log('[DEBUG] API Key first 10 chars:', apiKey ? apiKey.substring(0, 10) : 'NONE');

  if (!apiKey) {
    console.error('[ERROR] ANY_ROUTER_KEY not found in environment');
    return res.status(500).json({ 
      error: 'Server configuration error: ANY_ROUTER_KEY not found',
      debug: {
        environment: process.env.VERCEL_ENV || 'unknown',
        timestamp: new Date().toISOString(),
        nodeVersion: process.version
      }
    });
  }

  const { scenario } = req.body;
  if (!scenario) {
    return res.status(400).json({ error: 'Scenario is required.' });
  }

  // GEO 逻辑
  const city = req.headers['x-vercel-ip-city'] 
    ? decodeURIComponent(req.headers['x-vercel-ip-city']) 
    : '';
  const region = req.headers['x-vercel-ip-country-region'] 
    ? decodeURIComponent(req.headers['x-vercel-ip-country-region']) 
    : '';
  const location = city && region ? ` in ${city}, ${region}` : '';

  const prompt = `
You are an AI assistant that generates believable, hyper-local text message excuses.
The user's scenario is: "${scenario}"${location}.

Your response MUST be a valid JSON object with two keys: "excuse" and "image_search_term".

RULES for "excuse":
- If location provided, make it hyper-local (e.g., specific train lines, highways, landmarks)
- Under 40 words
- Lowercase, casual text message style
- Start directly (NO "I cannot come in" or formal openings)

RULES for "image_search_term":
- Simple, 2-4 word phrase for finding realistic proof photo
- Must relate directly to the excuse

Example for "Late for Work" in "Brooklyn":
{
  "excuse": "ugh the G train is fully stopped at nassau, platform is a nightmare. gonna be late.",
  "image_search_term": "crowded subway platform"
}

Generate the JSON for the user's request.
`;

  try {
    console.log('[INFO] Calling AI API...');
    
    const response = await fetch('https://api.anyrouter.top/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
        max_tokens: 120
      })
    });

    console.log('[INFO] AI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI ERROR]', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'AI provider error', 
        details: errorText 
      });
    }

    const data = await response.json();
    const ai_response = JSON.parse(data.choices[0].message.content);
    const believability = Math.floor(Math.random() * (98 - 88 + 1) + 88);

    console.log('[SUCCESS] Generated excuse');

    return res.status(200).json({ 
      text: ai_response.excuse,
      imageSearchTerm: ai_response.image_search_term,
      believability: believability 
    });

  } catch (error) {
    console.error('[SERVER ERROR]', error.message, error.stack);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};
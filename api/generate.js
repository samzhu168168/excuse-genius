// /api/generate.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 安全第一: 从 Vercel 环境变量中读取 Key
  const apiKey = process.env.ANY_ROUTER_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API Key not found.' });
  }

  const { scenario } = req.body;
  if (!scenario) {
    return res.status(400).json({ error: 'Scenario is required.' });
  }

  // GEO 逻辑: 从 Vercel 的请求头中解码用户地理位置
  const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : '';
  const region = req.headers['x-vercel-ip-country-region'] ? decodeURIComponent(req.headers['x-vercel-ip-country-region']) : '';
  const location = city && region ? ` in ${city}, ${region}` : '';

  // 增强版 Prompt: 强调本地化和 JSON 输出
  const prompt = `
You are an AI assistant that generates believable, hyper-local text message excuses.
The user's scenario is: "${scenario}"${location}.

Your response MUST be a valid JSON object with two keys: "excuse" and "image_search_term".

RULES for "excuse":
- If a location is provided, make it hyper-local with real-world knowledge (e.g., specific train lines, highways, local landmarks).
- Under 40 words.
- Lowercase, casual text message style.
- Start directly. NO "I cannot come in" or similar formal openings.

RULES for "image_search_term":
- A simple, 2-4 word phrase for finding a realistic proof photo.
- Must directly relate to the excuse.

Example for "Late for Work" in "Brooklyn":
{
  "excuse": "ugh the G train is fully stopped at nassau, platform is a nightmare. gonna be late.",
  "image_search_term": "crowded subway platform"
}

Generate the JSON for the user's request.
`;

  try {
    const response = await fetch('https://api.anyrouter.top/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" }, // 强制 JSON 输出
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
        max_tokens: 120
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      // 将 AI 供应商的错误信息透传给前端，便于调试
      return res.status(response.status).json({ error: 'AI provider error', details: errorData });
    }

    const data = await response.json();
    const ai_response = JSON.parse(data.choices[0].message.content);
    
    // 游戏化: 动态生成可信度分数
    const believability = Math.floor(Math.random() * (98 - 88 + 1) + 88);

    // 将前端需要的所有数据整合后一次性返回
    res.status(200).json({ 
      text: ai_response.excuse,
      imageSearchTerm: ai_response.image_search_term,
      believability: believability 
    });

  } catch (error) {
    console.error('Error in /api/generate:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

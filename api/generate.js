// /api/generate.js
// 使用 module.exports，因为 package.json 中已指定 "type": "commonjs"
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. 尝试从服务器环境变量中读取 API Key
  const apiKey = process.env.ANY_ROUTER_KEY;

  // 2. 如果 API Key 未找到，立即返回明确的服务器端错误
  if (!apiKey) {
    // 这个错误信息是专门给您（开发者）看的
    return res.status(500).json({ error: 'Server configuration error: The ANY_ROUTER_KEY environment variable was not found on the Vercel server.' });
  }

  const { scenario } = req.body;
  if (!scenario) {
    return res.status(400).json({ error: 'Scenario is required.' });
  }

  // GEO 逻辑
  const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : '';
  const region = req.headers['x-vercel-ip-country-region'] ? decodeURIComponent(req.headers['x-vercel-ip-country-region']) : '';
  const location = city && region ? ` in ${city}, ${region}` : '';

  const prompt = `
You are an AI assistant that generates believable, hyper-local text message excuses. The user's scenario is: "${scenario}"${location}.
Your response MUST be a valid JSON object with two keys: "excuse" and "image_search_term".
RULES for "excuse": Hyper-local, under 40 words, casual text message style, start directly.
RULES for "image_search_term": A simple, 2-4 word phrase for a realistic proof photo.
Example for "Late for Work" in "Brooklyn":
{
  "excuse": "ugh the G train is fully stopped at nassau, platform is a nightmare. gonna be late.",
  "image_search_term": "crowded subway platform"
}
Generate the JSON for the user's request.`;

  try {
    const response = await fetch('https://api.anyrouter.top/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
        max_tokens: 120
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: 'AI provider error', details: errorData });
    }

    const data = await response.json();
    const ai_response = JSON.parse(data.choices[0].message.content);
    const believability = Math.floor(Math.random() * (98 - 88 + 1) + 88);

    return res.status(200).json({ 
      text: ai_response.excuse,
      imageSearchTerm: ai_response.image_search_term,
      believability: believability 
    });

  } catch (error) {
    console.error('Error in /api/generate:', error);
    return res.status(500).json({ error: 'Internal server error caught in the catch block.' });
  }
};

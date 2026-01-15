// /api/generate.js

export default async function handler(req, res) {
  // 安全第一: 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 从环境变量中安全地读取API Key
  const apiKey = process.env.ANY_ROUTER_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API Key not found.' });
  }

  const { scenario } = req.body;

  if (!scenario) {
    return res.status(400).json({ error: 'Scenario is required.' });
  }
  
  // Prompt 压缩与优化: 去除不必要词语
  const prompt = `Generate a believable text message excuse for: ${scenario}. Requirements: Under 40 words. Lowercase/casual style. Include specific detail. NO "I cannot come in". START DIRECTLY.`;

  try {
    const response = await fetch('https://api.anyrouter.top/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85, // 稍微调高一点，增加创意
        max_tokens: 60
      })
    });

    if (!response.ok) {
        // 将上游错误信息传递给客户端，便于调试
        const errorData = await response.json();
        return res.status(response.status).json({ error: 'AI provider error', details: errorData });
    }

    const data = await response.json();
    const text = data.choices[0].message.content.replace(/"/g, '');
    
    // 惊艳输出: 增加随机的可信度评分
    const believability = Math.floor(Math.random() * (98 - 85 + 1) + 85);

    res.status(200).json({ 
      text: text,
      believability: believability 
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
}

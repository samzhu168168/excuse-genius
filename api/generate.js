export const config = {
  runtime: 'edge', // 使用 Edge Runtime 速度更快
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { prompt } = await req.json();
    
    // 从 Vercel 环境变量中读取 Key
    const apiKey = process.env.ANY_ROUTER_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error: API Key missing' }), { status: 500 });
    }

    const response = await fetch('https://api.anyrouter.top/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o", // 或者您的 Key 支持的其他模型
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      return new Response(JSON.stringify({ error: `API Error: ${response.status}`, details: errorData }), { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

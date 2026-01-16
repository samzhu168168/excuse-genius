// /api/generate.js

export default async function handler(req, res) {
  // Security: Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Securely read API Key from environment variables
  const apiKey = process.env.ANY_ROUTER_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API Key not found.' });
  }

  const { scenario } = req.body;
  if (!scenario) {
    return res.status(400).json({ error: 'Scenario is required.' });
  }

  // --- START: Hyper-Local GEO-Logic ---
  // Decode URI components to handle special characters in city names
  const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : '';
  const region = req.headers['x-vercel-ip-country-region'] ? decodeURIComponent(req.headers['x-vercel-ip-country-region']) : '';
  const location = city && region ? ` in ${city}, ${region}` : '';
  // --- END: Hyper-Local GEO-Logic ---

  // --- START: Enhanced JSON-Aware Prompt ---
  const prompt = `
    You are an AI assistant that generates a believable, hyper-local text message excuse.
    The user's scenario is: "${scenario}"${location}.
    
    Your response MUST be a valid JSON object with two keys: "excuse" and "image_search_term".
    
    RULES for "excuse":
    - If a location is provided, make it hyper-local. Use real-world local knowledge (e.g., specific train lines, highways, or common local events).
    - Under 40 words.
    - Lowercase, casual text message style.
    - Start directly. NO "I cannot come in".
    
    RULES for "image_search_term":
    - A simple, 2-4 word phrase for an image API (like Unsplash) to find a realistic proof photo.
    - It must directly relate to the excuse.
    
    Example for "Late for Work" in "Brooklyn":
    {
      "excuse": "ugh the G train is fully stopped at nassau, platform is a nightmare. gonna be late.",
      "image_search_term": "crowded subway platform"
    }

    Generate the JSON for the user's request.
    `;
  // --- END: Enhanced JSON-Aware Prompt ---

  try {
    const response = await fetch('https://api.anyrouter.top/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        // Enforce JSON output for reliability
        response_format: { type: "json_object" }, 
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
        max_tokens: 120 // Increased slightly for JSON structure and creativity
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: 'AI provider error', details: errorData });
    }

    const data = await response.json();
    // Parse the JSON content from the AI's message
    const ai_response = JSON.parse(data.choices[0].message.content);
    
    // Add a random, high believability score
    const believability = Math.floor(Math.random() * (98 - 88 + 1) + 88);

    res.status(200).json({ 
      text: ai_response.excuse,
      imageSearchTerm: ai_response.image_search_term, // Send search term to frontend
      believability: believability 
    });

  } catch (error) {
    console.error('Error in /api/generate:', error); // Log the full error for server-side debugging
    res.status(500).json({ error: 'Internal server error.' });
  }
}// /api/generate.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.ANY_ROUTER_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API Key not found.' });
  }

  const { scenario } = req.body;
  if (!scenario) {
    return res.status(400).json({ error: 'Scenario is required.' });
  }

  // GEO Logic - Extract location from Vercel headers
  const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : '';
  const region = req.headers['x-vercel-ip-country-region'] ? decodeURIComponent(req.headers['x-vercel-ip-country-region']) : '';
  const location = city && region ? ` in ${city}, ${region}` : '';

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

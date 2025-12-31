// api/ask.js - Updated for native fetch (no import needed)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'No question provided' });
  }

  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-4',  // Or try 'grok-beta' if you want cheaper/faster
        messages: [
          {
            role: 'system',
            content: `You are an expert insurance educator curated by Brayden York, RIMS-CRMP certified commercial insurance professional in Canada. 
Provide clear, accurate, unbiased answers based on standard Canadian and global insurance practices. 
Keep responses professional, educational, and concise (200-400 words). 
End with: "For personalized advice, book a free consultation at insuranceanswersai.ca"`
          },
          { role: 'user', content: question }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('xAI API error:', errorData);
      return res.status(500).json({ error: 'AI service error' });
    }

    const data = await response.json();
    const answer = data.choices[0].message.content.trim();

    res.status(200).json({ answer });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// This ensures body parsing works correctly
export const config = {
  api: {
    bodyParser: true,
  },
};

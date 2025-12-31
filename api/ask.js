// api/ask.js - Vercel Serverless Function
import fetch from 'node-fetch'; // Vercel includes this

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'No question provided' });
  }

  const apiKey = process.env.XAI_API_KEY; // We'll set this in Vercel env vars

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
        model: 'grok-4', // Or 'grok-beta' for cheaper; 'grok-4' is the best
        messages: [
          {
            role: 'system',
            content: `You are an expert insurance educator curated by Brayden York, RIMS-CRMP certified commercial insurance professional in Canada. 
Provide clear, accurate, unbiased answers based on standard Canadian and global insurance practices. 
Keep responses educational, professional, and concise (200-400 words). 
If the question is about specific advice, remind that this is general info and they should consult a licensed broker.`
          },
          { role: 'user', content: question }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(500).json({ error: error.error?.message || 'API error' });
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

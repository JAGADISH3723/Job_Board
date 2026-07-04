import client from '../lib/openai.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { title, company, location, salary, type, keyPoints } = req.body;

  if (!title || !company || !location) {
    return res.status(400).json({ error: 'title, company, and location are required' });
  }

  try {
    const prompt = `Write a polished job description for a ${type} role titled ${title} at ${company}, located in ${location}. The salary is ${salary || 'competitive'}. Include the following strengths: ${keyPoints || 'team culture, growth, and impact'}.`;
    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: prompt,
      max_output_tokens: 300
    });

    const text = response.output?.[0]?.content?.[0]?.text || '';
    return res.status(200).json({ description: text.trim() });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to generate description' });
  }
}

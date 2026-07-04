import OpenAI from '@openai/openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default client;

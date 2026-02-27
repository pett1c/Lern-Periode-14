const { OpenAI } = require('openai');

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'Eventify',
  }
});

const SYSTEM_PROMPT = `You are the Eventify platform's AI assistant. 
Your task is to recommend events based on the context provided.
Rules:
1. Use only data from the [CONTEXT] block.
2. Do not invent events.
3. Respond strictly in JSON format.
Output format:
{
  "message": "Response text",
  "eventIds": ["id1", "id2"]
}`;

module.exports = { openai, SYSTEM_PROMPT };
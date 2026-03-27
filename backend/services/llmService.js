const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { OpenAI } = require('openai');

// Initialize OpenRouter Client for Gemma-3
const openRouterClient = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'Eventify',
  },
});

const SYSTEM_PROMPT = `
You are Eventify Assistant, a helpful AI that helps users find and understand events.
You will be provided with a user's question and relevant context information retrieved from our event database.

Your tasks:
1. Answer the user's question clearly and concisely based ONLY on the provided context.
2. If the context does not contain enough information to answer the question, state that you don't know based on the current data.
3. Be friendly and helpful.

How events should be listed a.k.a your schema:
・[Title] — on [Month] [Day], [Year] in [City], [Country]
[Description...]
The following types of tickets are available:
– [TicketType1]: $[price]
– [TicketType2]: $[price]
`;

let extractorPipeline = null;

async function getExtractor() {
  if (!extractorPipeline) {
    // Dynamic import handles both CJS and ESM module systems seamlessly
    const transformers = await import('@xenova/transformers');
    // Using a very popular, small, fast embedding model that runs entirely on your machine
    extractorPipeline = await transformers.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractorPipeline;
}

/**
 * Generates an embedding vector for the given text using local @xenova/transformers.
 * Does not use paid APIs.
 */
async function generateEmbedding(text) {
  try {
    const extractor = await getExtractor();
    // Generate 384-dimensional embeddings and normalize them
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    
    const embeddings384 = Array.from(output.data);
    
    // ✨ MAGIC: The user created Pinecone with 1536 dimensions. 
    // We safely pad the 384 array with zeros up to 1536 dimensions.
    // Why it works? Dot product with zeros equals zero, so Cosine Similarity is unaffected!
    const paddedEmbedding = new Array(1536).fill(0);
    for (let i = 0; i < embeddings384.length; i++) {
        paddedEmbedding[i] = embeddings384[i];
    }
    
    return paddedEmbedding;
  } catch (error) {
    console.error('Error generating local embedding:', error);
    throw error;
  }
}

async function generateRagResponse(context, userQuery) {
  try {
    const prompt = `Context:\n${context}\n\nUser Question: ${userQuery}`;

    const completion = await openRouterClient.chat.completions.create({
      model: 'arcee-ai/trinity-large-preview:free',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating RAG response with Gemma-3 via OpenRouter:', error);
    throw error;
  }
}

module.exports = {
  generateEmbedding,
  generateRagResponse,
};

require('dotenv').config({ path: '../.env' });
const { Pinecone } = require('@pinecone-database/pinecone');
const { openai, SYSTEM_PROMPT } = require('../services/llmService');

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX);

function generateDummyEmbedding(text) {
  return Array.from({ length: 1536 }, () => Math.random() * 0.1);
}

async function runRagPipeline(userQuery) {
  // 1. Query vectorisation
  const queryVector = generateDummyEmbedding(userQuery);

  // 2. Search in a vector database
  const searchResults = await index.query({
    vector: queryVector,
    topK: 2,
    includeMetadata: true
  });

  // 3. Context formation
  const contextStrings = searchResults.matches.map(match => 
    `ID: ${match.id} | Title: ${match.metadata.title} | Description: ${match.metadata.description}`
  );
  const context = contextStrings.join('\n');

  // 4. Response generation via LLM
  const response = await openai.chat.completions.create({
    model: 'google/gemma-3-27b-it:free',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `[CONTEXT]:\n${context}\n\n[USER REQUEST]: ${userQuery}` }
    ],
    response_format: { type: "json_object" }
  });

  console.log('LLM response:');
  console.log(response.choices[0].message.content);
}

runRagPipeline("I have a holiday in winter, I want to go to a rock concert.").catch(console.error);
require('dotenv').config();
const { generateEmbedding, generateRagResponse } = require('../services/llmService');
const { Pinecone } = require('@pinecone-database/pinecone');

// Initialize Pinecone Client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

async function testRagPipeline() {
  try {
    const userQuery = 'Is there any rock festival happening soon?';
    console.log(`\n🗣️ User Query: "${userQuery}"`);

    // 1. Convert the user query into an embedding
    console.log('\n[1/3] Generating embedding for query...');
    const queryEmbedding = await generateEmbedding(userQuery);

    // 2. Search Pinecone for the most relevant events
    console.log('\n[2/3] Searching vector database for context...');
    const indexName = process.env.PINECONE_INDEX || 'eventify-indexed';
    const index = pinecone.index(indexName);

    const searchResults = await index.query({
      vector: queryEmbedding,
      topK: 2, // Get top 2 most matching events
      includeMetadata: true,
    });

    console.log(`Found ${searchResults.matches.length} matches.`);

    // Build context string from the retrieved matches
    let contextString = '';
    if (searchResults.matches && searchResults.matches.length > 0) {
      searchResults.matches.forEach((match, i) => {
        console.log(`  - Match ${i + 1} (Score: ${match.score.toFixed(3)}): ${match.metadata.title}`);
        contextString += `---\nEvent ID: ${match.id}\n${match.metadata.text}\n`;
      });
    } else {
      contextString = 'No relevant events found in the database.';
    }

    // 3. Generate response using LLM
    console.log('\n[3/3] Generating RAG response with Gemma-3...');
    const llmResponse = await generateRagResponse(contextString, userQuery);

    console.log('\n🤖 LLM Response:');
    console.log('===================================================');
    console.log(llmResponse);
    console.log('===================================================\n');

  } catch (error) {
    console.error('\n❌ RAG Pipeline Test Failed:', error);
  }
}

// Run the test
testRagPipeline();

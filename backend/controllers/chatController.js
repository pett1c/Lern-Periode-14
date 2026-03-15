const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { generateEmbedding, generateRagResponse } = require('../services/llmService');
const { Pinecone } = require('@pinecone-database/pinecone');

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const handleChatQuery = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string' || query.trim() === '') {
    throw new ApiError(400, 'BAD_REQUEST', 'A valid text query is required.');
  }

  // 1. Generate text embedding for the user's query
  const queryEmbedding = await generateEmbedding(query);

  if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
    throw new ApiError(500, 'INTERNAL_SERVER_ERROR', 'Failed to generate embedding for the query.');
  }

  // 2. Query Pinecone vector database for relevant events
  const indexName = process.env.PINECONE_INDEX || 'eventify-indexed';
  const index = pinecone.index(indexName);

  const searchResults = await index.query({
    vector: queryEmbedding,
    topK: 3, // retrieve top 3 most relevant matches
    includeMetadata: true,
  });

  // 3. Construct the context for the LLM
  let contextString = '';
  const sources = []; // Collecting sources to return alongside the AI response

  if (searchResults.matches && searchResults.matches.length > 0) {
    searchResults.matches.forEach((match) => {
      sources.push(match.metadata.title);
      contextString += `---\nEvent Details:\n${match.metadata.text}\n`;
    });
  } else {
    contextString = 'No events found that match the user query.';
  }

  // 4. Generate AI response using Gemma-3
  const llmResponse = await generateRagResponse(contextString, query);

  // Return the result
  return sendSuccess(res, {
    message: 'Chat query processed successfully.',
    data: {
      answer: llmResponse,
      sources: sources, // List of event titles referenced
    },
  });
});

module.exports = {
  handleChatQuery,
};

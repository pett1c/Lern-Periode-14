const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { generateEmbedding, generateRagResponse } = require('../services/llmService');
const { Pinecone } = require('@pinecone-database/pinecone');
const Event = require('../models/Event');

function getPineconeClient() {
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) {
    throw new ApiError(503, 'CHAT_UNAVAILABLE', 'Chat is temporarily unavailable (missing Pinecone configuration).');
  }
  return new Pinecone({ apiKey });
}

function formatEvent(event) {
  const dateText = new Date(event.date).toLocaleDateString('de-CH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const ticketText = (event.ticketTypes || [])
    .map((type) => `${type.name}: CHF ${type.price}`)
    .join(' | ');

  return `- ${event.title} (${dateText}, ${event.location})${ticketText ? `\n  Tickets: ${ticketText}` : ''}`;
}

async function localFallbackAnswer(query) {
  const regex = new RegExp(query.trim().split(/\s+/).join('|'), 'i');
  const events = await Event.find({
    $or: [
      { title: { $regex: regex } },
      { description: { $regex: regex } },
      { location: { $regex: regex } },
    ],
  })
    .sort({ date: 1 })
    .limit(5)
    .lean();

  if (!events.length) {
    return {
      answer:
        'Ich habe aktuell keine passenden Events in der lokalen Suche gefunden. Probiere andere Stichwörter wie Genre, Ort oder Monat.',
      sources: [],
      degraded: true,
    };
  }

  return {
    answer: `Pinecone/OpenRouter sind aktuell nicht konfiguriert. Ich zeige dir lokale Treffer:\n\n${events
      .map(formatEvent)
      .join('\n')}`,
    sources: events.map((event) => event.title),
    degraded: true,
  };
}

const handleChatQuery = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string' || query.trim() === '') {
    throw new ApiError(400, 'BAD_REQUEST', 'A valid text query is required.');
  }

  try {
    // 1. Generate text embedding for the user's query
    const queryEmbedding = await generateEmbedding(query);

    if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
      throw new ApiError(500, 'INTERNAL_SERVER_ERROR', 'Failed to generate embedding for the query.');
    }

    // 2. Query Pinecone vector database for relevant events
    const indexName = process.env.PINECONE_INDEX || 'eventify-indexed';
    const index = getPineconeClient().index(indexName);

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
        const title = match.metadata?.title || 'Unknown event';
        const text = match.metadata?.text || null;
        if (text) {
          sources.push(title);
          contextString += `---\nEvent Details:\n${text}\n`;
        }
      });
    } else {
      contextString = 'No events found that match the user query.';
    }

    if (!contextString.trim()) {
      contextString = 'No event metadata available for this query.';
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
  } catch (error) {
    // Fall back for missing/invalid Pinecone or OpenRouter config and transient provider errors.
    if (
      (error instanceof ApiError && error.code === 'CHAT_UNAVAILABLE') ||
      (typeof error?.message === 'string' &&
        (error.message.includes('Pinecone') ||
          error.message.includes('OpenRouter') ||
          error.message.includes('api.pinecone.io') ||
          error.message.includes('API key')))
    ) {
      const fallback = await localFallbackAnswer(query);
      return sendSuccess(res, {
        message: 'Chat is running in fallback mode.',
        data: fallback,
      });
    }
    throw error;
  }
});

module.exports = {
  handleChatQuery,
};

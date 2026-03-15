const { Pinecone } = require('@pinecone-database/pinecone');
const { generateEmbedding } = require('./llmService');

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

/**
 * Helper function to retrieve the Pinecone index.
 */
function getPineconeIndex() {
  const indexName = process.env.PINECONE_INDEX || 'eventify-indexed';
  return pinecone.index(indexName);
}

/**
 * Creates or updates a vector in Pinecone for the given Mongoose event.
 * Retrieves Pinecone v7 `records` style upsert structure.
 *
 * @param {Object} event Mongoose Event Document
 */
async function upsertEventVector(event) {
  try {
    const textToEmbed = `Title: ${event.title}. Location: ${event.location}. Date: ${event.date.toISOString()}. Description: ${event.description}`;
    
    // Using @xenova transformer -> returns 1536 zero-padded float array
    const embedding = await generateEmbedding(textToEmbed);

    if (!Array.isArray(embedding) || embedding.length === 0) {
      console.warn(`[Pinecone] Skipping vector upsert for event ${event._id}: invalid embedding generated.`);
      return;
    }

    const index = getPineconeIndex();

    await index.upsert([{
      id: event._id.toString(),
      values: embedding,
      metadata: {
        title: event.title,
        location: event.location,
        date: event.date.toISOString(),
        description: event.description,
        text: textToEmbed,
      }
    }]);

    console.log(`[Pinecone] Successfully upserted vector for event ${event._id}`);
  } catch (error) {
    console.error(`[Pinecone] Error upserting vector for event ${event._id}:`, error.message);
  }
}

/**
 * Deletes a vector from Pinecone given its Mongoose ID.
 *
 * @param {string} eventId
 */
async function deleteEventVector(eventId) {
  try {
    const index = getPineconeIndex();
    await index.deleteOne(eventId.toString());
    console.log(`[Pinecone] Successfully deleted vector for event ${eventId}`);
  } catch (error) {
    console.error(`[Pinecone] Error deleting vector for event ${eventId}:`, error.message);
  }
}

module.exports = {
  upsertEventVector,
  deleteEventVector,
};

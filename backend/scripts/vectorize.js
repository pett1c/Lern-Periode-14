require('dotenv').config();
const { generateEmbedding } = require('../services/llmService');
const { Pinecone } = require('@pinecone-database/pinecone');
const fs = require('fs');
const path = require('path');

// Initialize Pinecone Client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

async function vectorizeData() {
  try {
    console.log('Starting vectorization process...');

    // 1. Read mock data
    const dataPath = path.join(__dirname, '../data/mockEvents.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const events = JSON.parse(rawData);

    // 2. Access the target index
    const indexName = process.env.PINECONE_INDEX || 'eventify-indexed';
    const index = pinecone.index(indexName);

    console.log(`Processing ${events.length} events for index: ${indexName}`);

    // 3. Prepare vectors for Pinecone
    const vectorsToUpsert = [];

    for (const event of events) {
      // Build string of ticket types
      const ticketsInfo = event.ticketTypes
        ? event.ticketTypes.map(t => `${t.name} ($${t.price})`).join(', ')
        : 'N/A';

      // Construct a string combining relevant fields for semantic search
      const textToEmbed = `Title: ${event.title}. Genre: ${event.genre}. Location: ${event.location || 'Unknown'}. Date: ${event.date}. Description: ${event.description}. Tickets available: ${ticketsInfo}.`;
      
      console.log(`Generating embedding for event: ${event.title}`);
      
      // Generate the 1536-dimensional array
      const embedding = await generateEmbedding(textToEmbed);
      if (!Array.isArray(embedding) || embedding.length === 0) {
        console.error(`❌ Invalid embedding for ${event.title}. Skipping...`);
        continue; // Пропускаем битую запись
      }

      vectorsToUpsert.push({
        id: String(event.id),
        values: embedding,
        metadata: {
          title: String(event.title),
          genre: String(event.genre),
          location: String(event.location || 'Unknown'),
          date: String(event.date),
          description: String(event.description),
          tickets: String(ticketsInfo),
          text: textToEmbed 
        }
      });
    }

    // 4. Upsert vectors to Pinecone
    // Note: In production with many records, batch these upserts!
    console.log(`Upserting ${vectorsToUpsert.length} vectors to Pinecone...`);
    await index.upsert({
      records: vectorsToUpsert
    });

    console.log('✅ Vectorization complete! Data is ready for RAG.');

  } catch (error) {
    console.error('❌ Error during vectorization:', error);
  }
}

// Run the script
vectorizeData();

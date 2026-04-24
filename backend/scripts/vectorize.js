require('dotenv').config();
const { generateEmbedding } = require('../services/llmService');
const { Pinecone } = require('@pinecone-database/pinecone');
const mongoose = require('mongoose');
const Event = require('../models/Event');

// Initialize Pinecone Client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

async function vectorizeData() {
  try {
    console.log('Starting vectorization process...');

    // 1. Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // 2. Fetch events from database
    const events = await Event.find();
    console.log(`Fetched ${events.length} events from MongoDB.`);

    // 3. Access the target index
    const indexName = process.env.PINECONE_INDEX || 'eventify-indexed';
    const index = pinecone.index(indexName);

    console.log(`Processing events for index: ${indexName}`);

    // 4. Prepare vectors for Pinecone
    const vectorsToUpsert = [];

    for (const event of events) {
      const ticketsInfo = event.ticketTypes
        ? event.ticketTypes.map(t => `${t.name} ($${t.price})`).join(', ')
        : 'N/A';

      const textToEmbed = `Title: ${event.title}. Genre: ${event.genre}. Location: ${event.location || 'Unknown'}. Date: ${event.date}. Description: ${event.description}. Tickets available: ${ticketsInfo}.`;
      
      console.log(`Generating embedding for event: ${event.title}`);
      
      const embedding = await generateEmbedding(textToEmbed);
      if (!Array.isArray(embedding) || embedding.length === 0) {
        console.error(`❌ Invalid embedding for ${event.title}. Skipping...`);
        continue; 
      }

      vectorsToUpsert.push({
        id: String(event._id),
        values: embedding,
        metadata: {
          title: String(event.title),
          genre: String(event.genre),
          location: String(event.location || 'Unknown'),
          date: String(event.date),
          description: String(event.description),
          tickets: String(ticketsInfo),
          text: textToEmbed,
          eventId: String(event._id)
        }
      });
    }

    // 5. Upsert vectors to Pinecone
    console.log(`Upserting ${vectorsToUpsert.length} vectors to Pinecone...`);
    
    if (vectorsToUpsert.length > 0) {
        // Explicitly using the records wrapper which is required by some SDK versions
        await index.upsert({
            records: vectorsToUpsert
        });
        console.log('✅ Vectorization complete! Data is ready for RAG.');
    } else {
        console.warn('⚠️ No vectors to upsert.');
    }
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during vectorization:', error);
    process.exit(1);
  }
}

vectorizeData();

require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const { Pinecone } = require('@pinecone-database/pinecone');

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX);

// Plugin for generating embeddings (replace with API call for embeddings)
function generateDummyEmbedding(text) {
  return Array.from({ length: 1536 }, () => Math.random() * 0.1);
}

async function runVectorization() {
  const data = JSON.parse(fs.readFileSync('../data/mockEvents.json', 'utf8'));
  const vectors = data.map(event => {
    const textToEmbed = `${event.title}. ${event.description} Жанр: ${event.genre}`;
    return {
      id: event.id,
      values: generateDummyEmbedding(textToEmbed),
      metadata: { title: event.title, genre: event.genre, date: event.date, description: event.description }
    };
  });

  await index.upsert(vectors);
  console.log('Vectorisation is complete. Data has been loaded into Pinecone.');
}

runVectorization().catch(console.error);
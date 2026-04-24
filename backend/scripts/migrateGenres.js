require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Event = require('../models/Event');

async function migrateGenres() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set in your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const mockDataPath = path.join(__dirname, '../data/mockEvents.json');
    const mockEventsArray = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));

    let count = 0;
    for (const item of mockEventsArray) {
      if (item.genre) {
        const result = await Event.updateOne(
          { title: item.title },
          { $set: { genre: item.genre } }
        );
        if (result.modifiedCount > 0) count++;
      }
    }

    console.log(`Updated genre for ${count} events in mongodb.`);
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

migrateGenres();

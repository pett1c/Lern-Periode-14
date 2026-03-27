require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Event = require('../models/Event');
const User = require('../models/User');

const dbURI = process.env.MONGODB_URI;

async function seedDB() {
  if (!dbURI) {
    console.error('MONGODB_URI is not set in your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(dbURI);

    // find or create dummy organizer
    let organizer = await User.findOne({ email: 'system_organizer@eventify.local' });
    if (!organizer) {
      organizer = new User({
        name: 'system organizer',
        email: 'system_organizer@eventify.local',
        password: 'SuperSecretPassword123!',
        role: 'organizer',
      });
      await organizer.save();
    }

    // read mock data containing full schemas
    const mockDataPath = path.join(__dirname, '../data/mockEvents.json');
    const mockEventsArray = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));

    let count = 0;
    for (const item of mockEventsArray) {
      const existingEvent = await Event.findOne({ title: item.title });

      if (!existingEvent) {
        await Event.create({
          title: item.title,
          description: item.description,
          date: new Date(item.date),
          location: item.location,
          organizer: organizer._id,
          ticketTypes: item.ticketTypes,
        });
        count++;
      }
    }

    console.log(`inserted ${count} new events to mongodb.`);
    process.exit(0);
  } catch (error) {
    console.error('error while seeding database:', error);
    process.exit(1);
  }
}

seedDB();

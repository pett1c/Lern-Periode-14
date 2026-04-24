require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Event = require('../models/Event');

async function checkIds() {
  await mongoose.connect(process.env.MONGODB_URI);
  const events = await Event.find().limit(5);
  console.log(JSON.stringify(events.map(e => ({ title: e.title, id: e._id })), null, 2));
  process.exit(0);
}

checkIds();

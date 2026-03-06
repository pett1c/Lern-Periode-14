const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    bookedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ticketTypes: {
      type: [ticketTypeSchema],
      validate: {
        validator(ticketTypes) {
          const names = ticketTypes.map((item) => item.name);
          return new Set(names).size === names.length;
        },
        message: 'Ticket type names must be unique per event.',
      },
    },
  },
  { timestamps: true }
);

eventSchema.pre('validate', function preValidate(next) {
  for (const type of this.ticketTypes) {
    if (type.bookedCount > type.capacity) {
      return next(new Error(`Booked count for ticket type ${type.name} exceeds capacity.`));
    }
  }
  return next();
});

eventSchema.index({ organizer: 1, date: -1 });

module.exports = mongoose.model('Event', eventSchema);

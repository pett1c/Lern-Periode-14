const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const { sendSuccess } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const listAllEvents = asyncHandler(async (_req, res) => {
  const events = await Event.find()
    .populate('organizer', 'name email role')
    .sort({ createdAt: -1 });

  return sendSuccess(res, {
    message: 'Admin events loaded successfully.',
    data: { events },
    meta: { total: events.length },
  });
});

const listAllTickets = asyncHandler(async (_req, res) => {
  const tickets = await Ticket.find()
    .populate('user', 'name email role')
    .populate('event', 'title date location')
    .sort({ createdAt: -1 });

  return sendSuccess(res, {
    message: 'Admin tickets loaded successfully.',
    data: { tickets },
    meta: { total: tickets.length },
  });
});

module.exports = { listAllEvents, listAllTickets };

const mongoose = require('mongoose');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const { ApiError } = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

function findTicketType(event, ticketTypeName) {
  return event.ticketTypes.find((type) => type.name === ticketTypeName);
}

const bookTicket = asyncHandler(async (req, res) => {
  const { eventId, ticketType, quantity } = req.validatedBody;
  const session = await mongoose.startSession();

  try {
    let createdTicket;

    await session.withTransaction(async () => {
      const event = await Event.findById(eventId).session(session);
      if (!event) {
        throw new ApiError(404, 'EVENT_NOT_FOUND', 'Event not found.');
      }
      if (event.date.getTime() <= Date.now()) {
        throw new ApiError(409, 'EVENT_ALREADY_STARTED', 'Tickets can only be booked before the event starts.');
      }

      const selectedType = findTicketType(event, ticketType);
      if (!selectedType) {
        throw new ApiError(404, 'TICKET_TYPE_NOT_FOUND', 'Ticket type not found for this event.');
      }

      const available = selectedType.capacity - selectedType.bookedCount;
      if (quantity > available) {
        throw new ApiError(409, 'INSUFFICIENT_CAPACITY', 'Not enough tickets available.');
      }

      selectedType.bookedCount += quantity;
      await event.save({ session });

      const totalPrice = selectedType.price * quantity;
      const [ticket] = await Ticket.create(
        [
          {
            user: req.user.id,
            event: event._id,
            ticketType: selectedType.name,
            quantity,
            totalPrice,
            status: 'BOOKED',
          },
        ],
        { session }
      );

      createdTicket = ticket;
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Ticket booked successfully.',
      data: { ticket: createdTicket },
    });
  } finally {
    session.endSession();
  }
});

const listMyTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ user: req.user.id })
    .populate('event', 'title date location organizer')
    .sort({ createdAt: -1 });

  return sendSuccess(res, {
    message: 'Tickets loaded successfully.',
    data: { tickets },
  });
});

const getTicketById = asyncHandler(async (req, res) => {
  const { id } = req.validatedParams;
  const ticket = await Ticket.findById(id).populate('event');

  if (!ticket) {
    throw new ApiError(404, 'TICKET_NOT_FOUND', 'Ticket not found.');
  }

  if (req.user.role === 'user' && ticket.user.toString() !== req.user.id) {
    throw new ApiError(403, 'FORBIDDEN', 'You are not allowed to access this ticket.');
  }

  if (req.user.role === 'organizer') {
    const event = await Event.findById(ticket.event._id).select('organizer');
    if (!event || event.organizer.toString() !== req.user.id) {
      throw new ApiError(403, 'FORBIDDEN', 'You are not allowed to access this ticket.');
    }
  }

  return sendSuccess(res, {
    message: 'Ticket loaded successfully.',
    data: { ticket },
  });
});

const cancelTicket = asyncHandler(async (req, res) => {
  const { id } = req.validatedParams;
  const session = await mongoose.startSession();

  try {
    let cancelledTicket;

    await session.withTransaction(async () => {
      const ticket = await Ticket.findById(id).session(session);

      if (!ticket) {
        throw new ApiError(404, 'TICKET_NOT_FOUND', 'Ticket not found.');
      }

      if (ticket.status === 'CANCELLED') {
        throw new ApiError(409, 'ALREADY_CANCELLED', 'Ticket has already been cancelled.');
      }

      if (req.user.role === 'user' && ticket.user.toString() !== req.user.id) {
        throw new ApiError(403, 'FORBIDDEN', 'You can only cancel your own tickets.');
      }

      const event = await Event.findById(ticket.event).session(session);
      if (!event) {
        throw new ApiError(404, 'EVENT_NOT_FOUND', 'Related event not found.');
      }

      const selectedType = findTicketType(event, ticket.ticketType);
      if (!selectedType) {
        throw new ApiError(404, 'TICKET_TYPE_NOT_FOUND', 'Related ticket type not found.');
      }

      selectedType.bookedCount = Math.max(0, selectedType.bookedCount - ticket.quantity);
      ticket.status = 'CANCELLED';

      await event.save({ session });
      await ticket.save({ session });

      cancelledTicket = ticket;
    });

    return sendSuccess(res, {
      message: 'Ticket cancelled successfully.',
      data: { ticket: cancelledTicket },
    });
  } finally {
    session.endSession();
  }
});

module.exports = {
  bookTicket,
  listMyTickets,
  getTicketById,
  cancelTicket,
};

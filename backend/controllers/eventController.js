const Event = require('../models/Event');
const { ApiError } = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { upsertEventVector, deleteEventVector } = require('../services/pineconeService');

function ensureOrganizerOwnership(reqUser, event) {
  if (reqUser.role === 'admin') {
    return;
  }

  if (reqUser.role === 'organizer' && event.organizer.toString() !== reqUser.id) {
    throw new ApiError(403, 'FORBIDDEN', 'Organizers can only manage their own events.');
  }
}

function mergeTicketTypesWithExisting(existingTypes, updatedTypes) {
  return updatedTypes.map((updated) => {
    const existing = existingTypes.find((item) => item.name === updated.name);
    const bookedCount = existing ? existing.bookedCount : 0;

    if (updated.capacity < bookedCount) {
      throw new ApiError(
        400,
        'INVALID_TICKET_CAPACITY',
        `Capacity for ${updated.name} cannot be lower than already booked tickets (${bookedCount}).`
      );
    }

    return {
      ...updated,
      bookedCount,
    };
  });
}

const createEvent = asyncHandler(async (req, res) => {
  const body = req.validatedBody;

  const organizerId = req.user.role === 'admin' && body.organizerId ? body.organizerId : req.user.id;

  const event = await Event.create({
    title: body.title,
    description: body.description,
    date: new Date(body.date),
    location: body.location,
    organizer: organizerId,
    ticketTypes: body.ticketTypes.map((item) => ({
      ...item,
      bookedCount: 0,
    })),
  });

  // Sync vector database
  await upsertEventVector(event);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Event created successfully.',
    data: { event },
  });
});

const listEvents = asyncHandler(async (req, res) => {
  const query = req.validatedQuery || { page: 1, limit: 20 };
  const page = query.page;
  const limit = query.limit;

  const filters = {};
  if (query.organizerId) {
    filters.organizer = query.organizerId;
  }

  if (query.search) {
    filters.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
      { location: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [events, total] = await Promise.all([
    Event.find(filters)
      .populate('organizer', 'name email role')
      .sort({ date: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Event.countDocuments(filters),
  ]);

  return sendSuccess(res, {
    message: 'Events loaded successfully.',
    data: { events },
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.validatedParams;
  const event = await Event.findById(id).populate('organizer', 'name email role');

  if (!event) {
    throw new ApiError(404, 'EVENT_NOT_FOUND', 'Event not found.');
  }

  return sendSuccess(res, {
    message: 'Event loaded successfully.',
    data: { event },
  });
});

const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.validatedParams;
  const updates = req.validatedBody;

  const event = await Event.findById(id);
  if (!event) {
    throw new ApiError(404, 'EVENT_NOT_FOUND', 'Event not found.');
  }

  ensureOrganizerOwnership(req.user, event);

  if (updates.title !== undefined) {
    event.title = updates.title;
  }
  if (updates.description !== undefined) {
    event.description = updates.description;
  }
  if (updates.date !== undefined) {
    event.date = new Date(updates.date);
  }
  if (updates.location !== undefined) {
    event.location = updates.location;
  }
  if (updates.ticketTypes !== undefined) {
    event.ticketTypes = mergeTicketTypesWithExisting(event.ticketTypes, updates.ticketTypes);
  }

  await event.save();

  // Sync vector database with updated event details
  await upsertEventVector(event);

  return sendSuccess(res, {
    message: 'Event updated successfully.',
    data: { event },
  });
});

const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.validatedParams;
  const event = await Event.findById(id);

  if (!event) {
    throw new ApiError(404, 'EVENT_NOT_FOUND', 'Event not found.');
  }

  ensureOrganizerOwnership(req.user, event);
  await event.deleteOne();

  // Remove corresponding vector from Pinecone
  await deleteEventVector(id);

  return sendSuccess(res, {
    message: 'Event deleted successfully.',
    data: { id },
  });
});

module.exports = {
  createEvent,
  listEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};

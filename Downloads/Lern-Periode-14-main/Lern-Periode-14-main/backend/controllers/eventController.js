const Event = require("../models/Event");

const toPublicEvent = (event) => ({
  id: event._id,
  title: event.title,
  description: event.description,
  category: event.category,
  location: event.location,
  startDate: event.startDate,
  endDate: event.endDate,
  price: event.price,
  capacity: event.capacity,
  ticketsSold: event.ticketsSold,
  status: event.status,
  organizer: event.organizer,
  createdAt: event.createdAt,
  updatedAt: event.updatedAt,
});

const listEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: { $ne: "cancelled" } })
      .sort({ startDate: 1 })
      .populate("organizer", "name email role");

    return res.status(200).json({
      success: true,
      message: "Events fetched successfully.",
      data: { events: events.map(toPublicEvent) },
    });
  } catch (error) {
    return next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate("organizer", "name email role");
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event fetched successfully.",
      data: { event: toPublicEvent(event) },
    });
  } catch (error) {
    return next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const { title, description, location, startDate, endDate, price, capacity, category, status } =
      req.body;

    if (!title || !description || !location || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "title, description, location, startDate and endDate are required.",
      });
    }

    const event = await Event.create({
      title: String(title).trim(),
      description: String(description).trim(),
      location: String(location).trim(),
      startDate,
      endDate,
      price: Number(price || 0),
      capacity: Number(capacity || 1),
      category: category ? String(category).trim() : "general",
      status: status || "published",
      organizer: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully.",
      data: { event: toPublicEvent(event) },
    });
  } catch (error) {
    return next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const isOwner = event.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only the owner organizer or admin can update this event.",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "location",
      "startDate",
      "endDate",
      "price",
      "capacity",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Event updated successfully.",
      data: { event: toPublicEvent(event) },
    });
  } catch (error) {
    return next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const isOwner = event.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only the owner organizer or admin can delete this event.",
      });
    }

    await event.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};

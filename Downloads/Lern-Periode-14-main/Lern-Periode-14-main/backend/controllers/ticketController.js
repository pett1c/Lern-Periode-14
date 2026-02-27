const Event = require("../models/Event");
const Ticket = require("../models/Ticket");

const toPublicTicket = (ticket) => ({
  id: ticket._id,
  user: ticket.user,
  event: ticket.event,
  quantity: ticket.quantity,
  totalPrice: ticket.totalPrice,
  status: ticket.status,
  purchasedAt: ticket.purchasedAt,
  createdAt: ticket.createdAt,
  updatedAt: ticket.updatedAt,
});

const createTicket = async (req, res, next) => {
  try {
    const { eventId, quantity } = req.body;
    const qty = Number(quantity || 1);

    if (!eventId || Number.isNaN(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: "eventId and valid quantity are required.",
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    if (event.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Tickets can only be bought for published events.",
      });
    }

    const remaining = event.capacity - event.ticketsSold;
    if (qty > remaining) {
      return res.status(400).json({
        success: false,
        message: `Only ${remaining} tickets available.`,
      });
    }

    const totalPrice = qty * event.price;
    const ticket = await Ticket.create({
      user: req.user._id,
      event: event._id,
      quantity: qty,
      totalPrice,
    });

    event.ticketsSold += qty;
    await event.save();

    return res.status(201).json({
      success: true,
      message: "Ticket purchased successfully.",
      data: { ticket: toPublicTicket(ticket) },
    });
  } catch (error) {
    return next(error);
  }
};

const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("event", "title location startDate endDate status")
      .populate("user", "name email role");

    return res.status(200).json({
      success: true,
      message: "User tickets fetched successfully.",
      data: { tickets: tickets.map(toPublicTicket) },
    });
  } catch (error) {
    return next(error);
  }
};

const getAllTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({})
      .sort({ createdAt: -1 })
      .populate("event", "title location startDate endDate status organizer")
      .populate("user", "name email role");

    return res.status(200).json({
      success: true,
      message: "All tickets fetched successfully.",
      data: { tickets: tickets.map(toPublicTicket) },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
};

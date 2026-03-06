const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const bookTicketBodySchema = z.object({
  eventId: z.string().regex(objectIdRegex, 'Invalid event id.'),
  ticketType: z.string().trim().min(2).max(30).transform((value) => value.toUpperCase()),
  quantity: z.number().int().min(1).max(20),
});

const ticketIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid ticket id.'),
});

module.exports = { bookTicketBodySchema, ticketIdParamSchema };

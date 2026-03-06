const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const ticketTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(30)
    .transform((value) => value.toUpperCase()),
  price: z.number().min(0),
  capacity: z.number().int().min(1),
});

const dateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'Invalid date format.',
});

const createEventBodySchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(2000),
  date: dateString,
  location: z.string().trim().min(2).max(200),
  ticketTypes: z.array(ticketTypeSchema).min(1),
  organizerId: z
    .string()
    .regex(objectIdRegex, 'Invalid organizer id.')
    .optional(),
});

const updateEventBodySchema = z
  .object({
    title: z.string().trim().min(3).max(120).optional(),
    description: z.string().trim().min(10).max(2000).optional(),
    date: dateString.optional(),
    location: z.string().trim().min(2).max(200).optional(),
    ticketTypes: z.array(ticketTypeSchema).min(1).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required for update.',
  });

const eventIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid event id.'),
});

const listEventsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  organizerId: z.string().regex(objectIdRegex, 'Invalid organizer id.').optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

module.exports = {
  createEventBodySchema,
  updateEventBodySchema,
  eventIdParamSchema,
  listEventsQuerySchema,
};

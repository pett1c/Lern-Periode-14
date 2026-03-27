const express = require('express');
const {
  createEvent,
  listEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const {
  createEventBodySchema,
  updateEventBodySchema,
  eventIdParamSchema,
  listEventsQuerySchema,
} = require('../validators/eventSchemas');

const router = express.Router();

router.get('/', optionalAuth, validate({ query: listEventsQuerySchema }), listEvents);
router.get('/:id', optionalAuth, validate({ params: eventIdParamSchema }), getEventById);

router.post(
  '/',
  protect,
  authorizeRoles('organizer', 'admin'),
  validate({ body: createEventBodySchema }),
  createEvent
);

router.patch(
  '/:id',
  protect,
  authorizeRoles('organizer', 'admin'),
  validate({ params: eventIdParamSchema, body: updateEventBodySchema }),
  updateEvent
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('organizer', 'admin'),
  validate({ params: eventIdParamSchema }),
  deleteEvent
);

module.exports = router;

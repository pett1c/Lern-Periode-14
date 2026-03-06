const express = require('express');
const {
  bookTicket,
  listMyTickets,
  getTicketById,
  cancelTicket,
} = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { bookTicketBodySchema, ticketIdParamSchema } = require('../validators/ticketSchemas');

const router = express.Router();

router.post(
  '/book',
  protect,
  authorizeRoles('user'),
  validate({ body: bookTicketBodySchema }),
  bookTicket
);

router.get('/me', protect, authorizeRoles('user'), listMyTickets);

router.get(
  '/:id',
  protect,
  authorizeRoles('user', 'organizer', 'admin'),
  validate({ params: ticketIdParamSchema }),
  getTicketById
);

router.patch(
  '/:id/cancel',
  protect,
  authorizeRoles('user', 'admin'),
  validate({ params: ticketIdParamSchema }),
  cancelTicket
);

module.exports = router;

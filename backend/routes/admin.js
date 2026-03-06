const express = require('express');
const { listAllEvents, listAllTickets } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

router.get('/events', listAllEvents);
router.get('/tickets', listAllTickets);

module.exports = router;

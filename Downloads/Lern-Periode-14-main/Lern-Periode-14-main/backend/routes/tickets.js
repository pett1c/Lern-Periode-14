const express = require("express");
const { createTicket, getMyTickets, getAllTickets } = require("../controllers/ticketController");
const { requireAuth } = require("../middleware/auth");
const { permit } = require("../middleware/role");

const router = express.Router();

router.post("/", requireAuth, createTicket);
router.get("/mine", requireAuth, getMyTickets);
router.get("/", requireAuth, permit("admin", "organizer"), getAllTickets);

module.exports = router;

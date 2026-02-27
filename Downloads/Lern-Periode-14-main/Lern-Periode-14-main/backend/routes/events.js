const express = require("express");
const {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const { requireAuth } = require("../middleware/auth");
const { permit } = require("../middleware/role");

const router = express.Router();

router.get("/", listEvents);
router.get("/:id", getEventById);
router.post("/", requireAuth, permit("organizer", "admin"), createEvent);
router.put("/:id", requireAuth, permit("organizer", "admin"), updateEvent);
router.delete("/:id", requireAuth, permit("organizer", "admin"), deleteEvent);

module.exports = router;

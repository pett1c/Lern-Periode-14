const express = require("express");
const { chatQuery } = require("../controllers/chatController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/query", requireAuth, chatQuery);

module.exports = router;

const express = require('express');
const { handleChatQuery } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// The endpoint will be /api/chat
// We apply the `protect` middleware assuming only logged in users can use the chat.
// Remove `protect` if the chat should be public.
router.post('/', protect, handleChatQuery);

module.exports = router;

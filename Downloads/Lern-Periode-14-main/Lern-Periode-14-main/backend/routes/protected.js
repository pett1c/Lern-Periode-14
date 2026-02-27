const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { permit } = require("../middleware/role");

const router = express.Router();

router.get("/me", requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Protected profile route.",
    data: {
      user: req.user,
    },
  });
});

router.get("/admin", requireAuth, permit("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin route access granted.",
  });
});

module.exports = router;

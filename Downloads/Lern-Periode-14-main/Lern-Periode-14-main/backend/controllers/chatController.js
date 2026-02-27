const { generateChatAnswer } = require("../services/ragService");

const chatQuery = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query || !String(query).trim()) {
      return res.status(400).json({
        success: false,
        message: "query is required.",
      });
    }

    const result = await generateChatAnswer({
      query: String(query).trim(),
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "Chat response generated successfully.",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  chatQuery,
};

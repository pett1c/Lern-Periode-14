const generateChatAnswer = async ({ query, user }) => {
  if (!query || !query.trim()) {
    throw new Error("Query must not be empty.");
  }

  // Placeholder service contract until KI pipeline is connected.
  return {
    answer:
      "RAG service placeholder response. Connect embedding/vector/LLM pipeline to replace this result.",
    context: [],
    meta: {
      userId: user?._id ? String(user._id) : null,
      role: user?.role || null,
      provider: "stub",
    },
  };
};

module.exports = {
  generateChatAnswer,
};

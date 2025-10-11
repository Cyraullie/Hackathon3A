const express = require("express");
const router = express.Router();
const { sendPromptToAI } = require("../services/infomaniak");
const { sendPromptToChat } = require("../services/chat");

router.post("/prompt", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const command = await sendPromptToAI(prompt);
    res.json({ command });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Missing chat" });
  }

  try {
    const command = await sendPromptToChat(prompt);
    res.json({ command });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


const axios = require("axios");

async function sendPromptToAI(prompt) {
  const PRODUCT_ID = process.env.PRODUCT_ID;
  const API_TOKEN = process.env.INFOMANIAK_API_TOKEN;
  const BASE_URL = `https://api.infomaniak.com/1/ai/${PRODUCT_ID}/openai/chat/completions`;

  try {
    const response = await axios.post(
      BASE_URL,
      {
        model: "llama3",
        messages: [
          { role: "system", content: "You are an assistant that outputs movement commands for a maze game. You must only reply with one of: MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const message = response.data?.choices?.[0]?.message?.content?.trim();
    return message || "MOVE_UP"; 
  } catch (error) {
    console.error("❌ Infomaniak API error:", error.response?.data || error.message);
    throw new Error("Failed to communicate with Infomaniak API");
  }
}

module.exports = { sendPromptToAI };


const axios = require("axios");

function parseSimpleCommand(prompt) {
  const text = prompt.toLowerCase();

  if (/^avance\b/.test(text) || /tout droit/.test(text) || /en avant/.test(text)) {
    const match = text.match(/(\d+)/);
    const steps = match ? parseInt(match[1]) : 1;
    return Array(steps).fill("MOVE_UP").join(",");
  }

  if (/recule/.test(text) || /en arrière/.test(text)) {
    const match = text.match(/(\d+)/);
    const steps = match ? parseInt(match[1]) : 1;
    return Array(steps).fill("MOVE_DOWN").join(",");
  }

  if (/gauche/.test(text)) {
    const match = text.match(/(\d+)/);
    const steps = match ? parseInt(match[1]) : 1;
    return Array(steps).fill("MOVE_LEFT").join(",");
  }

  if (/droite/.test(text)) {
    const match = text.match(/(\d+)/);
    const steps = match ? parseInt(match[1]) : 1;
    return Array(steps).fill("MOVE_RIGHT").join(",");
  }

  return null;
}

async function sendPromptToAI(prompt) {
  const direct = parseSimpleCommand(prompt);
  if (direct) {
    console.log("✅ Interprétation locale :", direct);
    return direct;
  }

  // 🧠 2. Sinon, on demande à l’IA (cas complexes)
  const PRODUCT_ID = process.env.PRODUCT_ID;
  const API_TOKEN = process.env.INFOMANIAK_API_TOKEN;
  const BASE_URL = `https://api.infomaniak.com/1/ai/${PRODUCT_ID}/openai/chat/completions`;

  try {
    const response = await axios.post(
      BASE_URL,
      {
        model: "DeepSeek-R1-distilled-qwen32B",
        messages: [
          {
            role: "system",
            content: `
Tu contrôles une balle dans un labyrinthe vu du dessus (top-down).
Réponds uniquement avec une ou plusieurs commandes parmi :
MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT
(selon ce que dit l'utilisateur en français).
Ne réponds avec rien d'autre.
`
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    const raw = response.data?.choices?.[0]?.message?.content?.trim();
    console.log("🤖 Réponse IA brute :", raw);
    return raw || "MOVE_UP";
  } catch (err) {
    console.error("❌ Erreur API :", err.response?.data || err.message);
    throw new Error("Échec communication avec Infomaniak API");
  }
}

module.exports = { sendPromptToAI };


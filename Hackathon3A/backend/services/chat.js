export async function sendPromptToChat(prompt) {
  const PRODUCT_ID = "105933";
  const API_TOKEN = process.env.INFOMANIAK_API_TOKEN;

  const BASE_URL = `https://api.infomaniak.com/1/ai/${PRODUCT_ID}/openai/chat/completions`;

  const payload = {
    model: "llama3",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `
`
           },
      {
        role: "user",
        content: prompt
      }
    ]
  };

  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.result === "error") {
      console.error("Erreur API :", JSON.stringify(data, null, 2));
      throw new Error(data.error?.description || "Erreur API Infomaniak");
    }

    const raw = data?.choices?.[0]?.message?.content?.trim();
    console.log("Réponse IA brute :", raw);
    return raw || "";
  } catch (err) {
    console.error("Erreur de communication avec Infomaniak :", err.message);
    throw new Error("Échec communication avec Infomaniak API");
  }
}
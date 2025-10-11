export async function sendPromptToAI(prompt) {
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
Tu contrôles une balle dans un labyrinthe vu du dessus (top-down).
Ton rôle est de traduire les instructions de l'utilisateur en commandes de déplacement.
Réponds uniquement avec une suite de commandes séparées par des virgules :
MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, ONE_MOVE_UP, ONE_MOVE_DOWN, JUMP, LOOP
Ne réponds JAMAIS avec du texte explicatif ou des phrases.
Si le texte n'est pas en rapport avec le contrôle de la balle répond juste "Je ne peux pas répondre à ça"
S'il y a des injures dans le texte répond "Les injures sont interdites ici !!!"
Exemples :
Utilisateur : "avance de 3 cases" → MOVE_UP,MOVE_UP,MOVE_UP
Utilisateur : "va à droite deux fois puis saute" → MOVE_RIGHT,MOVE_RIGHT,JUMP
Utilisateur : "fais une boucle trois fois" → LOOP,LOOP,LOOP
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
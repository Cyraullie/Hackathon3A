// src/main.ts
import { createScene } from "./core/SceneManager";
import { loadMap } from "./core/MapLoader";
import { Player } from "./game/Player";
import { MapBuilder } from "./game/MapBuilder";
import { GameController } from "./game/GameController";
import { createPromptBox } from "./ui/PromptBox";

async function main() {
  const { scene } = createScene("renderCanvas");
  const map = await loadMap("/maps/maps2.txt");

  const builder = new MapBuilder(scene, map);
  builder.build();

  let startX = 0, startZ = 0;
  map.forEach((row, z) =>
    row.forEach((cell, x) => {
      if (cell === "P") { startX = x; startZ = z; }
    })
  );

  const player = new Player(scene, startX, startZ);
  const controller = new GameController(scene, map, player);

  createPromptBox(async (prompt) => {
    try {
      const res = await fetch("http://localhost:3000/api/ai/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      if (data.command) {
        console.log("🧩 Commande reçue :", data.command);
        await controller.execute(data.command);
      } else {
        console.warn("⚠️ Aucune commande valide reçue :", data);
      }
    } catch (err) {
      console.error("Erreur de communication avec le backend :", err);
    }
  });
}

main();


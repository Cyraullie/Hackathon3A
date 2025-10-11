
import { getMapFileData } from './get_map.ts'
import chat_bot from './chat-bot.svg'
import close_icon from './close.svg'

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

  const commands = data.command.split(",").map(c => c.trim());

  for (const cmd of commands) {
    await controller.execute(cmd);
    await new Promise(r => setTimeout(r, 400));
  }
} else {
  console.warn("⚠ Aucune commande valide reçue :", data);
}
    } catch (err) {
      console.error("Erreur de communication avec le backend :", err);
    }
  });
}

export async function run() {
	const { methods, map2D } = await getMapFileData(1);
	console.log("methods :", methods);
	console.log("map :", map2D);
	

	document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
	<div id="game_page">
		<div id="methods">
			<a id="methods_list">list of methods enable</a>
		</div>
		<div id="center_part">
			<button class="chatbot" type="button">
				<img id="chat_icon" src="${chat_bot}" alt="chat bot logo" />
			</button>
			<div id="game">
	  			<canvas id="renderCanvas"></canvas>
			</div>
			<div id="left_part">
				<div id="methods_used">
					methods used
				</div>
				<div id="prompt">

				</div>
			</div>
			<div id="chat">
				chat
			</div>
		</div>
	</div>
	`

	main();
	const methodsList = document.querySelector<HTMLAnchorElement>('#methods_list')!
	methodsList.textContent = methods.join(', ')
	
	// Récupère les éléments
	const chatButton = document.querySelector<HTMLButtonElement>('.chatbot')!
	const chatIcon = document.querySelector<HTMLImageElement>('#chat_icon')!
	const leftPart = document.querySelector<HTMLDivElement>('#left_part')!
	const chatDiv = document.querySelector<HTMLDivElement>('#chat')!

	let chatVisible = false

	// Toggle au clic
	chatButton.addEventListener('click', () => {
		chatVisible = !chatVisible

		if (chatVisible) {
			leftPart.style.display = 'none'
			chatDiv.style.display = 'block'
			chatIcon.src = close_icon // → change l'image
			chatIcon.alt = "close chat"
		} else {
			leftPart.style.display = 'flex'
			chatDiv.style.display = 'none'
			chatIcon.src = chat_bot // → remet l'image du chatbot
			chatIcon.alt = "open chat"
		}
	})
}
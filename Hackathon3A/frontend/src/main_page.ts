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

	const methodsUsedDiv = document.querySelector<HTMLDivElement>('#methods_used')!;

	for (const cmd of commands) {
		await controller.execute(cmd);
		await new Promise(r => setTimeout(r, 400));

		const cmdElement = document.createElement('div');
        cmdElement.textContent = cmd;
        methodsUsedDiv.appendChild(cmdElement);
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
        <!-- chat UI will be injected here -->
		<div style="padding:10px;">
			<input type="text" id="chatInput" placeholder="Ask the AI for moves..." style="width:70%; padding:6px;" />
			<button id="sendChat">Send</button>
			</div>
		<div id="chatLog" style="padding:10px; max-height:300px; overflow:auto; font-size:0.9rem;"></div>
		
      </div>
    </div>
  </div>
  `

	main();
	const methodsList = document.querySelector<HTMLDivElement>('#methods_list')!;

	// On vide d'abord le contenu
	methodsList.innerHTML = "";

	// Pour chaque méthode, on crée un petit encadré (span)
	methods.forEach(method => {
		const badge = document.createElement('span');
		badge.textContent = method;
		badge.style.display = 'inline-block';
		badge.style.padding = '4px 8px';
		badge.style.margin = '4px';
		badge.style.border = '1px solid #888';
		badge.style.borderRadius = '8px';
		badge.style.backgroundColor = '#f4f4f4';
		badge.style.fontWeight = 'bold';
		badge.style.color = '#000';
		badge.style.fontSize = '0.9rem';
		badge.style.fontFamily = 'monospace';

		methodsList.appendChild(badge);
	});

	
	// Récupère les éléments
	const chatButton = document.querySelector<HTMLButtonElement>('.chatbot')!
	const chatIcon = document.querySelector<HTMLImageElement>('#chat_icon')!
	const leftPart = document.querySelector<HTMLDivElement>('#left_part')!
	const chatDiv = document.querySelector<HTMLDivElement>('#chat')!

  // Initially hidden
  chatDiv.style.display = 'none';

  let chatVisible = false

  // Toggle chat panel and icon
  chatButton.addEventListener('click', () => {
    chatVisible = !chatVisible

    if (chatVisible) {
      leftPart.style.display = 'none'
      chatDiv.style.display = 'block'
      chatIcon.src = close_icon
      chatIcon.alt = "close chat"
    } else {
      leftPart.style.display = 'flex'
      chatDiv.style.display = 'none'
      chatIcon.src = chat_bot
      chatIcon.alt = "open chat"
    }
  })

// Wait for main to finish and get controller

  // Helper: send prompt to backend and execute returned commands
  async function sendPromptToBackend(prompt: string) {
    try {
		console.log(prompt)
      const res = await fetch("http://localhost:3000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      if (data.command) {
        console.log("🧩 Commande reçue :", data.command);
      } else {
        console.warn("⚠ Aucune commande valide reçue :", data);
      } 

      return data;
    } catch (err) {
      console.error("Erreur de communication avec le backend :", err);
      throw err;
    }
  }

  // Wire send button
  const sendBtn = document.querySelector<HTMLButtonElement>('#sendChat')!
  const chatInput = document.querySelector<HTMLInputElement>('#chatInput')!
  const chatLog = document.querySelector<HTMLDivElement>('#chatLog')!

  sendBtn.addEventListener('click', async (e) => {
    e.preventDefault()
	console.log(chatInput.value);
    const prompt = chatInput.value.trim()
	console.log(prompt);
    if (!prompt) return

    chatLog.innerHTML += `<div><strong>You:</strong> ${escapeHtml(prompt)}</div>`
    chatInput.value = ''

    try {
      const data = await sendPromptToBackend(prompt)
      const aiText = data.command ?? JSON.stringify(data)
      chatLog.innerHTML += `<div><strong>AI:</strong> ${escapeHtml(aiText)}</div>`
      chatLog.scrollTop = chatLog.scrollHeight
    } catch (err) {
      chatLog.innerHTML += `<div style="color:crimson">Error sending prompt. See console.</div>`
    }
  })

  // small utility to avoid inserting raw HTML from AI/prompt
  function escapeHtml(s: string) {
    return s.replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    } as any)[c]);
  }
}

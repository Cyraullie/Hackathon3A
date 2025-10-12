import { getMapFileData } from './get_map.ts'
import chat_bot from './chat-bot.svg'
import close_icon from './close.svg'

import { createScene } from "./core/SceneManager";
import { loadMap } from "./core/MapLoader";
import { Player } from "./game/Player";
import { MapBuilder } from "./game/MapBuilder";
import { GameController } from "./game/GameController";
import { createPromptBox } from "./ui/PromptBox";

const max_point: number = 10;
var actual_point: number = 10;
var first: boolean;

function save_point() {
	// Récupère la valeur existante dans le localStorage (ou 0 si elle n'existe pas)
	const storedPoint = localStorage.getItem("point");
	const previousPoints = storedPoint ? Number(storedPoint) : 0;

	// Ajoute les nouveaux points
	const totalPoints = previousPoints + actual_point;

	// Sauvegarde la nouvelle valeur dans le localStorage
	localStorage.setItem("point", totalPoints.toString());

	console.log(`✅ Points sauvegardés : ${totalPoints}`);
}

function update_points_display() {
  const el = document.querySelector<HTMLSpanElement>('#points_display');
  if (el) {
    el.textContent = `(${actual_point}/${max_point})`;
  }
}

async function main(level: number) {
	const { scene } = createScene("renderCanvas");
	const map = await loadMap("/maps/maps" + level + ".txt");

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
	const { serverMethods } = await getMapFileData(level);
			
	console.log("serverMethods :", serverMethods);

	createPromptBox(async (prompt) => {
		try {
			const res = await fetch("http://localhost:3000/api/ai/prompt", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prompt, serverMethods }),
			});
			const data = await res.json();

			const methodsUsedDiv = document.querySelector<HTMLDivElement>('#methods_used')!;

			// Récupère ou crée le conteneur pour le code (entre les {})
			let codeContainer = methodsUsedDiv.querySelector('.code-content');
			if (!codeContainer) {
				codeContainer = document.createElement('div');
				codeContainer.classList.add('code-content');
				codeContainer.style.marginLeft = '20px';
				methodsUsedDiv.insertBefore(codeContainer, methodsUsedDiv.querySelector('p:last-child'));
			}

			// Supprime tous les messages temporaires (erreurs rouges) avant d’ajouter le nouveau
			const oldErrors = methodsUsedDiv.querySelectorAll('.temp-error');
			oldErrors.forEach(e => e.remove());

			if (data.command) {
				console.log("🧩 Commande reçue :", data.command);

			const commands = data.command.split(",").map(c => c.trim());
			
  			
			const validCommands = serverMethods;

			let hasValid = false;
			if (first)
				first = false;
			else
			{
				if (actual_point > 0)
				{
					actual_point--;
					update_points_display();
				}
			}
			console.log(actual_point);
			for (const cmd of commands) {
				if (validCommands.includes(cmd)) {
					hasValid = true;

					// Ajoute la commande de manière persistante
					const cmdElement = document.createElement('div');
					cmdElement.textContent = cmd + "();";
					cmdElement.style.fontFamily = 'monospace';
					cmdElement.style.paddingLeft = '10px';
					cmdElement.style.color = '#00c853';
					codeContainer.appendChild(cmdElement);

					let result = await controller.execute(cmd);
										
					if (result === "success") {
						console.log("🎉 Le joueur a fini le niveau !"); // petite pause

						// Nettoie la scène et recharge la suivante
						save_point();

						const nextMapUrl = `/maps/maps${level + 1}.txt`;
						try {
							const res = await fetch(nextMapUrl);
							const text = await res.text();
							if (!res.ok || text.trim().startsWith("<")) {
								// Si le fichier n'existe pas
								const methodsUsedDiv = document.querySelector<HTMLDivElement>('#methods_used')!;
								const endMsg = document.createElement('div');
								endMsg.textContent = "🎯 Félicitations ! Tu as terminé tous les niveaux 🎉";
								endMsg.style.color = 'gold';
								endMsg.style.fontWeight = 'bold';
								endMsg.style.marginTop = '15px';
								methodsUsedDiv.appendChild(endMsg);
								loadLeaderboard();
								return;
							}
							else
							{
								const winMsg = document.createElement('div');
								winMsg.textContent = `🎉 Niveau ${level} réussi ! Passage au niveau ${level + 1}...`;
								winMsg.style.color = 'gold';
								winMsg.style.fontWeight = 'bold';
								winMsg.style.marginTop = '10px';
								codeContainer.appendChild(winMsg);

								await new Promise(r => setTimeout(r, 1000));
								document.querySelector<HTMLDivElement>('#app')!.innerHTML = "";
								// Sinon, on lance le niveau suivant
								const module = await import('./main_page.ts');
								module.run(level + 1);
							}
						} catch (err) {
							console.error("Erreur lors de la vérification du prochain niveau :", err);
						}
					} else if (result === "fail") {
					console.log("💥 Le joueur a échoué !");
					} else {
					console.log("➡️ Le jeu continue...");
					}
					await new Promise(r => setTimeout(r, 400));
				} else {
					// Affiche temporairement les textes non-valides en rouge
					const tempError = document.createElement('div');
					tempError.textContent = cmd;
					tempError.classList.add('temp-error');
					tempError.style.color = 'red';
					tempError.style.fontWeight = 'bold';
					tempError.style.marginTop = '5px';
					tempError.style.marginLeft = '20px';
					methodsUsedDiv.insertBefore(tempError, methodsUsedDiv.querySelector('p:last-child'));
				}
			}

		} else {
			// Aucun contenu → message temporaire
			const errorMsg = document.createElement('div');
			errorMsg.textContent = "⚠ Aucune commande valide reçue";
			errorMsg.classList.add('temp-error');
			errorMsg.style.color = 'red';
			errorMsg.style.fontWeight = 'bold';
			errorMsg.style.marginTop = '5px';
			errorMsg.style.marginLeft = '20px';
			methodsUsedDiv.insertBefore(errorMsg, methodsUsedDiv.querySelector('p:last-child'));
		}

    } catch (err) {
		console.error("Erreur de communication avec le backend :", err);

		const methodsUsedDiv = document.querySelector<HTMLDivElement>('#methods_used')!;
		const oldErrors = methodsUsedDiv.querySelectorAll('.temp-error');
		oldErrors.forEach(e => e.remove());

		const errorMsg = document.createElement('div');
		errorMsg.textContent = "❌ Erreur de communication avec le backend";
		errorMsg.classList.add('temp-error');
		errorMsg.style.color = 'red';
		errorMsg.style.fontWeight = 'bold';
		errorMsg.style.marginTop = '5px';
		errorMsg.style.marginLeft = '20px';
		methodsUsedDiv.insertBefore(errorMsg, methodsUsedDiv.querySelector('p:last-child'));
	}
	});
}

export async function run(level: number) {
	actual_point = 10;
	first = true;
	const { clientMethods  } = await getMapFileData(level);
	console.log("clientMethods :", clientMethods);

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
			<h2 style="text-align: center; width: 80%;">
				niveau ${level}
				<span id="points_display" style="font-size: 1rem; color: gold; margin-left: 10px;">
					(${actual_point}/${max_point})
				</span>
			</h2>
			  
			<p>{</p>
			<p style="color: lightblue;">//le code qui va s'executer va apparaitre ici</p>
			<p> }</p>
        </div>
        <div id="prompt">

        </div>
      </div>
      <div id="chat">
        <!-- chat UI will be injected here -->
		<div style="padding:10px; width: 80%">
			<input type="text" id="chatInput" placeholder="Pose tes questions ici" style="width:70%; padding:6px;" />
			<button id="sendChat">Send</button>
		</div>
		<div id="chatLog" style="padding:10px; height:calc(100vh - 140px); max-height:calc(100vh - 140px); overflow:auto;  overflow-y: auto; font-size:0.9rem;">
		</div>
		
      </div>
    </div>
	<div class="overlay" id="popupOverlay">
		<div class="popup">
			<div class="popup-header">
				<span>Leaderboard</span>
				<button id="closePopup">X</button>
			</div>
			<div style="margin-bottom: 10px;">	
				<input type="text" id="input"/>
				<button id="post">Post</button>
			</div>
			<div class="popup-content" id="popupContent">
			
			</div>
		</div>
	</div>
  </div>
  `

	main(level);
	const methodsList = document.querySelector<HTMLDivElement>('#methods_list')!;

	// On vide d'abord le contenu
	methodsList.innerHTML = "";

	// Pour chaque méthode, on crée un petit encadré (span)
	clientMethods.forEach(method => {
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
      chatDiv.style.display = 'flex'
      chatIcon.src = close_icon
      chatIcon.alt = "close chat"
    } else {
      leftPart.style.display = 'flex'
      chatDiv.style.display = 'none'
      chatIcon.src = chat_bot
      chatIcon.alt = "open chat"
    }
  })

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

	chatInput.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			e.preventDefault(); // empêche un éventuel saut de ligne
			sendBtn.click(); // simule un clic sur le bouton
		}
	});

 sendBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const prompt = chatInput.value.trim();
  if (!prompt) return;

  // --- User message (right aligned)
  const userMsg = document.createElement('div');
  userMsg.style.textAlign = 'right';
  userMsg.innerHTML = `
    <div style="
      display: inline-block;
      background-color: #4f8cff;
      color: white;
      padding: 8px 12px;
      border-radius: 12px;
      margin: 5px 0;
      max-width: 70%;
      word-wrap: break-word;
      text-align: left;
    ">
      ${escapeHtml(prompt)}
    </div>
  `;
  chatLog.appendChild(userMsg);
  chatInput.value = '';

  try {
    const data = await sendPromptToBackend(prompt);
    const aiText = data.command ?? JSON.stringify(data);

    // --- AI message (left aligned)
    const aiMsg = document.createElement('div');
    aiMsg.style.textAlign = 'left';
    aiMsg.innerHTML = `
      <div style="
        display: inline-block;
        background-color: #e5e5e5;
        color: #000;
        padding: 8px 12px;
        border-radius: 12px;
        margin: 5px 0;
        max-width: 70%;
        word-wrap: break-word;
      ">
        ${escapeHtml(aiText)}
      </div>
    `;
    chatLog.appendChild(aiMsg);

    chatLog.scrollTop = chatLog.scrollHeight;
  } catch (err) {
    const errorMsg = document.createElement('div');
    errorMsg.style.color = 'crimson';
    errorMsg.textContent = 'Error sending prompt. See console.';
    chatLog.appendChild(errorMsg);
  }
});
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

	const popupOverlay = document.getElementById("popupOverlay");
	const popupContent = document.getElementById("popupContent");
	const closePopup = document.getElementById("closePopup");
	const url = "http://localhost:3000";
	const postBtn = document.getElementById("post");
	const input = document.getElementById("input");

	// 🟡 POST button
	postBtn.addEventListener("click", async (e) => {
	e.preventDefault();

	const name = input.value.trim();
	if (!name) return alert("Please enter a name");

	const score = Number(localStorage.getItem("point"));
	localStorage.removeItem("point");
	try {
		const res = await fetch(url + "/info", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, score }),
		});
		
		const data = await res.json();

		if (res.ok) {
		alert(`✅ Saved ${data.name} with score ${data.score}`);
		input.value = "";
		loadLeaderboard(); // Refresh leaderboard after saving
		} else {
		alert("❌ Error: " + (data.error || "Unknown error"));
		}
	} catch (err) {
		console.error(err);
		alert("❌ Failed to send data to server");
	}
	});


	// 🔴 Close popup
	closePopup.addEventListener("click", () => {
		popupOverlay.style.display = "none";
	});
}

async function loadLeaderboard() {
	const popupOverlay = document.getElementById("popupOverlay");
	const popupContent = document.getElementById("popupContent");
	const closePopup = document.getElementById("closePopup");
	const url = "http://localhost:3000";
	const postBtn = document.getElementById("post");
	const input = document.getElementById("input");

	popupOverlay.style.display = "flex";
	popupContent.innerHTML = "<p>Loading leaderboard...</p>";

	try {
		const res = await fetch(url + "/connexion", {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		});

		if (!res.ok) throw new Error("Server returned " + res.status);

		const data = await res.json();

		if (!Array.isArray(data) || data.length === 0) {
		popupContent.innerHTML = `
			<p style="text-align:center; color:gray;">
			🕹️ No users found yet.<br>Be the first to post a score!
			</p>
		`;
		} else {
		data.sort((a, b) => b.score - a.score);
		popupContent.innerHTML = `
			${data
			.map((u, i) => `<div>${i + 1}. <b>${u.name}</b> — ${u.score}</div>`)
			.join("")}
		`;
		}
	} catch (err) {
		console.error(err);
		popupContent.innerHTML = `
		<p style="color:red; text-align:center;">
			⚠️ Could not load leaderboard.<br>
			Make sure the backend is running.
		</p>
		`;
	}
	}
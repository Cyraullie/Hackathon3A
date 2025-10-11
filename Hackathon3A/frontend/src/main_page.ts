import './style.css'
import { getMapFileData } from './get_map.ts'
import chat_bot from './chat-bot.svg'
import close_icon from './close.svg'

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
				game
			</div>
			<div id="left_part">
				<div id="methods_used">
					methods used
				</div>
				<div id="prompt">
					prompt
				</div>
			</div>
			<div id="chat">
				chat
			</div>
		</div>
	</div>
	`
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
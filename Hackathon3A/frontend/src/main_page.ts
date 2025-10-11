import './style.css'
import { setupCounter } from './counter.ts'
import { getMapFileData } from './get_map.ts'

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
		</div>
	</div>
	`
	const methodsList = document.querySelector<HTMLAnchorElement>('#methods_list')!
	methodsList.textContent = methods.join(', ')
	setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

}
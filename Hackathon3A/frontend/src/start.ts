
import { setupStartGame } from './start_game.ts'
const module = await import('./main_page.ts')
module.run();
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>

    <h1>Vite + test</h1>
    <div class="card">
      <button id="start" type="button">Start Game</button>
    </div>
  </div>
`

setupStartGame(document.querySelector<HTMLButtonElement>('#start')!)
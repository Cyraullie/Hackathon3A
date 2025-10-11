//TODO sysytem de niveau pour permettre les differentes methods/maps/
import { setupStartGame } from './start_game.ts'
const module = await import('./main_page.ts')
module.run(1);
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>

    <h1>Vite + test</h1>
    <div class="card">
      <button id="start" type="button">Start Game</button>
    </div>
  </div>
`

setupStartGame(document.querySelector<HTMLButtonElement>('#start')!)
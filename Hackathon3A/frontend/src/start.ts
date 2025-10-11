//TODO ajouter une manière de perdre
import { setupStartGame } from './start_game.ts'
//const module = await import('./main_page.ts')
//module.run(1);
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>

    <h1>Vite + test</h1>
    <div class="card">
      <button id="start" type="button">Start Game</button>
    </div>
  </div>
`
//TODO add chargement 
//TODO add chrono 20min? 
//TODO add AI course for each theme 
setupStartGame(document.querySelector<HTMLButtonElement>('#start')!)
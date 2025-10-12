

//TODO ajouter une manière de perdre
import { setupStartGame } from './start_game.ts'

// Render the base UI
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div class="card">
      <h1>Prompt Quest</h1>
      <button id="start" type="button">Start Game</button>
    </div>
    <div id="leaderboard-container" style="margin-top: 30px;"></div>
  </div>
`

// 🎨 Make the "Start Game" button bigger but keep its colors
const startButton = document.querySelector<HTMLButtonElement>('#start')!
Object.assign(startButton.style, {
  fontSize: '2rem',       // bigger text
  padding: '20px 60px',   // more padding to enlarge
  borderRadius: '12px',
  display: 'block',
  margin: '40px auto 20px auto',  // center + add spacing
  cursor: 'pointer',
  border: '2px solid black',      // preserve your theme
  backgroundColor: 'black',        // same color scheme
  color: 'white',
  transition: 'transform 0.2s ease',
})

// Optional: subtle press animation
startButton.addEventListener('mousedown', () => {
  startButton.style.transform = 'scale(0.95)'
})
startButton.addEventListener('mouseup', () => {
  startButton.style.transform = 'scale(1)'
})

// Initialize the game
setupStartGame(startButton)

// === LEADERBOARD DISPLAY LOGIC ===
const leaderboardContainer = document.getElementById('leaderboard-container') as HTMLDivElement

async function loadLeaderboard() {
  leaderboardContainer.innerHTML = '<p>Loading leaderboard...</p>'

  try {
    const res = await fetch('http://localhost:3000/connexion', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!res.ok) throw new Error('Server error')

    const data = await res.json()

    if (!Array.isArray(data) || data.length === 0) {
      leaderboardContainer.innerHTML = `
        <p style="text-align:center; color:gray;">
          🕹️ No players yet.<br>Be the first to score!
        </p>
      `
    } else {
      data.sort((a: any, b: any) => b.score - a.score)

      // 🏆 Keep your black + gray leaderboard
      leaderboardContainer.innerHTML = `
        <div style="
          background: black;
          border-radius: 12px;
          padding: 20px;
          max-width: 400px;
          margin: 0 auto;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        ">
          <h2 style="margin-bottom: 15px; color: white;">🏆 Leaderboard</h2>
          ${data
            .map(
              (u: any, i: number) => `
                <div style="
                  background: gray;
                  border-radius: 6px;
                  margin: 6px 0;
                  padding: 8px;
                  font-weight: 500;
                  color: white;
                ">
                  ${i + 1}. <b>${u.name}</b> — ${u.score}
                </div>
              `
            )
            .join('')}
        </div>
      `
    }
  } catch (err) {
    console.error(err)
    leaderboardContainer.innerHTML = `
      <p style="color:red; text-align:center;">
        ⚠️ Could not load leaderboard.<br>Check backend connection.
      </p>
    `
  }
}

// Load leaderboard on page load
loadLeaderboard()


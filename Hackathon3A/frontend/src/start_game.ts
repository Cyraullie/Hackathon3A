
export function setupStartGame(element: HTMLButtonElement) {
  element.addEventListener('click', async () => {
    // Import dynamique du module main_page.ts
    const module = await import('./main_page.ts')
    
    // Appel d'une fonction exportée depuis main_page.ts
    module.run(1)
  })
}

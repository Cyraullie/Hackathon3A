
export function setupCounter(element: HTMLButtonElement) {
  let counter = 0
  const setCounter = (count: number) => {
    counter = count
    element.innerHTML = `count is ${counter}`
  }
  element.addEventListener('click', () => setCounter(counter + 1))
  setCounter(0)


	// Définir le type pour la map 2D
	type Map2D = string[][];

	// Chemin vers le fichier .txt (doit être accessible depuis le serveur)
	const fileUrl: string = 'map1.txt';

	async function loadMap(): Promise<{ methods: string[]; map2D: Map2D }> {
		try {
			const response = await fetch(fileUrl);
			if (!response.ok) throw new Error(`Impossible de lire le fichier : ${response.statusText}`);

			const text: string = await response.text();
			const lines: string[] = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
			
			let methods: string[] = [];
			let map: string[] = [];
			let section: 'methods' | 'map' | null = null;

			lines.forEach(line => {
				if (line.startsWith('methods:')) {
					section = 'methods';
					const rest = line.slice('methods:'.length).trim();
					if (rest.length) methods = rest.split(',').map(s => s.trim());
				} else if (line.startsWith('map:')) {
					section = 'map';
				} else {
					if (section === 'methods') {
						methods.push(...line.split(',').map(s => s.trim()));
					} else if (section === 'map') {
						map.push(line);
					}
				}
			});

			const map2D: Map2D = map.map(row => row.split(''));

			return { methods, map2D };

		} catch (err) {
			console.error(err);
			return { methods: [], map2D: [] };
		}
	}

	// Exemple d'utilisation
	loadMap().then(({ methods, map2D }) => {
		console.log("Méthodes :", methods);
		console.log("Map 2D :", map2D);

		// Exemple : accéder à une case spécifique
		//console.log("Case [2][2] :", map2D[2][2]); // 'P'
	});


}

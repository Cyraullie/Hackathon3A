export async function getMapFileData(level: number): Promise<{ methods: string[]; map2D: string[][] }> {
    type Map2D = string[][];

    // Génère le nom du fichier selon le level
    const fileUrl = `map${level}.txt`;

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
                    methods.push(line);
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
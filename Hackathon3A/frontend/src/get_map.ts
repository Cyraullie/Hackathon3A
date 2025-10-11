export async function getMapFileData(level: number): Promise<{
  clientMethods: string[];
  serverMethods: string[];
}> {
  const fileUrl = `method${level}.txt`;

  console.log(fileUrl);
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Impossible de lire le fichier : ${response.statusText}`);

    const text = await response.text();
	console.log(text);
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

    let clientMethods: string[] = [];
    let serverMethods: string[] = [];
    let section: 'client' | 'server' | null = null;

    for (const line of lines) {
      if (line.startsWith('client:')) {
        section = 'client';
        continue;
      } else if (line.startsWith('server:')) {
        section = 'server';
        continue;
      }

      if (section === 'client') clientMethods.push(line);
      else if (section === 'server') serverMethods.push(line);
    }

    return { clientMethods, serverMethods };

  } catch (err) {
    console.error("❌ Erreur lors de la lecture du fichier :", err);
    return { clientMethods: [], serverMethods: [] };
  }
}

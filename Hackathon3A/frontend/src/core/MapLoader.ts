export async function loadMap(path: string): Promise<(string | number)[][]> {
  const res = await fetch(path);
  const text = await res.text();
  return text.trim().split("\n").map(line =>
    line.trim().split(/\s+/).map(v => (isNaN(Number(v)) ? v : Number(v)))
  );
}


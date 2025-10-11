import { createScene } from "./core/SceneManager";
import { loadMap } from "./core/MapLoader";
import { Player } from "./game/Player";
import { MapBuilder } from "./game/MapBuilder";
import { winAnimation, failAnimation } from "./core/Animations";

async function main() {
  const { scene } = createScene("renderCanvas");
  const map = await loadMap("/maps/maps2.txt");

  const builder = new MapBuilder(scene, map);
  builder.build();

  let startX = 0, startZ = 0;
  map.forEach((row, z) =>
    row.forEach((cell, x) => {
      if (cell === "P") { startX = x; startZ = z; }
    })
  );

  const player = new Player(scene, startX, startZ);

  console.log("✅ Scène prête. Appuie sur V pour victoire, F pour échec.");

  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "v") {
      winAnimation(scene, player.mesh);
    }
    if (e.key.toLowerCase() === "f") {
      failAnimation(scene, player.mesh);
    }
  });
}

main();


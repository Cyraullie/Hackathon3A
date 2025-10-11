import { Player } from "./Player";
import { winAnimation, failAnimation } from "../core/Animations";
import { MapBuilder } from "./MapBuilder";

export class GameController {
  player: Player;
  map: (string | number)[][];
  scene;
  levelIndex = 0;

  constructor(scene, map, player) {
    this.scene = scene;
    this.map = map;
    this.player = player;
  }

  async execute(command: string) {
    const { x, z } = this.player.pos;
    let newX = x, newZ = z;

    if (command === "MOVE_UP") newZ -= 1;
    if (command === "MOVE_DOWN") newZ += 1;
    if (command === "MOVE_LEFT") newX -= 1;
    if (command === "MOVE_RIGHT") newX += 1;

    if (
      newZ >= 0 && newZ < this.map.length &&
      newX >= 0 && newX < this.map[0].length &&
      this.map[newZ][newX] !== 0 && this.map[newZ][newX] !== "0"
    ) {
      this.player.moveTo(newX, newZ);

      if (this.map[newZ][newX] === "D") {
        console.log("🎉 Victoire !");
        await winAnimation(this.scene, this.player.mesh);
        this.loadNextLevel();
      }
    } else {
      failAnimation(this.scene, this.player.mesh);
    }
  }

  async loadNextLevel() {
    this.levelIndex++;
    const nextMapPath = `/maps/maps${this.levelIndex + 2}.txt`;
    try {
      const res = await fetch(nextMapPath);
      const text = await res.text();
      const map = text.trim().split("\n").map(line =>
        line.trim().split(/\s+/).map(v => (isNaN(Number(v)) ? v : Number(v)))
      );
      this.map = map;

      this.scene.meshes.forEach((m) => {
        if (m.name !== "player") m.dispose();
      });

      const builder = new MapBuilder(this.scene, map);
      builder.build();

      let startX = 0, startZ = 0;
      map.forEach((row, z) =>
        row.forEach((cell, x) => {
          if (cell === "P") { startX = x; startZ = z; }
        })
      );

      this.player.mesh.position.x = startX;
      this.player.mesh.position.z = startZ;
      this.player.pos = { x: startX, z: startZ };
      this.player.mesh.material.alpha = 1; // réaffiche la balle

    } catch (err) {
    }
  }
}


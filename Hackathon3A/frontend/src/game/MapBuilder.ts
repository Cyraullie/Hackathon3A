// src/game/MapBuilder.ts
import { MeshBuilder, StandardMaterial, Color3, Color4, Scene, Vector3, Mesh } from "@babylonjs/core";

export class MapBuilder {
  map: (string | number)[][];
  scene: Scene;
  cubeSize = 1;

  constructor(scene: Scene, map: (string | number)[][]) {
    this.scene = scene;
    this.map = map;
  }

  build() {
    const wallMat = new StandardMaterial("wallMat", this.scene);
    wallMat.diffuseColor = new Color3(0.25, 0.25, 0.25);

    const destMat = new StandardMaterial("destMat", this.scene);
    destMat.diffuseColor = new Color3(0.1, 0.4, 1.0);

    const startMat = new StandardMaterial("startMat", this.scene);
    startMat.diffuseColor = new Color3(0.2, 0.8, 0.2);

    const masterBox = MeshBuilder.CreateBox("master", { size: this.cubeSize }, this.scene);
    masterBox.material = wallMat;
    masterBox.isVisible = false;

    this.map.forEach((row, z) => {
      row.forEach((cellRaw, x) => {
        const cell = typeof cellRaw === "string" ? cellRaw.trim() : cellRaw;
        if (cell === 1 || cell === "1" || cell === "P" || cell === "D") {
          let cube: Mesh;

          if (cell === "D") {
            cube = MeshBuilder.CreateBox(`dest-${x}-${z}`, { size: this.cubeSize }, this.scene);
            cube.material = destMat;
          }
          else if (cell === "P") {
            cube = MeshBuilder.CreateBox(`start-${x}-${z}`, { size: this.cubeSize }, this.scene);
            cube.material = startMat;
          }
          else {
            cube = masterBox.createInstance(`wall-${x}-${z}`);
            cube.material = wallMat;
          }

          cube.position = new Vector3(x * this.cubeSize, this.cubeSize / 2, z * this.cubeSize);
          cube.enableEdgesRendering();
          cube.edgesWidth = 1.5;
          cube.edgesColor = new Color4(0.2, 0.5, 1, 1);
        }
      });
    });
  }
}


// src/game/MapBuilder.ts
import {
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  Scene,
  Vector3,
  Mesh,
  InstancedMesh
} from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

export interface LoopBlock {
  mesh: Mesh;
  loops: number;
  targetLoops: number;
  text: GUI.TextBlock;
}

export class MapBuilder {
  map: (string | number)[][];
  scene: Scene;
  cubeSize = 1;
  static loopBlocks: LoopBlock[] = [];

  constructor(scene: Scene, map: (string | number)[][]) {
    this.scene = scene;
    this.map = map;
  }

  build() {
    MapBuilder.loopBlocks = [];

    // 🎨 Materials
    const wallMat = new StandardMaterial("wallMat", this.scene);
    wallMat.diffuseColor = new Color3(0.25, 0.25, 0.25);

    const destMat = new StandardMaterial("destMat", this.scene);
    destMat.diffuseColor = new Color3(0.1, 0.4, 1.0);

    const startMat = new StandardMaterial("startMat", this.scene);
    startMat.diffuseColor = new Color3(0.2, 0.8, 0.2);

    const loopMat = new StandardMaterial("loopMat", this.scene);
    loopMat.diffuseColor = new Color3(0.6, 0.2, 0.8);

    const masterBox = MeshBuilder.CreateBox("master", { size: this.cubeSize }, this.scene);
    masterBox.material = wallMat;
    masterBox.isVisible = false;

    // 🧾 Interface GUI unique
    const ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("loopUI", true, this.scene);

    // 🧱 Construction
    this.map.forEach((row, z) => {
      row.forEach((cellRaw, x) => {
        const cell = typeof cellRaw === "string" ? cellRaw.trim() : cellRaw;

        // ✅ Support du format "B3"
        const isLoopBlock = typeof cell === "string" && cell.startsWith("B");
        const targetLoops = isLoopBlock ? parseInt(cell.slice(1)) || 3 : 0;

        if (cell === 1 || cell === "1" || cell === "P" || cell === "D" || isLoopBlock) {
          let cube: Mesh | InstancedMesh | null = null;

          if (cell === "D") {
            cube = MeshBuilder.CreateBox(`dest-${x}-${z}`, { size: this.cubeSize }, this.scene);
            cube.material = destMat;
          } else if (cell === "P") {
            cube = MeshBuilder.CreateBox(`start-${x}-${z}`, { size: this.cubeSize }, this.scene);
            cube.material = startMat;
          } else if (isLoopBlock) {
            const block = MeshBuilder.CreateBox(`loop-${x}-${z}`, { size: this.cubeSize }, this.scene);
            block.material = loopMat;
            block.position = new Vector3(x * this.cubeSize, this.cubeSize / 2, z * this.cubeSize);
            block.enableEdgesRendering();
            block.edgesWidth = 1.5;
            block.edgesColor = new Color4(0.8, 0.5, 1, 1);

            // 🧭 Texte 3D lié au bloc
            const text = new GUI.TextBlock();
            text.text = targetLoops.toString();
            text.color = "white";
            text.fontSize = 36;
            text.outlineWidth = 6;
            text.outlineColor = "black";
            ui.addControl(text);
            text.linkWithMesh(block);
            text.linkOffsetY = -this.cubeSize * 60;

            MapBuilder.loopBlocks.push({ mesh: block, loops: 0, targetLoops, text });
            return;
          } else {
            cube = masterBox.createInstance(`wall-${x}-${z}`);
            cube.material = wallMat;
          }

          if (cube) {
            cube.position = new Vector3(x * this.cubeSize, this.cubeSize / 2, z * this.cubeSize);
            cube.enableEdgesRendering();
            cube.edgesWidth = 1.5;
            cube.edgesColor = new Color4(0.2, 0.5, 1, 1);
          }
        }
      });
    });
  }
}


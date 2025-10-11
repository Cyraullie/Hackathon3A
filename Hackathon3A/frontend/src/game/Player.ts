import { MeshBuilder, StandardMaterial, Color3, Scene, Vector3 } from "@babylonjs/core";
import { moveTo } from "../core/Animations";

export class Player {
  mesh;
  pos = { x: 0, z: 0 };
  cubeSize = 1;
  sphereDiam = 0.5;
  scene: Scene;

  constructor(scene: Scene, x: number, z: number) {
    this.scene = scene;

    const sphere = MeshBuilder.CreateSphere("player", { diameter: this.sphereDiam }, scene);
    const mat = new StandardMaterial("playerMat", scene);
    mat.diffuseColor = new Color3(1, 0.2, 0.2);
    sphere.material = mat;

    sphere.position = new Vector3(
      x * this.cubeSize,
      this.cubeSize + this.sphereDiam /2,
      z * this.cubeSize
    );

    this.mesh = sphere;
    this.pos = { x, z };
  }

  moveTo(newX: number, newZ: number) {
    this.pos = { x: newX, z: newZ };
    const target = new Vector3(
      newX * this.cubeSize,
      this.mesh.position.y,
      newZ * this.cubeSize
    );
    moveTo(this.scene, this.mesh, target, 10);
  }
}


import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
} from "@babylonjs/core";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

const engine = new Engine(canvas, true);

const scene = new Scene(engine);

const camera = new ArcRotateCamera(
  "Camera",
  Math.PI / 2,
  Math.PI / 2,
  4,
  Vector3.Zero(),
  scene
);
camera.attachControl(canvas, true);

const light = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => {
  engine.resize();
});


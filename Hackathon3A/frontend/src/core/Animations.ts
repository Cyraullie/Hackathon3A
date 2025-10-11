import { Scene, Animation, Vector3, Color3, MeshBuilder, StandardMaterial } from "@babylonjs/core";

import * as GUI from "@babylonjs/gui";


export function moveTo(scene: Scene, mesh, target: Vector3, duration = 10) {
  const anim = new Animation("moveAnim", "position", 60, Animation.ANIMATIONTYPE_VECTOR3);
  anim.setKeys([
    { frame: 0, value: mesh.position.clone() },
    { frame: duration, value: target },
  ]);
  mesh.animations = [anim];
  scene.beginAnimation(mesh, 0, duration, false);
}


function jump(scene, mesh, height = 1, duration = 20) {
  const anim = new Animation("jump", "position.y", 60, Animation.ANIMATIONTYPE_FLOAT);
  anim.setKeys([
    { frame: 0, value: mesh.position.y },
    { frame: duration / 2, value: mesh.position.y + height },
    { frame: duration, value: mesh.position.y },
  ]);
  scene.beginDirectAnimation(mesh, [anim], 0, duration, false);
}


export async function loopCircle(scene: Scene, mesh, count = 3, radius = 2): Promise<void> {
  return new Promise<void>((resolve) => {
    const ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("loopUI");
    const text = new GUI.TextBlock();
    text.text = `↻ ${count}`;
    text.color = "white";
    text.fontSize = 40;
    text.outlineWidth = 6;
    text.outlineColor = "black";
    text.top = "-300px";
    ui.addControl(text);

    const center = mesh.position.clone();
    let angle = 0;
    let loops = 0;

    const update = scene.onBeforeRenderObservable.add(() => {
      angle += 0.05;
      mesh.position.x = center.x + Math.cos(angle) * radius;
      mesh.position.z = center.z + Math.sin(angle) * radius;

      if (angle >= Math.PI * 2) {
        angle = 0;
        loops++;
        const remaining = count - loops;
        text.text = `↻ ${remaining > 0 ? remaining : "✔"}`;

        if (remaining <= 0) {
          scene.onBeforeRenderObservable.remove(update);
          ui.dispose();
          winAnimation(scene, mesh).then(() => resolve());
        }
      }
    });
  });
}

export async function winAnimation(scene: Scene, mesh): Promise<void> {
  return new Promise((resolve) => {
    const scaleAnim = new Animation("winScale", "scaling", 60, Animation.ANIMATIONTYPE_VECTOR3);
    scaleAnim.setKeys([
      { frame: 0, value: mesh.scaling.clone() },
      { frame: 10, value: mesh.scaling.scale(1.5) },
      { frame: 20, value: mesh.scaling.clone() },
    ]);

    const colorAnim = new Animation("colorAnim", "material.diffuseColor", 60, Animation.ANIMATIONTYPE_COLOR3);
    colorAnim.setKeys([
      { frame: 0, value: new Color3(1, 0.2, 0.2) },
      { frame: 10, value: new Color3(1, 1, 0.3) },
      { frame: 20, value: new Color3(0.3, 1, 0.3) },
    ]);

    const rotAnim = new Animation("rotAnim", "rotation.y", 60, Animation.ANIMATIONTYPE_FLOAT);
    rotAnim.setKeys([
      { frame: 0, value: mesh.rotation.y },
      { frame: 30, value: mesh.rotation.y + Math.PI * 4 },
    ]);

    scene.beginDirectAnimation(mesh, [scaleAnim, colorAnim, rotAnim], 0, 30, false, 1, () => {
      let alpha = 1;
      const fade = scene.onBeforeRenderObservable.add(() => {
        alpha -= 0.02;
        if (mesh.material) mesh.material.alpha = Math.max(0, alpha);
        if (alpha <= 0) {
          scene.onBeforeRenderObservable.remove(fade);
          resolve();
        }
      });
    });
  });
}
export function failAnimation(scene: Scene, mesh) {
  const shakeAnim = new Animation("shake", "position.x", 60, Animation.ANIMATIONTYPE_FLOAT);
  const startX = mesh.position.x;
  shakeAnim.setKeys([
    { frame: 0, value: startX },
    { frame: 3, value: startX + 0.2 },
    { frame: 6, value: startX - 0.2 },
    { frame: 9, value: startX + 0.2 },
    { frame: 12, value: startX - 0.2 },
    { frame: 15, value: startX },
  ]);

  const colorAnim = new Animation("colorFail", "material.diffuseColor", 60, Animation.ANIMATIONTYPE_COLOR3);
  colorAnim.setKeys([
    { frame: 0, value: new Color3(1, 0.2, 0.2) },
    { frame: 5, value: new Color3(1, 0, 0) },
    { frame: 10, value: new Color3(0.5, 0, 0) },
    { frame: 15, value: new Color3(1, 0.2, 0.2) },
  ]);

  scene.beginDirectAnimation(mesh, [shakeAnim, colorAnim], 0, 15, false);
}

export function failFall(scene: Scene, mesh) {
  const fallAnim = new Animation("fall", "position.y", 60, Animation.ANIMATIONTYPE_FLOAT);
  fallAnim.setKeys([
    { frame: 0, value: mesh.position.y },
    { frame: 20, value: mesh.position.y - 3 },
  ]);
  scene.beginDirectAnimation(mesh, [fallAnim], 0, 20, false);
}

export function winSpin(scene: Scene, mesh) {
  const spinAnim = new Animation("spin", "rotation.y", 60, Animation.ANIMATIONTYPE_FLOAT);
  spinAnim.setKeys([
    { frame: 0, value: mesh.rotation.y },
    { frame: 20, value: mesh.rotation.y + Math.PI * 2 },
  ]);

  const colorAnim = new Animation("colorWin", "material.diffuseColor", 60, Animation.ANIMATIONTYPE_COLOR3);
  colorAnim.setKeys([
    { frame: 0, value: new Color3(1, 0.2, 0.2) },
    { frame: 10, value: new Color3(0.2, 1, 0.2) },
    { frame: 20, value: new Color3(0.2, 0.8, 1) },
  ]);

  scene.beginDirectAnimation(mesh, [spinAnim, colorAnim], 0, 20, false);
}

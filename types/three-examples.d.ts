declare module "three/examples/jsm/controls/PointerLockControls" {
  import { Camera, EventDispatcher, Object3D } from "three";

  export class PointerLockControls extends EventDispatcher {
    constructor(camera: Camera, domElement: HTMLElement);
    domElement: HTMLElement;
    object: Object3D;
    connect(): void;
    disconnect(): void;
    dispose(): void;
    lock(): void;
    unlock(): void;
    moveForward(distance: number): void;
    moveRight(distance: number): void;
    addEventListener(type: "lock" | "unlock", listener: () => void): void;
    removeEventListener(type: "lock" | "unlock", listener: () => void): void;
  }
}

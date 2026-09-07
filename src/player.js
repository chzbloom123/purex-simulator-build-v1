// player.js — first-person walker: pointer-lock look, WASD, sprint, ground-following,
// corridor/car collision, optional inspection fly mode (presentation conceit).
import * as THREE from 'three';
import { PRESENT } from './canon.js';

export class Player {
  constructor(camera, dom, world) {
    this.camera = camera;
    this.dom = dom;
    this.world = world;
    this.pos = new THREE.Vector3(0, PRESENT.eyeHeight, -60);
    this.yaw = Math.PI;   // facing +Z (south)
    this.pitch = 0;
    this.keys = new Set();
    this.locked = false;
    this.fly = false;
    this.enabled = false;
    this.onToggleFly = null;
    this.touch = { look: null, move: new THREE.Vector2() };

    dom.addEventListener('click', () => { if (this.enabled && !this.locked && !isTouch()) dom.requestPointerLock(); });
    document.addEventListener('pointerlockchange', () => { this.locked = document.pointerLockElement === dom; });
    document.addEventListener('mousemove', (e) => {
      if (!this.locked) return;
      this.yaw -= e.movementX * 0.0022;
      this.pitch -= e.movementY * 0.0022;
      this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch));
    });
    window.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      this.keys.add(e.code);
      if (e.code === 'KeyF') { this.fly = !this.fly; this.onToggleFly && this.onToggleFly(this.fly); }
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
  }

  setPosition(x, z, yaw = this.yaw) {
    this.pos.set(x, this.world.walk.groundHeight(x, z) + PRESENT.eyeHeight, z);
    this.yaw = yaw; this.pitch = 0;
  }

  update(dt) {
    const k = this.keys;
    const forward = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) + this.touch.move.y;
    const strafe = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0) + this.touch.move.x;
    const sprint = k.has('ShiftLeft') || k.has('ShiftRight');
    const speed = (this.fly ? 6 : sprint ? PRESENT.sprintSpeed : PRESENT.walkSpeed);

    // Camera looks along (-sin yaw, 0, -cos yaw); yaw = π looks +Z (south). Right = look × up.
    const dir = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const move = new THREE.Vector3().addScaledVector(dir, forward).addScaledVector(right, strafe);
    if (move.lengthSq() > 1) move.normalize();
    move.multiplyScalar(speed * dt);

    if (this.fly) {
      this.pos.add(move);
      const up = (k.has('KeyE') || k.has('Space') ? 1 : 0) - (k.has('KeyQ') || k.has('KeyC') ? 1 : 0);
      this.pos.y += up * speed * dt;
    } else {
      const nx = this.pos.x + move.x, nz = this.pos.z + move.z;
      const walk = this.world.walk;
      if (walk.isWalkable(nx, nz)) { this.pos.x = nx; this.pos.z = nz; }
      else if (walk.isWalkable(nx, this.pos.z)) { this.pos.x = nx; }
      else if (walk.isWalkable(this.pos.x, nz)) { this.pos.z = nz; }
      const targetY = walk.groundHeight(this.pos.x, this.pos.z) + PRESENT.eyeHeight;
      this.pos.y += (targetY - this.pos.y) * Math.min(1, dt * 12);
      // head bob: subtle, only when moving
      const moving = move.lengthSq() > 1e-8;
      this.moving = moving; this.sprinting = sprint;
      this.bobT = (this.bobT || 0) + (moving ? dt * (sprint ? 11 : 7) : 0);
      this.bob = moving ? Math.sin(this.bobT) * 0.025 : (this.bob || 0) * 0.9;
    }

    this.camera.position.copy(this.pos);
    this.camera.position.y += this.fly ? 0 : (this.bob || 0);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.set(this.pitch, this.yaw, 0);
  }
}

export function isTouch() {
  return matchMedia('(pointer: coarse)').matches;
}

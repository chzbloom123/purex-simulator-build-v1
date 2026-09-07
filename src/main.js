import * as THREE from 'three';
import { buildWorld } from './world/world.js';
import { Player, isTouch } from './player.js';
import { HUD } from './ui/hud.js';
import { Placards } from './ui/placards.js';
import { Ambience } from './audio.js';
import { L } from './world/layout.js';
import { PRESENT } from './canon.js';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x000000, 0.018);

const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 400);

// Visitor lighting — a presentation conceit (the tunnels were unlit): one headlamp plus a faint fill.
const headlamp = new THREE.SpotLight(0xffe9c8, 85, 140, 0.72, 0.6, 1.6);
headlamp.position.set(0, 0, 0);
camera.add(headlamp);
headlamp.target.position.set(0, -0.08, -1);
camera.add(headlamp.target);
const fill = new THREE.PointLight(0xffe9c8, 0.9, 14, 1.6);
camera.add(fill);
scene.add(camera);
scene.add(new THREE.AmbientLight(0x404050, 0.10));

const world = buildWorld(scene);
const player = new Player(camera, canvas, world);
const hud = new HUD(world);
const ambience = new Ambience();
const placards = new Placards(scene, world);
placards.load().catch((e) => console.error('placards', e));

// ---- Spawn: in the railroad tunnel, north of the turnout, facing south toward the Tunnel 1 door.
player.setPosition(0, L.spur.p0.y - 14, Math.PI);

// ---- Jump menu
const jumps = {
  'approach': () => player.setPosition(0, L.approach.northZ + 3, Math.PI),
  'door-t1': () => player.setPosition(0, world.doors[0].zNorth - 3, Math.PI),
  't1-inside': () => player.setPosition(-1.9, L.t1.start + 1.5, Math.PI),
  't1-south': () => player.setPosition(-2.0, L.t1.bumperZ - 8, Math.PI),
  'door-t2': () => player.setPosition(L.t2.axisX, world.doors[1].zNorth - 3, Math.PI),
  't2-inside': () => player.setPosition(L.t2.axisX, L.t2.start + 2, Math.PI),
  't2-cars': () => player.setPosition(L.t2.axisX - 2.6, world.cars.find((c) => c.tunnel === 2 && c.pos === 28).zStart - 6, Math.PI),
  't2-south': () => player.setPosition(L.t2.axisX - 2.6, L.t2.bumperZ - 10, Math.PI),
};
hud.jump.addEventListener('change', (e) => {
  const v = e.target.value; e.target.value = '';
  if (jumps[v]) jumps[v]();
  else if (v.startsWith('car-')) {
    const [, t, p] = v.split('-');
    const c = world.cars.find((x) => x.tunnel === +t && x.pos === +p);
    if (c) player.setPosition(c.axisX + (t === '1' ? -2.1 : -2.6), c.zStart - 2.5, Math.PI);
  }
  canvas.focus();
});

// ---- Door pass-through (presentation conceit)
function nearDoor() {
  for (const d of world.doors) {
    if (Math.abs(player.pos.x - d.axisX) > 3.5) continue;
    if (Math.abs(player.pos.z - d.zNorth) < 1.6) return { d, side: 'north' };
    if (Math.abs(player.pos.z - d.zSouth) < 1.6) return { d, side: 'south' };
  }
  return null;
}
function stepThrough() {
  const n = nearDoor(); if (!n) return;
  const z = n.side === 'north' ? n.d.zSouth + 1.0 : n.d.zNorth - 1.0;
  player.setPosition(player.pos.x, z, player.yaw);
}
window.addEventListener('keydown', (e) => { if (e.code === 'KeyE' && !player.fly) stepThrough(); });
document.getElementById('btn-through').addEventListener('click', stepThrough);

// ---- Entry framing
const entry = document.getElementById('entry');
document.getElementById('enter').addEventListener('click', () => {
  entry.hidden = true;
  ambience.start();
  document.getElementById('hud').hidden = false;
  player.enabled = true;
  if (!isTouch()) canvas.requestPointerLock();
  if (isTouch()) document.getElementById('touch').hidden = false;
});
player.onToggleFly = (fly) => hud.setMode(fly ? 'INSPECTION VIEW (free camera — a simulation conceit)  ·  F to walk' : 'WALK  ·  F for inspection view');
hud.setMode('WALK  ·  F for inspection view');

// ---- Touch controls (basic): left pad = move, drag right half = look
setupTouch(player);

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// Scripting hook for automated screenshots/tests (no effect on visitors).
window.__sim = { player, jumps, world, placards, camera, renderer, scene, stepThrough, look: (yaw, pitch = 0) => { player.yaw = yaw; player.pitch = pitch; } };

const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(0.05, clock.getDelta());
  player.update(dt);
  const n = nearDoor();
  hud.setPrompt(n && !player.fly ? `${n.d.name} — sealed. Press E (or tap) to step through — a simulation conceit; the real door was never reopened.` : '');
  document.getElementById('btn-through').hidden = !(n && isTouch());
  hud.setLocation(player.pos, world.walk.region(player.pos.x, player.pos.z));
  placards.update(player.pos);
  ambience.update(dt, player.moving && !player.fly, player.sprinting, 'gravel'); // ballast underfoot everywhere
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();

function setupTouch(p) {
  const pad = document.getElementById('pad');
  let padId = null, padOrigin = null;
  const lookIds = new Map();
  canvas.addEventListener('touchstart', (e) => {
    for (const t of e.changedTouches) lookIds.set(t.identifier, { x: t.clientX, y: t.clientY });
  }, { passive: true });
  canvas.addEventListener('touchmove', (e) => {
    for (const t of e.changedTouches) {
      const s = lookIds.get(t.identifier); if (!s) continue;
      p.yaw -= (t.clientX - s.x) * 0.005; p.pitch -= (t.clientY - s.y) * 0.005;
      p.pitch = Math.max(-1.45, Math.min(1.45, p.pitch));
      s.x = t.clientX; s.y = t.clientY;
    }
  }, { passive: true });
  canvas.addEventListener('touchend', (e) => { for (const t of e.changedTouches) lookIds.delete(t.identifier); });
  pad.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0]; padId = t.identifier; padOrigin = { x: t.clientX, y: t.clientY }; e.preventDefault();
  });
  pad.addEventListener('touchmove', (e) => {
    for (const t of e.changedTouches) if (t.identifier === padId) {
      const dx = (t.clientX - padOrigin.x) / 40, dy = (t.clientY - padOrigin.y) / 40;
      p.touch.move.set(Math.max(-1, Math.min(1, dx)), Math.max(-1, Math.min(1, -dy)));
    }
    e.preventDefault();
  });
  const end = (e) => { for (const t of e.changedTouches) if (t.identifier === padId) { padId = null; p.touch.move.set(0, 0); } };
  pad.addEventListener('touchend', end); pad.addEventListener('touchcancel', end);
}

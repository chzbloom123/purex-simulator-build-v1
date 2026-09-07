// placards.js — load /placards.json, place a small white board at each entry, and show the
// nearest placard's text in the side panel when the visitor is close. Boards are a presentation
// device (the tunnels had no signage); their content is the documented record.
import * as THREE from 'three';

const BOARD_W = 0.72, BOARD_H = 0.5, POST_H = 1.15;

function boardTexture(title, register) {
  const c = document.createElement('canvas');
  c.width = 720; c.height = 500;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e9e6dd'; ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = '#8f887a'; ctx.lineWidth = 6; ctx.strokeRect(12, 12, c.width - 24, c.height - 24);
  ctx.fillStyle = '#5d564a'; ctx.font = '600 24px system-ui, Segoe UI, sans-serif';
  ctx.fillText(register.toUpperCase(), 40, 62);
  ctx.fillStyle = '#1d1a15'; ctx.font = '600 38px system-ui, Segoe UI, sans-serif';
  // wrap title
  const words = title.split(' '); const lines = []; let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width > c.width - 80 && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  lines.slice(0, 7).forEach((l, i) => ctx.fillText(l, 40, 120 + i * 48));
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export class Placards {
  constructor(scene, world) {
    this.scene = scene; this.world = world;
    this.items = [];
    this.panel = document.getElementById('placard');
    this.current = null;
    this.group = new THREE.Group();
    scene.add(this.group);
  }

  async load(url = '/placards.json') {
    const res = await fetch(url);
    const data = await res.json();
    const postGeo = new THREE.BoxGeometry(0.05, POST_H, 0.05);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2c, roughness: 0.7, metalness: 0.4 });
    const boardGeo = new THREE.PlaneGeometry(BOARD_W, BOARD_H);
    for (const p of data.placards) {
      const [x, , z] = p.pos;
      const y = this.world.walk.groundHeight(x, z);
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.rotation.y = p.face ?? 0;
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.y = POST_H / 2;
      g.add(post);
      const mat = new THREE.MeshStandardMaterial({ map: boardTexture(p.title, p.register), roughness: 0.85, metalness: 0, emissive: 0xffffff, emissiveMap: null, emissiveIntensity: 0.0 });
      mat.emissive.set(0x151412); mat.emissiveIntensity = 1; // faint self-glow so boards can be found in the dark
      const board = new THREE.Mesh(boardGeo, mat);
      board.position.y = POST_H + BOARD_H / 2 - 0.05;
      board.rotation.x = -0.12; // tilted slightly up toward the reader
      g.add(board);
      const back = new THREE.Mesh(boardGeo, postMat);
      back.position.copy(board.position); back.rotation.copy(board.rotation); back.rotation.y = Math.PI; back.position.z -= 0.01;
      g.add(back);
      this.group.add(g);
      this.items.push({ ...p, x, z, y, node: g });
    }
    return this.items;
  }

  update(playerPos) {
    let best = null, bd = 9;
    for (const it of this.items) {
      const d = Math.hypot(it.x - playerPos.x, it.z - playerPos.z);
      if (d < bd) { bd = d; best = it; }
    }
    if (bd > 3.2) best = null;
    if (best !== this.current) {
      this.current = best;
      if (!best) { this.panel.hidden = true; return; }
      this.panel.hidden = false;
      this.panel.querySelector('.reg').textContent = best.register;
      this.panel.querySelector('h2').textContent = best.title;
      this.panel.querySelector('.body').textContent = best.body;
      this.panel.querySelector('.src').textContent = 'Source: ' + best.source;
    }
  }
}

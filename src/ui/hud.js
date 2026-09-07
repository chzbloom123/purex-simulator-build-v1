// hud.js — location readout, prompts, jump menu. Plain DOM; no framework.
import { L } from '../world/layout.js';

export class HUD {
  constructor(world) {
    this.world = world;
    this.el = document.getElementById('hud');
    this.loc = document.getElementById('hud-loc');
    this.prompt = document.getElementById('hud-prompt');
    this.mode = document.getElementById('hud-mode');
    this.jump = document.getElementById('jump');
    this.buildJumpMenu();
  }

  buildJumpMenu() {
    const opts = [
      ['approach', 'Railroad tunnel — north limit'],
      ['door-t1', 'Tunnel 1 door (approach side)'],
      ['t1-inside', 'Tunnel 1 — inside the door'],
      ['t1-south', 'Tunnel 1 — south bumper (HA column)'],
      ['door-t2', 'Tunnel 2 door (approach side)'],
      ['t2-inside', 'Tunnel 2 — inside the door (empty arch)'],
      ['t2-cars', 'Tunnel 2 — first car (position 28)'],
      ['t2-south', 'Tunnel 2 — south bumper (position 1)'],
    ];
    for (const c of this.world.cars) opts.push([`car-${c.tunnel}-${c.pos}`, `T${c.tunnel} position ${c.pos} — ${c.title}`]);
    this.jump.innerHTML = '<option value="">Jump to…</option>' + opts.map(([v, t]) => `<option value="${v}">${t}</option>`).join('');
  }

  setLocation(pos, region) {
    let text = '';
    if (region === 't1') text = `Tunnel 1 (218-E-14) · ${(pos.z - L.t1.start).toFixed(0)} m south of the door`;
    else if (region === 't2') text = `Tunnel 2 (218-E-15) · ${(pos.z - L.t2.start).toFixed(0)} m south of the door`;
    else text = pos.z < L.spur.p0.y - 2 ? 'PUREX railroad tunnel · below grade' : 'Railroad tunnel · junction of the storage tunnel spurs';
    const near = this.nearestCar(pos);
    if (near) text += `  ·  Position ${near.pos}: ${near.title}`;
    this.loc.textContent = text;
  }

  nearestCar(pos) {
    let best = null, bd = 1e9;
    for (const c of this.world.cars) {
      if (Math.abs(c.axisX - pos.x) > 6) continue;
      if (pos.z < c.zStart - 3 || pos.z > c.zEnd + 3) continue;
      const d = Math.abs(c.zCenter - pos.z);
      if (d < bd) { bd = d; best = c; }
    }
    return best;
  }

  setPrompt(text) { this.prompt.textContent = text || ''; this.prompt.hidden = !text; }
  setMode(text) { this.mode.textContent = text; }
}

// audio.js — the tunnels are silent; this adds only the visitor's own footsteps on ballast and a
// very faint enclosed-space tone, both synthesized (no assets). Presentation conceit, logged.
export class Ambience {
  constructor() { this.ctx = null; this.stepT = 0; this.enabled = false; }

  start() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.9; this.master.connect(this.ctx.destination);
    // room tone: brown-ish noise, heavily low-passed, barely audible
    const len = this.ctx.sampleRate * 4;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0); let last = 0;
    for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    const src = this.ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180;
    const g = this.ctx.createGain(); g.gain.value = 0.05;
    src.connect(lp); lp.connect(g); g.connect(this.master); src.start();
    this.enabled = true;
  }

  // call each frame with whether the visitor is moving, sprinting, and the surface ('gravel' | 'concrete')
  update(dt, moving, sprint, surface) {
    if (!this.enabled || !moving) { this.stepT = 0.15; return; }
    this.stepT -= dt;
    if (this.stepT > 0) return;
    this.stepT = sprint ? 0.32 : 0.55;
    this.footstep(surface);
  }

  footstep(surface) {
    const c = this.ctx, t = c.currentTime;
    const dur = surface === 'gravel' ? 0.16 : 0.08;
    const n = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
    const d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, surface === 'gravel' ? 1.6 : 3);
    const src = c.createBufferSource(); src.buffer = n;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass';
    bp.frequency.value = surface === 'gravel' ? 1800 + Math.random() * 900 : 700 + Math.random() * 200; bp.Q.value = 0.7;
    const g = c.createGain(); g.gain.setValueAtTime(surface === 'gravel' ? 0.22 : 0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(bp); bp.connect(g); g.connect(this.master); src.start(t);
  }
}

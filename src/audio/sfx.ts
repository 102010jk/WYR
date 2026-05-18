/**
 * Web Audio SFX engine. All sounds are synthesised programmatically — zero
 * external audio assets, zero deps. Browser autoplay policy: the AudioContext
 * is lazily initialised on the first `play()` call (which must follow a user
 * gesture) and resumed if suspended.
 */

export type SfxName =
  | 'click'
  | 'hoverBeep'
  | 'glitch'
  | 'lockOn'
  | 'explosion'
  | 'laser'
  | 'launch'
  | 'cashRegister';

class SfxEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private masterVolume = 0.22;
  private muted = false;

  private ensureCtx(): { ctx: AudioContext; master: GainNode } | null {
    if (!this.ctx) {
      const AC = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
        ?? (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : this.masterVolume;
      this.master.connect(this.ctx.destination);
    }
    return this.ctx && this.master ? { ctx: this.ctx, master: this.master } : null;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master && this.ctx) {
      this.master.gain.setValueAtTime(m ? 0 : this.masterVolume, this.ctx.currentTime);
    }
  }

  play(name: SfxName) {
    if (this.muted) return;
    const env = this.ensureCtx();
    if (!env) return;
    const { ctx, master } = env;
    if (ctx.state === 'suspended') ctx.resume();

    switch (name) {
      case 'click':        this.tone(ctx, master, 'square',   880,  0.04, 0.06); break;
      case 'hoverBeep':    this.tone(ctx, master, 'sine',    1400,  0.025, 0.025); break;
      case 'glitch':       this.playGlitch(ctx, master); break;
      case 'lockOn':       this.playLockOn(ctx, master); break;
      case 'explosion':    this.playExplosion(ctx, master); break;
      case 'laser':        this.playLaser(ctx, master); break;
      case 'launch':       this.playLaunch(ctx, master); break;
      case 'cashRegister': this.playCashRegister(ctx, master); break;
    }
  }

  // ── Primitive: single tone with exponential decay ─────────────────────────
  private tone(
    ctx: AudioContext,
    master: GainNode,
    type: OscillatorType,
    freq: number,
    vol: number,
    dur: number,
  ) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain).connect(master);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  }

  // ── Glitch: bandpass-filtered noise sweep ─────────────────────────────────
  private playGlitch(ctx: AudioContext, master: GainNode) {
    const dur = 0.32;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + dur);
    filter.Q.value = 3;

    const gain = ctx.createGain();
    gain.gain.value = 0.18;

    src.connect(filter).connect(gain).connect(master);
    src.start();
    src.stop(ctx.currentTime + dur + 0.02);
  }

  // ── Lock-on: two descending sine pings ────────────────────────────────────
  private playLockOn(ctx: AudioContext, master: GainNode) {
    const t0 = ctx.currentTime;
    const ping = (freq: number, time: number, dur: number) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.16, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + dur);
      o.connect(g).connect(master);
      o.start(time);
      o.stop(time + dur + 0.01);
    };
    ping(1100, t0,        0.07);
    ping(800,  t0 + 0.09, 0.1);
    ping(550,  t0 + 0.22, 0.16);
  }

  // ── Explosion: filtered noise + low-frequency boom ────────────────────────
  private playExplosion(ctx: AudioContext, master: GainNode) {
    const dur = 1.1;
    // Noise body
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      data[i] = (Math.random() * 2 - 1) * (1 - t) ** 1.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.8);

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.35;

    src.connect(filter).connect(noiseGain).connect(master);
    src.start();

    // Sub-boom sine
    const boom = ctx.createOscillator();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(140, ctx.currentTime);
    boom.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.7);
    const boomGain = ctx.createGain();
    boomGain.gain.setValueAtTime(0.4, ctx.currentTime);
    boomGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    boom.connect(boomGain).connect(master);
    boom.start();
    boom.stop(ctx.currentTime + 0.92);
  }

  // ── Laser beam: epic dual-sweep with charge-up + harmonic shimmer ─────────
  private playLaser(ctx: AudioContext, master: GainNode) {
    const t0 = ctx.currentTime;
    // Charge-up: rising sine 200 → 1600 Hz, 0.25 s
    const charge = ctx.createOscillator();
    charge.type = 'sine';
    charge.frequency.setValueAtTime(200, t0);
    charge.frequency.exponentialRampToValueAtTime(1600, t0 + 0.25);
    const chargeGain = ctx.createGain();
    chargeGain.gain.setValueAtTime(0.001, t0);
    chargeGain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.25);
    chargeGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.32);
    charge.connect(chargeGain).connect(master);
    charge.start(t0);
    charge.stop(t0 + 0.34);

    // Main beam: descending sawtooth from 2600 → 360 Hz with lowpass
    const beam = ctx.createOscillator();
    beam.type = 'sawtooth';
    beam.frequency.setValueAtTime(2600, t0 + 0.22);
    beam.frequency.exponentialRampToValueAtTime(360, t0 + 0.95);
    const beamFilter = ctx.createBiquadFilter();
    beamFilter.type = 'lowpass';
    beamFilter.frequency.setValueAtTime(3200, t0 + 0.22);
    beamFilter.frequency.exponentialRampToValueAtTime(800, t0 + 0.95);
    beamFilter.Q.value = 4;
    const beamGain = ctx.createGain();
    beamGain.gain.setValueAtTime(0.001, t0 + 0.22);
    beamGain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.3);
    beamGain.gain.setValueAtTime(0.25, t0 + 0.7);
    beamGain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.05);
    beam.connect(beamFilter).connect(beamGain).connect(master);
    beam.start(t0 + 0.22);
    beam.stop(t0 + 1.06);

    // Shimmer harmonic — adds a metallic edge
    const shimmer = ctx.createOscillator();
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(5200, t0 + 0.28);
    shimmer.frequency.exponentialRampToValueAtTime(2400, t0 + 0.9);
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.setValueAtTime(0.05, t0 + 0.28);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.95);
    shimmer.connect(shimmerGain).connect(master);
    shimmer.start(t0 + 0.28);
    shimmer.stop(t0 + 0.97);
  }

  // ── Missile launch: rumble whoosh ─────────────────────────────────────────
  private playLaunch(ctx: AudioContext, master: GainNode) {
    const dur = 1.4;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      const env = Math.sin(Math.PI * t) ** 1.4;
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + dur * 0.6);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + dur);
    const gain = ctx.createGain();
    gain.gain.value = 0.25;
    src.connect(filter).connect(gain).connect(master);
    src.start();
  }

  private playCashRegister(ctx: AudioContext, master: GainNode) {
    const t0 = ctx.currentTime;
    [880, 1320, 1760].forEach((f, i) => {
      this.tone(ctx, master, 'sine', f, 0.08, 0.08);
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.12, t0 + i * 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.06 + 0.09);
      o.connect(g).connect(master);
      o.start(t0 + i * 0.06);
      o.stop(t0 + i * 0.06 + 0.1);
    });
  }
}

export const sfx = new SfxEngine();

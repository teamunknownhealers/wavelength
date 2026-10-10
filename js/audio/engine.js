// Sound engine: generated demo tones, the audio element and its timers.
"use strict";

let ctx, master, step = 0, timer = null;

function ensure() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = $("#vol").value / 100 * .4;
    master.connect(ctx.destination)
  }
  if (ctx.state === "suspended") ctx.resume()
}

function note(freq, dur, type, gain, at) {
  at = at ?? ctx.currentTime;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(gain, at + .02);
  g.gain.exponentialRampToValueAtTime(.0001, at + dur);
  o.connect(g);
  g.connect(bus || master);
  o.start(at);
  o.stop(at + dur + .05)
}

const hz = m => 440 * Math.pow(2, (m - 69) / 12);
let bus = null, nextAt = 0, synthT0 = 0;

// Demo tones are scheduled ~1.6s ahead on the audio clock, so throttled background timers do not break them
function sched() {
  const tr = TRACKS[queue[qi]];
  if (!tr || !ctx) return;
  const beat = 60 / tr.tempo / 2;
  if (nextAt < ctx.currentTime) nextAt = ctx.currentTime + .05;
  while (nextAt < ctx.currentTime + 1.6) {
    const n = tr.sc[step % tr.sc.length];
    note(hz(tr.root + 12 + n), beat * 1.6, "triangle", .5, nextAt);
    if (step % 4 === 0) note(hz(tr.root + tr.sc[(step / 4 * 2) % tr.sc.length] - 12), beat * 3.5, "sine", .7, nextAt);
    step++;
    nextAt += beat
  }
}

function startTimer() {
  stopTimer();
  const tr = TRACKS[queue[qi]], u = fileUrl(tr.id);
  armRecent(tr.id);
  if (u) {
    if (A.dataset.u !== u) {
      A.dataset.u = u;
      A.src = u;
      try { A.currentTime = pos } catch (e) {}
    } else if (Math.abs(A.currentTime - pos) > 1) A.currentTime = pos;
    A.play().catch(() => {})
  } else {
    bus = ctx.createGain();
    bus.connect(master);
    nextAt = 0;
    synthT0 = performance.now() - pos * 1000;
    timer = setInterval(sched, 200);
    sched()
  }
  window._pt = setInterval(() => {
    if (!playing) return;
    if (u) {
      pos = A.currentTime;
      if (isFinite(A.duration) && A.duration) tr.d = Math.round(A.duration)
    } else {
      pos = (performance.now() - synthT0) / 1000;
      if (pos >= tr.d) {
        onEnd();
        return
      }
    }
    ui()
  }, 250)
}

function stopTimer() {
  clearTimeout(recT);
  clearInterval(timer);
  clearInterval(window._pt);
  A.pause();
  if (bus) {
    const b = bus;
    bus = null;
    try { b.gain.setTargetAtTime(0, ctx.currentTime, .015) } catch (e) {}
    setTimeout(() => b.disconnect(), 150)
  }
}

const A = new Audio();
A.preload = "auto";
A.addEventListener("ended", () => { if (playing && A.dataset.u) onEnd() }); // advance even when the page is in the background

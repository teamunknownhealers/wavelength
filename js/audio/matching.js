// Keyword matching used by the Keep mood play mode.
"use strict";

// Keyword matching: songs that share tags (calm, romantic, night...) are treated as similar
function sim(a, b) {
  const A = TRACKS[a].tags, B = TRACKS[b].tags;
  if (!A.length || !B.length) return 0;
  return A.filter(t => B.includes(t)).length / new Set([...A, ...B]).size
}

function dist(a, b) { return 1 - sim(a, b) }

function moodNext() {
  const cur = queue[qi];
  hist = [cur, ...hist].slice(0, 3);
  const W = [1, .6, .35];
  const all = queue.map((id, i) => ({ i, id, sc: hist.reduce((t, h, k) => t + W[k] * sim(id, h), 0) })).filter(x => x.id !== cur);
  const fresh = all.filter(x => !hist.includes(x.id)), pool = fresh.length ? fresh : all;
  const best = pool.filter(x => x.sc > 0).sort((a, b) => b.sc - a.sc).slice(0, 3), c = best.length ? best : pool;
  return c.length ? c[Math.floor(Math.random() * c.length)].i : qi
}

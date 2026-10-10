// Falling hearts, rain, petals and other theme animations.
"use strict";

const FX = {
  love: { n: 14, c: "heart", i: "fa-solid fa-heart", s: [12, 28], d: [11, 20], w: [-60, 60] },
  breakup: { n: 9, c: "broken", i: "fa-regular fa-heart", s: [14, 26], d: [14, 24], w: [-30, 30] },
  sad: { n: 26, c: "rain", s: [22, 54], d: [.8, 1.6], w: [0, 0] },
  happy: { n: 14, c: "bubble", s: [10, 26], d: [9, 16], w: [-40, 40] },
  chill: { n: 10, c: "bubble2", s: [14, 34], d: [14, 24], w: [-30, 30] },
  party: { n: 18, c: "confetti", s: [0, 0], d: [5, 9], w: [-80, 80] },
  mystery: { n: 18, c: "star", s: [2, 4], d: [2.5, 6], w: [0, 0] },
  nostalgia: { n: 12, c: "dust", s: [2, 5], d: [14, 26], w: [-30, 30] },
  bhakti: { n: 14, c: "petal", s: [10, 20], d: [12, 22], w: [-50, 50] }
};

const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
const lowEnd = (navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.connection && navigator.connection.saveData) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
let fxOn;

try {
  const v = localStorage.getItem("wl_fx");
  fxOn = v ? v === "on" : !lowEnd
} catch (e) { fxOn = !lowEnd }

let fxWatch = 0;

function watchFps() {
  const id = ++fxWatch;
  let last = 0, n = 0, sum = 0;
  setTimeout(() => {
    if (id !== fxWatch) return;
    const loop = t => {
      if (id !== fxWatch || document.hidden) return;
      if (last) {
        sum += t - last;
        n++
      }
      last = t;
      if (n < 90) requestAnimationFrame(loop);
      else if (sum / n > 36) {
        fxOn = false;
        try { localStorage.setItem("wl_fx", "off") } catch (e) {}
        buildFx();
        toast("Effects turned off to keep things smooth")
      }
    };
    requestAnimationFrame(loop)
  }, 1500)
}

function buildFx() {
  const f = $("#fx");
  f.textContent = "";
  f.className = "";
  f.style.display = "none";
  const t = document.documentElement.dataset.theme, d = FX[t];
  if (!d || !fxOn || reduce) return;
  f.style.display = "block";
  f.className = "fx-" + t;
  const r = (a, b) => a + Math.random() * (b - a);
  for (let i = 0; i < d.n; i++) {
    const e = document.createElement("i");
    e.className = d.c + (d.i ? " " + d.i : "");
    e.style.cssText = `--x:${r(0,100).toFixed(1)}%;--y:${r(0,100).toFixed(1)}%;--s:${r(d.s[0],d.s[1]).toFixed(1)}px;--d:${r(d.d[0],d.d[1]).toFixed(1)}s;--dl:-${r(0,d.d[1]).toFixed(1)}s;--w:${r(d.w[0],d.w[1]).toFixed(0)}px;--h:${Math.round(r(0,360))}`;
    f.appendChild(e)
  }
  watchFps()
}

document.addEventListener("visibilitychange", () => {
  $("#fx").classList.toggle("pause", document.hidden);
  if (!document.hidden && ctx && playing && ctx.state !== "running") ctx.resume()
});

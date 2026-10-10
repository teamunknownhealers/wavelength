// Lock screen and notification controls.
"use strict";

let msKey = "", msT = 0;

function msUpdate(tr) {
  if (!("mediaSession" in navigator)) return;
  const ms = navigator.mediaSession, k = tr.key + playing;
  if (msKey !== k) {
    msKey = k;
    try {
      ms.metadata = new MediaMetadata({ title: tr.t, artist: tr.a, album: tr.al, artwork: [{ src: tr.img || "icon-512.png", sizes: "512x512" }] });
      ms.playbackState = playing ? "playing" : "paused"
    } catch (e) {}
  }
  const now = Date.now();
  if (now - msT > 1000 && tr.d) {
    msT = now;
    try {
      ms.setPositionState({ duration: tr.d, position: Math.min(pos, tr.d), playbackRate: 1 })
    } catch (e) {}
  }
}

if ("mediaSession" in navigator) {
  const ms = navigator.mediaSession, set = (a, f) => {
    try { ms.setActionHandler(a, f) } catch (e) {}
  }, jump = t => {
    if (qi < 0) return;
    pos = Math.max(0, Math.min(TRACKS[queue[qi]].d, t));
    if (fileUrl(queue[qi])) A.currentTime = pos;
    else synthT0 = performance.now() - pos * 1000;
    ui()
  };
  set("play", () => { if (!playing) toggle() });
  set("pause", () => { if (playing) toggle() });
  set("stop", () => { if (playing) toggle() });
  set("previoustrack", () => go(-1));
  set("nexttrack", () => go(1));
  set("seekto", d => jump(d.seekTime));
  set("seekbackward", () => jump(pos - 10));
  set("seekforward", () => jump(pos + 10))
}

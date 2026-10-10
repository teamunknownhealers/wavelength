// Seek bar: drag or tap to jump inside a song.
"use strict";

let seeking = false, seekPos = 0;
const seekBlobs = {};

function commitSeek() {
  if (qi < 0) {
    seeking = false;
    return
  }
  seeking = false;
  const tr = TRACKS[queue[qi]];
  pos = seekPos;
  if (fileUrl(tr.id)) {
    const target = pos, u = A.dataset.u;
    try { A.currentTime = pos } catch (e) {}
    setTimeout(() => {
      if (playing && A.dataset.u === u && Math.abs(A.currentTime - target) > 2) blobSeek(tr, target)
    }, 600)
  } else synthT0 = performance.now() - pos * 1000;
  ui()
}

// Some servers cannot jump inside an audio file. Then load the whole song once and jump inside that copy.
async function blobSeek(tr, target) {
  if (!tr.src || seekBlobs[tr.id] || dlMap[tr.id]) return;
  try {
    const r = await fetch(tr.src);
    if (!r.ok) throw 0;
    seekBlobs[tr.id] = URL.createObjectURL(await r.blob());
    if (queue[qi] !== tr.id) return;
    const u = fileUrl(tr.id);
    A.dataset.u = u;
    A.src = u;
    A.currentTime = target;
    if (playing) A.play().catch(() => {})
  } catch (e) { toast("This server does not allow skipping inside this song.") }
}

const sk = $("#seek");
sk.disabled = true;
sk.addEventListener("pointerdown", () => { if (qi >= 0) seeking = true });
addEventListener("pointerup", () => { if (seeking) commitSeek() });
addEventListener("pointercancel", () => { if (seeking) commitSeek() });
sk.addEventListener("change", () => { if (seeking) commitSeek() });

sk.addEventListener("input", () => {
  if (qi < 0) {
    sk.value = 0;
    return
  }
  seekPos = sk.value / 1000 * TRACKS[queue[qi]].d;
  $("#cur").textContent = fmt(seekPos);
  fill(sk);
  if (!seeking) {
    seeking = true;
    commitSeek()
  }
});

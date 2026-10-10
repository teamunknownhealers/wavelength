// Recently played songs (kept on this device only).
"use strict";

let recT = 0, recDone = -1;

const saveRecents = () => {
  try {
    localStorage.setItem("wl_recent", JSON.stringify(recents.map(i => TRACKS[i].key)))
  } catch (e) {}
};

function loadRecents() {
  try {
    recents = JSON.parse(localStorage.getItem("wl_recent") || "[]").map(k => idxByKey[k]).filter(n => n != null)
  } catch (e) { recents = [] }
}

function addRecent(id) {
  recents = [id, ...recents.filter(x => x !== id)].slice(0, 30);
  saveRecents()
}

function armRecent(id) {
  if (recDone === id) return;
  clearTimeout(recT);
  recT = setTimeout(() => {
    if (playing && queue[qi] === id) {
      recDone = id;
      addRecent(id)
    }
  }, 8000)
}

function recentsHome() {
  if (!recents.some(id => inMode(TRACKS[id]))) return "";
  return hrow("Recently played", recents.filter(id => inMode(TRACKS[id])).map(id => {
    const t = TRACKS[id];
    return `<button class="card" data-rid="${id}">${tArt(t)}<b>${t.t}</b><span>${t.a}</span></button>`
  }), "recent")
}

function recentView() {
  const n = recents.length;
  return `<h1>Recents</h1><p style="color:var(--mute);margin-bottom:12px">${n} ${n===1?"song":"songs"} · kept on this device only</p>` + (n ? `<div class="bar2"><button data-playrec>${icon("play")} Play all</button><button data-clearrec>Clear history</button></div>` + rows(recents, recents) : `<p>Nothing here yet. Songs you listen to for a few seconds will show up here.</p>`)
}

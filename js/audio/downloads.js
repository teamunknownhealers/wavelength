// Downloads for offline listening (stored on this device in IndexedDB).
"use strict";

let dlMap = {}, dlBusy = {};
const urlCache = {};

const idb = new Promise((res, rej) => {
  try {
    const r = indexedDB.open("wl_dl", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("songs", { keyPath: "id" });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error)
  } catch (e) { rej(e) }
});

const tx = (mode, fn) => idb.then(db => new Promise((res, rej) => {
  const t = db.transaction("songs", mode), q = fn(t.objectStore("songs"));
  t.oncomplete = () => res(q && q.result);
  t.onerror = () => rej(t.error)
}));

const dbPut = r => tx("readwrite", st => st.put(r)), dbDel = id => tx("readwrite", st => st.delete(id)), dbAll = () => tx("readonly", st => st.getAll());
const dlIds = () => Object.keys(dlMap).map(Number).sort((a, b) => dlMap[a].at - dlMap[b].at);

function fileUrl(id) {
  const r = dlMap[id];
  if (r && r.blob) return urlCache[id] || (urlCache[id] = URL.createObjectURL(r.blob));
  return seekBlobs[id] || TRACKS[id].src || ""
}

async function download(id) {
  const t = TRACKS[id];
  if (dlMap[id] || dlBusy[id]) return;
  dlBusy[id] = 1;
  toast("Downloading “" + t.t + "”…");
  try {
    const rec = { id: t.key, at: Date.now() };
    if (t.src) {
      const r = await fetch(t.src);
      if (!r.ok) throw 0;
      rec.blob = await r.blob()
    } else await new Promise(r => setTimeout(r, 700));
    await dbPut(rec);
    dlMap[id] = rec;
    toast("Downloaded “" + t.t + "”");
    try {
      navigator.storage && navigator.storage.persist && navigator.storage.persist()
    } catch (e) {}
  } catch (e) { toast("Couldn't download. Check your connection and free space.") }
  delete dlBusy[id];
  render();
  ui()
}

async function undl(id) {
  try { await dbDel(TRACKS[id].key) } catch (e) {}
  if (urlCache[id]) {
    URL.revokeObjectURL(urlCache[id]);
    delete urlCache[id]
  }
  delete dlMap[id];
  toast("Removed from Downloads");
  render();
  ui()
}

async function clearDl() {
  const n = dlIds().length;
  for (const id of dlIds()) {
    try { await dbDel(TRACKS[id].key) } catch (e) {}
    delete dlMap[id]
  }
  toast("Removed " + n + (n === 1 ? " download" : " downloads"));
  render()
}

function dlView() {
  const ids = dlIds();
  return `<h1>Downloads</h1><p style="color:var(--mute);margin-bottom:12px">${navigator.onLine?"":"You're offline. Everything here still plays. "}${ids.length} ${ids.length===1?"song":"songs"} saved on this device</p>` + (ids.length ? `<div class="bar2"><button data-playdl>${icon("play")} Play all</button><button data-cleardl>Remove all</button></div>` + rows(ids, ids) : `<p>Nothing downloaded yet. Open the ${icon("ellipsis-vertical")} menu on any song and choose Download for offline.</p>`)
}

addEventListener("offline", () => {
  toast("You're offline. Downloaded songs still play.");
  if (view === "dl") render()
});

addEventListener("online", () => {
  toast("Back online");
  if (view === "dl") render()
});

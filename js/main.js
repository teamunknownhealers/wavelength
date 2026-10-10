// Start-up: load the songs, restore saved data and draw the first page.
"use strict";

const regSW = () => navigator.serviceWorker.register("sw.js").catch(() => {});

async function boot() {
  await loadCatalog();
  loadSaved();
  loadRecents();
  loadLiked();
  dbAll().then(a => {
    a.forEach(r => {
      const n = idxByKey[r.id];
      if (n != null) dlMap[n] = r
    });
    if (a.length) render()
  }).catch(() => {});
  try {
    const t = localStorage.getItem("wl_theme");
    if (t) setTheme(t, false)
  } catch (e) {}
  if (qi < 0) queue = allIds();
  render();
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) document.readyState === "complete" ? regSW() : addEventListener("load", regSW);
}

boot();

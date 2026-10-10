// Saves and restores playlists on this device (localStorage).
"use strict";

const save = () => {
  try {
    const K = a => a.map(i => TRACKS[i].key);
    localStorage.setItem("wl_pls", JSON.stringify({
      v: 3,
      custom: PLS.filter(p => p.custom).map(p => ({ ...p, ids: K(p.ids) })),
      base: Object.fromEntries(PLS.filter(p => !p.custom).map(p => [p.n, K(p.ids)]))
    }))
  } catch (e) { toast("Couldn't save: this device is out of storage") }
};

function loadSaved() {
  try {
    const sv = JSON.parse(localStorage.getItem("wl_pls") || "null");
    if (!sv || sv.v !== 3) return;
    const ok = a => a.map(k => idxByKey[k]).filter(n => n != null);
    PLS.forEach(p => { if (sv.base[p.n]) p.ids = ok(sv.base[p.n]) });
    sv.custom.forEach(p => {
      p.ids = ok(p.ids);
      PLS.push(p)
    })
  } catch (e) {}
}

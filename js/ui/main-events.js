// Clicks and keys inside the main area, the sidebar and the bottom tabs.
"use strict";

$("#main").addEventListener("click", e => {
  if (e.target.closest("#back")) {
    back();
    return
  }
  if (e.target.closest("#homebtn")) {
    view = "home";
    render();
    return
  }
  const tb = e.target.closest("#theme");
  if (tb) {
    openThemeMenu(tb);
    return
  }
  const g = a => e.target.closest("[" + a + "]");
  let x;
  if (x = g("data-scr")) {
    const row = x.closest(".sec").nextElementSibling;
    if (row) row.scrollBy({ left: +x.dataset.scr * Math.max(240, row.clientWidth * .8), behavior: "smooth" });
    return
  }
  if (x = g("data-like")) {
    toggleLike(+x.dataset.like);
    return
  }
  if (x = g("data-gv")) {
    if (x.dataset.gv === "search") q = "";
    view = x.dataset.gv;
    render();
    return
  }
  if (g("data-playliked")) {
    if (liked.length) {
      qpl = -1;
      playTrack(liked[0], liked.slice())
    }
    return
  }
  if (x = g("data-rid")) {
    qpl = -1;
    playTrack(+x.dataset.rid, recents.slice(0, 12));
    return
  }
  if (g("data-gorecent")) {
    view = "recent";
    render();
    return
  }
  if (g("data-playrec")) {
    if (recents.length) {
      qpl = -1;
      playTrack(recents[0], recents.slice())
    }
    return
  }
  if (g("data-clearrec")) {
    recents = [];
    saveRecents();
    toast("History cleared");
    render();
    return
  }
  if (x = g("data-sp")) {
    openSong(+x.dataset.sp);
    return
  }
  if (x = g("data-ap")) {
    openArtist(x.dataset.ap);
    return
  }
  if (x = g("data-tag")) {
    q = x.dataset.tag;
    view = "search";
    render();
    return
  }
  if (x = g("data-playsong")) {
    qpl = -1;
    playTrack(+x.dataset.playsong, allIds());
    return
  }
  if (g("data-playart")) {
    const ids = TRACKS.filter(t => t.a === artName).map(t => t.id);
    if (ids.length) {
      qpl = -1;
      playTrack(ids[0], ids)
    }
    return
  }
  if (x = g("data-album")) {
    const ids = TRACKS.filter(t => t.a === artName && t.al === x.dataset.album).map(t => t.id);
    if (ids.length) {
      qpl = -1;
      playTrack(ids[0], ids)
    }
    return
  }
  if (x = g("data-more")) {
    openMenu(x, +x.dataset.more);
    return
  }
  if (x = g("data-here")) {
    const p = PLS[plIdx];
    p.ids.push(+x.dataset.here);
    save();
    render();
    return
  }
  if (x = g("data-rm")) {
    const p = PLS[plIdx];
    p.ids.splice(+x.dataset.rm, 1);
    afterEdit(p);
    return
  }
  if (g("data-grip")) return;
  if (g("data-shufpl")) {
    const p = PLS[plIdx];
    flip(() => {
      for (let i = p.ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [p.ids[i], p.ids[j]] = [p.ids[j], p.ids[i]]
      }
      afterEdit(p)
    });
    return
  }
  if (g("data-playpl")) {
    const p = PLS[plIdx];
    if (p.ids.length) {
      qpl = plIdx;
      playTrack(p.ids[0], p.ids.slice())
    }
    return
  }
  if (g("data-newpl")) {
    openNew();
    return
  }
  if (g("data-cancel")) {
    cropImg = null;
    view = dr.edit >= 0 ? "pl" : "lib";
    render();
    return
  }
  if (g("data-delpl")) {
    PLS.splice(plIdx, 1);
    save();
    plIdx = 0;
    view = "lib";
    render();
    return
  }
  if (g("data-pick")) {
    $("#npf").click();
    return
  }
  if (g("data-crreset")) {
    syncDr();
    dr.zoom = 1;
    dr.ox = 0;
    dr.oy = 0;
    render();
    return
  }
  if (g("data-noimg")) {
    syncDr();
    dr.img = "";
    cropImg = null;
    render();
    return
  }
  if (x = g("data-gi")) {
    syncDr();
    dr.gi = +x.dataset.gi;
    render();
    return
  }
  if (g("data-editpl")) {
    const p = PLS[plIdx];
    dr = { n: un(p.n), i: un(p.idea || ""), img: p.img || "", gi: p.gi ?? 0, edit: plIdx, zoom: 1, ox: 0, oy: 0 };
    cropImg = null;
    if (dr.img) {
      const im = new Image();
      im.onload = () => {
        cropImg = im;
        if (view === "new") render()
      };
      im.src = dr.img
    }
    view = "new";
    render();
    return
  }
  if (g("data-playdl")) {
    const ids = dlIds();
    if (ids.length) {
      qpl = -1;
      playTrack(ids[0], ids)
    }
    return
  }
  if (g("data-cleardl")) {
    clearDl();
    return
  }
  if (g("data-create")) {
    syncDr();
    const nm = dr.n.trim();
    if (!nm) {
      $("#npn").focus();
      return
    }
    const o = { n: esc(nm), idea: esc(dr.i.trim()), img: cropImg ? exportCrop() : dr.img, gi: dr.gi, g: PAL[dr.gi] };
    if (dr.edit >= 0) {
      Object.assign(PLS[dr.edit], o);
      plIdx = dr.edit
    } else {
      PLS.push({ ...o, ids: dr.add != null ? [dr.add] : [], custom: 1 });
      plIdx = PLS.length - 1
    }
    save();
    cropImg = null;
    view = "pl";
    render();
    return
  }
  const row = e.target.closest("[data-list]");
  if (row) {
    qpl = row.querySelector("[data-grip]") ? plIdx : -1;
    playTrack(+row.dataset.id, row.dataset.list.split(",").map(Number));
    return
  }
  const c = e.target.closest("[data-pl]");
  if (c) {
    plIdx = +c.dataset.pl;
    view = "pl";
    render();
    return
  }
  const t = e.target.closest("[data-id]");
  if (t) playTrack(+t.dataset.id, allIds())
});

$("#main").addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.classList.contains("row")) e.target.click()
});

document.querySelector("nav").onclick = e => {
  const b = e.target.closest("button");
  if (b) {
    view = b.dataset.v;
    render()
  }
};

$("#tabs").onclick = e => {
  const b = e.target.closest("button");
  if (b) {
    view = b.dataset.v;
    render()
  }
};

$("#addpl").onclick = () => openNew();

$("#pls").onclick = e => {
  const b = e.target.closest("[data-i]");
  if (b) {
    plIdx = +b.dataset.i;
    view = "pl";
    render()
  }
};

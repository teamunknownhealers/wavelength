// Draws the pages inside the main area and handles going back.
"use strict";

function back() {
  let t;
  while ((t = stack.pop()) && t.view === "pl" && !PLS[t.plIdx]);
  goingBack = true;
  view = t ? t.view : "home";
  plIdx = t ? t.plIdx : plIdx;
  if (t) {
    sid = t.sid;
    artName = t.art
  }
  render()
}

function render() {
  if (!goingBack && (view !== last.view || (view === "pl" && plIdx !== last.plIdx) || (view === "song" && sid !== last.sid) || (view === "artist" && artName !== last.art))) {
    stack.push(last);
    if (stack.length > 30) stack.shift()
  }
  goingBack = false;
  last = { view, plIdx, sid, art: artName };
  renderPls();
  const m = $("#main");
  document.querySelectorAll("nav button,#tabs button").forEach(b => b.classList.toggle("on", b.dataset.v === (view === "pl" || view === "new" ? "lib" : view)));
  const top = `<div class="top">${view!=="home"?`<button id="back" aria-label="Go back" title="Back">${icon("arrow-left")}</button><button id="homebtn" aria-label="Home" title="Home">${icon("house")}</button>`:""}<input id="q" type="search" placeholder="Search songs, artists, albums or moods" value="${esc(q)}" aria-label="Search"><button id="theme">${icon("palette")} Theme</button></div>`;
  let h = top;
  if (view === "liked") {
    m.style.setProperty("--hue", "#7b2ff7");
    m.innerHTML = h + likedView();
    return
  }
  if (view === "recent") {
    m.style.setProperty("--hue", "#2a3a4a");
    m.innerHTML = h + recentView();
    return
  }
  if (view === "song") {
    const st = TRACKS[sid];
    m.style.setProperty("--hue", st ? st.g[0] : "#2a2a4a");
    m.innerHTML = h + songView();
    return
  }
  if (view === "artist") {
    const sa = TRACKS.find(t => t.a === artName);
    m.style.setProperty("--hue", sa ? sa.g[0] : "#2a2a4a");
    m.innerHTML = h + artistView();
    return
  }
  if (view === "dl") {
    m.style.setProperty("--hue", "#1f3a4a");
    m.innerHTML = h + dlView();
    return
  }
  if (view === "new") {
    m.style.setProperty("--hue", "#2a3a5a");
    m.innerHTML = h + newForm();
    drawCrop();
    $("#npn").focus();
    return
  }
  if (view === "home") {
    m.style.setProperty("--hue", "#1f3a2a");
    h += bannerHtml();
    const hr = new Date().getHours();
    h += `<h1>${bm()?"Namaste":hr<12?"Good morning":hr<18?"Good afternoon":"Good evening"}</h1>` + (document.documentElement.dataset.theme === "bhakti" && !bm() ? `<p class="note">No songs are tagged “bhakti” yet, so every song is showing. Add the tag “bhakti” to devotional songs in songs.json.</p>` : "");
    h += `<div class="quick">` + likedTile() + PLS.map((p, i) => `<button data-pl="${i}">${pArt(p)}${p.n}</button>`).join("") + `</div>`;
    h += recentsHome();
    h += hrow("Made for you", PLS.map((p, i) => `<button class="card" data-pl="${i}">${pArt(p)}<b>${p.n}</b><span>${p.s}</span></button>`), "lib");
    h += hrow(bm() ? "Bhakti songs" : "Discover", allIds().map(id => {
      const t = TRACKS[id];
      return `<button class="card" data-id="${t.id}">${tArt(t)}<b>${t.t}</b><span>${t.a}</span></button>`
    }), "search");
  } else if (view === "search") {
    m.style.setProperty("--hue", "#2a2a4a");
    h += `<h1>${q?"Search":"Browse all"}</h1><div id="res">${resultsHtml()}</div>`;
  } else {
    const p = PLS[plIdx];
    m.style.setProperty("--hue", p.g[0]);
    h += view === "lib" ? `<h1>Your library</h1>` : `<div class="ph">${pArt(p)}<h1 style="margin:0">${p.n}</h1></div>`;
    if (view === "lib") h += `<div class="bar2"><button data-newpl>${icon("plus")} New playlist</button></div><div class="cards">${likedCard()}` + PLS.map((p, i) => `<button class="card" data-pl="${i}">${pArt(p)}<b>${p.n}</b><span>${p.s}</span></button>`).join("") + `</div>`;
    else {
      h += `<p style="color:var(--mute);margin-bottom:12px">${p.idea?p.idea+" · ":""}${p.s}</p><div class="bar2"><button data-playpl>${icon("play")} Play</button><button data-shufpl>${icon("shuffle")} Shuffle order</button>${p.custom?"<button data-editpl>Edit details</button><button data-delpl>Delete playlist</button>":""}</div>` + (p.ids.length ? rows(p.ids, p.ids, { edit: 1, rm: 1 }) : "<p>Nothing here yet. Add songs from the list below.</p>");
      const rest = TRACKS.map(t => t.id).filter(id => !p.ids.includes(id));
      if (rest.length) {
        const sc = id => p.ids.length ? p.ids.reduce((a, x) => a + dist(id, x), 0) / p.ids.length : 0;
        rest.sort((a, b) => sc(a) - sc(b));
        h += `<h2>Add songs</h2>` + (p.ids.length ? `<p style="color:var(--mute);margin-bottom:8px">Best matches for this playlist first</p>` : "") + rows(rest, rest, { here: 1 })
      }
    }
  }
  m.innerHTML = h;
  fitBanner();
  if (view === "search") {
    const i = $("#q");
    i.focus();
    i.setSelectionRange(q.length, q.length)
  }
}

function renderPls() {
  PLS.forEach(p => p.s = "Playlist · " + p.ids.length + (p.ids.length === 1 ? " song" : " songs"));
  $("#pls").innerHTML = PLS.map((p, i) => `<button class="pl" data-i="${i}">${pArt(p)}<span><b>${p.n}</b><small>${p.s}</small></span></button>`).join("")
}

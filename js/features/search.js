// Search: matching, ranking and the results list.
"use strict";

const norm = t => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

function lev(a, b) {
  if (Math.abs(a.length - b.length) > 1) return 2;
  const m = a.length, n = b.length, d = [];
  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n]
}

// every typed word must match the title, artist, album or a tag; best matches first; one-letter typos are forgiven
function searchIds(qs) {
  const toks = norm(qs).split(" ").filter(Boolean);
  if (!toks.length) return[];
  const out = [];
  TRACKS.forEach(t => {
    if (!inMode(t)) return;
    const T = norm(t.t), A = norm(t.a), L = norm(t.al), G = t.tags.join(" "), TW = T.split(" "), AW = A.split(" ");
    let score = 0;
    for (const k of toks) {
      let b = 0;
      if (T === k) b = 100;
      else if (T.startsWith(k)) b = 80;
      else if (TW.some(w => w.startsWith(k))) b = 70;
      else if (T.includes(k)) b = 60;
      else if (AW.some(w => w.startsWith(k))) b = 50;
      else if (A.includes(k)) b = 45;
      else if (L.includes(k)) b = 35;
      else if (G.split(" ").some(w => w.startsWith(k))) b = 30;
      else if (k.length >= 4 && [...TW, ...AW].some(w => lev(w, k) <= 1)) b = 20;
      if (!b) {
        score = 0;
        return
      }
      score += b
    }
    if (T.startsWith(toks.join(" "))) score += 40;
    out.push({ id: t.id, score })
  });
  return out.sort((a, b) => b.score - a.score).map(x => x.id)
}

function searchOrder() {
  const ids = searchIds(q), rec = recents.filter(id => ids.includes(id));
  return[...rec, ...ids.filter(id => !rec.includes(id))]
}

function resultsHtml() {
  const vis = TRACKS.filter(inMode);
  if (!norm(q)) return `<div class="cards">` + vis.map(t => `<button class="card" data-id="${t.id}">${tArt(t)}<b>${t.t}</b><span>${t.a}</span></button>`).join("") + `</div>`;
  const ids = searchIds(q), toks = norm(q).split(" "), arts = [...new Set(vis.map(t => t.a))].filter(n => toks.every(k => norm(n).includes(k)));
  if (!ids.length && !arts.length) {
    const top = [...new Set([...liked, ...recents, ...allIds()])].filter(id => inMode(TRACKS[id])).slice(0, 8);
    return `<p>No songs match “${esc(q)}”.${top.length?" Here are some songs to try instead.":""}</p>` + (top.length ? `<h2>Songs to try</h2>` + rows(top, top) : "")
  }
  const rec = recents.filter(id => ids.includes(id)), rest = ids.filter(id => !rec.includes(id)), all = [...rec, ...rest];
  return (arts.length ? `<h2>Artists</h2><div class="cards">` + arts.map(n => `<button class="card" data-ap="${esc(n)}"><div class="art round" style="background:${grad(...TRACKS.find(t=>t.a===n).g)}"></div><b>${esc(n)}</b><span>Artist</span></button>`).join("") + `</div>` : "") + (rec.length ? `<h2>You listened to these recently</h2>` + rows(rec, all) : "") + (rest.length ? `<h2>${rec.length?"More matches":"Songs"}</h2>` + rows(rest, all) : "")
}

$("#main").addEventListener("input", e => {
  if (e.target.id !== "q") return;
  q = e.target.value;
  if (view !== "search") {
    view = "search";
    render();
    return
  }
  const r = $("#res");
  if (r) {
    r.innerHTML = resultsHtml();
    const h = $("#main h1");
    if (h) h.textContent = q ? "Search" : "Browse all"
  } else render()
});

$("#main").addEventListener("keydown", e => {
  if (e.target.id === "q" && e.key === "Enter") {
    const ids = searchOrder();
    if (ids.length) {
      qpl = -1;
      playTrack(ids[0], ids);
      e.target.blur()
    }
  }
});

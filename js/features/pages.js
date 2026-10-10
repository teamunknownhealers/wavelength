// Song page and artist page.
"use strict";

function openSong(id) {
  closeFull();
  sid = id;
  view = "song";
  render();
  $("#main").scrollTop = 0
}

function openArtist(n) {
  closeFull();
  artName = n;
  view = "artist";
  render();
  $("#main").scrollTop = 0
}

$("#npT").onclick = () => { if (qi >= 0) openSong(queue[qi]) };
$("#npA").onclick = () => { if (qi >= 0) openArtist(TRACKS[queue[qi]].a) };

function songView() {
  const t = TRACKS[sid];
  if (!t) return "<p>This song is no longer available.</p>";
  const more = TRACKS.filter(x => x.a === t.a && x.id !== t.id).map(x => x.id);
  const alike = TRACKS.filter(x => x.id !== t.id).map(x => ({ id: x.id, s: sim(x.id, t.id) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 5).map(x => x.id);
  return `<div class="hero">${tArt(t)}<div><small class="kick">Song</small><h1 style="margin:4px 0 8px">${t.t}</h1><div class="meta"><span class="lk" data-ap="${esc(t.a)}"><b>${t.a}</b></span> · ${t.al} · ${fmt(t.d)}${dlMap[t.id]?" · "+icon("download")+" Downloaded":""}</div></div></div>
<div class="bar2"><button data-playsong="${t.id}">${icon("play")} Play</button><button data-like="${t.id}" aria-pressed="${liked.includes(t.id)}">${liked.includes(t.id)?icon("heart")+" Liked":icon("heart","regular")+" Like"}</button><button data-more="${t.id}" aria-haspopup="menu" aria-expanded="false">${icon("ellipsis-vertical")} More</button></div>` + (t.tags.length ? `<div class="chips">${t.tags.map(k=>`<button class="chip" data-tag="${esc(k)}">#${esc(k)}</button>`).join("")}</div>` : "") + (t.about ? `<h2>About this song</h2><p class="about">${esc(t.about)}</p>` : "") + (more.length ? `<h2>More from ${t.a}</h2>` + rows(more, more) : "") + (alike.length ? `<h2>You might also like</h2>` + rows(alike, alike) : "")
}

function artistView() {
  const name = artName, list = TRACKS.filter(t => t.a === name).map(t => t.id);
  if (!list.length) return `<h1>${esc(name)}</h1><p>No songs found for this artist yet.</p>`;
  const info = ARTISTS[name] || {}, albums = [...new Set(list.map(i => TRACKS[i].al))];
  const pic = info.image ? `<div class="art round" style="background:center/cover url('${info.image}')"></div>` : `<div class="art round" style="background:${grad(...(info.colors||TRACKS[list[0]].g))}"></div>`;
  return `<div class="hero">${pic}<div><small class="kick">Artist</small><h1 style="margin:4px 0 8px">${esc(name)}</h1><div class="meta">${list.length} ${list.length===1?"song":"songs"} · ${albums.length} ${albums.length===1?"album":"albums"}</div></div></div>
<div class="bar2"><button data-playart>${icon("play")} Play all</button></div>` + (info.bio ? `<h2>About</h2><p class="about">${esc(info.bio)}</p>` : "") + `<h2>Songs</h2>` + rows(list, list) + `<h2>Albums</h2><div class="cards">` + albums.map(al => {
    const ids = list.filter(i => TRACKS[i].al === al);
    return `<button class="card" data-album="${esc(al)}">${tArt(TRACKS[ids[0]])}<b>${esc(al)}</b><span>${ids.length} ${ids.length===1?"song":"songs"}</span></button>`
  }).join("") + `</div>`
}

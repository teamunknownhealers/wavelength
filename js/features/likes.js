// Liked songs (kept on this device only).
"use strict";

const saveLiked = () => {
  try {
    localStorage.setItem("wl_liked", JSON.stringify(liked.map(i => TRACKS[i].key)))
  } catch (e) {}
};

function loadLiked() {
  try {
    liked = JSON.parse(localStorage.getItem("wl_liked") || "[]").map(k => idxByKey[k]).filter(n => n != null)
  } catch (e) { liked = [] }
}

function likeUI(id) {
  const on = liked.includes(id);
  ["#like", "#mlike"].forEach(i => {
    const b = $(i);
    b.disabled = false;
    if (b.dataset.on !== String(on)) {
      b.dataset.on = String(on);
      b.innerHTML = icon("heart", on ? "solid" : "regular")
    }
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on);
    b.setAttribute("aria-label", on ? "Unlike" : "Like");
    b.title = on ? "Unlike" : "Like"
  })
}

function toggleLike(id) {
  const on = liked.includes(id);
  liked = on ? liked.filter(x => x !== id) : [id, ...liked];
  saveLiked();
  toast(on ? "Removed from Liked songs" : "Added to Liked songs");
  if (qi >= 0) {
    likeUI(queue[qi]);
    const b = $("#like");
    if (!on && queue[qi] === id) {
      b.classList.remove("pop");
      void b.offsetWidth;
      b.classList.add("pop")
    }
  }
  if (view !== "new") render()
}

$("#like").onclick = $("#mlike").onclick = () => { if (qi >= 0) toggleLike(queue[qi]) };
const LIKEBG = "linear-gradient(135deg,#7b2ff7,#ff5c93)";
const likedTile = () => `<button data-gv="liked"><div class="art" style="background:${LIKEBG};display:grid;place-items:center;color:#fff;font-size:24px">${icon("heart")}</div>Liked songs</button>`;
const likedCard = () => `<button class="card" data-gv="liked"><div class="art" style="background:${LIKEBG};display:grid;place-items:center;color:#fff;font-size:48px">${icon("heart")}</div><b>Liked songs</b><span>Playlist · ${liked.length} ${liked.length===1?"song":"songs"}</span></button>`;

function likedView() {
  const n = liked.length;
  return `<div class="hero"><div class="art" style="background:${LIKEBG};display:grid;place-items:center;color:#fff;font-size:72px">${icon("heart")}</div><div><small class="kick">Playlist</small><h1 style="margin:4px 0 8px">Liked songs</h1><div class="meta">${n} ${n===1?"song":"songs"} · kept on this device only</div></div></div>` + (n ? `<div class="bar2"><button data-playliked>${icon("play")} Play all</button></div>` + rows(liked, liked) : `<p>Nothing liked yet. Tap the ${icon("heart","regular")} on a song to save it here.</p>`)
}

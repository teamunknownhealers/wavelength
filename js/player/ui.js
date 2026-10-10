// Keeps the mini player and the full player in step with what is playing.
"use strict";

let uiKey = -1;

function ui() {
  const tr = qi >= 0 ? TRACKS[queue[qi]] : null;
  const pl = playing ? "Pause" : "Play";
  ["#play", "#mplay"].forEach(i => {
    const b = $(i);
    if (b.dataset.on !== String(playing)) {
      b.dataset.on = String(playing);
      b.innerHTML = icon(playing ? "pause" : "play")
    }
    b.setAttribute("aria-label", pl);
    b.title = pl
  });
  document.body.classList.toggle("playing", playing);
  if (!tr) return;
  sk.disabled = false;
  likeUI(tr.id);
  if (uiKey !== tr.id) {
    uiKey = tr.id;
    const bg = tr.img ? `center/cover url('${tr.img}')` : grad(...tr.g);
    $("#npT").textContent = tr.t;
    $("#npA").textContent = tr.a;
    $("#npArt").style.background = bg;
    $("#mT").textContent = tr.t;
    $("#mA").textContent = tr.a;
    $("#mArt").style.background = bg;
    $("#mini").style.setProperty("--mc", tr.g[0]);
    $("#fbg").style.background = `linear-gradient(180deg,color-mix(in srgb,${tr.g[0]} 75%,#000) 0%,var(--bg) 78%)`;
    $("#fctx").textContent = qpl >= 0 && PLS[qpl] ? un(PLS[qpl].n) : "Wavelength"
  }
  $("#mprog").style.width = Math.min(100, pos / tr.d * 100) + "%";
  dlUI(tr.id);
  $("#tot").textContent = fmt(tr.d);
  if (!seeking) {
    $("#cur").textContent = fmt(pos);
    $("#seek").value = pos / tr.d * 1000;
    fill($("#seek"))
  }
  document.title = (playing ? "▶ " : "") + tr.t + " · Wavelength";
  msUpdate(tr)
}

function dlUI(id) {
  const b = $("#fdl"), d = !!dlMap[id], busy = !!dlBusy[id];
  const state = busy ? "busy" : d ? "done" : "idle";
  if (b.dataset.on !== state) {
    b.dataset.on = state;
    b.innerHTML = busy ? '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>' : icon(d ? "check" : "download")
  }
  b.classList.toggle("on", d);
  const l = d ? "Remove download" : "Download for offline";
  b.setAttribute("aria-label", l);
  b.title = l
}

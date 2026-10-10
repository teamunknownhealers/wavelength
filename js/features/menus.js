// Pop-up menus: the three dots menu and its keyboard handling.
"use strict";

let menuBtn = null;

function closeMenu() {
  const m = $("#menu");
  if (!m) return;
  m.removeAttribute("id");
  m.classList.remove("in");
  setTimeout(() => m.remove(), 170);
  if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  menuBtn = null
}

function mainItems(id) {
  const d = dlMap[id];
  return `<b class="mh">${esc(TRACKS[id].t)}</b><button role="menuitem" data-act="like" data-song="${id}">${liked.includes(id)?icon("heart")+" Remove from Liked songs":icon("heart","regular")+" Add to Liked songs"}</button>` + (d ? `<button role="menuitem" data-act="undl" data-song="${id}">${icon("check")} Downloaded · Remove</button>` : dlBusy[id] ? `<button role="menuitem" disabled>Downloading…</button>` : `<button role="menuitem" data-act="dl" data-song="${id}">${icon("download")} Download for offline</button>`) + `<button role="menuitem" data-act="addpl" data-song="${id}">${icon("plus")} Add to playlist ${icon("chevron-right")}</button><button role="menuitem" data-act="song" data-song="${id}">${icon("music")} Song page</button><button role="menuitem" data-act="artist" data-song="${id}">${icon("user")} Artist page</button>`
}

function plItems(id) {
  return `<button role="menuitem" data-act="back" data-song="${id}">${icon("chevron-left")} Back</button>` + PLS.map((p, i) => `<button role="menuitem" data-to="${i}" data-song="${id}">${p.ids.includes(id)?icon("check")+" ":""}${p.n}</button>`).join("") + `<button role="menuitem" data-to="new" data-song="${id}">${icon("plus")} New playlist</button>`
}

function placeMenu(d, btn) {
  const r = btn.getBoundingClientRect(), h = d.offsetHeight, w = d.offsetWidth, up = r.bottom + h + 12 > innerHeight && r.top > h + 12;
  d.style.top = Math.max(8, up ? r.top - h - 6 : Math.min(r.bottom + 6, innerHeight - h - 8)) + "px";
  d.style.left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8)) + "px";
  d.style.transformOrigin = (up ? "bottom" : "top") + " right"
}

function focusFirst(d) {
  const f = d.querySelector("button:not([disabled])");
  if (f) f.focus({ preventScroll: true })
}

function openMenu(btn, id) {
  if (menuBtn === btn) {
    closeMenu();
    return
  }
  const old = $("#menu");
  if (old) old.remove();
  menuBtn = btn;
  btn.setAttribute("aria-expanded", "true");
  const d = document.createElement("div");
  d.className = "menu";
  d.id = "menu";
  d.setAttribute("role", "menu");
  d.innerHTML = mainItems(id);
  document.body.appendChild(d);
  placeMenu(d, btn);
  requestAnimationFrame(() => d.classList.add("in"));
  focusFirst(d)
}

document.addEventListener("click", e => {
  if (e.target.closest("[data-fx-toggle]")) {
    fxOn = !fxOn;
    try { localStorage.setItem("wl_fx", fxOn ? "on" : "off") } catch (er) {}
    buildFx();
    closeMenu();
    toast("Effects " + (fxOn ? "on" : "off"));
    return
  }
  const th = e.target.closest("[data-set-theme]");
  if (th) {
    setTheme(th.dataset.setTheme);
    closeMenu();
    return
  }
  const a = e.target.closest("[data-act]");
  if (a) {
    const id = +a.dataset.song, d = $("#menu");
    if (!d) return;
    if (a.dataset.act === "addpl" || a.dataset.act === "back") {
      d.innerHTML = a.dataset.act === "addpl" ? plItems(id) : mainItems(id);
      placeMenu(d, menuBtn);
      focusFirst(d);
      return
    }
    if (a.dataset.act === "like") toggleLike(id);
    else if (a.dataset.act === "dl") download(id);
    else if (a.dataset.act === "undl") undl(id);
    else if (a.dataset.act === "song") openSong(id);
    else if (a.dataset.act === "artist") openArtist(TRACKS[id].a);
    closeMenu();
    return
  }
  const b = e.target.closest("[data-to]");
  if (b) {
    const id = +b.dataset.song;
    if (b.dataset.to === "new") {
      closeMenu();
      openNew(id);
      return
    }
    const p = PLS[+b.dataset.to];
    if (p.ids.includes(id)) toast("Already in " + un(p.n));
    else {
      p.ids.push(id);
      save();
      b.innerHTML = icon("check") + " " + p.n;
      renderPls();
      toast("Added to " + un(p.n))
    }
    setTimeout(closeMenu, 180);
    return
  }
  if (!e.target.closest(".menu") && !e.target.closest("[data-more]") && !e.target.closest("#theme")) closeMenu()
});

document.addEventListener("keydown", e => {
  const m = $("#menu");
  if (!m) return;
  if (e.key === "Escape") {
    const bt = menuBtn;
    closeMenu();
    if (bt) bt.focus();
    return
  }
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    const it = [...m.querySelectorAll("button:not([disabled])")], i = it.indexOf(document.activeElement);
    it[(i + (e.key === "ArrowDown" ? 1 : -1) + it.length) % it.length].focus()
  }
});

addEventListener("resize", closeMenu);
$("#main").addEventListener("scroll", closeMenu, { passive: true });

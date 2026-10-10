// Theme list and theme menu.
"use strict";

const THEMES = [
  ["dark", "Dark", "#1ed760", "#121212"],
  ["light", "Light", "#0b8a3e", "#ffffff"],
  ["love", "Love", "#ff5c93", "#3a1229"],
  ["mystery", "Mystery", "#9d7bff", "#1a1240"],
  ["breakup", "Break up", "#7fb2d3", "#171c22"],
  ["sad", "Sad", "#6c9bff", "#0f2147"],
  ["happy", "Happy", "#f59e0b", "#fff3c4"],
  ["chill", "Chill", "#2dd4bf", "#0a3533"],
  ["party", "Party", "#ff3bd8", "#2a0750"],
  ["focus", "Focus", "#d4a373", "#1c1814"],
  ["nostalgia", "Nostalgia", "#a4442b", "#f1e4cc"],
  //["bhakti", "Bhakti mode", "#ffb21e", "#3b1a0a"]
];

function setTheme(t, store = true) {
  if (!THEMES.some(x => x[0] === t)) return;
  const prev = document.documentElement.dataset.theme;
  document.documentElement.dataset.theme = t;
  const mt = document.querySelector('meta[name="theme-color"]');
  if (mt) mt.content = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#121212";
  if (store) {
    try { localStorage.setItem("wl_theme", t) } catch (e) {}
  }
  buildFx();
  if (store) {
    if (t === "bhakti") toast(bm() ? "Bhakti mode on: devotional songs only" : "Bhakti mode on. Add the tag “bhakti” to songs to fill it.");
    else if (prev === "bhakti") toast("Bhakti mode off");
    if (qi < 0) queue = allIds();
    if (view !== "new") render()
  }
}

function openThemeMenu(btn) {
  if (menuBtn === btn) {
    closeMenu();
    return
  }
  const old = $("#menu");
  if (old) old.remove();
  menuBtn = btn;
  btn.setAttribute("aria-expanded", "true");
  const cur = document.documentElement.dataset.theme || "", d = document.createElement("div");
  d.className = "menu tall";
  d.id = "menu";
  d.setAttribute("role", "menu");
  d.innerHTML = `<b class="mh">Theme</b>` + THEMES.map((t, i) => (i === 2 ? `<b class="mh">Moods</b>` : "") + `<button role="menuitem" data-set-theme="${t[0]}"><i class="tdot" style="background:linear-gradient(135deg,${t[2]} 50%,${t[3]} 50%)"></i>${t[1]}${cur===t[0]?" "+icon("check"):""}</button>`).join("") + `<b class="mh">Effects</b><button role="menuitem" data-fx-toggle ${reduce?"disabled":""}>${reduce?"Off (reduced motion is on)":fxOn?icon("check")+" Animated effects":"Animated effects"}</button>`;
  document.body.appendChild(d);
  placeMenu(d, btn);
  requestAnimationFrame(() => d.classList.add("in"));
  focusFirst(d)
}

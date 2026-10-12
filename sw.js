// Wavelength offline helper. Bump VERSION whenever you change the SHELL list below.
const VERSION="wavelength-v4";
// Font Awesome is loaded from a CDN; these copies let the icons work offline too.
const FA = "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/";
const FA_FILES = [FA + "css/all.min.css", FA + "webfonts/fa-solid-900.woff2", FA + "webfonts/fa-regular-400.woff2"];
const SHELL = [
  "./",
  "index.html",
  "songs.json",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "css/variables.css",
  "css/themes.css",
  "css/base.css",
  "css/layout.css",
  "css/navigation.css",
  "css/lists.css",
  "css/cards.css",
  "css/buttons.css",
  "css/sliders.css",
  "css/menus.css",
  "css/forms.css",
  "css/pages.css",
  "css/banner.css",
  "css/mini-player.css",
  "css/full-player.css",
  "css/effects.css",
  "css/icons.css",
  "css/icon-fallback.css",
  "css/responsive.css",
  "css/accessibility.css",
  "js/content/quotes.js",
  "js/core/helpers.js",
  "js/core/icons.js",
  "js/data/catalog.js",
  "js/core/state.js",
  "js/data/playlist-storage.js",
  "js/audio/engine.js",
  "js/audio/matching.js",
  "js/audio/playback.js",
  "js/audio/volume.js",
  "js/audio/seek.js",
  "js/audio/downloads.js",
  "js/audio/media-session.js",
  "js/ui/components.js",
  "js/ui/toast.js",
  "js/features/likes.js",
  "js/features/recents.js",
  "js/features/bhakti.js",
  "js/features/search.js",
  "js/features/pages.js",
  "js/features/banner.js",
  "js/features/playlist-editor.js",
  "js/features/playlist-reorder.js",
  "js/features/effects.js",
  "js/features/themes.js",
  "js/features/menus.js",
  "js/player/ui.js",
  "js/player/full-player.js",
  "js/ui/render.js",
  "js/ui/main-events.js",
  "js/main.js"
];

self.addEventListener("install",e=>{
  e.waitUntil(caches.open(VERSION).then(c=>Promise.all([c.addAll(SHELL),...FA_FILES.map(f=>c.add(f).catch(()=>{}))])).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=="GET"||(u.origin!==location.origin&&!u.href.startsWith(FA)))return;
  // Songs are NOT cached here. They are saved only when a listener presses Download.
  if(r.headers.has("range")||/\.(mp3|m4a|ogg|wav|flac|aac)$/i.test(u.pathname))return;
  const net=()=>fetch(r).then(res=>{if(res.ok){const copy=res.clone();caches.open(VERSION).then(c=>c.put(r,copy))}return res});
  // Pages and the song list: newest version when online, saved version when offline or when the network is too slow (3 seconds).
  const fresh=ms=>Promise.race([net(),new Promise((_,no)=>setTimeout(()=>no(new Error("slow")),ms))]);
  const saved=key=>caches.match(key).then(hit=>hit||net());
  if(r.mode==="navigate"){e.respondWith(fresh(3000).catch(()=>saved("index.html")));return}
  if(u.pathname.endsWith("songs.json")){e.respondWith(fresh(3000).catch(()=>saved(r)));return}
  // Everything else (icons, cover pictures): saved copy first, refreshed in the background.
  e.respondWith(caches.match(r).then(hit=>hit||net()));
});

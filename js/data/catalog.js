// The song catalogue: demo songs, default playlists and the songs.json loader.
"use strict";

// Catalog: demo tracks are short generated melodies (no external audio needed)
const TRACKS = [
  {
    id: 0,
    t: "Night Drive",
    a: "Kaya Moon",
    al: "Neon Hours",
    d: 96,
    g: ["#7b2ff7", "#f107a3"],
    tempo: 112,
    sc: [0, 3, 7, 10, 12, 10, 7, 3],
    root: 45
  },
  {
    id: 1,
    t: "Golden Hour",
    a: "Sol & Sage",
    al: "Late Light",
    d: 84,
    g: ["#f7971e", "#ffd200"],
    tempo: 100,
    sc: [0, 4, 7, 12, 7, 4, 9, 5],
    root: 48
  },
  {
    id: 2,
    t: "Tidal",
    a: "Marin Bay",
    al: "Low Water",
    d: 108,
    g: ["#00c6ff", "#0072ff"],
    tempo: 84,
    sc: [0, 2, 7, 9, 12, 9, 7, 2],
    root: 43
  },
  {
    id: 3,
    t: "Paper Lanterns",
    a: "Hoshi",
    al: "Quiet Rooms",
    d: 90,
    g: ["#ff5e62", "#ff9966"],
    tempo: 92,
    sc: [0, 5, 7, 12, 10, 7, 5, 0],
    root: 46
  },
  {
    id: 4,
    t: "Concrete Garden",
    a: "The Understory",
    al: "Overgrown",
    d: 120,
    g: ["#11998e", "#38ef7d"],
    tempo: 128,
    sc: [0, 3, 5, 7, 10, 7, 5, 3],
    root: 41
  },
  {
    id: 5,
    t: "Static Bloom",
    a: "Kaya Moon",
    al: "Neon Hours",
    d: 102,
    g: ["#8e2de2", "#4a00e0"],
    tempo: 120,
    sc: [0, 7, 3, 10, 5, 12, 7, 3],
    root: 44
  },
  {
    id: 6,
    t: "Slow Orbit",
    a: "Marin Bay",
    al: "Low Water",
    d: 132,
    g: ["#232526", "#4b6cb7"],
    tempo: 76,
    sc: [0, 7, 12, 7, 5, 10, 7, 0],
    root: 40
  },
  {
    id: 7,
    t: "Sunday Tape",
    a: "Sol & Sage",
    al: "Late Light",
    d: 78,
    g: ["#d38312", "#a83279"],
    tempo: 96,
    sc: [0, 4, 9, 7, 4, 7, 12, 9],
    root: 47
  },
  {
    id: 8,
    t: "Morning Aarti",
    a: "Sample Devotional Group",
    al: "Devotional Demo",
    d: 110,
    g: ["#ff9933", "#b34700"],
    tempo: 72,
    sc: [0, 4, 7, 12, 7, 4, 2, 0],
    root: 43
  },
  {
    id: 9,
    t: "Evening Bhajan",
    a: "Sample Devotional Group",
    al: "Devotional Demo",
    d: 124,
    g: ["#ffb21e", "#7a1f00"],
    tempo: 80,
    sc: [0, 2, 4, 7, 9, 7, 4, 2],
    root: 50
  },
  {
    id: 10,
    t: "Temple Bells",
    a: "Sample Devotional Group",
    al: "Devotional Demo",
    d: 96,
    g: ["#ffcc66", "#a8480f"],
    tempo: 60,
    sc: [0, 7, 12, 7, 0, 5, 7, 5],
    root: 45
  }
];

const PLS = [
  { n: "Evening Wind-down", s: "Playlist · 5 songs", g: ["#4b6cb7", "#182848"], ids: [2, 6, 3, 1, 7] },
  { n: "Focus Flow", s: "Playlist · 4 songs", g: ["#11998e", "#0b3d2e"], ids: [4, 0, 5, 2] },
  { n: "Warm Sessions", s: "Playlist · 4 songs", g: ["#f7971e", "#8e2d1a"], ids: [1, 7, 3, 0] },
  { n: "Devotional", s: "", g: ["#ff9933", "#7a1f00"], ids: [8, 9, 10] },
  { n: "All songs", s: "", g: ["#7b2ff7", "#1b1b3a"], ids: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
];

const PC = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };

const DEFG = [
  ["#7b2ff7", "#f107a3"],
  ["#f7971e", "#ffd200"],
  ["#00c6ff", "#0072ff"],
  ["#ff5e62", "#ff9966"],
  ["#11998e", "#38ef7d"],
  ["#8e2de2", "#4a00e0"]
];

const DEMO_TAGS = [
  ["night", "synth", "driving", "moody"],
  ["sunny", "warm", "happy", "easy"],
  ["calm", "ocean", "chill", "dreamy"],
  ["warm", "gentle", "dreamy", "romantic"],
  ["energetic", "upbeat", "driving", "happy"],
  ["night", "synth", "moody", "energetic"],
  ["calm", "dreamy", "sad", "night"],
  ["warm", "happy", "easy", "sunny"],
  ["bhakti", "devotional", "calm", "morning"],
  ["bhakti", "bhajan", "devotional", "calm", "evening"],
  ["bhakti", "devotional", "peaceful", "bells"]
];

const idxByKey = {}, ARTISTS = {};

// Reads songs.json (falls back to the built-in demo songs when the file is missing).
async function loadCatalog() {
  try {
    const r = await fetch("songs.json", { cache: "no-cache" });
    if (r.ok) {
      const j = await r.json(), seen = new Set(), list = [];
      (j.songs || []).forEach((x, n) => {
        if (!x || !x.title) {
          console.warn("songs.json: song #" + (n + 1) + " has no title, skipped");
          return
        }
        const key = slug(x.id || x.title);
        if (seen.has(key)) {
          console.warn("songs.json: duplicate id '" + key + "', skipped");
          return
        }
        seen.add(key);
        const pc = PC[x.key] ?? 0;
        list.push({
          id: list.length,
          key,
          t: x.title,
          a: x.artist || "Unknown artist",
          al: x.album || "Single",
          d: Math.round(x.duration) || 180,
          g: Array.isArray(x.colors) && x.colors.length > 1 ? x.colors : DEFG[list.length % DEFG.length],
          src: x.src || "",
          img: x.cover || "",
          about: x.about || "",
          tempo: x.tempo || 100,
          root: 36 + pc + (pc < 4 ? 12 : 0),
          sc: x.melody || [0, 3, 7, 10, 12, 10, 7, 3],
          tags: (Array.isArray(x.tags) ? x.tags : []).map(t => String(t).toLowerCase().trim()).filter(Boolean)
        })
      });
      if (list.length) {
        TRACKS.splice(0, TRACKS.length, ...list);
        queue.splice(0, queue.length, ...list.map(t => t.id));
        const pls = (j.playlists || []).map((p, n) => ({
          n: esc(p.name || "Playlist"),
          idea: esc(p.description || ""),
          g: p.colors || DEFG[(n + 2) % DEFG.length],
          img: p.cover || "",
          ids: (p.songs || []).map(k => list.findIndex(t => t.key === slug(k))).filter(n => n >= 0)
        }));
        if (!pls.length) pls.push({ n: "All songs", g: DEFG[0], ids: list.map(t => t.id) });
        PLS.splice(0, PLS.length, ...pls);
        plIdx = 0
      }
      (j.artists || []).forEach(a => { if (a && a.name) ARTISTS[a.name] = a })
    }
  } catch (e) { console.warn("songs.json not loaded, using the built-in demo songs", e) }
  TRACKS.forEach((t, n) => {
    t.id = n;
    if (!t.key) t.key = slug(t.t);
    if (!t.tags) t.tags = DEMO_TAGS[n] || [];
    idxByKey[t.key] = n
  });
}

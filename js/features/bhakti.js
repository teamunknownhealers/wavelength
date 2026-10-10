// Bhakti mode: only devotional songs are shown.
"use strict";

const BHAKTI_TAGS = ["bhakti", "devotional", "bhajan", "aarti", "kirtan"];
const isBhakti = t => t.tags.some(k => BHAKTI_TAGS.includes(k));
const bm = () => document.documentElement.dataset.theme === "bhakti" && TRACKS.some(isBhakti);
const inMode = t => !bm() || isBhakti(t);

function allIds() {
  return TRACKS.filter(inMode).map(t => t.id)
}

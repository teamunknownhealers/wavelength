// Reusable pieces of page markup: cover art, song rows, side-scrolling rows.
"use strict";

const art = (g, c = "") => `<div class="art ${c}" style="background:${grad(...g)}"></div>`;

function tArt(t) {
  return t.img ? `<div class="art" style="background:center/cover url('${t.img}'),${grad(...t.g)}"></div>` : art(t.g)
}

function pArt(p) {
  return p.img ? `<div class="art" style="background:center/cover url('${p.img}'),${grad(...p.g)}"></div>` : art(p.g)
}

function rows(ids, list, opt = {}) {
  const cur = qi >= 0 ? queue[qi] : -1;
  return `<div role="list">` + ids.map((id, i) => {
    const t = TRACKS[id];
    return `<div class="row ${cur===id?"now":""}" role="listitem" tabindex="0" ${opt.edit?"data-edit":""} data-i="${i}" data-id="${id}" data-list="${list.join(",")}"><span class="n">${cur===id&&playing?icon("music"):i+1}</span><span class="t">${tArt(t)}<span><b class="lk" data-sp="${id}">${t.t}</b><small>${liked.includes(id)?`<span class="lh">${icon("heart")}</span> `:""}<span class="lk" data-ap="${esc(t.a)}">${t.a}</span>${dlMap[id]?" · "+icon("download")+" Downloaded":""}</small></span></span><span class="al d">${t.al}</span><span class="d">${fmt(t.d)}</span><span class="act">${actBtns(id,i,opt)}</span></div>`
  }).join("") + `</div>`
}

function actBtns(id, i, o) {
  let h = "";
  if (o.edit) h += `<span class="grip" data-grip="${i}" role="button" tabindex="0" aria-label="Drag to reorder. Arrow keys also move this song." title="Drag to reorder">${icon("grip-vertical")}</span>`;
  if (o.here) h += `<button data-here="${id}" aria-label="Add to this playlist">${icon("plus")}</button>`;
  h += `<button data-more="${id}" aria-haspopup="menu" aria-expanded="false" aria-label="More options" title="More options">${icon("ellipsis-vertical")}</button>`;
  if (o.rm) h += `<button data-rm="${i}" aria-label="Remove from playlist">${icon("xmark")}</button>`;
  return h
}

// Side-scrolling row: at most 8 tiles, then a "See all" tile (9 in total)
function hrow(title, tiles, goView) {
  const more = tiles.length > 9;
  return `<div class="sec"><h2>${title}</h2><span class="arrs"><button class="arr" data-scr="-1" aria-label="Scroll left">${icon("chevron-left")}</button><button class="arr" data-scr="1" aria-label="Scroll right">${icon("chevron-right")}</button></span></div><div class="hrow">${tiles.slice(0,9).join("")}${more?`<button class="seeall-round" data-gv="${goView}" aria-label="See all ${esc(title)}"><span>${icon("arrow-right")}</span><small>See all</small></button>`:""}</div>`
}

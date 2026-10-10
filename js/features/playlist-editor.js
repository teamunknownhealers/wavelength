// New playlist and edit playlist form, including the cover picture editor.
"use strict";

const PAL = [
  ["#ff5e62", "#7b2ff7"],
  ["#00c6ff", "#11998e"],
  ["#f7971e", "#a83279"],
  ["#38ef7d", "#4a00e0"],
  ["#f953c6", "#b91d73"],
  ["#232526", "#4b6cb7"]
];

let dr = { n: "", i: "", img: "", gi: 0, edit: -1 }, cropImg = null, pan = null;

function openNew(id) {
  cropImg = null;
  dr = { n: "", i: "", img: "", gi: PLS.length % PAL.length, edit: -1, add: id, zoom: 1, ox: 0, oy: 0 };
  view = "new";
  render()
}

function syncDr() {
  const n = $("#npn"), i = $("#npi");
  if (n) dr.n = n.value;
  if (i) dr.i = i.value
}

function cropDraw(cv, size) {
  const x = cv.getContext("2d");
  cv.width = cv.height = size;
  const g = x.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, PAL[dr.gi][0]);
  g.addColorStop(1, PAL[dr.gi][1]);
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  if (!cropImg) return;
  const iw = cropImg.width, ih = cropImg.height, bs = Math.max(size / iw, size / ih) * (dr.zoom ?? 1), w = iw * bs, h = ih * bs, mx = Math.max(0, (w - size) / 2), my = Math.max(0, (h - size) / 2);
  x.drawImage(cropImg, (size - w) / 2 + (dr.ox || 0) * mx, (size - h) / 2 + (dr.oy || 0) * my, w, h)
}

function drawCrop() {
  const cv = $("#crop");
  if (cv) cropDraw(cv, 240)
}

function exportCrop() {
  const c = document.createElement("canvas");
  cropDraw(c, 320);
  return c.toDataURL("image/jpeg", .85)
}

function newForm() {
  const z = dr.zoom ?? 1, bg = dr.img ? `center/cover url('${dr.img}')` : grad(...PAL[dr.gi]);
  const pic = cropImg ? `<canvas id="crop" class="crop" width="240" height="240" aria-label="Cover preview. Drag to move the picture."></canvas><div style="display:grid;gap:8px;min-width:200px;flex:1"><label>Zoom<input type="range" id="crz" min="60" max="300" value="${Math.round(z*100)}" style="--p:${(z*100-60)/240*100}%"></label><small style="color:var(--mute)">Drag the picture to move it. Zoom below 100% shows the whole picture with colour around it.</small><div class="bar2" style="margin:0"><button data-crreset>Reset</button><button data-pick>Change image</button><button data-noimg>Remove image</button></div></div>` : `<div class="art cover" style="background:${bg}"></div><div><div class="bar2" style="margin:0 0 6px"><button data-pick>Choose image</button></div><small style="color:var(--mute)">Pick a picture, then move and zoom it to fit the square cover. It stays on this device.</small></div>`;
  return `<h1>${dr.edit>=0?"Edit playlist":"New playlist"}</h1><div style="display:grid;gap:16px;max-width:520px">
<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">${pic}<input type="file" id="npf" accept="image/*" hidden></div>
<div><div style="margin-bottom:6px">Colour (shown when there is no image)</div><div class="sw" role="radiogroup" aria-label="Colour">${PAL.map((g,i)=>`<button data-gi="${i}" role="radio" aria-checked="${i===dr.gi}" class="${i===dr.gi?"on":""}" aria-label="Colour ${i+1}" style="background:${grad(...g)}"></button>`).join("")}</div></div>
<label>Name<input id="npn" class="fld" maxlength="40" value="${esc(dr.n)}" placeholder="Rainy day coding"></label>
<label>Your idea (optional)<textarea id="npi" class="fld" rows="3" maxlength="140" placeholder="Calm, steady beats for long focus sessions">${esc(dr.i)}</textarea></label>
<div class="bar2"><button data-create>${dr.edit>=0?"Save changes":"Create playlist"}</button><button data-cancel>Cancel</button></div></div>`
}

M.addEventListener("change", e => {
  if (e.target.id !== "npf" || !e.target.files[0]) return;
  syncDr();
  const rd = new FileReader();
  rd.onload = () => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 1200 / Math.max(im.width, im.height));
      let src = im;
      if (k < 1) {
        const c = document.createElement("canvas");
        c.width = Math.round(im.width * k);
        c.height = Math.round(im.height * k);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        src = c
      }
      cropImg = src;
      dr.zoom = 1;
      dr.ox = 0;
      dr.oy = 0;
      dr.img = "";
      render()
    };
    im.onerror = () => toast("That file isn't a usable image");
    im.src = rd.result
  };
  rd.readAsDataURL(e.target.files[0])
});

M.addEventListener("input", e => {
  if (e.target.id === "crz") {
    dr.zoom = e.target.value / 100;
    fill(e.target);
    drawCrop()
  }
});

M.addEventListener("wheel", e => {
  if (e.target.id === "crop" && cropImg) {
    e.preventDefault();
    dr.zoom = Math.max(.6, Math.min(3, (dr.zoom ?? 1) - e.deltaY / 600));
    const z = $("#crz");
    z.value = Math.round(dr.zoom * 100);
    fill(z);
    drawCrop()
  }
}, { passive: false });

M.addEventListener("pointerdown", e => {
  if (e.target.id !== "crop" || !cropImg) return;
  pan = { x: e.clientX, y: e.clientY, ox: dr.ox || 0, oy: dr.oy || 0 };
  e.target.setPointerCapture(e.pointerId);
  e.preventDefault()
});

M.addEventListener("pointermove", e => {
  if (!pan) return;
  const sz = 240, iw = cropImg.width, ih = cropImg.height, bs = Math.max(sz / iw, sz / ih) * (dr.zoom ?? 1), mx = Math.max(0, (iw * bs - sz) / 2), my = Math.max(0, (ih * bs - sz) / 2), k = sz / e.target.getBoundingClientRect().width;
  dr.ox = mx ? Math.max(-1, Math.min(1, pan.ox + (e.clientX - pan.x) * k / mx)) : 0;
  dr.oy = my ? Math.max(-1, Math.min(1, pan.oy + (e.clientY - pan.y) * k / my)) : 0;
  drawCrop()
});

M.addEventListener("pointerup", () => { pan = null });
M.addEventListener("pointercancel", () => { pan = null });

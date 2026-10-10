// Full-screen player: open, close and drag down to close.
"use strict";

const full = $("#full");
full.inert = true;
let pushed = false;

function openFull() {
  if (qi < 0) {
    toast("Pick a song to play first");
    return
  }
  full.inert = false;
  full.classList.add("open");
  document.body.classList.add("fullopen");
  ui();
  $("#fclose").focus({ preventScroll: true });
  if (!pushed) {
    try {
      history.pushState({ full: 1 }, "");
      pushed = true
    } catch (e) {}
  }
}

function closeFull(fromPop) {
  if (!full.classList.contains("open")) return;
  full.classList.remove("open");
  full.inert = true;
  document.body.classList.remove("fullopen");
  if (pushed) {
    pushed = false;
    if (fromPop !== true) {
      try { history.back() } catch (e) {}
    }
  }
  try { $("#mopen").focus({ preventScroll: true }) } catch (e) {}
}

$("#mopen").onclick = openFull;
$("#fclose").onclick = () => closeFull();
$("#fmore").onclick = e => { if (qi >= 0) openMenu(e.currentTarget, queue[qi]) };

$("#fdl").onclick = () => {
  if (qi < 0) return;
  const id = queue[qi];
  dlMap[id] ? undl(id) : download(id)
};

addEventListener("popstate", () => {
  if (full.classList.contains("open")) {
    pushed = false;
    closeFull(true)
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && full.classList.contains("open") && !$("#menu")) closeFull()
}, true);

// Drag the player down (finger or mouse) to close it. It follows the pointer, then closes or springs back.
let drag = null, dragged = false;

full.addEventListener("pointerdown", e => {
  if (!full.classList.contains("open") || e.button > 0) return;
  if (e.target.closest("input,button,a,select,textarea,[role=button]")) return;
  drag = { id: e.pointerId, y: e.clientY, dy: 0, on: false, lastY: e.clientY, lastT: performance.now(), v: 0 }
});

addEventListener("pointermove", e => {
  if (!drag || e.pointerId !== drag.id) return;
  const dy = e.clientY - drag.y;
  if (!drag.on) {
    if (Math.abs(dy) < 8) return;
    if (dy < 0) {
      drag = null;
      return
    }
    drag.on = true;
    full.style.transition = "none";
    try { full.setPointerCapture(e.pointerId) } catch (_) {}
  }
  drag.dy = Math.max(0, dy);
  const now = performance.now();
  drag.v = (e.clientY - drag.lastY) / Math.max(1, now - drag.lastT);
  drag.lastY = e.clientY;
  drag.lastT = now;
  full.style.transform = `translateY(${drag.dy}px)`
});

const endDrag = e => {
  if (!drag || e.pointerId !== drag.id) return;
  const d = drag;
  drag = null;
  if (!d.on) return;
  dragged = true;
  setTimeout(() => { dragged = false }, 60);
  full.style.transition = "";
  if (e.type !== "pointercancel" && (d.dy > 110 || d.v > .7)) {
    full.style.transform = "";
    closeFull()
  } else full.style.transform = ""
};

addEventListener("pointerup", endDrag);
addEventListener("pointercancel", endDrag);

full.addEventListener("click", e => {
  if (dragged) {
    e.stopPropagation();
    e.preventDefault()
  }
}, true);

// Reordering songs in a playlist by dragging, plus the sliding animation.
"use strict";

function afterEdit(p) {
  save();
  if (qpl === plIdx && qi >= 0) {
    const cur = queue[qi];
    queue = p.ids.slice();
    qi = queue.indexOf(cur);
    if (qi < 0) {
      playing = false;
      stopTimer()
    }
  }
  ui();
  render()
}

function mv(i, d) {
  const p = PLS[plIdx], j = i + d;
  if (j < 0 || j >= p.ids.length) return;
  flip(() => {
    [p.ids[i], p.ids[j]] = [p.ids[j], p.ids[i]];
    afterEdit(p)
  });
  const gg = $(`[data-grip="${j}"]`);
  if (gg) gg.focus()
}

// Smooth reorder animation: remember where rows were, re-render, then slide them from old to new place
function flip(change) {
  const first = {}, q = () => document.querySelectorAll("#main .row[data-edit]");
  q().forEach(r => first[r.dataset.id] = r.getBoundingClientRect().top);
  change();
  q().forEach(r => {
    const d = first[r.dataset.id] - r.getBoundingClientRect().top;
    if (!d) return;
    r.style.transition = "none";
    r.style.transform = `translateY(${d}px)`;
    r.getBoundingClientRect();
    requestAnimationFrame(() => {
      r.style.transition = "transform .45s cubic-bezier(.2,.8,.2,1)";
      r.style.transform = ""
    })
  })
}

// Drag by the grip handle: works with finger and mouse; other rows slide out of the way
function startDrag(e, grip) {
  const row = grip.closest(".row"), R = [...row.parentElement.children], from = R.indexOf(row), n = R.length;
  if (n < 2) return;
  e.preventDefault();
  const h = R[1].offsetTop - R[0].offsetTop, sy = e.clientY, main = $("#main"), s0 = main.scrollTop;
  let cy = sy, target = from, raf, done = false;
  grip.setPointerCapture(e.pointerId);
  row.classList.add("lift");
  R.forEach(r => { if (r !== row) r.classList.add("sh") });
  const frame = () => {
    if (done) return;
    const bb = main.getBoundingClientRect();
    if (cy < bb.top + 60) main.scrollTop -= 10;
    else if (cy > bb.bottom - 60) main.scrollTop += 10;
    const dy = Math.max(-from * h, Math.min((n - 1 - from) * h, cy - sy + main.scrollTop - s0));
    row.style.transform = `translateY(${dy}px)`;
    target = Math.max(0, Math.min(n - 1, Math.round(from + dy / h)));
    R.forEach((r, i) => {
      if (r !== row) r.style.transform = (from < target && i > from && i <= target) ? `translateY(${-h}px)` : (from > target && i < from && i >= target) ? `translateY(${h}px)` : ""
    });
    raf = requestAnimationFrame(frame)
  };
  const mvh = ev => { cy = ev.clientY };
  const end = ev => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    grip.removeEventListener("pointermove", mvh);
    grip.removeEventListener("pointerup", end);
    grip.removeEventListener("pointercancel", end);
    if (ev.type === "pointercancel") target = from;
    row.style.transition = "transform .18s ease";
    row.style.transform = `translateY(${(target-from)*h}px)`;
    setTimeout(() => {
      if (target !== from) {
        const p = PLS[plIdx], m = p.ids.splice(from, 1)[0];
        p.ids.splice(target, 0, m);
        afterEdit(p)
      } else render()
    }, 200)
  };
  grip.addEventListener("pointermove", mvh);
  grip.addEventListener("pointerup", end);
  grip.addEventListener("pointercancel", end);
  frame()
}

document.addEventListener("pointerdown", e => {
  const g = e.target.closest("[data-grip]");
  if (g && e.button === 0) startDrag(e, g)
});

M.addEventListener("keydown", e => {
  const g = e.target.closest("[data-grip]");
  if (g && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
    e.preventDefault();
    mv(+g.dataset.grip, e.key === "ArrowUp" ? -1 : 1)
  }
});

// The small message that appears at the bottom of the screen.
"use strict";

function toast(msg) {
  document.querySelectorAll(".toast").forEach(x => x.remove());
  const t = document.createElement("div");
  t.className = "toast";
  t.setAttribute("role", "status");
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("in"));
  setTimeout(() => {
    t.classList.remove("in");
    setTimeout(() => t.remove(), 250)
  }, 1900)
}

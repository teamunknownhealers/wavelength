// Small helpers used everywhere: DOM lookup, text escaping, time formatting.
"use strict";

// Font Awesome icon markup: icon("heart") is solid, icon("heart", "regular") is the outline version.
function icon(name, style = "solid") {
  return `<i class="fa-${style} fa-${name}" aria-hidden="true"></i>`
}

const grad = (a, b) => `linear-gradient(135deg,${a},${b})`;
const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const $ = s => document.querySelector(s);
const M = $("#main");
const fmt = s => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
const slug = t => String(t).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const un = t => {
  const x = document.createElement("textarea");
  x.innerHTML = t;
  return x.value
};

const fill = el => el.style.setProperty("--p", (el.value - el.min) / (el.max - el.min) * 100 + "%");

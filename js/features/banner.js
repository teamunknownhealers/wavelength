// Quote of the day banner on the Home page.
"use strict";

function bannerHtml() {
  const d = new Date(), mm = String(d.getMonth() + 1).padStart(2, "0"), dd = String(d.getDate()).padStart(2, "0");
  const sp = SPECIAL[d.getFullYear() + "-" + mm + "-" + dd] || SPECIAL[mm + "-" + dd];
  const t = sp || QUOTES[Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5) % QUOTES.length];
  return `<div class="qb ${sp?"sp":""}" role="note"><b>${sp?"Special day":"Quote of the day"}</b><div class="qtext" id="qtext" data-t="${esc(t)}" title="${esc(t)}"></div></div>`
}

function fitBanner() {
  const box = $("#qtext");
  if (!box) return;
  const t = box.dataset.t;
  box.textContent = t;
  if (box.scrollWidth <= box.clientWidth || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const inn = document.createElement("span");
  inn.className = "qin";
  for (let i = 0; i < 2; i++) {
    const x = document.createElement("span");
    x.className = "qi";
    x.textContent = t;
    inn.appendChild(x)
  }
  inn.style.animationDuration = Math.max(14, t.length * .3) + "s";
  box.textContent = "";
  box.appendChild(inn)
}

addEventListener("resize", fitBanner);

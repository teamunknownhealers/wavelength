// Volume slider and mute button.
"use strict";

let preVol = 60;

function volUI() {
  const v = +$("#vol").value, l = v === 0 ? 0 : v < 35 ? 1 : v < 70 ? 2 : 3, m = $("#mute");
  fill($("#vol"));
  m.innerHTML = icon(l === 0 ? "volume-xmark" : l === 3 ? "volume-high" : "volume-low");
  m.setAttribute("aria-label", v === 0 ? "Unmute" : "Mute");
  m.title = v === 0 ? "Unmute" : "Mute"
}

function setVol(v) {
  if (master) master.gain.value = v / 100 * .4;
  A.volume = v / 100;
  volUI()
}

$("#vol").oninput = e => setVol(+e.target.value);

$("#mute").onclick = () => {
  const r = $("#vol");
  if (+r.value > 0) {
    preVol = +r.value;
    r.value = 0
  } else r.value = preVol || 60;
  setVol(+r.value)
};

A.volume = $("#vol").value / 100;
volUI();

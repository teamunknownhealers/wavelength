// Playing songs: play, pause, next, previous and the play modes.
"use strict";

function onEnd() {
  if (mode === "one") {
    pos = 0;
    step = 0;
    startTimer()
  } else if (mode === "order" && qi === queue.length - 1) {
    playing = false;
    stopTimer();
    pos = 0;
    ui();
    render()
  } else go(1)
}

function playAt(i, restart = true) {
  const t0 = TRACKS[queue[i]];
  if (t0 && !navigator.onLine && t0.src && !dlMap[t0.id]) {
    toast("You're offline. Download this song to play it without internet.");
    return
  }
  ensure();
  recDone = -1;
  uiKey = -1;
  qi = i;
  if (restart) {
    pos = 0;
    step = 0
  }
  playing = true;
  startTimer();
  ui();
  render()
}

function playTrack(id, list) {
  queue = mode === "mood" ? allIds() : (list || queue);
  const i = queue.indexOf(id);
  playAt(i < 0 ? 0 : i)
}

function toggle() {
  if (qi < 0) {
    playAt(0);
    return
  }
  ensure();
  playing = !playing;
  if (playing) startTimer();
  else stopTimer();
  ui()
}

function nextIdx() {
  const n = queue.length;
  if (mode === "random" && n > 1) {
    let i;
    do { i = Math.floor(Math.random() * n) }
    while (i === qi);
    return i
  }
  if (mode === "mood") return moodNext();
  return (qi + 1) % n
}

function go(d) {
  if (qi < 0) return;
  if (d < 0 && pos > 3) {
    pos = 0;
    step = 0;
    ui();
    return
  }
  playAt(d > 0 ? nextIdx() : (qi - 1 + queue.length) % queue.length)
}

$("#play").onclick = toggle;
$("#mplay").onclick = toggle;
$("#next").onclick = () => go(1);
$("#prev").onclick = () => go(-1);

const MODES = {
  order: [icon("arrow-right-long"), "In order", "Play in order, then stop"],
  random: [icon("shuffle"), "Random", "Play in random order"],
  loop: [icon("repeat"), "Loop all", "Repeat the whole list"],
  one: [icon("repeat") + "<sup>1</sup>", "Loop 1", "Repeat this song"],
  mood: [icon("wand-magic-sparkles"), "Keep mood", "Pick songs with matching keywords"]
};

function showMode() {
  const b = $("#mode");
  const [symbol, name, hint] = MODES[mode];
  b.innerHTML = `<span class="mi">${symbol}</span><span class="mt"> ${name}</span>`;
  b.title = hint;
  b.setAttribute("aria-label", "Play mode: " + hint);
  b.style.color = mode === "order" ? "" : "var(--accent)"
}

$("#mode").onclick = () => {
  const k = Object.keys(MODES);
  mode = k[(k.indexOf(mode) + 1) % k.length];
  if (mode === "mood" && qi >= 0) {
    const c = queue[qi];
    queue = allIds();
    qi = queue.indexOf(c);
    qpl = -1
  }
  hist = [];
  showMode();
  toast(MODES[mode][1] + ": " + MODES[mode][2])
};

showMode();

document.addEventListener("keydown", e => {
  if (e.code === "Space" && !/INPUT|BUTTON/.test(e.target.tagName)) {
    e.preventDefault();
    toggle()
  }
});

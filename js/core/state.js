// Shared state: the play queue, the current page, recents and liked songs.
"use strict";

let queue = TRACKS.map(t => t.id), qi = -1, playing = false, pos = 0, mode = "order", hist = [], qpl = -1, view = "home", plIdx = 3, q = "";
let recents = [];
let liked = [];
let stack = [], last = { view: "home", plIdx: 3, sid: 0, art: "" }, goingBack = false, sid = 0, artName = "";

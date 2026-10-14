// LCARS button sounds and screen-top button, adapted from TheLCARS.com lcars.js.

// <audio> restarts slowly and MP3s open with encoder silence, so the beeps are decoded once into
// Web Audio buffers, trimmed to the first audible sample, and played from there. Until a buffer is
// ready (or if decoding fails, e.g. on file://) playback falls back to the <audio> element.
const sounds = {};
const audioCtx = window.AudioContext ? new AudioContext() : null;

function decodeSounds() {
  if (!audioCtx) {
    return;
  }
  document.querySelectorAll("audio[id]").forEach(function (el) {
    fetch(el.src)
      .then(function (r) { return r.arrayBuffer(); })
      .then(function (data) { return audioCtx.decodeAudioData(data); })
      .then(function (buffer) {
        const samples = buffer.getChannelData(0);
        let first = 0;
        while (first < samples.length && Math.abs(samples[first]) < 0.01) {
          first++;
        }
        sounds[el.id] = { buffer: buffer, offset: first / buffer.sampleRate };
      })
      .catch(function () {});
  });
}

function playSoundAndRedirect(audioId, url) {
  const audio = document.getElementById(audioId);
  const sound = sounds[audioId];

  if (sound) {
    audioCtx.resume();
    const source = audioCtx.createBufferSource();
    source.buffer = sound.buffer;
    source.connect(audioCtx.destination);
    if (url) {
      source.onended = function () { window.location.href = url; };
    }
    source.start(0, sound.offset);
    return;
  }

  function go() {
    if (url) {
      window.location.href = url;
    }
  }

  // Navigate even if the sound is missing, blocked, or muted.
  if (!audio) {
    go();
    return;
  }
  audio.currentTime = 0;
  audio.onended = go;
  audio.onerror = go;
  audio.play().catch(go);
}

function topFunction() {
  window.scrollTo(0, 0);
  playSoundAndRedirect("audio4", "");
}

// Wrap a post image or video in the LCARS image frame, replacing `target`.
// The media's title attribute, if any, becomes the frame title.
function frameMedia(media, target) {
  const frame = document.createElement("div");
  frame.className = "image-frame";
  frame.innerHTML =
    '<div class="imgf-title"></div>' +
    '<div class="imgf-image-body"><div class="image-holder"></div></div>' +
    '<div class="imgf-base">' +
    '<div class="imgf-block-1"> </div><div class="imgf-block-2"> </div><div class="imgf-block-3"> </div>' +
    '<div class="imgf-block-4"> </div><div class="imgf-block-5"> </div>' +
    "</div>";

  if (media.title) {
    const wrapper = document.createElement("div");
    const heading = document.createElement("h4");
    wrapper.className = "h4-wrapper";
    heading.textContent = media.title;
    wrapper.appendChild(heading);
    frame.querySelector(".imgf-title").appendChild(wrapper);
  }

  ["small", "medium", "large"].forEach(function (size) {
    if (media.classList.contains(size)) {
      frame.classList.add(size);
    }
  });
  if (!frame.classList.contains("small") && !frame.classList.contains("medium") && media.tagName === "VIDEO") {
    frame.classList.add("large");
  }

  target.replaceWith(frame);
  frame.querySelector(".image-holder").appendChild(media);
  markPortrait(media, frame);
  return frame;
}

// Click a framed image to view it full size in its own LCARS frame; click anywhere or press Esc to close.
// The photo morphs between its spot on the page and the big frame (View Transitions) where the browser supports it.
function zoomableImages() {
  const dialog = document.createElement("dialog");
  dialog.className = "image-zoom";
  document.body.appendChild(dialog);
  // The theme paints the frame's gaps black. This filter turns black into transparent (alpha = 20 × (r+g+b))
  // so the dimmed page shows through them; site.css applies it to the zoom frame.
  document.body.insertAdjacentHTML("beforeend",
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="lcars-cutout" color-interpolation-filters="sRGB">' +
    '<feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  20 20 20 0 0"/></filter></svg>');

  let opener = null;

  // Run `update`, morphing `from` into the element it returns.
  function morph(from, update) {
    if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      update();
      return;
    }
    from.style.viewTransitionName = "zoom-photo";
    let to;
    const transition = document.startViewTransition(function () {
      from.style.viewTransitionName = "";
      to = update();
      to.style.viewTransitionName = "zoom-photo";
    });
    // A skipped transition (e.g. a hidden tab) still runs `update`, just without the morph.
    transition.ready.catch(function () {});
    transition.finished.finally(function () {
      to.style.viewTransitionName = "";
    });
  }

  function close() {
    const photo = dialog.querySelector(".zoom-photo");
    if (!photo) {
      return;
    }
    playSoundAndRedirect("audio3", "");
    morph(photo, function () {
      dialog.close();
      dialog.replaceChildren();
      return opener;
    });
  }

  dialog.addEventListener("click", close);
  dialog.addEventListener("cancel", function (event) {
    event.preventDefault();
    close();
  });

  document.querySelectorAll(".post-body .image-frame img").forEach(function (img) {
    img.addEventListener("click", function () {
      opener = img;
      playSoundAndRedirect("audio2", "");
      morph(img, function () {
        // The filter would also hollow out dark pixels in the picture, so the framed copy is only a hidden
        // placeholder and an unfiltered copy is stacked on top of it.
        const placeholder = img.cloneNode();
        placeholder.className = "";
        const photo = img.cloneNode();
        photo.className = "zoom-photo";
        const stack = document.createElement("div");
        stack.className = "zoom-stack";
        const slot = document.createElement("div");
        stack.append(slot, photo);
        dialog.appendChild(stack);
        frameMedia(placeholder, slot);
        dialog.showModal();
        return photo;
      });
    });
  });
}

// Tall media gets a height cap (site.css) so a phone screenshot or recording can't fill the screen;
// very wide media (diagrams) gets a minimum height on narrow screens and scrolls sideways instead.
function markPortrait(media, frame) {
  function check() {
    // Width/height attributes give the shape before a video's metadata has loaded.
    const w = media.naturalWidth || media.videoWidth || Number(media.getAttribute("width"));
    const h = media.naturalHeight || media.videoHeight || Number(media.getAttribute("height"));
    if (w && h) {
      frame.style.setProperty("--aspect", w / h);
      frame.style.setProperty("--natural-height", h + "px");
      frame.classList.toggle("portrait", h > w * 1.1);
      frame.classList.toggle("wide", w > h * 3);
    }
  }
  check();
  media.addEventListener(media.tagName === "VIDEO" ? "loadedmetadata" : "load", check);
}

// A paragraph of only images gets framed; two or more become a side-by-side row.
function frameStandaloneImages() {
  document.querySelectorAll(".post-body p").forEach(function (paragraph) {
    const images = Array.from(paragraph.children);
    const onlyImages = images.length > 0 && paragraph.textContent.trim() === "" &&
      images.every(function (el) { return el.tagName === "IMG" && !el.classList.contains("plain"); });
    if (!onlyImages) {
      return;
    }
    if (images.length === 1) {
      frameMedia(images[0], paragraph);
      return;
    }
    const row = document.createElement("div");
    row.className = "image-row";
    paragraph.replaceWith(row);
    images.forEach(function (img) {
      row.appendChild(img);
      frameMedia(img, img);
    });
  });
}

function formatTime(seconds) {
  if (!isFinite(seconds)) {
    return "00:00";
  }
  const whole = Math.floor(seconds);
  return String(Math.floor(whole / 60)).padStart(2, "0") + ":" + String(whole % 60).padStart(2, "0");
}

// Replace the browser's video controls with LCARS ones. Native controls stay if this never runs.
function lcarsVideo(video) {
  const frame = frameMedia(video, video);
  video.controls = false;

  // The frame's decorative bottom blocks become the controls.
  const bar = frame.querySelector(".imgf-base");
  bar.className = "imgf-base vid-base";
  bar.innerHTML =
    '<button type="button" class="vid-play">play</button>' +
    '<div class="vid-track">' +
    '<input type="range" class="vid-seek" min="0" max="1000" value="0" aria-label="Seek">' +
    '<span class="vid-time" aria-live="off">00:00 / 00:00</span>' +
    "</div>" +
    '<button type="button" class="vid-full">full</button>';

  // Mute sits in the title bar, leaving the bottom bar to play, seek and full screen.
  const muteButton = document.createElement("button");
  muteButton.type = "button";
  muteButton.className = "vid-mute";
  muteButton.textContent = "mute";
  frame.querySelector(".imgf-title").prepend(muteButton);

  // An untitled video shows its time readout in the frame's title bar instead of on the seek track.
  if (!video.title) {
    const wrapper = document.createElement("div");
    const heading = document.createElement("h4");
    wrapper.className = "h4-wrapper";
    heading.appendChild(bar.querySelector(".vid-time"));
    wrapper.appendChild(heading);
    frame.querySelector(".imgf-title").appendChild(wrapper);
  }

  const play = bar.querySelector(".vid-play");
  const seek = bar.querySelector(".vid-seek");
  const time = frame.querySelector(".vid-time");
  const mute = muteButton;
  const full = bar.querySelector(".vid-full");
  let seeking = false;

  function beep() {
    playSoundAndRedirect("audio2", "");
  }

  function togglePlay() {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  function render() {
    play.textContent = video.paused ? "play" : "pause";
    mute.textContent = video.muted ? "unmute" : "mute";
    time.textContent = formatTime(video.currentTime) + " / " + formatTime(video.duration);
    if (!seeking && video.duration) {
      seek.value = String(Math.round((video.currentTime / video.duration) * 1000));
    }
    seek.style.setProperty("--progress", seek.value / 10 + "%");
  }

  play.addEventListener("click", function () {
    beep();
    togglePlay();
  });
  video.addEventListener("click", function () {
    beep();
    togglePlay();
  });
  mute.addEventListener("click", function () {
    beep();
    video.muted = !video.muted;
  });
  full.addEventListener("click", function () {
    beep();
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    }
  });
  seek.addEventListener("input", function () {
    seeking = true;
    seek.style.setProperty("--progress", seek.value / 10 + "%");
    if (video.duration) {
      video.currentTime = (Number(seek.value) / 1000) * video.duration;
    }
  });
  seek.addEventListener("change", function () {
    playSoundAndRedirect("audio1", "");
    seeking = false;
  });
  ["play", "pause", "timeupdate", "loadedmetadata", "volumechange"].forEach(function (name) {
    video.addEventListener(name, render);
  });
  render();
}

// Keypad: type an ID (xx-xxxx) and press return (•) to open that page. The header readout echoes the keys.
function initKeypad() {
  const indexEl = document.getElementById("page-index");
  const readout = document.querySelector(".readout-text");
  if (!indexEl) {
    return;
  }
  let pages = {};
  try {
    pages = JSON.parse(indexEl.textContent);
  } catch (err) {
    return;
  }
  const idleText = readout ? readout.textContent : "";
  const idBlock = document.querySelector(".panel-3");
  const idleId = idBlock ? idBlock.textContent : "";
  let buffer = "";
  let timer;

  function show() {
    if (readout) {
      readout.textContent = buffer || idleText;
    }
    // The header readout can be scrolled out of view, so echo the digits in the sidebar ID block too.
    if (idBlock) {
      idBlock.textContent = buffer || idleId;
    }
    clearTimeout(timer);
    if (buffer) {
      timer = setTimeout(function () {
        buffer = "";
        show();
      }, 4000);
    }
  }

  function press(key) {
    if (key === "enter") {
      // The Tools page answers to whatever today's stardate is.
      const url = buffer === stardate().split(".")[0] ? pages.stardate : pages[buffer.replace("-", "").replace(/^(\d\d)(\d{4})$/, "$1-$2")];
      buffer = "";
      show();
      playSoundAndRedirect(url ? "audio5" : "audio4", url || "");
      return;
    }
    playSoundAndRedirect("audio2", "");
    if (buffer.length < 7) {
      buffer += key;
      show();
    }
  }

  document.querySelectorAll(".key[data-key]").forEach(function (button) {
    button.addEventListener("click", function () {
      press(button.dataset.key);
    });
  });
  document.querySelectorAll(".keypad-button[data-href]").forEach(function (button) {
    button.addEventListener("click", function () {
      playSoundAndRedirect("audio5", button.dataset.href);
    });
  });

  // The physical keyboard works too, unless the user is typing in a field or using a shortcut.
  document.addEventListener("keydown", function (event) {
    const target = event.target;
    if (event.ctrlKey || event.metaKey || event.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable) {
      return;
    }
    if (/^[0-9-]$/.test(event.key)) {
      press(event.key);
    } else if (event.key === "." || (event.key === "Enter" && buffer)) {
      press("enter");
    } else {
      return;
    }
    event.preventDefault();
  });
}

// Live stardate for the header: TNG's formula with the year moved forward 400 (2026 is 2426), two decimals (0.01 is about 5 minutes).
function stardate() {
  const now = new Date();
  const year = now.getFullYear();
  // Wall-clock time as if UTC, so daylight saving doesn't shift the result by an hour.
  const wall = Date.UTC(year, now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
  const start = Date.UTC(year, 0, 1);
  const length = Date.UTC(year + 1, 0, 1) - start;
  const total = (year - 1923) * 1e5 + Math.floor(((wall - start) * 1e5) / length);
  return Math.floor(total / 100) + "." + String(total % 100).padStart(2, "0");
}

function updateStardate() {
  const el = document.getElementById("stardate");
  if (el) {
    el.textContent = stardate();
  }
}

function init() {
  decodeSounds();
  updateStardate();
  setInterval(updateStardate, 1000);
  initKeypad();
  frameStandaloneImages();
  zoomableImages();
  document.querySelectorAll(".post-body video").forEach(lcarsVideo);

  const topBtn = document.getElementById("topBtn");
  const entries = document.querySelector(".left-frame .panel-8");
  if (topBtn && entries) {
    // Keep the button one button-height below the entry list, so it never covers the keypad; it slides up 1:1 with scroll.
    const slide = () => {
      const h = topBtn.offsetHeight;
      const y = Math.min(h, Math.max(0, entries.getBoundingClientRect().bottom + 2 * h - window.innerHeight));
      topBtn.style.transform = "translateY(" + y + "px)";
    };
    window.addEventListener("resize", slide);
    window.addEventListener("scroll", slide, { passive: true });
    slide();
  }
}

init();

// LCARS button sounds and screen-top button, adapted from TheLCARS.com lcars.js.

function playSoundAndRedirect(audioId, url) {
  const audio = document.getElementById(audioId);

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

// Tall media gets a height cap (site.css) so a phone screenshot or recording can't fill the screen.
function markPortrait(media, frame) {
  function check() {
    // Width/height attributes give the shape before a video's metadata has loaded.
    const w = media.naturalWidth || media.videoWidth || Number(media.getAttribute("width"));
    const h = media.naturalHeight || media.videoHeight || Number(media.getAttribute("height"));
    if (w && h) {
      frame.style.setProperty("--aspect", w / h);
      frame.classList.toggle("portrait", h > w * 1.1);
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
  video.addEventListener("click", togglePlay);
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
    seeking = false;
  });
  ["play", "pause", "timeupdate", "loadedmetadata", "volumechange"].forEach(function (name) {
    video.addEventListener(name, render);
  });
  render();
}

function init() {
  frameStandaloneImages();
  document.querySelectorAll(".post-body video").forEach(lcarsVideo);

  const topBtn = document.getElementById("topBtn");
  if (!topBtn) {
    return;
  }
  window.addEventListener("scroll", function () {
    topBtn.style.display = window.scrollY > 200 ? "block" : "none";
  });
}

init();

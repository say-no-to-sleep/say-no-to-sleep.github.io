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
  return frame;
}

function frameStandaloneImages() {
  const images = document.querySelectorAll(".post-body p > img");
  images.forEach(function (img) {
    const paragraph = img.parentElement;
    const isAlone = paragraph.children.length === 1 && paragraph.textContent.trim() === "";
    if (isAlone && !img.classList.contains("plain")) {
      frameMedia(img, paragraph);
    }
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
  frameMedia(video, video);
  video.controls = false;

  const bar = document.createElement("div");
  bar.className = "lcars-video-controls";
  bar.innerHTML =
    '<button type="button" class="vid-play">play</button>' +
    '<input type="range" class="vid-seek" min="0" max="1000" value="0" aria-label="Seek">' +
    '<span class="vid-time" aria-live="off">00:00 / 00:00</span>' +
    '<button type="button" class="vid-mute">mute</button>' +
    '<button type="button" class="vid-full">full</button>';
  video.after(bar);

  const play = bar.querySelector(".vid-play");
  const seek = bar.querySelector(".vid-seek");
  const time = bar.querySelector(".vid-time");
  const mute = bar.querySelector(".vid-mute");
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

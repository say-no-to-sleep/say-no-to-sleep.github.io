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

// Wrap a standalone post image (alone in its paragraph) in the LCARS image frame.
// The image's Markdown title, if any, becomes the frame title.
function frameImage(img) {
  const frame = document.createElement("div");
  frame.className = "image-frame";
  frame.innerHTML =
    '<div class="imgf-title"></div>' +
    '<div class="imgf-image-body"><div class="image-holder"></div></div>' +
    '<div class="imgf-base">' +
    '<div class="imgf-block-1"> </div><div class="imgf-block-2"> </div><div class="imgf-block-3"> </div>' +
    '<div class="imgf-block-4"> </div><div class="imgf-block-5"> </div>' +
    "</div>";

  if (img.title) {
    const wrapper = document.createElement("div");
    const heading = document.createElement("h4");
    wrapper.className = "h4-wrapper";
    heading.textContent = img.title;
    wrapper.appendChild(heading);
    frame.querySelector(".imgf-title").appendChild(wrapper);
  }

  const paragraph = img.parentElement;
  frame.querySelector(".image-holder").appendChild(img);
  paragraph.replaceWith(frame);
}

function frameStandaloneImages() {
  const images = document.querySelectorAll(".post-body p > img");
  images.forEach(function (img) {
    const paragraph = img.parentElement;
    const isAlone = paragraph.children.length === 1 && paragraph.textContent.trim() === "";
    if (isAlone && !img.classList.contains("plain")) {
      frameImage(img);
    }
  });
}

function init() {
  frameStandaloneImages();

  const topBtn = document.getElementById("topBtn");
  if (!topBtn) {
    return;
  }
  window.addEventListener("scroll", function () {
    topBtn.style.display = window.scrollY > 200 ? "block" : "none";
  });
}

init();

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

function init() {
  const topBtn = document.getElementById("topBtn");
  if (!topBtn) {
    return;
  }
  window.addEventListener("scroll", function () {
    topBtn.style.display = window.scrollY > 200 ? "block" : "none";
  });
}

init();

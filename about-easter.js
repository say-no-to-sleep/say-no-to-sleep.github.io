(function () {
  const trigger = document.querySelector("[data-portfolio-easter]");

  if (!trigger) {
    return;
  }

  const revealDelay = 5000;
  const target = trigger.dataset.portfolioEaster || "portfolio/";
  const revealedText = trigger.dataset.revealedText || trigger.textContent.trim();
  let revealTimer = 0;
  let isRevealed = false;

  function startReveal() {
    if (isRevealed || revealTimer) {
      return;
    }

    trigger.classList.add("is-holding");
    revealTimer = window.setTimeout(reveal, revealDelay);
  }

  function cancelReveal() {
    window.clearTimeout(revealTimer);
    revealTimer = 0;

    if (!isRevealed) {
      trigger.classList.remove("is-holding");
    }
  }

  function reveal() {
    revealTimer = 0;
    isRevealed = true;
    trigger.href = target;
    trigger.textContent = revealedText;
    trigger.classList.add("is-revealed");
    trigger.classList.remove("is-holding");
    trigger.setAttribute("aria-label", "Open Jinyuan Zhao portfolio");
  }

  trigger.addEventListener("pointerenter", startReveal);
  trigger.addEventListener("pointerleave", cancelReveal);
  trigger.addEventListener("pointerdown", startReveal);
  trigger.addEventListener("pointerup", cancelReveal);
  trigger.addEventListener("pointercancel", cancelReveal);
  trigger.addEventListener("focus", startReveal);
  trigger.addEventListener("blur", cancelReveal);

  trigger.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && !isRevealed) {
      event.preventDefault();
      startReveal();
    }
  });

  trigger.addEventListener("click", (event) => {
    if (!isRevealed) {
      event.preventDefault();
    }
  });
})();

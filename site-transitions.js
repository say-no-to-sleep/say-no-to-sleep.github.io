const transitionLinks = document.querySelectorAll(".site-header .aqua-text-button[href]");
const transitionDuration = 170;
const themeTransitionDuration = 360;
const themeStorageKey = "watthehex.theme";
const aquaThemeStorageKey = "aqua-theme";
const themeToggle = createThemeToggle();
let themeTransitionTimeout = 0;

disableReloadScrollDrift();
document.body.classList.add("site-transition-ready");
initTheme();
installThemeToggle();

window.addEventListener("pageshow", () => {
  document.body.classList.remove("site-transition-leaving");
  syncThemeToggle();
  resetReloadScrollPosition();
});

function disableReloadScrollDrift() {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
}

function resetReloadScrollPosition() {
  if (window.location.hash || getNavigationType() !== "reload") {
    return;
  }

  window.requestAnimationFrame(() => {
    window.scrollTo(0, 0);
  });
}

function getNavigationType() {
  const navigation = performance.getEntriesByType?.("navigation")?.[0];

  return navigation?.type || "";
}

transitionLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (shouldSkipTransition(event, link)) {
      return;
    }

    event.preventDefault();
    document.body.classList.add("site-transition-leaving");

    window.setTimeout(() => {
      window.location.href = link.href;
    }, transitionDuration);
  });
});

function shouldSkipTransition(event, link) {
  if (event.defaultPrevented || event.button !== 0) {
    return true;
  }

  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return true;
  }

  if (link.target && link.target !== "_self") {
    return true;
  }

  const nextUrl = new URL(link.href, window.location.href);
  const currentUrl = new URL(window.location.href);
  currentUrl.hash = "";
  nextUrl.hash = "";

  return nextUrl.href === currentUrl.href;
}

function initTheme() {
  const storedTheme = getStoredTheme();
  const nextTheme = storedTheme || getSystemTheme();

  applyTheme(nextTheme);

  if (!storedTheme && window.matchMedia) {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if (!getStoredTheme()) {
        applyTheme(getSystemTheme());
      }
    };

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", handleSystemThemeChange);
    } else if (typeof query.addListener === "function") {
      query.addListener(handleSystemThemeChange);
    }
  }
}

function installThemeToggle() {
  const actions = document.querySelector(".site-header .aqua-top-bar-actions");

  if (!actions || actions.querySelector(".site-theme-toggle")) {
    return;
  }

  actions.prepend(themeToggle);
  syncThemeToggle();
}

function createThemeToggle() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "graphite-button-circular site-theme-toggle";
  button.addEventListener("click", () => {
    const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
    persistTheme(nextTheme);
    applyTheme(nextTheme);
  });

  return button;
}

function applyTheme(theme) {
  const currentTheme = document.documentElement.dataset.theme;
  const shouldAnimate = Boolean(currentTheme && currentTheme !== theme && !prefersReducedMotion());

  if (shouldAnimate && document.startViewTransition) {
    document.startViewTransition(() => {
      setTheme(theme);
    });
    return;
  }

  if (shouldAnimate) {
    startThemeTransition();
  }

  setTheme(theme);
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  syncThemeToggle();
}

function startThemeTransition() {
  window.clearTimeout(themeTransitionTimeout);
  document.documentElement.classList.add("site-theme-transitioning");

  themeTransitionTimeout = window.setTimeout(() => {
    document.documentElement.classList.remove("site-theme-transitioning");
  }, themeTransitionDuration);
}

function prefersReducedMotion() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function persistTheme(theme) {
  try {
    window.localStorage.setItem(themeStorageKey, theme);
    window.localStorage.setItem(aquaThemeStorageKey, theme);
  } catch {
    // Theme still works for the current page when storage is unavailable.
  }
}

function getStoredTheme() {
  try {
    const theme = window.localStorage.getItem(themeStorageKey) || window.localStorage.getItem(aquaThemeStorageKey);

    if (theme === "dark" || theme === "light") {
      return theme;
    }
  } catch {
    return "";
  }

  return "";
}

function getSystemTheme() {
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

function getCurrentTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function syncThemeToggle() {
  if (!themeToggle) {
    return;
  }

  const isDark = getCurrentTheme() === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  themeToggle.setAttribute("aria-label", label);
  themeToggle.title = label;
  themeToggle.innerHTML = isDark ? getSunIcon() : getMoonIcon();
}

function getSunIcon() {
  return [
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
    '<circle cx="12" cy="12" r="4"></circle>',
    '<path d="M12 2v2"></path>',
    '<path d="M12 20v2"></path>',
    '<path d="m4.93 4.93 1.41 1.41"></path>',
    '<path d="m17.66 17.66 1.41 1.41"></path>',
    '<path d="M2 12h2"></path>',
    '<path d="M20 12h2"></path>',
    '<path d="m6.34 17.66-1.41 1.41"></path>',
    '<path d="m19.07 4.93-1.41 1.41"></path>',
    "</svg>"
  ].join("");
}

function getMoonIcon() {
  return [
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
    '<path d="M20.4 14.2A7.8 7.8 0 0 1 9.8 3.6 8.5 8.5 0 1 0 20.4 14.2Z"></path>',
    "</svg>"
  ].join("");
}

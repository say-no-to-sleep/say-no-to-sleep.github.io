(function () {
  "use strict";

  function renderKatexNodes() {
    if (typeof document === "undefined" || !window.katex) {
      return;
    }

    document.querySelectorAll("[data-katex]").forEach((node) => {
      const expression = node.dataset.katex;

      if (!expression) {
        return;
      }

      try {
        window.katex.render(expression, node, {
          displayMode: node.dataset.katexDisplay === "block",
          throwOnError: false,
          strict: "ignore"
        });
      } catch (_error) {
        // Leave the fallback text content in place if rendering fails.
      }
    });
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", renderKatexNodes);
  }
}());

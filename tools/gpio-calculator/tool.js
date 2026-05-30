(function () {
  "use strict";

  const LED_INDICES = [23, 22, 21, 20, 19, 18, 11, 10];
  const BUTTON_INDICES = [13, 12];
  const SEVEN_SEG_INDICES = [9, 5, 4, 3, 2, 1, 0];
  const OTHER_INDICES = Array.from({ length: 32 }, (_, index) => index).filter((index) => {
    return !LED_INDICES.includes(index) && !BUTTON_INDICES.includes(index) && !SEVEN_SEG_INDICES.includes(index);
  });
  const MOBILE_BREAKPOINT_QUERY = "(max-width: 959px)";
  const ACTIONS = [
    { key: "all-leds", label: "All LEDs", indices: LED_INDICES, tone: "led" },
    { key: "all-pbs", label: "All PBs", indices: BUTTON_INDICES, tone: "pb" },
    { key: "all-7-seg", label: "All 7-Seg", indices: SEVEN_SEG_INDICES, tone: "seg" },
    { key: "others", label: "Others", indices: OTHER_INDICES, tone: "misc" },
    { key: "invert", label: "Invert", tone: "misc" },
    { key: "shift-left", label: "Shift Left", tone: "teal" },
    { key: "shift-right", label: "Shift Right", tone: "teal" },
    { key: "clear", label: "Clear", tone: "danger" }
  ];

  const state = {
    bits: createEmptyBits(),
    isCompactSummaryVisible: false,
    toastTimeoutId: null,
    toastHideTimeoutId: null
  };

  const refs = {};

  function createEmptyBits() {
    return Array(32).fill(false);
  }

  function getRawValue(bits) {
    let value = 0;

    bits.forEach((isOn, index) => {
      if (isOn) {
        value += 2 ** index;
      }
    });

    return value;
  }

  function formatHex(bits) {
    return getRawValue(bits).toString(16).toUpperCase().padStart(8, "0");
  }

  function formatDecimal(bits) {
    return String(getRawValue(bits));
  }

  function formatBinary(bits) {
    const reversed = bits
      .slice()
      .reverse()
      .map((bit) => (bit ? "1" : "0"))
      .join("");

    return reversed.replace(/(.{4})(?=.)/g, "$1 ");
  }

  function toggleBitAt(bits, index) {
    return bits.map((bit, bitIndex) => {
      if (bitIndex === index) {
        return !bit;
      }

      return bit;
    });
  }

  function toggleBitGroup(bits, indices) {
    const allOn = indices.every((index) => bits[index]);

    return bits.map((bit, bitIndex) => {
      if (indices.includes(bitIndex)) {
        return !allOn;
      }

      return bit;
    });
  }

  function clearAllBits() {
    return createEmptyBits();
  }

  function invertBitMask(bits) {
    return bits.map((bit) => !bit);
  }

  function shiftBitsLeft(bits) {
    return [false, ...bits.slice(0, -1)];
  }

  function shiftBitsRight(bits) {
    return [...bits.slice(1), false];
  }

  function getBitMetadata(index) {
    if (LED_INDICES.includes(index)) {
      return { label: "LED Bar", kind: "led" };
    }

    if (BUTTON_INDICES.includes(index)) {
      return { label: index === 13 ? "PB 2" : "PB 1", kind: "pb" };
    }

    if (SEVEN_SEG_INDICES.includes(index)) {
      return { label: "7-Seg", kind: "seg" };
    }

    return { label: "GPIO", kind: "general" };
  }

  function getKindChipClass(kind) {
    if (kind === "pb" || kind === "general") {
      return "graphite-chip gpio-chip";
    }

    return "aqua-chip gpio-chip";
  }

  function createKindChipMarkup(metadata) {
    return `<span class="${getKindChipClass(metadata.kind)} gpio-chip--${metadata.kind}">${escapeHtml(metadata.label)}</span>`;
  }

  function bindCheckboxChipInteractions(chip) {
    if (!chip || chip.dataset.gpioChipBound === "true") {
      return;
    }

    chip.dataset.gpioChipBound = "true";

    const input = chip.querySelector('input[type="checkbox"]');
    const control = input?.nextElementSibling;

    if (input && control?.classList.contains("aqua-checkbox-control")) {
      input.addEventListener("change", () => {
        control.classList.remove("settling");
        void control.offsetWidth;
        control.classList.add("settling");
      });

      control.addEventListener("animationend", (event) => {
        if (event.animationName === "checkbox-settle") {
          control.classList.remove("settling");
        }
      });
    }

    function releasePress() {
      chip.classList.remove("pressing");
    }

    chip.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) {
        return;
      }

      chip.classList.add("pressing");
    });

    chip.addEventListener("pointerup", releasePress);
    chip.addEventListener("pointercancel", releasePress);
    chip.addEventListener("pointerleave", (event) => {
      if (event.buttons === 1) {
        releasePress();
      }
    });
  }

  function isMobileViewport() {
    if (refs.mobileQuery) {
      return refs.mobileQuery.matches;
    }

    return window.innerWidth <= 959;
  }

  function createValueRowMarkup(label, value, kind) {
    const rowClass = kind === "hex" ? "gpio-value-row gpio-value-row--hex" : "gpio-value-row";

    return [
      `<div class="${rowClass}">`,
      `<span class="gpio-value-label">${label}</span>`,
      `<span class="gpio-value-code" data-kind="${kind}">${escapeHtml(value)}</span>`,
      "</div>"
    ].join("");
  }

  function createCompactValueRowMarkup(label, value, kind) {
    const rowClass = kind === "hex" ? "gpio-compact-row gpio-compact-row--hex" : "gpio-compact-row";

    return [
      `<div class="${rowClass}">`,
      `<span class="gpio-compact-label">${label}</span>`,
      `<span class="gpio-compact-code" data-kind="${kind}">${escapeHtml(value)}</span>`,
      "</div>"
    ].join("");
  }

  function createActionButtonsMarkup() {
    return ACTIONS.map((action) => {
      const buttonClass = action.tone === "danger" ? "graphite-button" : "aqua-button";
      return `<button type="button" class="${buttonClass}" data-action="${action.key}" data-tone="${action.tone}">${action.label}</button>`;
    }).join("");
  }

  function renderMainValueRows() {
    refs.valueStack.innerHTML = [
      createValueRowMarkup("HEX", `0x${formatHex(state.bits)}`, "hex"),
      createValueRowMarkup("DEC", formatDecimal(state.bits), "dec"),
      createValueRowMarkup("BIN", formatBinary(state.bits), "bin")
    ].join("");

    syncSummaryObserverTarget();
  }

  function renderCompactSummary() {
    if (!refs.compactValues) {
      return;
    }

    refs.compactValues.innerHTML = [
      createCompactValueRowMarkup("HEX", `0x${formatHex(state.bits)}`, "hex"),
      createCompactValueRowMarkup("DEC", formatDecimal(state.bits), "dec"),
      createCompactValueRowMarkup("BIN", formatBinary(state.bits), "bin")
    ].join("");
  }

  function renderActions() {
    const markup = createActionButtonsMarkup();
    refs.desktopActionsGrid.innerHTML = markup;
    refs.mobileActionsGrid.innerHTML = markup;
  }

  function renderBitSection(container, indices) {
    container.innerHTML = indices.map((index) => createBitMarkup(index)).join("");
    container.querySelectorAll(".gpio-bit-cell").forEach(bindCheckboxChipInteractions);
  }

  function renderBitSections() {
    renderBitSection(refs.upperGrid, Array.from({ length: 16 }, (_, offset) => 31 - offset));
    renderBitSection(refs.lowerGrid, Array.from({ length: 16 }, (_, offset) => 15 - offset));
  }

  function renderDerivedValues() {
    renderMainValueRows();
    renderCompactSummary();
  }

  function renderAll() {
    renderDerivedValues();
    renderActions();
    renderBitSections();
  }

  function createBitMarkup(index) {
    const metadata = getBitMetadata(index);
    const isOn = state.bits[index];

    return [
      `<label class="aqua-checkbox-chip gpio-bit-cell" data-kind="${metadata.kind}">`,
      `<input type="checkbox" data-bit-index="${index}" ${isOn ? "checked" : ""} aria-label="${metadata.label}, bit ${index}">`,
      '<span class="aqua-checkbox-control"><span class="aqua-checkbox-left"></span><span class="aqua-checkbox-right"></span></span>',
      '<span class="aqua-checkbox-label">',
      '<span class="gpio-bit-meta">',
      createKindChipMarkup(metadata),
      `<span class="gpio-bit-index">Bit ${index}</span>`,
      "</span>",
      "</span>",
      "</label>"
    ].join("");
  }

  function syncBitToggleElement(cell, index) {
    const metadata = getBitMetadata(index);
    const isOn = state.bits[index];
    const input = cell.querySelector("input[data-bit-index]");
    const kindChip = cell.querySelector(".gpio-chip");
    const bitIndex = cell.querySelector(".gpio-bit-index");

    cell.dataset.kind = metadata.kind;
    cell.classList.add("aqua-checkbox-chip");
    cell.classList.remove("graphite-checkbox-chip");

    if (input) {
      input.checked = isOn;
      input.setAttribute("aria-label", `${metadata.label}, bit ${index}`);
    }

    if (kindChip) {
      kindChip.className = `${getKindChipClass(metadata.kind)} gpio-chip--${metadata.kind}`;
      kindChip.textContent = metadata.label;
    }

    if (bitIndex) {
      bitIndex.textContent = `Bit ${index}`;
    }
  }

  function syncRenderedBitToggles() {
    refs.tool.querySelectorAll(".gpio-bit-cell input[data-bit-index]").forEach((input) => {
      const cell = input.closest(".gpio-bit-cell");

      if (cell) {
        syncBitToggleElement(cell, Number(input.dataset.bitIndex));
      }
    });
  }

  function syncCompactSummaryVisibility() {
    refs.compactSummary.classList.toggle("is-visible", state.isCompactSummaryVisible);
    refs.compactSummary.setAttribute("aria-hidden", String(!state.isCompactSummaryVisible));
    document.body.classList.toggle("gpio-compact-summary-active", state.isCompactSummaryVisible);
  }

  function closeMobileActionsPanel() {
    if (!refs.mobileActionsPanel?.classList.contains("aqua-floating-control-panel-open")) {
      return;
    }

    refs.mobileActionsPanel.querySelector("[data-aqua-floating-control-panel-toggle], .aqua-floating-control-panel-tab")?.click();
  }

  function setCompactSummaryVisible(visible) {
    const nextVisible = Boolean(visible);

    if (state.isCompactSummaryVisible === nextVisible) {
      return;
    }

    state.isCompactSummaryVisible = nextVisible;

    if (!nextVisible) {
      closeMobileActionsPanel();
    }

    syncCompactSummaryVisibility();
  }

  function getSummaryVisibilityTarget() {
    return refs.summaryPanel;
  }

  function syncSummaryObserverTarget() {
    const nextTarget = getSummaryVisibilityTarget();

    if (!nextTarget || refs.summaryObserverTarget === nextTarget) {
      return;
    }

    if (refs.summaryObserver && refs.summaryObserverTarget) {
      refs.summaryObserver.unobserve(refs.summaryObserverTarget);
    }

    refs.summaryObserverTarget = nextTarget;

    if (refs.summaryObserver) {
      refs.summaryObserver.observe(nextTarget);
    }
  }

  function updateCompactSummaryVisibility() {
    const target = refs.summaryObserverTarget || getSummaryVisibilityTarget();

    if (!target) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const summaryVisible = rect.bottom > 0 && rect.top < window.innerHeight;

    setCompactSummaryVisible(!summaryVisible);
  }

  function initSummaryObserver() {
    const target = refs.summaryObserverTarget || getSummaryVisibilityTarget();

    if (!target) {
      return;
    }

    if ("IntersectionObserver" in window) {
      refs.summaryObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target !== refs.summaryObserverTarget) {
            return;
          }

          const summaryVisible = entry.isIntersecting;
          setCompactSummaryVisible(!summaryVisible);
        });
      }, {
        threshold: [0]
      });

      refs.summaryObserverTarget = target;
      refs.summaryObserver.observe(target);
      updateCompactSummaryVisibility();
      return;
    }

    refs.summaryFallbackHandler = updateCompactSummaryVisibility;
    window.addEventListener("scroll", refs.summaryFallbackHandler, { passive: true });
    window.addEventListener("resize", refs.summaryFallbackHandler);
    updateCompactSummaryVisibility();
  }

  function handleDocumentClick(event) {
    const actionButton = event.target.closest("[data-action]");

    if (
      actionButton &&
      (refs.scope.contains(actionButton) || refs.mobileActionsPanel.contains(actionButton))
    ) {
      handleAction(actionButton.dataset.action);
    }
  }

  function handleChange(event) {
    const bitInput = event.target.closest("input[data-bit-index]");
    if (!bitInput) {
      return;
    }

    const index = Number(bitInput.dataset.bitIndex);
    const cell = bitInput.closest(".gpio-bit-cell");

    state.bits = toggleBitAt(state.bits, index);

    if (cell) {
      syncBitToggleElement(cell, index);
    }

    renderDerivedValues();
  }

  function handleAction(actionKey) {
    const groupAction = ACTIONS.find((action) => action.key === actionKey && Array.isArray(action.indices));

    if (groupAction) {
      state.bits = toggleBitGroup(state.bits, groupAction.indices);
      renderDerivedValues();
      syncRenderedBitToggles();
      closeMobileActionsPanel();
      return;
    }

    if (actionKey === "invert") {
      state.bits = invertBitMask(state.bits);
      renderDerivedValues();
      syncRenderedBitToggles();
      closeMobileActionsPanel();
      return;
    }

    if (actionKey === "clear") {
      state.bits = clearAllBits();
      renderDerivedValues();
      syncRenderedBitToggles();
      closeMobileActionsPanel();
      return;
    }

    if (actionKey === "shift-left") {
      state.bits = shiftBitsLeft(state.bits);
      renderDerivedValues();
      syncRenderedBitToggles();
      closeMobileActionsPanel();
      return;
    }

    if (actionKey === "shift-right") {
      state.bits = shiftBitsRight(state.bits);
      renderDerivedValues();
      syncRenderedBitToggles();
      closeMobileActionsPanel();
      return;
    }

    if (actionKey === "copy-hex") {
      copyHex();
    }
  }

  async function copyHex() {
    const value = `0x${formatHex(state.bits)}`;

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(value);
      } else {
        fallbackCopyText(value);
      }

      showToast("Copied to clipboard");
    } catch (_error) {
      fallbackCopyText(value);
      showToast("Copied to clipboard");
    }
  }

  function fallbackCopyText(value) {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  function showToast(message) {
    refs.toast.textContent = message;
    refs.toast.hidden = false;
    refs.toast.classList.remove("is-hiding", "is-visible");

    if (state.toastHideTimeoutId) {
      window.clearTimeout(state.toastHideTimeoutId);
      state.toastHideTimeoutId = null;
    }

    void refs.toast.offsetWidth;
    refs.toast.classList.add("is-visible");

    if (state.toastTimeoutId) {
      window.clearTimeout(state.toastTimeoutId);
    }

    state.toastTimeoutId = window.setTimeout(() => {
      refs.toast.classList.remove("is-visible");
      refs.toast.classList.add("is-hiding");
      state.toastHideTimeoutId = window.setTimeout(() => {
        refs.toast.hidden = true;
        refs.toast.classList.remove("is-hiding");
        state.toastHideTimeoutId = null;
      }, 220);
      state.toastTimeoutId = null;
    }, 1400);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function handleViewportChange() {
    if (!isMobileViewport()) {
      closeMobileActionsPanel();
    }
  }

  function init() {
    refs.tool = document.getElementById("gpio-tool");
    refs.scope = document.querySelector(".gpio-tool-main");
    refs.summaryPanel = document.getElementById("gpio-summary-panel");
    refs.valueStack = document.getElementById("gpio-value-stack");
    refs.desktopActionsGrid = document.getElementById("gpio-desktop-actions-grid");
    refs.mobileActionsGrid = document.getElementById("gpio-mobile-actions-grid");
    refs.upperGrid = document.getElementById("gpio-upper-grid");
    refs.lowerGrid = document.getElementById("gpio-lower-grid");
    refs.compactSummary = document.getElementById("gpio-compact-summary");
    refs.compactValues = document.getElementById("gpio-compact-values");
    refs.mobileActionsPanel = document.getElementById("gpio-mobile-actions-panel");
    refs.toast = document.getElementById("gpio-toast");
    refs.mobileQuery = window.matchMedia ? window.matchMedia(MOBILE_BREAKPOINT_QUERY) : null;

    if (
      !refs.tool ||
      !refs.scope ||
      !refs.summaryPanel ||
      !refs.valueStack ||
      !refs.desktopActionsGrid ||
      !refs.mobileActionsGrid ||
      !refs.upperGrid ||
      !refs.lowerGrid ||
      !refs.compactSummary ||
      !refs.compactValues ||
      !refs.mobileActionsPanel ||
      !refs.toast
    ) {
      return;
    }

    document.addEventListener("click", handleDocumentClick);
    refs.tool.addEventListener("change", handleChange);

    if (refs.mobileQuery) {
      if (typeof refs.mobileQuery.addEventListener === "function") {
        refs.mobileQuery.addEventListener("change", handleViewportChange);
      } else if (typeof refs.mobileQuery.addListener === "function") {
        refs.mobileQuery.addListener(handleViewportChange);
      }
    }

    renderAll();
    syncCompactSummaryVisibility();
    initSummaryObserver();
  }

  globalThis.GpioBitmaskBuilder = {
    LED_INDICES,
    BUTTON_INDICES,
    SEVEN_SEG_INDICES,
    OTHER_INDICES,
    createEmptyBits,
    getRawValue,
    formatHex,
    formatDecimal,
    formatBinary,
    toggleBitAt,
    toggleBitGroup,
    clearAllBits,
    invertBitMask,
    shiftBitsLeft,
    shiftBitsRight,
    getBitMetadata
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", init);
  }
})();

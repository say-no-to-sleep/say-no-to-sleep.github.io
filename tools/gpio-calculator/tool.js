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
    isMobileActionsOpen: false,
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

    return { label: `Bit ${index}`, kind: "general" };
  }

  function isMobileViewport() {
    if (refs.mobileQuery) {
      return refs.mobileQuery.matches;
    }

    return window.innerWidth <= 959;
  }

  function createValueRowMarkup(label, value, kind) {
    return [
      '<div class="gpio-value-row">',
      `<span class="gpio-value-label">${label}</span>`,
      `<p class="gpio-value-code" data-kind="${kind}">${escapeHtml(value)}</p>`,
      "</div>"
    ].join("");
  }

  function createCompactValueRowMarkup(label, value, kind) {
    return [
      `<div class="gpio-compact-row" data-kind="${kind}">`,
      `<span class="gpio-compact-label">${label}</span>`,
      `<span class="gpio-compact-code" data-kind="${kind}">${escapeHtml(value)}</span>`,
      "</div>"
    ].join("");
  }

  function createActionButtonsMarkup() {
    return ACTIONS.map((action) => {
      return `<button type="button" class="gpio-action-button aqua-button" data-action="${action.key}" data-tone="${action.tone}">${action.label}</button>`;
    }).join("");
  }

  function renderMainValueRows() {
    refs.valueStack.innerHTML = [
      createValueRowMarkup("HEX", `0x${formatHex(state.bits)}`, "hex"),
      createValueRowMarkup("DEC", formatDecimal(state.bits), "dec"),
      createValueRowMarkup("BIN", formatBinary(state.bits), "bin"),
      '<button type="button" class="gpio-copy-button aqua-button-focused" data-action="copy-hex">Copy Hex</button>'
    ].join("");

    syncSummaryObserverTarget();
  }

  function renderCompactSummary() {
    refs.compactSummary.innerHTML = [
      '<div class="gpio-panel gpio-compact-summary-panel">',
      '<div class="gpio-compact-summary-layout">',
      '<div class="gpio-compact-values">',
      createCompactValueRowMarkup("HEX", `0x${formatHex(state.bits)}`, "hex"),
      createCompactValueRowMarkup("DEC", formatDecimal(state.bits), "dec"),
      createCompactValueRowMarkup("BIN", formatBinary(state.bits), "bin"),
      "</div>",
      '<div class="gpio-compact-actions">',
      '<button type="button" class="gpio-copy-button aqua-button-focused" data-action="copy-hex">Copy</button>',
      `<button type="button" class="gpio-action-button aqua-button gpio-compact-menu-button" data-action="toggle-mobile-actions" aria-controls="gpio-mobile-actions-tray" aria-expanded="${state.isMobileActionsOpen}">Actions</button>`,
      "</div>",
      "</div>",
      "</div>"
    ].join("");

    syncFloatingUiState();
  }

  function renderActions() {
    const markup = createActionButtonsMarkup();
    refs.desktopActionsGrid.innerHTML = markup;
    refs.mobileActionsGrid.innerHTML = markup;
  }

  function renderBitSection(container, indices) {
    container.innerHTML = indices.map((index) => createBitMarkup(index)).join("");
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
      `<div class="gpio-bit-toggle" data-kind="${metadata.kind}" data-on="${isOn}">`,
      '<label class="aqua-checkbox">',
      `<input type="checkbox" data-bit-index="${index}" ${isOn ? "checked" : ""} aria-label="${metadata.label} bit ${index}">`,
      '<span class="aqua-checkbox-control"><span class="aqua-checkbox-left"></span><span class="aqua-checkbox-right"></span></span>',
      "</label>",
      '<div class="gpio-bit-toggle-layout">',
      `<span class="gpio-bit-label">${metadata.label}</span>`,
      `<span class="gpio-bit-index">Bit ${index}</span>`,
      `<span class="gpio-bit-state">${isOn ? "On" : "Off"}</span>`,
      "</div>",
      "</div>"
    ].join("");
  }

  function syncBitToggleElement(toggle, index) {
    const metadata = getBitMetadata(index);
    const isOn = state.bits[index];
    const input = toggle.querySelector("input[data-bit-index]");
    const label = toggle.querySelector(".gpio-bit-label");
    const bitIndex = toggle.querySelector(".gpio-bit-index");
    const bitState = toggle.querySelector(".gpio-bit-state");

    toggle.dataset.kind = metadata.kind;
    toggle.dataset.on = String(isOn);

    if (input) {
      input.checked = isOn;
      input.setAttribute("aria-label", `${metadata.label} bit ${index}`);
    }

    if (label) {
      label.textContent = metadata.label;
    }

    if (bitIndex) {
      bitIndex.textContent = `Bit ${index}`;
    }

    if (bitState) {
      bitState.textContent = isOn ? "On" : "Off";
    }
  }

  function syncRenderedBitToggles() {
    refs.tool.querySelectorAll(".gpio-bit-toggle input[data-bit-index]").forEach((input) => {
      const toggle = input.closest(".gpio-bit-toggle");

      if (toggle) {
        syncBitToggleElement(toggle, Number(input.dataset.bitIndex));
      }
    });
  }

  function syncFloatingUiState() {
    refs.compactSummary.classList.toggle("is-visible", state.isCompactSummaryVisible);
    refs.compactSummary.setAttribute("aria-hidden", String(!state.isCompactSummaryVisible));

    refs.mobileActionsBackdrop.classList.toggle("is-visible", state.isMobileActionsOpen);
    refs.mobileActionsBackdrop.setAttribute("aria-hidden", String(!state.isMobileActionsOpen));

    refs.mobileActionsTray.classList.toggle("is-visible", state.isMobileActionsOpen);
    refs.mobileActionsTray.setAttribute("aria-hidden", String(!state.isMobileActionsOpen));

    const trigger = refs.compactSummary.querySelector("[data-action='toggle-mobile-actions']");
    if (trigger) {
      trigger.setAttribute("aria-expanded", String(state.isMobileActionsOpen));
    }
  }

  function setCompactSummaryVisible(visible) {
    const nextVisible = Boolean(visible);

    if (state.isCompactSummaryVisible === nextVisible) {
      return;
    }

    state.isCompactSummaryVisible = nextVisible;

    if (!nextVisible && state.isMobileActionsOpen) {
      state.isMobileActionsOpen = false;
    }

    syncFloatingUiState();
  }

  function setMobileActionsOpen(open) {
    const nextOpen = Boolean(open) && state.isCompactSummaryVisible && isMobileViewport();

    if (state.isMobileActionsOpen === nextOpen) {
      syncFloatingUiState();
      return;
    }

    state.isMobileActionsOpen = nextOpen;
    syncFloatingUiState();
  }

  function getSummaryVisibilityTarget() {
    const hexValue = refs.valueStack?.querySelector(".gpio-value-code[data-kind='hex']");

    return hexValue?.closest(".gpio-value-row") || refs.summaryPanel;
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

    if (actionButton && refs.scope.contains(actionButton)) {
      handleAction(actionButton.dataset.action);
      return;
    }

    if (!state.isMobileActionsOpen) {
      return;
    }

    const clickedInsideTray = event.target.closest("#gpio-mobile-actions-tray");
    const clickedTrayToggle = event.target.closest("[data-action='toggle-mobile-actions']");

    if (!clickedInsideTray && !clickedTrayToggle) {
      setMobileActionsOpen(false);
    }
  }

  function handleKeydown(event) {
    if (event.key === "Escape" && state.isMobileActionsOpen) {
      setMobileActionsOpen(false);
    }
  }

  function handleChange(event) {
    const bitInput = event.target.closest("input[data-bit-index]");
    if (!bitInput) {
      return;
    }

    const index = Number(bitInput.dataset.bitIndex);
    const toggle = bitInput.closest(".gpio-bit-toggle");

    state.bits = toggleBitAt(state.bits, index);

    if (toggle) {
      syncBitToggleElement(toggle, index);
    }

    renderDerivedValues();
  }

  function handleBitToggleClick(event) {
    const toggle = event.target.closest(".gpio-bit-toggle");
    if (!toggle || !refs.tool.contains(toggle)) {
      return;
    }

    if (event.target.closest(".aqua-checkbox")) {
      return;
    }

    const input = toggle.querySelector("input[data-bit-index]");
    if (!input) {
      return;
    }

    input.click();
  }

  function handleAction(actionKey) {
    if (actionKey === "toggle-mobile-actions") {
      setMobileActionsOpen(!state.isMobileActionsOpen);
      return;
    }

    const groupAction = ACTIONS.find((action) => action.key === actionKey && Array.isArray(action.indices));

    if (groupAction) {
      state.bits = toggleBitGroup(state.bits, groupAction.indices);
      renderDerivedValues();
      syncRenderedBitToggles();
      setMobileActionsOpen(false);
      return;
    }

    if (actionKey === "invert") {
      state.bits = invertBitMask(state.bits);
      renderDerivedValues();
      syncRenderedBitToggles();
      setMobileActionsOpen(false);
      return;
    }

    if (actionKey === "clear") {
      state.bits = clearAllBits();
      renderDerivedValues();
      syncRenderedBitToggles();
      setMobileActionsOpen(false);
      return;
    }

    if (actionKey === "shift-left") {
      state.bits = shiftBitsLeft(state.bits);
      renderDerivedValues();
      syncRenderedBitToggles();
      setMobileActionsOpen(false);
      return;
    }

    if (actionKey === "shift-right") {
      state.bits = shiftBitsRight(state.bits);
      renderDerivedValues();
      syncRenderedBitToggles();
      setMobileActionsOpen(false);
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
      setMobileActionsOpen(false);
    } else {
      syncFloatingUiState();
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
    refs.mobileActionsBackdrop = document.getElementById("gpio-mobile-actions-backdrop");
    refs.mobileActionsTray = document.getElementById("gpio-mobile-actions-tray");
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
      !refs.mobileActionsBackdrop ||
      !refs.mobileActionsTray ||
      !refs.toast
    ) {
      return;
    }

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleKeydown);
    refs.tool.addEventListener("click", handleBitToggleClick);
    refs.tool.addEventListener("change", handleChange);

    if (refs.mobileQuery) {
      if (typeof refs.mobileQuery.addEventListener === "function") {
        refs.mobileQuery.addEventListener("change", handleViewportChange);
      } else if (typeof refs.mobileQuery.addListener === "function") {
        refs.mobileQuery.addListener(handleViewportChange);
      }
    }

    renderAll();
    syncFloatingUiState();
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

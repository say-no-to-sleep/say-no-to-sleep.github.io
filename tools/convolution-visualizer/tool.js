(function () {
  "use strict";

  const VIEWBOX_WIDTH = 760;
  const VIEWBOX_HEIGHT = 220;
  const PAD_X = 34;
  const PAD_Y = 24;
  const DOMAIN_MIN = -6;
  const DOMAIN_MAX = 6;
  const SAMPLE_COUNT = 600;
  const DT = (DOMAIN_MAX - DOMAIN_MIN) / SAMPLE_COUNT;
  const COMPUTE_PADDING = DOMAIN_MAX - DOMAIN_MIN;
  const COMPUTE_MIN = DOMAIN_MIN - COMPUTE_PADDING;
  const COMPUTE_MAX = DOMAIN_MAX + COMPUTE_PADDING;
  const COMPUTE_SAMPLE_COUNT = Math.round((COMPUTE_MAX - COMPUTE_MIN) / DT);
  const TS = Array.from({ length: SAMPLE_COUNT }, (_, index) => DOMAIN_MIN + index * DT);
  const COMPUTE_TS = Array.from({ length: COMPUTE_SAMPLE_COUNT }, (_, index) => COMPUTE_MIN + index * DT);
  const DISPLAY_SAMPLE_OFFSET = Math.round((DOMAIN_MIN - COMPUTE_MIN) / DT);
  const X_TICKS = [-4, -2, 0, 2, 4];
  const SCREEN_RADIUS = 16;
  const PRESETS = [
    { key: "rect-rect", label: "rect * rect", f: "rect(t)", g: "rect(t)" },
    { key: "exp-rect", label: "exp * rect", f: "exp(-t) * u(t)", g: "rect(t)" },
    { key: "exp-exp", label: "exp * exp", f: "exp(-t) * u(t)", g: "exp(-t) * u(t)" },
    { key: "sin-rect", label: "sin * rect", f: "sin(2*pi*t)", g: "rect(t/4)" },
    { key: "tri-rect", label: "tri * rect", f: "tri(t)", g: "rect(t)" },
    { key: "gauss-gauss", label: "gauss * gauss", f: "exp(-t^2)", g: "exp(-t^2)" }
  ];
  const COLORS = {
    f: "#3f9ac2",
    g: "#8c72cf",
    product: "#c79227",
    output: "#59a06e",
    ghost: "#59a06e"
  };

  const state = {
    fExpr: PRESETS[0].f,
    gExpr: PRESETS[0].g,
    cursorT: 0,
    activePresetKey: PRESETS[0].key,
    dragging: false
  };

  const cache = {
    key: "",
    fCompiled: null,
    gCompiled: null,
    fSamples: createZeroArray(COMPUTE_SAMPLE_COUNT),
    gSamples: createZeroArray(COMPUTE_SAMPLE_COUNT),
    convSamples: createZeroArray(COMPUTE_SAMPLE_COUNT),
    fViewSamples: createZeroArray(),
    gViewSamples: createZeroArray(),
    convViewSamples: createZeroArray()
  };

  const refs = {};

  function createZeroArray(count) {
    return Array(count || SAMPLE_COUNT).fill(0);
  }

  function init() {
    refs.tool = document.getElementById("conv-tool");
    refs.presetList = document.getElementById("conv-preset-list");
    refs.fInput = document.getElementById("conv-f-input");
    refs.gInput = document.getElementById("conv-g-input");
    refs.fWrap = document.getElementById("conv-f-wrap");
    refs.gWrap = document.getElementById("conv-g-wrap");
    refs.fError = document.getElementById("conv-f-error");
    refs.gError = document.getElementById("conv-g-error");
    refs.scrub = document.getElementById("conv-time-scrub");
    refs.scrubValue = document.getElementById("conv-scrub-value");
    refs.fPlot = document.getElementById("conv-f-plot");
    refs.gPlot = document.getElementById("conv-g-plot");
    refs.overlapPlot = document.getElementById("conv-overlap-plot");
    refs.outputPlot = document.getElementById("conv-output-plot");

    if (
      !refs.tool ||
      !refs.presetList ||
      !refs.fInput ||
      !refs.gInput ||
      !refs.fWrap ||
      !refs.gWrap ||
      !refs.fError ||
      !refs.gError ||
      !refs.scrub ||
      !refs.scrubValue ||
      !refs.fPlot ||
      !refs.gPlot ||
      !refs.overlapPlot ||
      !refs.outputPlot
    ) {
      return;
    }

    refs.fInput.value = state.fExpr;
    refs.gInput.value = state.gExpr;

    refs.presetList.addEventListener("click", handlePresetClick);
    refs.fInput.addEventListener("input", handleExpressionInput);
    refs.gInput.addEventListener("input", handleExpressionInput);
    refs.scrub.addEventListener("input", handleScrubInput);
    refs.overlapPlot.addEventListener("pointerdown", handlePointerDown);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    renderAll();
  }

  function handlePresetClick(event) {
    const button = event.target.closest("[data-preset-key]");

    if (!button || !refs.presetList.contains(button)) {
      return;
    }

    const preset = PRESETS.find((entry) => entry.key === button.dataset.presetKey);

    if (!preset) {
      return;
    }

    state.fExpr = preset.f;
    state.gExpr = preset.g;
    state.cursorT = 0;
    state.activePresetKey = preset.key;

    refs.fInput.value = state.fExpr;
    refs.gInput.value = state.gExpr;
    refs.scrub.value = String(state.cursorT);

    renderAll();
  }

  function handleExpressionInput(event) {
    if (event.target === refs.fInput) {
      state.fExpr = refs.fInput.value;
    } else if (event.target === refs.gInput) {
      state.gExpr = refs.gInput.value;
    }

    state.activePresetKey = findMatchingPresetKey(state.fExpr, state.gExpr);
    renderAll();
  }

  function handleScrubInput() {
    state.cursorT = clamp(parseFloat(refs.scrub.value), DOMAIN_MIN, DOMAIN_MAX);
    renderDynamicViews();
  }

  function handlePointerDown(event) {
    event.preventDefault();
    state.dragging = true;
    updateCursorFromClientX(event.clientX);
  }

  function handlePointerMove(event) {
    if (!state.dragging) {
      return;
    }

    updateCursorFromClientX(event.clientX);
  }

  function handlePointerUp() {
    state.dragging = false;
  }

  function updateCursorFromClientX(clientX) {
    const rect = refs.overlapPlot.getBoundingClientRect();

    if (!rect.width) {
      return;
    }

    const viewX = ((clientX - rect.left) / rect.width) * VIEWBOX_WIDTH;
    state.cursorT = clamp(viewXToTime(viewX), DOMAIN_MIN, DOMAIN_MAX);
    renderDynamicViews();
  }

  function renderAll() {
    updateSignalCache();
    renderPresetButtons();
    syncExpressionState();
    renderStaticViews();
    renderDynamicViews();
  }

  function renderStaticViews() {
    refs.fPlot.innerHTML = createSignalPlotMarkup("signal-f", "f(t)", cache.fViewSamples, COLORS.f);
    refs.gPlot.innerHTML = createSignalPlotMarkup("signal-g", "g(t)", cache.gViewSamples, COLORS.g);
  }

  function renderDynamicViews() {
    const shiftedSamples = buildShiftedSignal(cache.gSamples, state.cursorT);
    const productSamples = cache.fViewSamples.map((value, index) => value * shiftedSamples[index]);
    const currentIndex = timeToSampleIndex(state.cursorT);
    const currentOutput = cache.convViewSamples[currentIndex] || 0;

    syncScrubPresentation();
    refs.overlapPlot.innerHTML = createOverlapPlotMarkup(shiftedSamples, productSamples);
    refs.outputPlot.innerHTML = createOutputPlotMarkup(cache.convViewSamples, currentIndex, currentOutput);
  }

  function updateSignalCache() {
    const nextKey = `${normalizeExpression(state.fExpr)}|||${normalizeExpression(state.gExpr)}`;

    if (cache.key === nextKey) {
      return;
    }

    cache.key = nextKey;
    cache.fCompiled = compileExpression(state.fExpr);
    cache.gCompiled = compileExpression(state.gExpr);
    cache.fSamples = sampleExpression(cache.fCompiled, COMPUTE_TS);
    cache.gSamples = sampleExpression(cache.gCompiled, COMPUTE_TS);
    cache.convSamples = convolve(cache.fSamples, cache.gSamples, COMPUTE_MIN);
    cache.fViewSamples = sliceDisplaySamples(cache.fSamples);
    cache.gViewSamples = sliceDisplaySamples(cache.gSamples);
    cache.convViewSamples = sliceDisplaySamples(cache.convSamples);
  }

  function renderPresetButtons() {
    refs.presetList.innerHTML = PRESETS.map((preset) => {
      return `<button type="button" class="conv-preset-button" data-preset-key="${preset.key}" data-selected="${preset.key === state.activePresetKey}">${preset.label}</button>`;
    }).join("");
  }

  function syncExpressionState() {
    syncExpressionField(refs.fWrap, refs.fError, cache.fCompiled);
    syncExpressionField(refs.gWrap, refs.gError, cache.gCompiled);
  }

  function syncExpressionField(wrap, errorNode, compiled) {
    const hasError = Boolean(compiled.error);
    wrap.dataset.error = String(hasError);
    errorNode.hidden = !hasError;
  }

  function syncScrubPresentation() {
    refs.scrub.value = String(state.cursorT);
    refs.scrubValue.textContent = formatSigned(state.cursorT, 2);

    const percent = ((state.cursorT - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN)) * 100;
    refs.scrub.style.setProperty("--conv-range-fill", `${percent}%`);
  }

  function createSignalPlotMarkup(plotKey, label, samples, color) {
    const bounds = getSeriesBounds([samples]);
    const linePath = buildSeriesPath(samples, bounds);
    const fillPath = buildAreaPath(samples, bounds);
    const grid = createGridMarkup(bounds);
    const ids = getPlotPaintIds(plotKey);

    return createSvgMarkup(
      ids,
      grid.plot +
      createAreaLayerMarkup(fillPath, color, 0.1, "conv-trace-fill") +
      createTraceMarkup(linePath, color, ids, {
        mainWidth: 2.35,
        glowWidth: 7.2,
        glowOpacity: 0.32
      }),
      grid.labels,
      `${label} plot`
    );
  }

  function createOverlapPlotMarkup(shiftedSamples, productSamples) {
    const bounds = getSeriesBounds([cache.fViewSamples, shiftedSamples, productSamples]);
    const fPath = buildSeriesPath(cache.fViewSamples, bounds);
    const gPath = buildSeriesPath(shiftedSamples, bounds);
    const areaPath = buildAreaPath(productSamples, bounds);
    const cursorX = timeToViewX(state.cursorT);
    const grid = createGridMarkup(bounds);
    const ids = getPlotPaintIds("overlap");

    return createSvgMarkup(
      ids,
      grid.plot +
      createAreaLayerMarkup(areaPath, COLORS.product, 0.16, "conv-product-fill") +
      createTraceMarkup(fPath, COLORS.f, ids, {
        mainWidth: 2.1,
        glowWidth: 6.2,
        glowOpacity: 0.18,
        mainOpacity: 0.7
      }) +
      createTraceMarkup(gPath, COLORS.g, ids, {
        mainWidth: 2.45,
        glowWidth: 7.1,
        glowOpacity: 0.32
      }) +
      `<line class="conv-cursor-line" x1="${cursorX}" y1="${PAD_Y}" x2="${cursorX}" y2="${VIEWBOX_HEIGHT - PAD_Y}" />` +
      createValueChipMarkup(ids, cursorX, PAD_Y + 16, `t ${formatSigned(state.cursorT, 2)}`),
      grid.labels,
      "Overlap plot"
    );
  }

  function createOutputPlotMarkup(samples, currentIndex, currentOutput) {
    const bounds = getSeriesBounds([samples]);
    const ghostPath = buildSeriesPath(samples, bounds);
    const tracePath = buildSeriesPath(samples, bounds, currentIndex);
    const fillPath = buildAreaPath(samples, bounds, currentIndex);
    const cursorX = timeToViewX(state.cursorT);
    const dotY = valueToViewY(currentOutput, bounds);
    const chipX = clamp(cursorX + 56, PAD_X + 64, VIEWBOX_WIDTH - PAD_X - 64);
    const chipY = clamp(dotY - 18, PAD_Y + 14, VIEWBOX_HEIGHT - PAD_Y - 14);
    const grid = createGridMarkup(bounds);
    const ids = getPlotPaintIds("output");

    return createSvgMarkup(
      ids,
      grid.plot +
      createAreaLayerMarkup(fillPath, COLORS.output, 0.1, "conv-output-fill") +
      createTraceMarkup(ghostPath, COLORS.ghost, ids, {
        mainWidth: 2.15,
        glowWidth: 5.6,
        glowOpacity: 0.08,
        mainOpacity: 0.22
      }) +
      createTraceMarkup(tracePath, COLORS.output, ids, {
        mainWidth: 3.35,
        glowWidth: 8.8,
        glowOpacity: 0.36,
        strongGlow: true
      }) +
      `<line class="conv-cursor-line" x1="${cursorX}" y1="${PAD_Y}" x2="${cursorX}" y2="${VIEWBOX_HEIGHT - PAD_Y}" />` +
      `<circle class="conv-output-dot-halo" cx="${cursorX}" cy="${dotY}" r="10.5" fill="${applyAlpha(COLORS.output, 0.18)}" filter="url(#${ids.softGlow})" />` +
      `<circle class="conv-output-dot" cx="${cursorX}" cy="${dotY}" r="5.8" fill="${COLORS.output}" />` +
      createValueChipMarkup(ids, chipX, chipY, `y(t) ${formatSigned(currentOutput, 3)}`),
      grid.labels,
      "Convolution output plot"
    );
  }

  function createSvgMarkup(ids, plotContent, overlayContent, label) {
    const screenWidth = VIEWBOX_WIDTH - PAD_X * 2;
    const screenHeight = VIEWBOX_HEIGHT - PAD_Y * 2;

    return [
      `<svg class="conv-plot-svg" viewBox="0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}" role="img" aria-label="${label}">`,
      createPlotDefsMarkup(ids),
      `<rect class="conv-screen-shell" x="${PAD_X}" y="${PAD_Y}" width="${screenWidth}" height="${screenHeight}" rx="${SCREEN_RADIUS}" fill="url(#${ids.screenFill})" />`,
      `<rect class="conv-screen-gloss" x="${PAD_X}" y="${PAD_Y}" width="${screenWidth}" height="${screenHeight}" rx="${SCREEN_RADIUS}" fill="url(#${ids.screenGloss})" />`,
      `<rect class="conv-screen-stroke" x="${PAD_X}" y="${PAD_Y}" width="${screenWidth}" height="${screenHeight}" rx="${SCREEN_RADIUS}" />`,
      `<g clip-path="url(#${ids.screenClip})">${plotContent}</g>`,
      overlayContent || "",
      "</svg>"
    ].join("");
  }

  function createGridMarkup(bounds) {
    const horizontalLines = Array.from({ length: 5 }, (_, index) => {
      const y = PAD_Y + (index / 4) * (VIEWBOX_HEIGHT - PAD_Y * 2);
      return `<line class="conv-grid-line conv-grid-line-horizontal" x1="${PAD_X}" y1="${y}" x2="${VIEWBOX_WIDTH - PAD_X}" y2="${y}" />`;
    }).join("");
    const verticalLines = X_TICKS.map((tick) => {
      const x = timeToViewX(tick);
      return `<line class="conv-grid-line conv-grid-line-vertical" x1="${x}" y1="${PAD_Y}" x2="${x}" y2="${VIEWBOX_HEIGHT - PAD_Y}" />`;
    }).join("");
    const zeroY = valueToViewY(0, bounds);

    return {
      plot: [
        "<g>",
        horizontalLines,
        verticalLines,
        `<line class="conv-zero-line" x1="${PAD_X}" y1="${zeroY}" x2="${VIEWBOX_WIDTH - PAD_X}" y2="${zeroY}" />`,
        "</g>"
      ].join(""),
      labels: [
        "<g>",
        X_TICKS.map((tick) => {
          const x = timeToViewX(tick);
          return `<text class="conv-axis-label" x="${x}" y="${VIEWBOX_HEIGHT - 8}" text-anchor="middle">${tick}</text>`;
        }).join(""),
        "</g>"
      ].join("")
    };
  }

  function createValueChipMarkup(ids, centerX, centerY, label) {
    const width = Math.max(96, label.length * 7.4 + 18);
    const x = clamp(centerX - width / 2, PAD_X + 4, VIEWBOX_WIDTH - PAD_X - width - 4);
    const y = clamp(centerY - 14, PAD_Y + 4, VIEWBOX_HEIGHT - PAD_Y - 32);
    const textX = x + width / 2;
    const textY = y + 18.2;

    return [
      `<g filter="url(#${ids.chipShadow})">`,
      `<rect class="conv-value-chip" x="${x}" y="${y}" width="${width}" height="28" rx="14" fill="url(#${ids.chipFill})" />`,
      `<rect class="conv-value-chip-gloss" x="${x}" y="${y}" width="${width}" height="28" rx="14" fill="url(#${ids.chipGloss})" />`,
      "</g>",
      `<text class="conv-value-text" x="${textX}" y="${textY}" text-anchor="middle">${label}</text>`
    ].join("");
  }

  function createPlotDefsMarkup(ids) {
    return [
      "<defs>",
      `<linearGradient id="${ids.screenFill}" x1="0" y1="0" x2="0" y2="1">`,
      '<stop offset="0%" stop-color="#fcfdff" />',
      '<stop offset="54%" stop-color="#edf2f6" />',
      '<stop offset="100%" stop-color="#dde5ec" />',
      "</linearGradient>",
      `<linearGradient id="${ids.screenGloss}" x1="0" y1="0" x2="0" y2="1">`,
      '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.68" />',
      '<stop offset="22%" stop-color="#ffffff" stop-opacity="0.18" />',
      '<stop offset="23%" stop-color="#ffffff" stop-opacity="0" />',
      '<stop offset="100%" stop-color="#ffffff" stop-opacity="0" />',
      "</linearGradient>",
      `<linearGradient id="${ids.chipFill}" x1="0" y1="0" x2="0" y2="1">`,
      '<stop offset="0%" stop-color="#fdfefe" stop-opacity="0.95" />',
      '<stop offset="52%" stop-color="#edf2f6" stop-opacity="0.94" />',
      '<stop offset="100%" stop-color="#dbe4ec" stop-opacity="0.96" />',
      "</linearGradient>",
      `<linearGradient id="${ids.chipGloss}" x1="0" y1="0" x2="0" y2="1">`,
      '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.74" />',
      '<stop offset="48%" stop-color="#ffffff" stop-opacity="0.12" />',
      '<stop offset="49%" stop-color="#ffffff" stop-opacity="0" />',
      '<stop offset="100%" stop-color="#ffffff" stop-opacity="0" />',
      "</linearGradient>",
      `<filter id="${ids.softGlow}" x="-20%" y="-40%" width="140%" height="180%" color-interpolation-filters="sRGB">`,
      '<feGaussianBlur in="SourceGraphic" stdDeviation="3.2" />',
      "</filter>",
      `<filter id="${ids.strongGlow}" x="-24%" y="-44%" width="148%" height="188%" color-interpolation-filters="sRGB">`,
      '<feGaussianBlur in="SourceGraphic" stdDeviation="4.6" />',
      "</filter>",
      `<filter id="${ids.chipShadow}" x="-22%" y="-50%" width="144%" height="200%" color-interpolation-filters="sRGB">`,
      '<feDropShadow dx="0" dy="1.2" stdDeviation="1.8" flood-color="#697d8f" flood-opacity="0.22" />',
      "</filter>",
      `<clipPath id="${ids.screenClip}">`,
      `<rect x="${PAD_X}" y="${PAD_Y}" width="${VIEWBOX_WIDTH - PAD_X * 2}" height="${VIEWBOX_HEIGHT - PAD_Y * 2}" rx="${SCREEN_RADIUS}" />`,
      "</clipPath>",
      "</defs>"
    ].join("");
  }

  function createAreaLayerMarkup(path, color, opacity, className) {
    if (!path) {
      return "";
    }

    return `<path class="${className}" d="${path}" fill="${applyAlpha(color, opacity)}" />`;
  }

  function createTraceMarkup(path, color, ids, options) {
    if (!path) {
      return "";
    }

    const config = options || {};
    const mainWidth = config.mainWidth || 2.4;
    const glowWidth = config.glowWidth || mainWidth + 4;
    const glowOpacity = config.glowOpacity == null ? 0.28 : config.glowOpacity;
    const mainOpacity = config.mainOpacity == null ? 1 : config.mainOpacity;
    const filterId = config.strongGlow ? ids.strongGlow : ids.softGlow;

    return [
      `<path class="conv-trace-halo" d="${path}" fill="none" stroke="${applyAlpha(color, glowOpacity)}" stroke-width="${glowWidth}" stroke-linejoin="round" stroke-linecap="round" filter="url(#${filterId})" />`,
      `<path class="conv-trace-line" d="${path}" fill="none" stroke="${applyAlpha(color, mainOpacity)}" stroke-width="${mainWidth}" stroke-linejoin="round" stroke-linecap="round" />`
    ].join("");
  }

  function getPlotPaintIds(plotKey) {
    const safeKey = String(plotKey || "plot")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-");

    return {
      screenFill: `conv-screen-fill-${safeKey}`,
      screenGloss: `conv-screen-gloss-${safeKey}`,
      screenClip: `conv-screen-clip-${safeKey}`,
      softGlow: `conv-glow-soft-${safeKey}`,
      strongGlow: `conv-glow-strong-${safeKey}`,
      chipFill: `conv-chip-fill-${safeKey}`,
      chipGloss: `conv-chip-gloss-${safeKey}`,
      chipShadow: `conv-chip-shadow-${safeKey}`
    };
  }

  function getSeriesBounds(seriesList) {
    let min = 0;
    let max = 0;

    seriesList.forEach((series) => {
      series.forEach((value) => {
        if (!Number.isFinite(value)) {
          return;
        }

        min = Math.min(min, value);
        max = Math.max(max, value);
      });
    });

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return { min: -1, max: 1 };
    }

    if (Math.abs(max - min) < 1e-6) {
      const base = Math.max(Math.abs(max), 1);
      return { min: -base * 1.15, max: base * 1.15 };
    }

    const pad = (max - min) * 0.18 + 0.08;
    return { min: min - pad, max: max + pad };
  }

  function buildSeriesPath(values, bounds, limitIndex) {
    let path = "";
    let penUp = true;
    const maxIndex = typeof limitIndex === "number" ? Math.min(limitIndex, values.length - 1) : values.length - 1;

    for (let index = 0; index <= maxIndex; index += 1) {
      const value = values[index];

      if (!Number.isFinite(value)) {
        penUp = true;
        continue;
      }

      const x = timeToViewX(TS[index]);
      const y = valueToViewY(value, bounds);
      path += `${penUp ? "M" : " L"}${x.toFixed(2)},${y.toFixed(2)}`;
      penUp = false;
    }

    return path;
  }

  function buildAreaPath(values, bounds, limitIndex) {
    const maxIndex = typeof limitIndex === "number" ? Math.min(limitIndex, values.length - 1) : values.length - 1;

    if (maxIndex < 0) {
      return "";
    }

    const baseline = valueToViewY(0, bounds);
    let path = `M${timeToViewX(TS[0]).toFixed(2)},${baseline.toFixed(2)}`;

    for (let index = 0; index <= maxIndex; index += 1) {
      const value = values[index];
      const x = timeToViewX(TS[index]);
      const y = valueToViewY(Number.isFinite(value) ? value : 0, bounds);
      path += ` L${x.toFixed(2)},${y.toFixed(2)}`;
    }

    path += ` L${timeToViewX(TS[maxIndex]).toFixed(2)},${baseline.toFixed(2)}`;
    path += ` L${timeToViewX(TS[0]).toFixed(2)},${baseline.toFixed(2)}`;

    return `${path} Z`;
  }

  function buildShiftedSignal(samples, cursorT) {
    return TS.map((tau) => {
      const shiftedIndex = Math.round((cursorT - tau - COMPUTE_MIN) / DT);

      if (shiftedIndex < 0 || shiftedIndex >= samples.length) {
        return 0;
      }

      return samples[shiftedIndex];
    });
  }

  function convolve(fSamples, gSamples, domainMin) {
    const sampleCount = Math.min(fSamples.length, gSamples.length);
    const result = createZeroArray(sampleCount);
    const offset = Math.round(-((domainMin == null ? DOMAIN_MIN : domainMin)) / DT);

    for (let n = 0; n < sampleCount; n += 1) {
      let sum = 0;

      for (let k = 0; k < sampleCount; k += 1) {
        const shiftedIndex = n - k + offset;

        if (shiftedIndex >= 0 && shiftedIndex < sampleCount) {
          sum += fSamples[k] * gSamples[shiftedIndex];
        }
      }

      result[n] = sum * DT;
    }

    return result;
  }

  function sampleExpression(compiled, times) {
    const sampleTimes = times || TS;

    if (compiled.error || !compiled.ast) {
      return createZeroArray(sampleTimes.length);
    }

    return sampleTimes.map((time) => {
      try {
        const value = evaluateAst(compiled.ast, {
          t: time,
          x: time
        });
        return Number.isFinite(value) ? value : 0;
      } catch (_error) {
        return 0;
      }
    });
  }

  function compileExpression(expression) {
    const trimmed = String(expression || "").trim();

    if (!trimmed) {
      return { ast: null, error: "Enter an expression." };
    }

    try {
      const tokens = tokenize(trimmed);
      const ast = parseExpressionTokens(tokens);
      return { ast, error: null };
    } catch (error) {
      return {
        ast: null,
        error: error instanceof Error ? error.message : "Invalid expression."
      };
    }
  }

  function tokenize(expression) {
    const tokens = [];
    let index = 0;

    while (index < expression.length) {
      const character = expression[index];

      if (/\s/.test(character)) {
        index += 1;
        continue;
      }

      if (/\d/.test(character) || (character === "." && /\d/.test(expression[index + 1] || ""))) {
        let literal = character;
        index += 1;

        while (index < expression.length && /[\d.]/.test(expression[index])) {
          literal += expression[index];
          index += 1;
        }

        const value = Number(literal);

        if (!Number.isFinite(value)) {
          throw new Error("Invalid number literal.");
        }

        tokens.push({ type: "number", value });
        continue;
      }

      if (/[A-Za-z_]/.test(character)) {
        let identifier = character;
        index += 1;

        while (index < expression.length && /[A-Za-z0-9_]/.test(expression[index])) {
          identifier += expression[index];
          index += 1;
        }

        tokens.push({ type: "identifier", value: identifier.toLowerCase() });
        continue;
      }

      if ("+-*/^".includes(character)) {
        tokens.push({ type: "operator", value: character });
        index += 1;
        continue;
      }

      if (character === "(" || character === ")") {
        tokens.push({ type: "paren", value: character });
        index += 1;
        continue;
      }

      throw new Error(`Unsupported character "${character}".`);
    }

    return tokens;
  }

  function parseExpressionTokens(tokens) {
    if (tokens.length === 0) {
      throw new Error("Expression is empty.");
    }

    let position = 0;

    function peek() {
      return tokens[position] || null;
    }

    function match(type, value) {
      const token = peek();

      if (!token || token.type !== type || (value !== undefined && token.value !== value)) {
        return null;
      }

      position += 1;
      return token;
    }

    function expect(type, value, message) {
      const token = match(type, value);

      if (!token) {
        throw new Error(message || "Unexpected token.");
      }

      return token;
    }

    function parseExpression() {
      return parseAdditive();
    }

    function parseAdditive() {
      let node = parseMultiplicative();

      while (true) {
        const operator = match("operator", "+") || match("operator", "-");

        if (!operator) {
          break;
        }

        node = {
          type: "binary",
          operator: operator.value,
          left: node,
          right: parseMultiplicative()
        };
      }

      return node;
    }

    function parseMultiplicative() {
      let node = parseUnary();

      while (true) {
        const operator = match("operator", "*") || match("operator", "/");

        if (!operator) {
          break;
        }

        node = {
          type: "binary",
          operator: operator.value,
          left: node,
          right: parseUnary()
        };
      }

      return node;
    }

    function parseUnary() {
      const operator = match("operator", "+") || match("operator", "-");

      if (operator) {
        return {
          type: "unary",
          operator: operator.value,
          argument: parseUnary()
        };
      }

      return parsePower();
    }

    function parsePower() {
      let node = parsePrimary();

      if (match("operator", "^")) {
        node = {
          type: "binary",
          operator: "^",
          left: node,
          right: parseUnary()
        };
      }

      return node;
    }

    function parsePrimary() {
      const token = peek();

      if (!token) {
        throw new Error("Unexpected end of expression.");
      }

      if (token.type === "number") {
        position += 1;
        return { type: "literal", value: token.value };
      }

      if (token.type === "identifier") {
        position += 1;
        const name = token.value;

        if (match("paren", "(")) {
          const argument = parseExpression();
          expect("paren", ")", `Missing closing ")" after ${name}.`);
          return { type: "call", name, argument };
        }

        return { type: "identifier", name };
      }

      if (match("paren", "(")) {
        const node = parseExpression();
        expect("paren", ")", 'Missing closing ")".');
        return node;
      }

      throw new Error(`Unexpected token "${token.value}".`);
    }

    const ast = parseExpression();

    if (position < tokens.length) {
      throw new Error(`Unexpected token "${tokens[position].value}".`);
    }

    return ast;
  }

  function evaluateAst(node, scope) {
    switch (node.type) {
      case "literal":
        return node.value;
      case "identifier":
        return evaluateIdentifier(node.name, scope);
      case "unary":
        return node.operator === "-" ? -evaluateAst(node.argument, scope) : evaluateAst(node.argument, scope);
      case "binary":
        return evaluateBinary(node, scope);
      case "call":
        return evaluateCall(node, scope);
      default:
        throw new Error("Unsupported expression node.");
    }
  }

  function evaluateIdentifier(name, scope) {
    if (name === "t" || name === "x") {
      return scope.t;
    }

    if (name === "pi") {
      return Math.PI;
    }

    if (name === "e") {
      return Math.E;
    }

    throw new Error(`Unknown identifier "${name}".`);
  }

  function evaluateBinary(node, scope) {
    const left = evaluateAst(node.left, scope);
    const right = evaluateAst(node.right, scope);

    switch (node.operator) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        return right === 0 ? 0 : left / right;
      case "^":
        return Math.pow(left, right);
      default:
        throw new Error(`Unsupported operator "${node.operator}".`);
    }
  }

  function evaluateCall(node, scope) {
    const argument = evaluateAst(node.argument, scope);

    switch (node.name) {
      case "sin":
        return Math.sin(argument);
      case "cos":
        return Math.cos(argument);
      case "exp":
        return Math.exp(argument);
      case "abs":
        return Math.abs(argument);
      case "u":
        return argument >= 0 ? 1 : 0;
      case "rect":
        return Math.abs(argument) <= 0.5 ? 1 : 0;
      case "tri":
        return Math.abs(argument) <= 1 ? 1 - Math.abs(argument) : 0;
      default:
        throw new Error(`Unsupported function "${node.name}".`);
    }
  }

  function normalizeExpression(expression) {
    return String(expression || "")
      .replace(/\s+/g, "")
      .toLowerCase();
  }

  function findMatchingPresetKey(fExpression, gExpression) {
    const normalizedF = normalizeExpression(fExpression);
    const normalizedG = normalizeExpression(gExpression);
    const match = PRESETS.find((preset) => {
      return normalizeExpression(preset.f) === normalizedF && normalizeExpression(preset.g) === normalizedG;
    });

    return match ? match.key : "";
  }

  function valueToViewY(value, bounds) {
    const range = bounds.max - bounds.min || 1;
    return VIEWBOX_HEIGHT - PAD_Y - ((value - bounds.min) / range) * (VIEWBOX_HEIGHT - PAD_Y * 2);
  }

  function timeToViewX(time) {
    return PAD_X + ((time - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN)) * (VIEWBOX_WIDTH - PAD_X * 2);
  }

  function viewXToTime(viewX) {
    return DOMAIN_MIN + ((viewX - PAD_X) / (VIEWBOX_WIDTH - PAD_X * 2)) * (DOMAIN_MAX - DOMAIN_MIN);
  }

  function timeToSampleIndex(time) {
    return clampInteger(Math.round((time - DOMAIN_MIN) / DT), 0, SAMPLE_COUNT - 1);
  }

  function clamp(value, minValue, maxValue) {
    return Math.max(minValue, Math.min(maxValue, value));
  }

  function clampInteger(value, minValue, maxValue) {
    return Math.max(minValue, Math.min(maxValue, value));
  }

  function formatSigned(value, decimals) {
    const safeValue = Math.abs(value) < 10 ** (-(decimals + 1)) ? 0 : value;
    return safeValue.toFixed(decimals);
  }

  function sliceDisplaySamples(samples) {
    return samples.slice(DISPLAY_SAMPLE_OFFSET, DISPLAY_SAMPLE_OFFSET + SAMPLE_COUNT);
  }

  function applyAlpha(color, alpha) {
    const safeAlpha = Math.max(0, Math.min(1, alpha));
    const hexMatch = /^#([a-f\d]{3}|[a-f\d]{6})$/i.exec(color);

    if (hexMatch) {
      const normalized = hexMatch[1].length === 3
        ? hexMatch[1].split("").map((character) => character + character).join("")
        : hexMatch[1];
      const red = parseInt(normalized.slice(0, 2), 16);
      const green = parseInt(normalized.slice(2, 4), 16);
      const blue = parseInt(normalized.slice(4, 6), 16);
      return `rgba(${red}, ${green}, ${blue}, ${safeAlpha})`;
    }

    const rgbMatch = /^rgba?\(([^)]+)\)$/i.exec(color);

    if (rgbMatch) {
      const parts = rgbMatch[1].split(",").map((part) => part.trim());

      if (parts.length >= 3) {
        return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${safeAlpha})`;
      }
    }

    return color;
  }

  const api = {
    PRESETS,
    DOMAIN_MIN,
    DOMAIN_MAX,
    SAMPLE_COUNT,
    COMPUTE_SAMPLE_COUNT,
    DT,
    tokenize,
    compileExpression,
    sampleExpression,
    convolve,
    evaluateAst
  };

  globalThis.ConvolutionVisualizer = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", init);
  }
}());

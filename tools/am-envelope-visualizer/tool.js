(function () {
  "use strict";

  const PAD = 14;
  const SAMPLES = 1400;
  const CONTROL_CONFIG = {
    fm: { decimals: 1, suffix: " Hz", fromInternal: (value) => value / 2 },
    fc: { decimals: 0, suffix: " Hz", fromInternal: (value) => value * 5 },
    m: { decimals: 2, suffix: "", fromInternal: (value) => value / 20 },
    tau: { decimals: 3, suffix: " s", fromInternal: (value) => value / 200 }
  };
  const STAGE_COLORS = {
    msg: "#7a5cc4",
    scaled: "#9568d4",
    env: "#c79227",
    carrier: "#d48a2c",
    am: "#3f9ac2",
    det: "#59a06e",
    warning: "#b25544"
  };

  const state = {
    fm: 3,
    fc: 40,
    m: 0.7,
    tau: 0.08,
    isCompactSummaryVisible: false
  };

  const refs = {
    tool: document.getElementById("am-tool"),
    summaryPanel: document.getElementById("am-status-panel"),
    compactSummary: document.getElementById("am-compact-summary"),
    ratioCard: document.querySelector('[data-status-card="ratio"]'),
    envelopeCard: document.querySelector('[data-status-card="envelope"]'),
    detectorCard: document.querySelector('[data-status-card="detector"]'),
    ratioValue: document.getElementById("am-ratio-value"),
    ratioNote: document.getElementById("am-ratio-note"),
    envelopeValue: document.getElementById("am-envelope-value"),
    envelopeNote: document.getElementById("am-envelope-note"),
    detectorValue: document.getElementById("am-detector-value"),
    detectorNote: document.getElementById("am-detector-note"),
    envelopeInlineNote: document.getElementById("am-envelope-inline-note"),
    controlWraps: {
      m: document.getElementById("am-m-control-wrap"),
      tau: document.getElementById("am-tau-control-wrap")
    },
    inputs: {},
    outputs: {},
    canvases: {}
  };

  let resizeObserver = null;
  let renderFrameId = 0;

  function init() {
    if (!refs.tool || !refs.summaryPanel || !refs.compactSummary) {
      return;
    }

    refs.tool.querySelectorAll("[data-control]").forEach((input) => {
      const control = input.dataset.control;
      refs.inputs[control] = input;
      refs.outputs[control] = document.getElementById(`am-${control}-value`);
      bindSlider(input, control);
    });

    refs.tool.querySelectorAll("[data-canvas]").forEach((canvas) => {
      refs.canvases[canvas.dataset.canvas] = canvas;
    });

    Object.keys(refs.inputs).forEach((control) => {
      state[control] = controlValueFromInternal(control, getSliderIntegerValue(refs.inputs[control]));
      syncControlPresentation(control);
    });

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => {
        queueRender();
      });
      resizeObserver.observe(refs.tool);
    } else {
      window.addEventListener("resize", queueRender);
    }

    window.addEventListener("load", queueRender, { once: true });
    queueRender();
    syncCompactSummaryVisibility();
    initSummaryObserver();
  }

  function syncControlPresentation(control) {
    const input = refs.inputs[control];
    const output = refs.outputs[control];

    if (!input) {
      return;
    }

    const value = controlValueFromInternal(control, getSliderIntegerValue(input));
    updateSliderA11y(input, control, value);

    if (output) {
      output.textContent = formatControlValue(control, value);
    }
  }

  function formatControlValue(control, value) {
    const config = CONTROL_CONFIG[control];
    return `${value.toFixed(config.decimals)}${config.suffix}`;
  }

  function controlValueFromInternal(control, value) {
    return CONTROL_CONFIG[control].fromInternal(value);
  }

  function getSliderIntegerValue(slider) {
    return Number.parseInt(slider.dataset.value || "0", 10);
  }

  function updateSliderA11y(slider, control, value) {
    slider.setAttribute("aria-valuenow", String(value));
    slider.setAttribute("aria-valuetext", formatControlValue(control, value));
  }

  function setSliderValue(slider, value) {
    const min = Number.parseInt(slider.dataset.min || "0", 10);
    const max = Number.parseInt(slider.dataset.max || "100", 10);
    const next = clamp(value, min, max);
    const fraction = max === min ? 0 : (next - min) / (max - min);
    const percentage = fraction * 100;
    const fill = slider.querySelector(".aqua-slider-fill");
    const thumb = slider.querySelector(".aqua-slider-thumb");

    slider.dataset.value = String(next);

    if (fill) {
      fill.style.width = `calc(${percentage}% + 1px)`;
    }

    if (thumb) {
      thumb.style.left = `${percentage}%`;
    }
  }

  function bindSlider(slider, control) {
    const syncFromDom = () => {
      const value = getSliderIntegerValue(slider);
      state[control] = controlValueFromInternal(control, value);
      syncControlPresentation(control);
      queueRender();
    };

    const scheduleSync = () => {
      if (slider._syncFrame) {
        cancelAnimationFrame(slider._syncFrame);
      }

      slider._syncFrame = requestAnimationFrame(() => {
        slider._syncFrame = 0;
        syncFromDom();
      });
    };

    ["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach((eventName) => {
      slider.addEventListener(eventName, scheduleSync);
    });

    slider.addEventListener("keydown", (event) => {
      const min = Number.parseInt(slider.dataset.min || "0", 10);
      const max = Number.parseInt(slider.dataset.max || "100", 10);
      const current = getSliderIntegerValue(slider);
      let next = current;

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowDown":
          next = current - 1;
          break;
        case "ArrowRight":
        case "ArrowUp":
          next = current + 1;
          break;
        case "PageDown":
          next = current - 3;
          break;
        case "PageUp":
          next = current + 3;
          break;
        case "Home":
          next = min;
          break;
        case "End":
          next = max;
          break;
        default:
          return;
      }

      event.preventDefault();
      setSliderValue(slider, next);
      syncFromDom();
    });
  }

  function queueRender() {
    if (renderFrameId) {
      cancelAnimationFrame(renderFrameId);
    }

    renderFrameId = window.requestAnimationFrame(() => {
      renderFrameId = 0;
      render();
    });
  }

  function render() {
    const signals = buildSignals(state);

    drawLine(refs.canvases.msg, signals.msg, STAGE_COLORS.msg, -1.5, 1.5, 0, 0.08);

    const scaledRange = Math.max(state.m + 0.15, 0.2);
    drawLine(refs.canvases.scaled, signals.scaled, STAGE_COLORS.scaled, -scaledRange, scaledRange, 0, 0.08);

    const envMin = Math.min(1 - state.m - 0.2, -0.3);
    const envMax = 1 + state.m + 0.2;
    drawLine(
      refs.canvases.env,
      signals.env,
      STAGE_COLORS.env,
      envMin,
      envMax,
      0,
      0.1,
      signals.overmod
        ? [{ data: createFlatArray(0), color: hexToRgba(STAGE_COLORS.warning, 0.72), dash: [6, 4] }]
        : null
    );

    drawLine(refs.canvases.carrier, signals.carrier, STAGE_COLORS.carrier, -1.5, 1.5, 0, 0.06);
    drawAmPanel(refs.canvases.am, signals.am, signals.env, signals.overmod);
    drawDetector(refs.canvases.det, signals.am, signals.tau);
    renderStatus(signals);
  }

  function buildSignals(values) {
    const msg = [];
    const scaled = [];
    const env = [];
    const carrier = [];
    const am = [];
    const dt = 1 / SAMPLES;
    let cap = 0;
    const detected = [];

    for (let index = 0; index < SAMPLES; index += 1) {
      const time = index / SAMPLES;
      const messageValue = Math.cos(2 * Math.PI * values.fm * time);
      const scaledValue = values.m * messageValue;
      const envelopeValue = 1 + scaledValue;
      const carrierValue = Math.cos(2 * Math.PI * values.fc * time);
      const amValue = envelopeValue * carrierValue;

      msg.push(messageValue);
      scaled.push(scaledValue);
      env.push(envelopeValue);
      carrier.push(carrierValue);
      am.push(amValue);

      cap = amValue > cap ? amValue : cap * Math.exp(-dt / Math.max(values.tau, 0.001));
      detected.push(cap);
    }

    const ratio = values.fc / values.fm;
    const tauMin = 1 / values.fc;
    const tauMax = 1 / values.fm;

    return {
      msg,
      scaled,
      env,
      carrier,
      am,
      detected,
      ratio,
      tau: values.tau,
      tauMin,
      tauMax,
      tauOk: values.tau > tauMin && values.tau < tauMax,
      overmod: values.m > 1
    };
  }

  function renderStatus(signals) {
    const ratioOk = signals.ratio >= 10;
    const statusModel = buildStatusModel(signals, ratioOk);

    applyStatusTone(refs.ratioCard, ratioOk);
    applyStatusTone(refs.envelopeCard, !signals.overmod);
    applyStatusTone(refs.detectorCard, signals.tauOk);

    refs.ratioValue.textContent = statusModel.ratio.value;
    refs.ratioNote.textContent = statusModel.ratio.note;

    refs.envelopeValue.textContent = statusModel.envelope.value;
    refs.envelopeNote.textContent = statusModel.envelope.note;

    refs.detectorValue.textContent = statusModel.detector.value;
    refs.detectorNote.textContent = statusModel.detector.note;

    refs.envelopeInlineNote.textContent = signals.overmod
      ? "Envelope crosses below zero."
      : "Envelope remains above zero.";
    refs.envelopeInlineNote.dataset.tone = signals.overmod ? "bad" : "good";

    refs.controlWraps.m.dataset.warning = String(signals.overmod);
    refs.controlWraps.tau.dataset.warning = String(!signals.tauOk);
    renderCompactSummary(statusModel);
  }

  function buildStatusModel(signals, ratioOk) {
    return {
      ratio: {
        tone: ratioOk ? "good" : "bad",
        value: `${signals.ratio.toFixed(1)}x`,
        note: ratioOk
          ? "Carrier is well above the message rate."
          : "Increase fc or lower fm until the carrier is at least 10x faster.",
        meta: "Target >= 10x"
      },
      envelope: {
        tone: signals.overmod ? "bad" : "good",
        value: signals.overmod ? "Overmodulated" : "Stable",
        note: signals.overmod
          ? "m is above 1, so the envelope crosses zero and flips portions of the waveform."
          : "m stays at or below 1, so the envelope never inverts.",
        meta: signals.overmod ? "m > 1.00" : "m <= 1.00"
      },
      detector: {
        tone: signals.tauOk ? "good" : "bad",
        value: signals.tauOk ? "Valid" : "Out of Range",
        note: signals.tauOk
          ? `tau stays between ${signals.tauMin.toFixed(3)} s and ${signals.tauMax.toFixed(3)} s.`
          : `Move tau into ${signals.tauMin.toFixed(3)} s < tau < ${signals.tauMax.toFixed(3)} s.`,
        meta: `${signals.tauMin.toFixed(3)}s - ${signals.tauMax.toFixed(3)}s`
      }
    };
  }

  function applyStatusTone(element, isGood) {
    if (!element) {
      return;
    }

    element.dataset.tone = isGood ? "good" : "bad";
  }

  function renderCompactSummary(statusModel) {
    refs.compactSummary.innerHTML = [
      '<div class="am-panel am-compact-summary-panel" aria-label="Floating operating window summary">',
      '<div class="am-compact-summary-layout">',
      '<div class="am-compact-summary-copy">',
      '<p class="am-eyebrow">Live Checks</p>',
      '<p class="am-compact-summary-title">Operating Window</p>',
      "</div>",
      '<div class="am-compact-summary-grid">',
      createCompactStatusCardMarkup("Carrier Ratio", statusModel.ratio),
      createCompactStatusCardMarkup("Envelope State", statusModel.envelope),
      createCompactStatusCardMarkup("Detector Window", statusModel.detector),
      "</div>",
      "</div>",
      "</div>"
    ].join("");
  }

  function createCompactStatusCardMarkup(label, status) {
    return [
      `<article class="am-compact-status-card" data-tone="${status.tone}">`,
      `<p class="am-compact-status-label">${label}</p>`,
      `<p class="am-compact-status-value">${status.value}</p>`,
      `<p class="am-compact-status-meta">${status.meta}</p>`,
      "</article>"
    ].join("");
  }

  function syncCompactSummaryVisibility() {
    refs.compactSummary.classList.toggle("is-visible", state.isCompactSummaryVisible);
    refs.compactSummary.setAttribute("aria-hidden", String(!state.isCompactSummaryVisible));
  }

  function setCompactSummaryVisible(visible) {
    const nextVisible = Boolean(visible);

    if (state.isCompactSummaryVisible === nextVisible) {
      return;
    }

    state.isCompactSummaryVisible = nextVisible;
    syncCompactSummaryVisibility();
  }

  function updateCompactSummaryVisibility() {
    const rect = refs.summaryPanel.getBoundingClientRect();
    const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;

    setCompactSummaryVisible(!isVisible);
  }

  function initSummaryObserver() {
    if ("IntersectionObserver" in window) {
      refs.summaryObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target !== refs.summaryPanel) {
            return;
          }

          setCompactSummaryVisible(!entry.isIntersecting);
        });
      }, {
        threshold: [0]
      });

      refs.summaryObserver.observe(refs.summaryPanel);
      updateCompactSummaryVisibility();
      return;
    }

    refs.summaryFallbackHandler = updateCompactSummaryVisibility;
    window.addEventListener("scroll", refs.summaryFallbackHandler, { passive: true });
    window.addEventListener("resize", refs.summaryFallbackHandler);
    updateCompactSummaryVisibility();
  }

  function createFlatArray(value) {
    return Array.from({ length: SAMPLES }, () => value);
  }

  function drawLine(canvas, samples, color, minValue, maxValue, zeroValue, fillAlpha, extraLines) {
    const frame = getCanvasFrame(canvas);

    if (!frame) {
      return;
    }

    const { ctx, width, height } = frame;
    const toY = drawGrid(ctx, width, height, zeroValue, minValue, maxValue);
    const sampleCount = samples.length;

    if (fillAlpha > 0) {
      ctx.beginPath();
      ctx.moveTo(0, toY(clamp(zeroValue, minValue, maxValue)));

      for (let index = 0; index < sampleCount; index += 1) {
        ctx.lineTo((index / (sampleCount - 1)) * width, toY(samples[index]));
      }

      ctx.lineTo(width, toY(clamp(zeroValue, minValue, maxValue)));
      ctx.closePath();
      ctx.fillStyle = hexToRgba(color, fillAlpha);
      ctx.fill();
    }

    if (extraLines) {
      extraLines.forEach((line) => {
        ctx.beginPath();
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 1.6;
        ctx.setLineDash(line.dash || []);
        ctx.shadowColor = line.color;
        ctx.shadowBlur = 4;

        for (let index = 0; index < sampleCount; index += 1) {
          const x = (index / (sampleCount - 1)) * width;

          if (index === 0) {
            ctx.moveTo(x, toY(line.data[index]));
          } else {
            ctx.lineTo(x, toY(line.data[index]));
          }
        }

        ctx.stroke();
      });

      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    }

    strokeSeries(ctx, width, samples, toY, color, 2.2, 6);
  }

  function drawAmPanel(canvas, amSamples, envelope, overmod) {
    const frame = getCanvasFrame(canvas);

    if (!frame) {
      return;
    }

    const { ctx, width, height } = frame;
    const toY = drawGrid(ctx, width, height, 0, -1.6, 1.6);
    const sampleCount = amSamples.length;
    const envelopeColor = overmod ? STAGE_COLORS.warning : STAGE_COLORS.env;

    ctx.beginPath();
    ctx.moveTo(0, toY(0));

    for (let index = 0; index < sampleCount; index += 1) {
      ctx.lineTo((index / (sampleCount - 1)) * width, toY(amSamples[index]));
    }

    ctx.lineTo(width, toY(0));
    ctx.closePath();
    ctx.fillStyle = hexToRgba(STAGE_COLORS.am, 0.08);
    ctx.fill();

    strokeSeries(ctx, width, amSamples, toY, STAGE_COLORS.am, 2.1, 6);

    ctx.setLineDash([7, 4]);
    strokeSeries(ctx, width, envelope, toY, envelopeColor, 1.8, 4);
    strokeSeries(ctx, width, envelope.map((value) => -value), toY, envelopeColor, 1.8, 4);
    ctx.setLineDash([]);
  }

  function drawDetector(canvas, amSamples, tau) {
    const frame = getCanvasFrame(canvas);

    if (!frame) {
      return;
    }

    const { ctx, width, height } = frame;
    const toY = drawGrid(ctx, width, height, 0, -1.6, 1.6);
    const dt = 1 / amSamples.length;
    let cap = 0;
    const detected = [];

    for (let index = 0; index < amSamples.length; index += 1) {
      const sample = amSamples[index];
      cap = sample > cap ? sample : cap * Math.exp(-dt / Math.max(tau, 0.001));
      detected.push(cap);
    }

    strokeSeries(ctx, width, amSamples, toY, hexToRgba(STAGE_COLORS.am, 0.32), 1.3, 0);
    strokeSeries(ctx, width, detected, toY, STAGE_COLORS.det, 2.4, 8);
  }

  function strokeSeries(ctx, width, samples, toY, color, lineWidth, blur) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;

    for (let index = 0; index < samples.length; index += 1) {
      const x = (index / (samples.length - 1)) * width;

      if (index === 0) {
        ctx.moveTo(x, toY(samples[index]));
      } else {
        ctx.lineTo(x, toY(samples[index]));
      }
    }

    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawGrid(ctx, width, height, zeroValue, minValue, maxValue) {
    const range = maxValue - minValue || 1;

    function toY(value) {
      return PAD + ((maxValue - value) / range) * (height - PAD * 2);
    }

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(32, 66, 92, 0.10)";
    ctx.lineWidth = 1;

    for (let index = 0; index <= 4; index += 1) {
      const y = PAD + (index / 4) * (height - PAD * 2);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (zeroValue >= minValue && zeroValue <= maxValue) {
      ctx.strokeStyle = "rgba(33, 67, 92, 0.24)";
      ctx.beginPath();
      ctx.moveTo(0, toY(zeroValue));
      ctx.lineTo(width, toY(zeroValue));
      ctx.stroke();
    }

    return toY;
  }

  function getCanvasFrame(canvas) {
    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const targetWidth = Math.round(width * ratio);
    const targetHeight = Math.round(height * ratio);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    return { ctx, width, height };
  }

  function clamp(value, minValue, maxValue) {
    return Math.max(minValue, Math.min(maxValue, value));
  }

  function hexToRgba(hex, alpha) {
    const normalized = hex.replace("#", "");
    const size = normalized.length === 3 ? 1 : 2;
    const channels = [];

    for (let index = 0; index < normalized.length; index += size) {
      const part = normalized.slice(index, index + size);
      channels.push(parseInt(size === 1 ? `${part}${part}` : part, 16));
    }

    return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${alpha})`;
  }

  init();
}());

(function () {
  "use strict";

  const COLORS = {
    base: "#4e94d2",
    compare: "#d39b2d",
    action: "#c76166",
    done: "#5ba06f",
    pivot: "#8e73cc",
    pointer: "#db7a28",
    structure: "#7f91c9",
    line: "rgba(59, 83, 100, 0.18)",
    text: "#102838",
    textMuted: "rgba(16, 40, 56, 0.56)",
    axis: "rgba(59, 83, 100, 0.28)",
    region: ["#6f8fd0", "#af7ac8", "#4da6b6", "#c7902f", "#64a66a"]
  };

  const FAMILY_META = {
    iterative: {
      label: "Iterative",
      note: "Iterative sorts repeatedly scan the same array and update a local region in place.",
      algorithms: ["bubble", "selection", "insertion", "heap"]
    },
    divide: {
      label: "Divide and Conquer",
      note: "Divide-and-conquer sorts split the array into smaller subproblems before combining them again.",
      algorithms: ["merge", "quick"]
    },
    radix: {
      label: "Radix",
      note: "Radix sort distributes keys into digit buckets and gathers them back without comparing full values.",
      algorithms: ["radix"]
    }
  };

  const DATASET_META = {
    random: { label: "Random" },
    sorted: { label: "Already Sorted" },
    reverse: { label: "Reverse Sorted" },
    lecture: { label: "Lecture Example", algorithms: ["radix"] }
  };

  const RADIX_LECTURE_ARRAY = [780, 351, 672, 3, 24, 126, 76, 917, 17, 8, 259];
  const RADIX_BALANCED_POOL = [
    -130, -241, -352, -463, -574, -685, -796, -907, -118, -229,
    3, 14, 25, 36, 47, 58, 69, 70, 81, 92, 126, 237, 348, 459, 560, 671, 782, 893
  ];
  const RADIX_REQUIRED_VALUES = [-130, 3, 126];

  const HEAP_VARIANT_META = {
    "lecture-min": {
      label: "Lecture min-heap",
      heapKind: "min",
      deletedLabel: "minimum",
      parentLabel: "minimum",
      childLabel: "smaller",
      idea: "This lecture version builds a top-down min-heap, then repeatedly deletes the minimum into the right edge of the array.",
      tradeoff: "It improves the asymptotic running time, but it has weaker locality and this lecture variant ends in descending order.",
      subtitle: "Lecture version: top-down min-heap build, then deleteMin into the right edge.",
      order: "descending",
      orderLabel: "Descending output",
      heapCopy: "The heap region is shown as an array-backed min-heap while the descending sorted suffix grows on the right.",
      watch: [
        "During heapify, the heap region grows one node at a time and the new value bubbles upward if it is smaller than its parent.",
        "During extraction, the sorted suffix grows on the right because each deleted minimum is written there.",
        "The heap tree panel shows the same array-backed min-heap used in the bar chart."
      ]
    },
    "ascending-max": {
      label: "Ascending max-heap",
      heapKind: "max",
      deletedLabel: "maximum",
      parentLabel: "maximum",
      childLabel: "larger",
      idea: "This variant builds a top-down max-heap, then repeatedly deletes the maximum into the right edge of the array.",
      tradeoff: "It improves the asymptotic running time, but it has weaker locality than the simpler quadratic sorts.",
      subtitle: "Ascending version: top-down max-heap build, then deleteMax into the right edge.",
      order: "ascending",
      orderLabel: "Ascending output",
      heapCopy: "The heap region is shown as an array-backed max-heap while the ascending sorted suffix grows on the right.",
      watch: [
        "During heapify, the heap region grows one node at a time and the new value bubbles upward if it is larger than its parent.",
        "During extraction, the sorted suffix grows on the right because each deleted maximum is written there.",
        "The heap tree panel shows the same array-backed max-heap used in the bar chart."
      ]
    }
  };

  const ALGORITHM_META = {
    bubble: {
      name: "Bubble Sort",
      family: "iterative",
      best: "O(n)",
      average: "O(n²)",
      worst: "O(n²)",
      space: "O(1)",
      idea: "Bubble sort sweeps left to right and swaps adjacent out-of-order pairs.",
      tradeoff: "Very simple, but it can do a large number of adjacent swaps.",
      subtitle: "Largest remaining values bubble toward the right edge.",
      operationLabel: "Swaps",
      order: "ascending",
      orderLabel: "Ascending output",
      watch: [
        "The active adjacent pair decides whether the larger value should move right.",
        "Each completed pass settles one more value at the far right.",
        "If a full pass makes no swaps, the lecture best-case O(n) behavior appears immediately."
      ]
    },
    selection: {
      name: "Selection Sort",
      family: "iterative",
      best: "O(n²)",
      average: "O(n²)",
      worst: "O(n²)",
      space: "O(1)",
      idea: "Selection sort scans the unsorted suffix for the minimum value, then moves it into the next open slot.",
      tradeoff: "It minimizes writes compared with bubble sort, but it still performs the same quadratic number of comparisons.",
      subtitle: "The next open slot is filled by the smallest remaining element.",
      operationLabel: "Swaps",
      order: "ascending",
      orderLabel: "Ascending output",
      watch: [
        "Only the minimum candidate matters during the scan; everything else is just being compared against it.",
        "The green prefix grows from left to right because each chosen minimum is final.",
        "Already sorted input still triggers the full scan of the unsorted suffix on every pass."
      ]
    },
    insertion: {
      name: "Insertion Sort",
      family: "iterative",
      best: "O(n)",
      average: "O(n²)",
      worst: "O(n²)",
      space: "O(1)",
      idea: "Insertion sort grows a sorted prefix and inserts the next key into its correct position.",
      tradeoff: "It performs well on nearly sorted input, but shifting many values can still make it quadratic.",
      subtitle: "The sorted prefix expands one inserted key at a time.",
      operationLabel: "Writes",
      order: "ascending",
      orderLabel: "Ascending output",
      watch: [
        "The key leaves the unsorted region and searches leftward for its insertion point.",
        "Red steps are shifts that open space inside the sorted prefix.",
        "On already sorted input, the key usually stays put after one quick comparison."
      ]
    },
    heap: {
      name: "Heap Sort",
      family: "iterative",
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n log n)",
      space: "O(1)",
      operationLabel: "Swaps",
      idea: "",
      tradeoff: "",
      subtitle: "",
      order: "descending",
      orderLabel: "Descending output",
      watch: []
    },
    merge: {
      name: "Merge Sort",
      family: "divide",
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n log n)",
      space: "O(n)",
      idea: "Merge sort recursively splits the array, sorts both halves, and merges them back together.",
      tradeoff: "It scales well and is parallel-friendly, but it requires extra array space during the merge.",
      subtitle: "Recursive splits create small sorted pieces before they are merged back together.",
      operationLabel: "Writes",
      order: "ascending",
      orderLabel: "Ascending output",
      watch: [
        "Bracket overlays show the currently active recursive ranges from the notes' divide-and-conquer view.",
        "Compare steps read the front of the left and right halves, then write the smaller value back into the main array.",
        "A green merged region is internally sorted, even if the full array is not finished yet."
      ]
    },
    quick: {
      name: "Quicksort",
      family: "divide",
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n²)",
      space: "O(log n)",
      idea: "Quicksort picks a pivot, partitions smaller values left and larger values right, then recurses on both sides.",
      tradeoff: "It is fast in practice and in place, but bad pivot choices can still force quadratic behavior.",
      subtitle: "Random pivots and two scouts partition each subarray in place.",
      operationLabel: "Swaps",
      order: "ascending",
      orderLabel: "Ascending output",
      watch: [
        "Purple marks the pivot, while the orange scouts track the lecture's lo and hi partition scan.",
        "When both scouts get stuck, the algorithm swaps their values to restore the partition invariant.",
        "Once the scouts cross, the pivot is swapped into its final location and never moves again."
      ]
    },
    radix: {
      name: "Radix Sort",
      family: "radix",
      best: "O(M(N + K))",
      average: "O(M(N + K))",
      worst: "O(M(N + K))",
      space: "O(N + K)",
      idea: "LSD radix sort distributes keys into decimal digit buckets and gathers them back one digit at a time.",
      tradeoff: "It can beat comparison-sort bounds for bounded-digit integers, but it needs extra bucket space and key-specific logic.",
      subtitle: "Process ones, then tens, then hundreds digits while preserving bucket order within each pass.",
      primaryMetricLabel: "Passes",
      operationLabel: "Moves",
      order: "ascending",
      orderLabel: "Ascending output",
      watch: [
        "Each pass distributes values by the current active digit, then gathers bucket 0 through bucket 9 back into the array.",
        "Missing digits behave like 0, so short values automatically flow into bucket 0 on higher-order passes.",
        "On the final pass with mixed signs, negatives are gathered first in reversed order before non-negatives."
      ]
    }
  };

  const PHASE_META = {
    setup: { label: "Setup", tone: "structure" },
    compare: { label: "Compare", tone: "compare" },
    swap: { label: "Swap", tone: "action" },
    write: { label: "Write", tone: "action" },
    extract: { label: "Extract", tone: "action" },
    divide: { label: "Divide", tone: "structure" },
    merge: { label: "Merge", tone: "structure" },
    partition: { label: "Partition", tone: "structure" },
    pivot: { label: "Pivot", tone: "structure" },
    distribute: { label: "Distribute", tone: "action" },
    gather: { label: "Gather", tone: "structure" },
    "pass-complete": { label: "Pass Done", tone: "done" },
    "sign-gather": { label: "Sign Gather", tone: "structure" },
    finalize: { label: "Settle", tone: "done" },
    done: { label: "Done", tone: "done" }
  };

  const refs = {};

  const state = {
    family: "iterative",
    algorithm: "bubble",
    heapVariant: "lecture-min",
    preset: "random",
    size: 16,
    speed: 260,
    playing: false,
    playbackDelayId: 0,
    animationFrameId: 0,
    transition: null,
    prefersReducedMotion: false,
    motionQuery: null,
    seedCursor: (Date.now() >>> 0) ^ 0x9e3779b9,
    runSeed: 0,
    baseArray: [],
    steps: [],
    stepIndex: 0
  };

  function init() {
    refs.tool = document.getElementById("sort-tool");
    refs.familyTabs = document.getElementById("sort-family-tabs");
    refs.stageNote = document.getElementById("sort-stage-note");
    refs.stageToolbar = document.getElementById("sort-stage-toolbar");
    refs.algoField = document.getElementById("sort-algo-field");
    refs.algoSelect = document.getElementById("sort-algo-select");
    refs.heapVariantField = document.getElementById("sort-heap-variant-field");
    refs.heapVariantSelect = document.getElementById("sort-heap-variant-select");
    refs.heapCopy = document.getElementById("sort-heap-copy");
    refs.presetSelect = document.getElementById("sort-preset-select");
    refs.sizeSlider = document.getElementById("sort-size-slider");
    refs.speedSlider = document.getElementById("sort-speed-slider");
    refs.sizeOutput = document.getElementById("sort-size-output");
    refs.sizeMin = document.getElementById("sort-size-min");
    refs.sizeMax = document.getElementById("sort-size-max");
    refs.speedOutput = document.getElementById("sort-speed-output");
    refs.playButton = document.getElementById("sort-play-button");
    refs.stepBackButton = document.getElementById("sort-step-back-button");
    refs.stepForwardButton = document.getElementById("sort-step-forward-button");
    refs.resetButton = document.getElementById("sort-reset-button");
    refs.shuffleButton = document.getElementById("sort-shuffle-button");
    refs.plot = document.getElementById("sort-plot");
    refs.mergePanel = document.getElementById("sort-merge-panel");
    refs.mergeAux = document.getElementById("sort-merge-aux");
    refs.heapPanel = document.getElementById("sort-heap-panel");
    refs.heapTree = document.getElementById("sort-heap-tree");
    refs.narration = document.getElementById("sort-narration");
    refs.phaseChip = document.getElementById("sort-phase-chip");
    refs.stepLabel = document.getElementById("sort-step-label");
    refs.progress = document.getElementById("sort-progress");
    refs.progressFill = refs.progress?.querySelector(".aqua-progress-fill") ?? null;
    refs.primaryMetricLabel = document.getElementById("sort-primary-metric-label");
    refs.comparisons = document.getElementById("sort-comparisons");
    refs.operationsLabel = document.getElementById("sort-operations-label");
    refs.operations = document.getElementById("sort-operations");
    refs.summaryIdea = document.getElementById("sort-summary-idea");
    refs.best = document.getElementById("sort-best");
    refs.average = document.getElementById("sort-average");
    refs.worst = document.getElementById("sort-worst");
    refs.space = document.getElementById("sort-space");
    refs.summaryTradeoff = document.getElementById("sort-summary-tradeoff");
    refs.watchList = document.getElementById("sort-watch-list");

    if (
      !refs.tool ||
      !refs.familyTabs ||
      !refs.stageToolbar ||
      !refs.algoField ||
      !refs.algoSelect ||
      !refs.heapVariantField ||
      !refs.heapVariantSelect ||
      !refs.presetSelect ||
      !refs.sizeSlider ||
      !refs.sizeMin ||
      !refs.sizeMax ||
      !refs.speedSlider ||
      !refs.playButton ||
      !refs.plot ||
      !refs.mergePanel ||
      !refs.mergeAux ||
      !refs.heapPanel ||
      !refs.heapTree ||
      !refs.progressFill ||
      !refs.primaryMetricLabel
    ) {
      return;
    }

    bindFamilyTabs();
    bindSelect(refs.algoSelect, handleAlgorithmSelect);
    bindSelect(refs.heapVariantSelect, handleHeapVariantSelect);
    bindSelect(refs.presetSelect, handlePresetSelect);
    bindSlider(refs.sizeSlider, handleSizeChange);
    bindSlider(refs.speedSlider, handleSpeedChange);

    refs.playButton.addEventListener("click", togglePlayback);
    refs.stepBackButton.addEventListener("click", stepBackward);
    refs.stepForwardButton.addEventListener("click", stepForward);
    refs.resetButton.addEventListener("click", resetRun);
    refs.shuffleButton.addEventListener("click", shuffleRun);

    state.runSeed = nextSeed();
    state.baseArray = buildBaseArray(state.size, state.preset, state.runSeed, state.algorithm);
    syncReducedMotionPreference();
    bindReducedMotionPreference();

    setActiveFamilyTab(state.family);
    filterAlgorithmOptions();
    filterPresetOptions();
    setSelectValue(refs.algoSelect, state.algorithm);
    setSelectValue(refs.heapVariantSelect, state.heapVariant);
    syncHeapVariantField();
    setSelectValue(refs.presetSelect, state.preset);
    syncSizeControl();
    setSliderValue(refs.speedSlider, state.speed);
    syncStaticPanels();
    rebuildSteps({ regenerateArray: false, newSeed: false });

    requestAnimationFrame(() => {
      setActiveFamilyTab(state.family);
    });

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        setActiveFamilyTab(state.family);
      });
    }

    revealPageWhenReady();
  }

  function syncReducedMotionPreference() {
    state.prefersReducedMotion = Boolean(state.motionQuery?.matches);
  }

  function bindReducedMotionPreference() {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    state.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    syncReducedMotionPreference();

    if (typeof state.motionQuery.addEventListener === "function") {
      state.motionQuery.addEventListener("change", handleMotionPreferenceChange);
      return;
    }

    if (typeof state.motionQuery.addListener === "function") {
      state.motionQuery.addListener(handleMotionPreferenceChange);
    }
  }

  function handleMotionPreferenceChange() {
    syncReducedMotionPreference();
    settleTransition({ commitTarget: true });

    if (state.playing && !state.transition?.active) {
      scheduleAutoplayAdvance(getAutoplaySettleDelay());
    }

    render();
  }

  function revealPageWhenReady() {
    const reveal = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          refs.tool.classList.remove("sort-tool-pending");
          refs.tool.setAttribute("aria-busy", "false");
          document.body?.classList.remove("sort-page-loading");
          document.documentElement.classList.remove("sort-page-pending");

          requestAnimationFrame(() => {
            setActiveFamilyTab(state.family);
          });
        });
      });
    };

    if (document.readyState === "complete") {
      reveal();
      return;
    }

    window.addEventListener("load", reveal, { once: true });
  }

  function bindFamilyTabs() {
    const tabs = Array.from(refs.familyTabs.querySelectorAll(".aqua-tabview-tab"));

    refs.familyTabs.addEventListener("pointerup", () => {
      const activeTab = refs.familyTabs.querySelector(".aqua-tabview-tab.active");

      if (!activeTab) {
        return;
      }

      handleFamilySelect(activeTab.dataset.tab);
    });

    tabs.forEach((tab, index) => {
      tab.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleFamilySelect(tab.dataset.tab);
          return;
        }

        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
          return;
        }

        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = clamp(index + direction, 0, tabs.length - 1);
        const nextTab = tabs[nextIndex];

        if (!nextTab) {
          return;
        }

        nextTab.focus();
        handleFamilySelect(nextTab.dataset.tab);
      });
    });
  }

  function bindSelect(select, onChange) {
    const trigger = select.querySelector(".aqua-select-trigger");
    const panel = select.querySelector(".aqua-select-panel");
    const panelHeader = select.querySelector(".aqua-select-panel-header");
    const options = Array.from(select.querySelectorAll(".aqua-select-option"));

    if (!trigger || !panel || !panelHeader || options.length === 0) {
      return;
    }

    trigger.tabIndex = 0;
    trigger.setAttribute("role", "button");
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    panel.setAttribute("role", "listbox");

    panelHeader.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeSelect(select);
      },
      true
    );

    trigger.addEventListener("click", () => {
      requestAnimationFrame(() => {
        syncSelectExpansion(select);
      });
    });

    options.forEach((option) => {
      option.tabIndex = -1;
      option.setAttribute("role", "option");

      option.addEventListener("click", () => {
        onChange(option.dataset.value || "");
        syncSelectExpansion(select);
      });

      option.addEventListener("keydown", (event) => {
        const visibleOptions = getVisibleOptions(select);
        const currentIndex = visibleOptions.indexOf(option);

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onChange(option.dataset.value || "");
          closeSelect(select);
          trigger.focus();
          return;
        }

        if (event.key === "Escape") {
          event.preventDefault();
          closeSelect(select);
          trigger.focus();
          return;
        }

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const delta = event.key === "ArrowDown" ? 1 : -1;
          const nextIndex = clamp(currentIndex + delta, 0, visibleOptions.length - 1);
          visibleOptions[nextIndex]?.focus();
        }
      });
    });

    trigger.addEventListener("keydown", (event) => {
      const visibleOptions = getVisibleOptions(select);

      if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        openSelect(select);
        const chosen = select.querySelector(".aqua-select-option.chosen:not([hidden])");
        (chosen || visibleOptions[0])?.focus();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeSelect(select);
      }
    });
  }

  function bindSlider(slider, onChange) {
    const syncFromDom = () => {
      if (slider.dataset.disabled === "true") {
        return;
      }

      const value = Number.parseInt(slider.dataset.value || "0", 10);
      updateSliderA11y(slider, value);
      onChange(value);
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
      if (slider.dataset.disabled === "true") {
        return;
      }

      const min = Number.parseInt(slider.dataset.min || "0", 10);
      const max = Number.parseInt(slider.dataset.max || "100", 10);
      const current = Number.parseInt(slider.dataset.value || "0", 10);
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
      setSliderValue(slider, clamp(next, min, max));
      syncFromDom();
    });
  }

  function handleFamilySelect(family) {
    if (!FAMILY_META[family]) {
      return;
    }

    const previousAlgorithm = state.algorithm;
    state.family = family;
    setActiveFamilyTab(family);
    const algorithmChanged = filterAlgorithmOptions();
    const presetChanged = filterPresetOptions();
    const sizeChanged = syncSizeControl();

    if (algorithmChanged) {
      setSelectValue(refs.algoSelect, state.algorithm);
    }

    syncAlgorithmField();
    syncHeapVariantField();
    syncStaticPanels();
    rebuildSteps({
      regenerateArray: previousAlgorithm === "radix" || state.algorithm === "radix" || presetChanged || sizeChanged,
      newSeed: true
    });
  }

  function handleAlgorithmSelect(value) {
    if (!ALGORITHM_META[value]) {
      return;
    }

    const previousAlgorithm = state.algorithm;
    state.algorithm = value;

    if (ALGORITHM_META[value].family !== state.family) {
      state.family = ALGORITHM_META[value].family;
      setActiveFamilyTab(state.family);
    }

    filterAlgorithmOptions();
    setSelectValue(refs.algoSelect, value);
    syncAlgorithmField();
    syncHeapVariantField();
    const presetChanged = filterPresetOptions();
    const sizeChanged = syncSizeControl();
    syncStaticPanels();
    rebuildSteps({
      regenerateArray: previousAlgorithm === "radix" || state.algorithm === "radix" || presetChanged || sizeChanged,
      newSeed: true
    });
  }

  function handleHeapVariantSelect(value) {
    if (!HEAP_VARIANT_META[value]) {
      return;
    }

    state.heapVariant = value;
    setSelectValue(refs.heapVariantSelect, value);
    syncHeapVariantField();
    syncStaticPanels();
    rebuildSteps({ regenerateArray: false, newSeed: false });
  }

  function handlePresetSelect(value) {
    if (!DATASET_META[value]) {
      return;
    }

    state.preset = value;
    setSelectValue(refs.presetSelect, value);
    syncSizeControl();
    syncStaticPanels();
    rebuildSteps({ regenerateArray: true, newSeed: true });
  }

  function handleSizeChange(value) {
    if (refs.sizeSlider.dataset.disabled === "true") {
      refs.sizeOutput.textContent = String(state.size);
      return;
    }

    if (!Number.isFinite(value) || value === state.size) {
      refs.sizeOutput.textContent = String(state.size);
      return;
    }

    state.size = value;
    refs.sizeOutput.textContent = String(value);
    rebuildSteps({ regenerateArray: true, newSeed: true });
  }

  function handleSpeedChange(value) {
    if (!Number.isFinite(value)) {
      return;
    }

    state.speed = value;
    refs.speedOutput.textContent = `${value} ms`;
    updateSliderA11y(refs.speedSlider, value);

    if (animationsDisabled() && state.transition?.active) {
      settleTransition({ commitTarget: true });
      render();
    }

    if (state.playing && !state.transition?.active) {
      scheduleAutoplayAdvance(getAutoplaySettleDelay());
    }
  }

  function togglePlayback() {
    if (state.playing) {
      stopPlayback({ settle: true });
      render();
      return;
    }

    settleTransition({ commitTarget: true });

    if (state.stepIndex >= state.steps.length - 1) {
      state.stepIndex = 0;
    }

    state.playing = true;
    render();
    scheduleAutoplayAdvance(0);
  }

  function stepBackward() {
    stopPlayback({ settle: true });

    if (state.stepIndex === 0) {
      render();
      return;
    }

    beginStepTransition(state.stepIndex - 1, { mode: "manual" });
  }

  function stepForward() {
    stopPlayback({ settle: true });

    if (state.stepIndex >= state.steps.length - 1) {
      render();
      return;
    }

    beginStepTransition(state.stepIndex + 1, { mode: "manual" });
  }

  function resetRun() {
    cancelMotion({ commitTarget: true });
    rebuildSteps({ regenerateArray: false, newSeed: true });
  }

  function shuffleRun() {
    cancelMotion({ commitTarget: true });
    rebuildSteps({ regenerateArray: true, newSeed: true });
  }

  function scheduleAutoplayAdvance(delay) {
    clearTimeout(state.playbackDelayId);
    state.playbackDelayId = 0;

    if (!state.playing) {
      return;
    }

    const launch = () => {
      state.playbackDelayId = 0;

      if (!state.playing) {
        return;
      }

      if (state.stepIndex >= state.steps.length - 1) {
        stopPlayback({ settle: true });
        render();
        return;
      }

      beginStepTransition(state.stepIndex + 1, { mode: "autoplay" });
    };

    if (delay <= 0) {
      launch();
      return;
    }

    state.playbackDelayId = window.setTimeout(launch, delay);
  }

  function beginStepTransition(targetIndex, { mode }) {
    if (!Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex >= state.steps.length) {
      return;
    }

    settleTransition({ commitTarget: true });

    const fromIndex = state.stepIndex;

    if (targetIndex === fromIndex) {
      render();
      return;
    }

    const fromStep = state.steps[fromIndex];
    const toStep = state.steps[targetIndex];
    const duration = getTransitionDuration(mode);

    state.stepIndex = targetIndex;

    if (animationsDisabled() || duration <= 0) {
      render();
      handleTransitionSettled(mode);
      return;
    }

    state.transition = {
      active: true,
      fromIndex,
      toIndex: targetIndex,
      fromStep,
      toStep,
      mode,
      direction: targetIndex > fromIndex ? 1 : -1,
      duration,
      startedAt: 0,
      progress: 0
    };

    render();
    state.animationFrameId = requestAnimationFrame(tickTransition);
  }

  function tickTransition(timestamp) {
    const transition = state.transition;

    if (!transition?.active) {
      state.animationFrameId = 0;
      return;
    }

    if (transition.startedAt === 0) {
      transition.startedAt = timestamp;
    }

    transition.progress = clamp((timestamp - transition.startedAt) / transition.duration, 0, 1);
    render();

    if (transition.progress >= 1) {
      state.animationFrameId = 0;
      settleTransition({ commitTarget: true });
      handleTransitionSettled(transition.mode);
      return;
    }

    state.animationFrameId = requestAnimationFrame(tickTransition);
  }

  function handleTransitionSettled(mode) {
    render();

    if (mode !== "autoplay" || !state.playing) {
      return;
    }

    if (state.stepIndex >= state.steps.length - 1) {
      stopPlayback({ settle: false });
      render();
      return;
    }

    scheduleAutoplayAdvance(getAutoplaySettleDelay());
  }

  function getTransitionDuration(mode) {
    if (animationsDisabled()) {
      return 0;
    }

    if (mode === "autoplay") {
      return clamp(Math.round(state.speed * 0.72), 44, 220);
    }

    return 300;
  }

  function getAutoplaySettleDelay() {
    return Math.max(18, state.speed - getTransitionDuration("autoplay"));
  }

  function animationsDisabled() {
    return state.prefersReducedMotion || state.speed < 250;
  }

  function settleTransition({ commitTarget }) {
    if (state.animationFrameId) {
      cancelAnimationFrame(state.animationFrameId);
      state.animationFrameId = 0;
    }

    if (state.transition?.active) {
      state.stepIndex = commitTarget ? state.transition.toIndex : state.transition.fromIndex;
    }

    state.transition = null;
  }

  function cancelMotion({ commitTarget }) {
    clearTimeout(state.playbackDelayId);
    state.playbackDelayId = 0;
    settleTransition({ commitTarget });
  }

  function stopPlayback({ settle }) {
    state.playing = false;
    clearTimeout(state.playbackDelayId);
    state.playbackDelayId = 0;

    if (settle) {
      settleTransition({ commitTarget: true });
    }
  }

  function rebuildSteps({ regenerateArray, newSeed }) {
    stopPlayback({ settle: false });
    settleTransition({ commitTarget: false });

    if (newSeed) {
      state.runSeed = nextSeed();
    }

    if (regenerateArray) {
      state.baseArray = buildBaseArray(state.size, state.preset, state.runSeed, state.algorithm);
    }

    state.steps = generateSteps(state.algorithm, state.baseArray, state.runSeed, state.heapVariant);
    state.stepIndex = 0;
    render();
  }

  function syncStaticPanels() {
    const familyMeta = FAMILY_META[state.family];
    const algorithmMeta = getCurrentAlgorithmMeta();

    refs.stageNote.textContent = familyMeta.note;
    refs.summaryIdea.textContent = algorithmMeta.idea;
    renderComplexityNode(refs.best, algorithmMeta.best);
    renderComplexityNode(refs.average, algorithmMeta.average);
    renderComplexityNode(refs.worst, algorithmMeta.worst);
    renderComplexityNode(refs.space, algorithmMeta.space);
    refs.summaryTradeoff.textContent = `Tradeoff: ${algorithmMeta.tradeoff}`;
    refs.primaryMetricLabel.textContent = algorithmMeta.primaryMetricLabel || "Comparisons";
    refs.operationsLabel.textContent = algorithmMeta.operationLabel;
    if (refs.heapCopy) {
      refs.heapCopy.textContent = algorithmMeta.heapCopy || "";
    }
    if (refs.watchList) {
      refs.watchList.innerHTML = algorithmMeta.watch.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    }
    refs.sizeOutput.textContent = String(state.size);
    refs.speedOutput.textContent = `${state.speed} ms`;
  }

  function renderComplexityNode(node, value) {
    if (!node) {
      return;
    }

    const katexExpression = complexityToKatex(value);
    node.dataset.katex = katexExpression;
    node.textContent = value;

    if (!window.katex) {
      return;
    }

    try {
      window.katex.render(katexExpression, node, {
        displayMode: false,
        throwOnError: false,
        strict: "ignore"
      });
    } catch (_error) {
      node.textContent = value;
    }
  }

  function complexityToKatex(value) {
    const normalized = String(value)
      .replace(/²/g, "^2")
      .replace(/₁/g, "_1")
      .replace(/₀/g, "_0")
      .trim();
    const body = normalized
      .replace(/^O\s*\(/, "")
      .replace(/\)\s*$/, "")
      .replace(/\blog\b/g, "\\log ");

    return `\\mathcal{O}\\left(${body}\\right)`;
  }

  function render() {
    const step = getDisplayStep();
    const phaseMeta = PHASE_META[step.phase] || PHASE_META.setup;
    const progress = state.steps.length === 0 ? 0 : ((state.stepIndex + 1) / state.steps.length) * 100;
    const isAnimating = Boolean(state.transition?.active);
    const primaryMetricValue = state.algorithm === "radix" ? step.radixPassIndex : step.comparisons;
    const operationMetricValue = state.algorithm === "radix" ? step.radixMoves : step.writesOrSwaps;

    refs.phaseChip.textContent = phaseMeta.label;
    refs.phaseChip.dataset.tone = phaseMeta.tone;
    refs.narration.textContent = step.description;
    refs.comparisons.textContent = String(primaryMetricValue);
    refs.operations.textContent = String(operationMetricValue);
    refs.stepLabel.textContent = `Step ${Math.min(state.stepIndex + 1, state.steps.length)} / ${state.steps.length}`;
    refs.progress.dataset.value = String(Math.round(progress));
    refs.progressFill.style.width = `${progress}%`;
    refs.playButton.textContent = state.playing ? "Pause" : state.stepIndex >= state.steps.length - 1 ? "Replay" : "Play";
    refs.stepBackButton.disabled = isAnimating || state.stepIndex === 0;
    refs.stepForwardButton.disabled = isAnimating || state.stepIndex >= state.steps.length - 1;

    syncAlgorithmField();
    syncHeapVariantField();
    renderPlot(step, state.transition);
    renderMergeAux(step, state.transition);
    renderHeapTree(step, state.transition);
  }

  function syncHeapVariantField() {
    refs.heapVariantField.hidden = state.algorithm !== "heap";
  }

  function syncAlgorithmField() {
    const hideAlgorithmField = state.family === "radix";
    refs.algoField.hidden = hideAlgorithmField;
    refs.stageToolbar.classList.toggle("is-radix-only", hideAlgorithmField);
  }

  function getCurrentAlgorithmMeta() {
    const algorithmMeta = ALGORITHM_META[state.algorithm];

    if (state.algorithm !== "heap") {
      return algorithmMeta;
    }

    return {
      ...algorithmMeta,
      ...(HEAP_VARIANT_META[state.heapVariant] || HEAP_VARIANT_META["lecture-min"])
    };
  }

  function getDisplayStep() {
    return state.transition?.toStep || getCurrentStep();
  }

  function renderPlot(step, transition) {
    if (state.algorithm === "radix") {
      renderRadixPlot(step, transition);
      return;
    }

    const fromStep = transition?.fromStep || step;
    const toStep = step;
    const geometry = getPlotGeometry(step.array.length);
    const motionProgress = transition ? easeInOutCubic(clamp(transition.progress, 0, 1)) : 1;
    const pulse = transition ? Math.sin(motionProgress * Math.PI) : 0;
    const fromState = getStepStateSets(fromStep);
    const toState = getStepStateSets(toStep);
    const maxValue = Math.max(...toStep.array, 1);
    const canAnimateByValue = canAnimateByValueIdentity(fromStep.array, toStep.array);
    const useInsertionOverlay = state.algorithm === "insertion" && (hasInsertionHold(fromStep) || hasInsertionHold(toStep));

    const indexMarkup = geometry.showIndexLabels
      ? toStep.array.map((_, index) => {
        const x = getSlotCenter(index, geometry);
        return `<text x="${x}" y="${geometry.height - 12}" text-anchor="middle" class="sort-plot-index-label">${index}</text>`;
      }).join("")
      : "";

    const barEntries = useInsertionOverlay
      ? buildInsertionBarEntries(fromStep, toStep, geometry, motionProgress, pulse, fromState, toState, maxValue)
      : canAnimateByValue
      ? buildValueMotionBarEntries(fromStep, toStep, geometry, motionProgress, pulse, fromState, toState, maxValue)
      : buildSlotMotionBarEntries(fromStep, toStep, geometry, motionProgress, pulse, fromState, toState, maxValue);
    const insertionMarkup = useInsertionOverlay
      ? createInsertionOverlayMarkup(fromStep, toStep, geometry, motionProgress, pulse, maxValue)
      : "";

    const barMarkup = barEntries
      .sort((left, right) => Number(left.highlighted) - Number(right.highlighted) || left.currentX - right.currentX)
      .map((entry) => entry.markup)
      .join("");

    refs.plot.dataset.animating = String(Boolean(transition?.active));
    refs.plot.innerHTML = `
      <svg viewBox="0 0 ${geometry.width} ${geometry.height}" role="img" aria-label="${escapeHtml(ALGORITHM_META[state.algorithm].name)} visualization">
        ${createGridMarkup(geometry)}
        <line x1="${geometry.padLeft}" y1="${geometry.padTop + geometry.plotHeight}" x2="${geometry.width - geometry.padRight}" y2="${geometry.padTop + geometry.plotHeight}" stroke="${COLORS.axis}" stroke-width="1.2" />
        ${createMergeMarkup(fromStep, toStep, geometry, motionProgress, pulse)}
        ${[
          createAnimatedPointerMarkup(fromStep.pivot, toStep.pivot, "pivot", 18, COLORS.pivot, geometry, motionProgress, pulse),
          createAnimatedPointerMarkup(fromStep.lo, toStep.lo, "lo", 34, COLORS.pointer, geometry, motionProgress, pulse),
          createAnimatedPointerMarkup(fromStep.hi, toStep.hi, "hi", 50, COLORS.pointer, geometry, motionProgress, pulse)
        ].join("")}
        ${barMarkup}
        ${insertionMarkup}
        ${indexMarkup}
      </svg>
    `;
  }

  function renderRadixPlot(step, transition) {
    const fromStep = transition?.fromStep || step;
    const toStep = step;
    const geometry = getRadixPlotGeometry(toStep.radixMainSlots.length || toStep.array.length || 1);
    const motionProgress = transition ? easeInOutCubic(clamp(transition.progress, 0, 1)) : 1;
    const pulse = transition ? Math.sin(motionProgress * Math.PI) : 0;
    const fromPositions = buildRadixPositionMap(fromStep, geometry);
    const toPositions = buildRadixPositionMap(toStep, geometry);
    const entries = Array.isArray(toStep.radixEntries) && toStep.radixEntries.length > 0
      ? toStep.radixEntries
      : (fromStep.radixEntries || []);
    const cardMarkup = entries
      .map((entry) => buildRadixCardEntry(entry, fromPositions.get(entry.id), toPositions.get(entry.id), toStep, motionProgress, pulse))
      .filter(Boolean)
      .sort((left, right) => Number(left.highlighted) - Number(right.highlighted) || left.y - right.y || left.x - right.x)
      .map((entry) => entry.markup)
      .join("");

    refs.plot.dataset.animating = String(Boolean(transition?.active));
    refs.plot.innerHTML = `
      <svg viewBox="0 0 ${geometry.width} ${geometry.height}" role="img" aria-label="Radix sort visualization">
        ${createRadixPassMarkup(toStep, geometry)}
        ${createRadixMainLaneMarkup(toStep, geometry)}
        ${createRadixBucketMarkup(toStep, geometry)}
        ${cardMarkup}
      </svg>
    `;
  }

  function renderMergeAux(step, transition) {
    if (state.algorithm !== "merge") {
      refs.mergePanel.hidden = true;
      refs.mergeAux.innerHTML = "";
      refs.mergeAux.dataset.animating = "false";
      return;
    }

    refs.mergePanel.hidden = false;

    const fromStep = transition?.fromStep || step;
    const toStep = step;
    const motionProgress = transition ? easeInOutCubic(clamp(transition.progress, 0, 1)) : 1;
    const pulse = transition ? Math.sin(motionProgress * Math.PI) : 0;
    const plotGeometry = getPlotGeometry(step.array.length);
    const auxGeometry = getMergeAuxGeometry(plotGeometry);
    const fromAux = getMergeAuxState(fromStep);
    const toAux = getMergeAuxState(toStep);

    refs.mergeAux.dataset.animating = String(Boolean(transition?.active));
    refs.mergeAux.innerHTML = `
      <svg viewBox="0 0 ${plotGeometry.width} ${auxGeometry.height}" role="img" aria-label="Merge temporary space">
        ${createMergeAuxTrackMarkup(fromAux, toAux, plotGeometry, auxGeometry, motionProgress)}
        ${createMergeAuxWriteGhostMarkup(fromAux, toAux, plotGeometry, auxGeometry, motionProgress, pulse)}
        ${createMergeAuxLaneMarkup("left", fromAux, toAux, plotGeometry, auxGeometry, motionProgress, pulse)}
        ${createMergeAuxLaneMarkup("right", fromAux, toAux, plotGeometry, auxGeometry, motionProgress, pulse)}
      </svg>
    `;
  }

  function renderHeapTree(step, transition) {
    if (state.algorithm !== "heap") {
      refs.heapPanel.hidden = true;
      refs.heapTree.innerHTML = "";
      refs.heapTree.dataset.animating = "false";
      return;
    }

    refs.heapPanel.hidden = false;

    const fromStep = transition?.fromStep || step;
    const toStep = step;
    const fromState = getStepStateSets(fromStep);
    const toState = getStepStateSets(toStep);
    const fromValueIndex = buildValueIndexMap(fromStep.array);
    const toValueIndex = buildValueIndexMap(toStep.array);
    const motionProgress = transition ? easeInOutCubic(clamp(transition.progress, 0, 1)) : 1;
    const pulse = transition ? Math.sin(motionProgress * Math.PI) : 0;
    const visibleCount = Math.min(step.array.length, 31);
    const fromHeapSize = Number.isInteger(fromStep.heapSize) ? fromStep.heapSize : fromStep.array.length;
    const toHeapSize = Number.isInteger(toStep.heapSize) ? toStep.heapSize : toStep.array.length;
    const width = 620;
    const height = 240;
    const levels = Math.max(1, Math.ceil(Math.log2(visibleCount + 1)));
    const radius = clamp(24 - levels * 2, 12, 18);
    const activeEdges = getHeapActiveEdges(toStep);

    const lineMarkup = [];
    const nodeEntries = [];

    for (let index = 0; index < visibleCount; index += 1) {
      const point = getHeapPoint(index, levels, width, height);
      const children = [2 * index + 1, 2 * index + 2];

      children.forEach((child) => {
        if (child >= visibleCount) {
          return;
        }

        const childPoint = getHeapPoint(child, levels, width, height);
        const key = `${index}-${child}`;
        const edgePulse = activeEdges.has(key) ? pulse : 0;
        const opacity = lerp(index < fromHeapSize && child < fromHeapSize ? 0.26 : 0.08, index < toHeapSize && child < toHeapSize ? 0.26 : 0.08, motionProgress);
        const stroke = edgePulse > 0 ? mixColor("rgba(59, 83, 100, 0.26)", getPhaseColor(toStep.phase), edgePulse * 0.8) : "rgba(59, 83, 100, 0.26)";

        lineMarkup.push(
          `<line class="sort-heap-edge${edgePulse > 0 ? " sort-heap-edge-active" : ""}" x1="${point.x}" y1="${point.y}" x2="${childPoint.x}" y2="${childPoint.y}" stroke="${stroke}" stroke-width="${2 + edgePulse * 1.4}" opacity="${opacity + edgePulse * 0.18}" />`
        );
      });
    }

    toStep.array.forEach((value) => {
      const fromIndex = fromValueIndex.get(value);
      const toIndex = toValueIndex.get(value);
      const fromPoint = getHeapPoint(fromIndex, levels, width, height);
      const toPoint = getHeapPoint(toIndex, levels, width, height);
      const x = lerp(fromPoint.x, toPoint.x, motionProgress);
      const y = lerp(fromPoint.y, toPoint.y, motionProgress);
      const fill = transition
        ? mixColor(
          getBarFill(fromIndex, fromStep, fromState.active, fromState.sorted),
          getBarFill(toIndex, toStep, toState.active, toState.sorted),
          motionProgress
        )
        : getBarFill(toIndex, toStep, toState.active, toState.sorted);
      const opacity = lerp(fromIndex < fromHeapSize ? 1 : 0.45, toIndex < toHeapSize ? 1 : 0.45, motionProgress);
      const highlighted = toState.active.has(toIndex);
      const nodePulse = highlighted ? pulse : 0;
      const nodeRadius = radius + nodePulse * 1.4;

      nodeEntries.push({
        highlighted,
        y,
        markup: `
          <g opacity="${opacity}">
            <circle class="sort-heap-node${highlighted ? " sort-heap-node-active" : ""}" cx="${x}" cy="${y}" r="${nodeRadius}" fill="${fill}" stroke="rgba(18, 44, 62, 0.2)" stroke-width="${1.4 + nodePulse * 0.3}" />
            <text x="${x}" y="${y + 4}" text-anchor="middle" fill="#102838" font-family="monospace" font-size="${radius - 2}" font-weight="700">${value}</text>
          </g>
        `
      });
    });

    refs.heapTree.dataset.animating = String(Boolean(transition?.active));
    refs.heapTree.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Heap tree">
        <text x="12" y="20" class="sort-plot-note">Heap size: ${toHeapSize}</text>
        ${lineMarkup.join("")}
        ${nodeEntries
          .sort((left, right) => Number(left.highlighted) - Number(right.highlighted) || left.y - right.y)
          .map((entry) => entry.markup)
          .join("")}
      </svg>
    `;
  }

  function getPlotGeometry(count) {
    const width = 860;
    const height = 300;
    const padLeft = 36;
    const padRight = 24;
    const padBottom = 28;
    const padTop = 18;
    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;
    const gap = count >= 22 ? 5 : count >= 14 ? 7 : 9;
    const barWidth = (plotWidth - gap * (count - 1)) / count;

    return {
      width,
      height,
      padLeft,
      padRight,
      padBottom,
      padTop,
      plotWidth,
      plotHeight,
      gap,
      barWidth,
      showValueLabels: barWidth >= 18,
      showIndexLabels: barWidth >= 20
    };
  }

  function getRadixPlotGeometry(count) {
    const width = 860;
    const height = 430;
    const padLeft = 36;
    const padRight = 24;
    const mainLabelX = 36;
    const mainLineStartX = 134;
    const mainLineY = 56;
    const laneWidth = width - padLeft - padRight;
    const mainGap = count >= 15 ? 6 : count >= 12 ? 8 : 10;
    const mainCardWidth = (laneWidth - mainGap * Math.max(0, count - 1)) / Math.max(1, count);
    const mainCardHeight = clamp(mainCardWidth * 0.58, 30, 40);
    const mainCardY = 72;
    const bucketGap = 12;
    const bucketCols = 5;
    const bucketWidth = (laneWidth - bucketGap * (bucketCols - 1)) / bucketCols;
    const bucketHeight = 118;
    const bucketRowOneY = 148;
    const bucketRowGap = 18;
    const bucketRowTwoY = bucketRowOneY + bucketHeight + bucketRowGap;

    return {
      width,
      height,
      padLeft,
      padRight,
      mainLabelX,
      mainLineStartX,
      mainLineY,
      mainCardY,
      mainGap,
      mainCardWidth,
      mainCardHeight,
      bucketGap,
      bucketWidth,
      bucketHeight,
      bucketRowOneY,
      bucketRowTwoY
    };
  }

  function buildRadixPositionMap(step, geometry) {
    const positions = new Map();
    const mainSlots = Array.isArray(step.radixMainSlots) ? step.radixMainSlots : [];
    const buckets = Array.isArray(step.radixBuckets) ? step.radixBuckets : [];

    mainSlots.forEach((entryId, index) => {
      if (!entryId) {
        return;
      }

      positions.set(entryId, getRadixMainSlotRect(index, geometry));
    });

    buckets.forEach((bucket, bucketIndex) => {
      bucket.forEach((entryId, slotIndex) => {
        positions.set(entryId, getRadixBucketSlotRect(bucketIndex, slotIndex, geometry));
      });
    });

    return positions;
  }

  function getRadixMainSlotRect(index, geometry) {
    return {
      area: "main",
      index,
      x: geometry.padLeft + index * (geometry.mainCardWidth + geometry.mainGap),
      y: geometry.mainCardY,
      width: geometry.mainCardWidth,
      height: geometry.mainCardHeight
    };
  }

  function getRadixBucketTrayRect(bucketIndex, geometry) {
    const row = bucketIndex < 5 ? 0 : 1;
    const column = bucketIndex % 5;
    const y = row === 0 ? geometry.bucketRowOneY : geometry.bucketRowTwoY;

    return {
      x: geometry.padLeft + column * (geometry.bucketWidth + geometry.bucketGap),
      y,
      width: geometry.bucketWidth,
      height: geometry.bucketHeight
    };
  }

  function getRadixBucketSlotRect(bucketIndex, slotIndex, geometry) {
    const tray = getRadixBucketTrayRect(bucketIndex, geometry);
    const columns = 3;
    const innerPadX = 10;
    const innerPadY = 34;
    const gapX = 6;
    const gapY = 8;
    const cardWidth = (tray.width - innerPadX * 2 - gapX * (columns - 1)) / columns;
    const cardHeight = 26;
    const column = slotIndex % columns;
    const row = Math.floor(slotIndex / columns);

    return {
      area: "bucket",
      bucketIndex,
      slotIndex,
      x: tray.x + innerPadX + column * (cardWidth + gapX),
      y: tray.y + innerPadY + row * (cardHeight + gapY),
      width: cardWidth,
      height: cardHeight
    };
  }

  function createRadixPassMarkup(step, geometry) {
    const placeLabel = step.radixDigitLabel
      ? `Pass ${step.radixPassIndex || 0} • ${capitalize(step.radixDigitLabel)} digit`
      : "Radix setup";
    const detail = step.phase === "sign-gather"
      ? "Final sign-aware gather"
      : step.phase === "distribute"
        ? "Distribute into buckets"
        : step.phase === "gather"
          ? "Gather buckets back into the main array"
          : step.phase === "pass-complete"
            ? "Digit pass complete"
            : "Digit buckets";

    return `
      <text x="${geometry.padLeft}" y="18" class="sort-radix-pass-note">${escapeHtml(placeLabel)}</text>
      <text x="${geometry.padLeft}" y="38" class="sort-radix-pass-note" opacity="0.78">${escapeHtml(detail)}</text>
    `;
  }

  function createRadixMainLaneMarkup(step, geometry) {
    const slots = Array.isArray(step.radixMainSlots) ? step.radixMainSlots : [];
    const placeholders = slots.map((entryId, index) => {
      const rect = getRadixMainSlotRect(index, geometry);
      const isFilled = Boolean(entryId);
      return `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" rx="${Math.min(10, rect.width / 4)}" ry="${Math.min(10, rect.width / 4)}" fill="${isFilled ? "rgba(78, 148, 210, 0.08)" : "rgba(78, 148, 210, 0.04)"}" stroke="rgba(18, 44, 62, ${isFilled ? 0.12 : 0.16})" stroke-width="1.1" stroke-dasharray="${isFilled ? "0" : "5 4"}" />`;
    }).join("");

    return `
      <text x="${geometry.mainLabelX}" y="${geometry.mainLineY}" class="sort-radix-lane-label">Main array</text>
      <line x1="${geometry.mainLineStartX}" y1="${geometry.mainLineY}" x2="${geometry.width - geometry.padRight}" y2="${geometry.mainLineY}" stroke="rgba(59, 83, 100, 0.22)" stroke-width="1.4" stroke-linecap="round" />
      ${placeholders}
    `;
  }

  function createRadixBucketMarkup(step, geometry) {
    const buckets = Array.isArray(step.radixBuckets) ? step.radixBuckets : Array.from({ length: 10 }, () => []);

    return buckets.map((bucket, bucketIndex) => {
      const tray = getRadixBucketTrayRect(bucketIndex, geometry);
      const active = step.radixActiveBucket === bucketIndex;
      const fill = active
        ? "rgba(211, 155, 45, 0.14)"
        : "rgba(127, 145, 201, 0.08)";
      const stroke = active
        ? "rgba(183, 145, 46, 0.4)"
        : "rgba(18, 44, 62, 0.12)";

      return `
        <g>
          <rect x="${tray.x}" y="${tray.y}" width="${tray.width}" height="${tray.height}" rx="20" ry="20" fill="${fill}" stroke="${stroke}" stroke-width="1.2" />
          <text x="${tray.x + 12}" y="${tray.y + 18}" class="sort-radix-bucket-label">Bucket ${bucketIndex}</text>
          <text x="${tray.x + tray.width - 12}" y="${tray.y + 18}" text-anchor="end" class="sort-radix-bucket-count">${bucket.length}</text>
        </g>
      `;
    }).join("");
  }

  function buildRadixCardEntry(entry, fromRect, toRect, step, progress, pulse) {
    const sourceRect = fromRect || toRect;
    const targetRect = toRect || fromRect;

    if (!sourceRect || !targetRect) {
      return null;
    }

    const x = lerp(sourceRect.x, targetRect.x, progress);
    const y = lerp(sourceRect.y, targetRect.y, progress);
    const width = lerp(sourceRect.width, targetRect.width, progress);
    const height = lerp(sourceRect.height, targetRect.height, progress);
    const highlighted = step.radixActiveEntryId === entry.id;
    const emphasis = highlighted ? pulse : 0;
    const fill = getRadixCardFill(step, entry, targetRect.area, highlighted);
    const stroke = highlighted ? "rgba(18, 44, 62, 0.42)" : "rgba(18, 44, 62, 0.18)";
    const radius = Math.min(10, width / 4);
    const labelMeta = getRadixCardLabelMeta(entry.value, step.radixPlace);
    const fontSize = getRadixCardFontSize(labelMeta.measureLabel, width, height);
    const glow = highlighted
      ? `<rect class="sort-radix-card-glow" x="${x - 2}" y="${y - 2}" width="${width + 4}" height="${height + 4}" rx="${radius + 2}" ry="${radius + 2}" fill="${fill}" opacity="${0.08 + emphasis * 0.14}" />`
      : "";

    return {
      highlighted,
      x,
      y,
      markup: `
        <g>
          ${glow}
          <rect x="${x}" y="${y - emphasis * 3}" width="${width}" height="${height + emphasis * 2}" rx="${radius}" ry="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${1.2 + emphasis * 0.2}" />
          ${buildRadixCardLabelMarkup(labelMeta.parts, x + width / 2, y + height / 2 + fontSize * 0.34 - emphasis * 3, fontSize)}
        </g>
      `
    };
  }

  function getRadixCardFill(step, entry, area, highlighted) {
    if (step.phase === "done") {
      return COLORS.done;
    }

    if (highlighted) {
      if (step.phase === "distribute") {
        return COLORS.compare;
      }

      if (step.phase === "gather" || step.phase === "sign-gather") {
        return COLORS.action;
      }
    }

    if (area === "bucket") {
      return mixColor(COLORS.base, COLORS.structure, 0.48);
    }

    return entry.value < 0
      ? mixColor(COLORS.base, COLORS.pointer, 0.22)
      : COLORS.base;
  }

  function getRadixCardFontSize(label, width, height) {
    const natural = Math.min(height * 0.5, width / Math.max(2, label.length * 0.6));
    return clamp(natural, 9, 17);
  }

  function getRadixCardLabelMeta(value, place) {
    if (!Number.isFinite(place) || place < 1) {
      return {
        measureLabel: String(value),
        parts: [{ text: String(value), classes: [] }]
      };
    }

    const activeIndexFromRight = Math.max(0, Math.round(Math.log10(place)));
    const digits = String(Math.abs(value)).split("");
    const leadingZeroCount = Math.max(0, activeIndexFromRight + 1 - digits.length);
    const paddedDigits = Array.from({ length: leadingZeroCount }, () => "0").concat(digits);
    const activeDigitIndex = paddedDigits.length - 1 - activeIndexFromRight;
    const parts = [];

    if (value < 0) {
      parts.push({ text: "-", classes: [] });
    }

    paddedDigits.forEach((digit, index) => {
      const classes = [];

      if (index < leadingZeroCount) {
        classes.push("sort-radix-card-digit-placeholder");
      }

      if (index === activeDigitIndex) {
        classes.push("sort-radix-card-digit-active");
      }

      parts.push({ text: digit, classes });
    });

    return {
      measureLabel: `${value < 0 ? "-" : ""}${paddedDigits.join("")}`,
      parts
    };
  }

  function buildRadixCardLabelMarkup(parts, x, y, fontSize) {
    const charAdvance = getRadixCardCharacterAdvance(fontSize);
    const totalWidth = parts.length * charAdvance;
    const startX = x - totalWidth / 2 + charAdvance / 2;
    const activeIndex = parts.findIndex((part) => part.classes.includes("sort-radix-card-digit-active"));
    const activeCenterX = activeIndex >= 0 ? startX + activeIndex * charAdvance : null;
    const badgeWidth = charAdvance * 1.02;
    const badgeHeight = fontSize * 1.12;
    const badgeY = y - fontSize * 0.9;
    const badgeMarkup = activeCenterX === null
      ? ""
      : `
        <rect
          x="${activeCenterX - badgeWidth / 2}"
          y="${badgeY}"
          width="${badgeWidth}"
          height="${badgeHeight}"
          rx="${Math.min(4, badgeHeight * 0.24)}"
          ry="${Math.min(4, badgeHeight * 0.24)}"
          class="sort-radix-card-digit-badge"
        />
      `;
    const textMarkup = parts.map((part, index) => {
      const className = ["sort-radix-card-label"].concat(part.classes).join(" ");
      return `<text x="${startX + index * charAdvance}" y="${y}" text-anchor="middle" class="${className}" font-size="${fontSize}px">${escapeHtml(part.text)}</text>`;
    }).join("");

    return `<g>${badgeMarkup}${textMarkup}</g>`;
  }

  function getRadixCardCharacterAdvance(fontSize) {
    return fontSize * 0.62;
  }

  function getMergeAuxGeometry(plotGeometry) {
    return {
      width: plotGeometry.width,
      height: 108,
      labelX: plotGeometry.padLeft,
      lineStartX: plotGeometry.padLeft + 104,
      leftLabelY: 48,
      rightLabelY: 92,
      leftLaneY: 10,
      rightLaneY: 56,
      laneHeight: 22,
      writeTopY: 8
    };
  }

  function getMergeAuxState(step) {
    const left = Array.isArray(step.auxLeft) ? step.auxLeft.map((entry) => ({ ...entry })) : [];
    const right = Array.isArray(step.auxRight) ? step.auxRight.map((entry) => ({ ...entry })) : [];

    return {
      left,
      right,
      leftCursor: clamp(Number.isInteger(step.auxLeftCursor) ? step.auxLeftCursor : 0, 0, left.length),
      rightCursor: clamp(Number.isInteger(step.auxRightCursor) ? step.auxRightCursor : 0, 0, right.length),
      writeIndex: Number.isInteger(step.auxWriteIndex) ? step.auxWriteIndex : null,
      range: step.auxRange ? { ...step.auxRange } : null,
      phase: step.auxPhase || "idle"
    };
  }

  function createMergeAuxTrackMarkup(fromAux, toAux, plotGeometry, auxGeometry, progress) {
    return `
      ${createMergeAuxWriteGuideMarkup(fromAux.writeIndex, toAux.writeIndex, plotGeometry, auxGeometry, progress)}
      <text x="${auxGeometry.labelX}" y="${auxGeometry.leftLabelY}" class="sort-merge-label">Left temp</text>
      <line x1="${auxGeometry.lineStartX}" y1="${auxGeometry.leftLabelY}" x2="${plotGeometry.width - plotGeometry.padRight}" y2="${auxGeometry.leftLabelY}" stroke="rgba(59, 83, 100, 0.22)" stroke-width="1.4" stroke-linecap="round" />
      <text x="${auxGeometry.labelX}" y="${auxGeometry.rightLabelY}" class="sort-merge-label">Right temp</text>
      <line x1="${auxGeometry.lineStartX}" y1="${auxGeometry.rightLabelY}" x2="${plotGeometry.width - plotGeometry.padRight}" y2="${auxGeometry.rightLabelY}" stroke="rgba(59, 83, 100, 0.22)" stroke-width="1.4" stroke-linecap="round" />
    `;
  }

  function createMergeAuxRangeBand(side, fromRange, toRange, plotGeometry, auxGeometry, progress) {
    const fromSpan = getMergeAuxLaneSpan(side, fromRange);
    const toSpan = getMergeAuxLaneSpan(side, toRange);

    if (!fromSpan && !toSpan) {
      return "";
    }

    const startIndex = lerp(fromSpan ? fromSpan.start : toSpan.start, toSpan ? toSpan.start : fromSpan.start, progress);
    const endIndex = lerp(fromSpan ? fromSpan.end : toSpan.end, toSpan ? toSpan.end : fromSpan.end, progress);
    const x = getBarX(startIndex, plotGeometry) - 4;
    const width = Math.max(10, getBarX(endIndex, plotGeometry) + plotGeometry.barWidth - getBarX(startIndex, plotGeometry) + 8);
    const y = side === "left" ? auxGeometry.leftLaneY - 5 : auxGeometry.rightLaneY - 5;
    const height = auxGeometry.laneHeight + 10;
    const opacity = lerp(fromSpan ? 0.18 : 0, toSpan ? 0.26 : 0, progress);
    const fill = side === "left" ? "rgba(127, 145, 201, 0.34)" : "rgba(77, 166, 182, 0.3)";

    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="14" ry="14" fill="${fill}" opacity="${opacity}" />`;
  }

  function getMergeAuxLaneSpan(side, range) {
    if (!range) {
      return null;
    }

    if (side === "left") {
      return { start: range.left, end: range.middle };
    }

    return { start: range.middle + 1, end: range.right };
  }

  function createMergeAuxWriteGuideMarkup(fromWriteIndex, toWriteIndex, plotGeometry, auxGeometry, progress) {
    const fromIsNumber = Number.isInteger(fromWriteIndex);
    const toIsNumber = Number.isInteger(toWriteIndex);

    if (!fromIsNumber && !toIsNumber) {
      return "";
    }

    const x = lerp(
      getSlotCenter(fromIsNumber ? fromWriteIndex : toWriteIndex, plotGeometry),
      getSlotCenter(toIsNumber ? toWriteIndex : fromWriteIndex, plotGeometry),
      progress
    );
    const opacity = lerp(fromIsNumber ? 0.34 : 0, toIsNumber ? 0.46 : 0, progress);
    const upperY2 = auxGeometry.leftLabelY - 12;
    const lowerY1 = auxGeometry.rightLaneY - 6;
    const lowerY2 = auxGeometry.rightLabelY - 12;

    return `
      <line x1="${x}" y1="${auxGeometry.writeTopY}" x2="${x}" y2="${upperY2}" stroke="${COLORS.action}" stroke-width="1.4" stroke-dasharray="4 4" opacity="${opacity}" />
      <line x1="${x}" y1="${lowerY1}" x2="${x}" y2="${lowerY2}" stroke="${COLORS.action}" stroke-width="1.4" stroke-dasharray="4 4" opacity="${opacity}" />
      <text x="${x + 8}" y="14" class="sort-merge-note" fill="${COLORS.action}" opacity="${opacity}">write</text>
    `;
  }

  function createMergeAuxLaneMarkup(side, fromAux, toAux, plotGeometry, auxGeometry, progress, pulse) {
    const fromEntries = decorateMergeAuxEntries(fromAux[side], fromAux[`${side}Cursor`]);
    const toEntries = decorateMergeAuxEntries(toAux[side], toAux[`${side}Cursor`]);
    const entryIds = [
      ...toEntries.map((entry) => entry.id),
      ...fromEntries.filter((entry) => !toEntries.some((candidate) => candidate.id === entry.id)).map((entry) => entry.id)
    ];
    const laneY = side === "left" ? auxGeometry.leftLaneY : auxGeometry.rightLaneY;

    return entryIds.map((id) => {
      const fromEntry = fromEntries.find((entry) => entry.id === id) || null;
      const toEntry = toEntries.find((entry) => entry.id === id) || null;
      const sourceIndex = (toEntry || fromEntry)?.sourceIndex;

      if (!Number.isInteger(sourceIndex)) {
        return "";
      }

      const xFrom = fromEntry ? getBarX(fromEntry.sourceIndex, plotGeometry) : getBarX(sourceIndex, plotGeometry);
      const xTo = toEntry ? getBarX(toEntry.sourceIndex, plotGeometry) : getBarX(sourceIndex, plotGeometry);
      const yFrom = fromEntry ? laneY : laneY - 26;
      const yTo = toEntry ? laneY : laneY - 26;
      const currentX = lerp(xFrom, xTo, progress);
      const currentY = lerp(yFrom, yTo, progress);
      const opacity = lerp(
        fromEntry ? getMergeAuxEntryOpacity(fromEntry) : 0,
        toEntry ? getMergeAuxEntryOpacity(toEntry) : 0,
        progress
      );

      if (opacity <= 0.01) {
        return "";
      }

      const isActive = Boolean(toEntry?.active);
      const emphasis = isActive ? pulse : 0;
      const fill = mixColor(
        fromEntry ? getMergeAuxEntryFill(side, fromEntry, fromAux.phase) : getMergeAuxEntryFill(side, toEntry, toAux.phase),
        toEntry ? getMergeAuxEntryFill(side, toEntry, toAux.phase) : getMergeAuxEntryFill(side, fromEntry, fromAux.phase),
        progress
      );
      const stroke = mixColor(
        fromEntry ? getMergeAuxEntryStroke(fromEntry) : getMergeAuxEntryStroke(toEntry),
        toEntry ? getMergeAuxEntryStroke(toEntry) : getMergeAuxEntryStroke(fromEntry),
        progress
      );
      const width = plotGeometry.barWidth;
      const height = auxGeometry.laneHeight + emphasis * 2.2;
      const y = currentY - emphasis * 3;
      const radius = Math.min(8, width / 4);
      const glow = isActive
        ? `<rect class="sort-merge-entry-glow" x="${currentX - 1.5}" y="${y - 2}" width="${width + 3}" height="${height + 4}" rx="${radius + 1.5}" ry="${radius + 1.5}" fill="${fill}" opacity="${0.08 + emphasis * 0.16}" />`
        : "";

      return `
        <g aria-label="${escapeHtml(side)} temp entry ${escapeHtml(String((toEntry || fromEntry).value))}">
          ${glow}
          <rect x="${currentX}" y="${y}" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${1.1 + emphasis * 0.2}" opacity="${opacity}" />
          <text x="${currentX + width / 2}" y="${y + 15}" text-anchor="middle" class="sort-merge-entry-label" opacity="${Math.min(1, opacity + 0.12)}">${escapeHtml(String((toEntry || fromEntry).value))}</text>
        </g>
      `;
    }).join("");
  }

  function decorateMergeAuxEntries(entries, cursor) {
    return entries.map((entry, index) => ({
      ...entry,
      consumed: index < cursor,
      active: index === cursor
    }));
  }

  function getMergeAuxEntryOpacity(entry) {
    return entry.consumed ? 0.34 : 0.94;
  }

  function getMergeAuxEntryFill(side, entry, phase) {
    const base = side === "left" ? "#8fa5d7" : "#86b4c3";

    if (!entry) {
      return base;
    }

    if (entry.consumed) {
      return "rgba(142, 157, 170, 0.5)";
    }

    if (entry.active) {
      return mixColor(base, getPhaseColor(phase), phase === "compare" ? 0.58 : 0.42);
    }

    return base;
  }

  function getMergeAuxEntryStroke(entry) {
    return entry?.active
      ? "rgba(18, 44, 62, 0.4)"
      : entry?.consumed
        ? "rgba(18, 44, 62, 0.12)"
        : "rgba(18, 44, 62, 0.22)";
  }

  function createMergeAuxWriteGhostMarkup(fromAux, toAux, plotGeometry, auxGeometry, progress, pulse) {
    if (progress <= 0 || progress >= 1) {
      return "";
    }

    const motions = [
      ...collectMergeAuxWriteMotions("left", fromAux.left, fromAux.leftCursor, toAux.left, toAux.leftCursor, fromAux.writeIndex, toAux.writeIndex, plotGeometry, auxGeometry),
      ...collectMergeAuxWriteMotions("right", fromAux.right, fromAux.rightCursor, toAux.right, toAux.rightCursor, fromAux.writeIndex, toAux.writeIndex, plotGeometry, auxGeometry)
    ];

    return motions.map((motion) => {
      const currentX = lerp(motion.fromX, motion.toX, progress);
      const currentY = lerp(motion.fromY, motion.toY, progress) - Math.sin(progress * Math.PI) * 8;
      const width = Math.max(16, plotGeometry.barWidth * 0.82);
      const height = auxGeometry.laneHeight - 4;
      const opacity = Math.sin(progress * Math.PI) * 0.95;

      return `
        <g class="sort-merge-entry-ghost" opacity="${opacity}">
          <rect x="${currentX - width / 2}" y="${currentY - height / 2}" width="${width}" height="${height}" rx="${Math.min(8, width / 4)}" ry="${Math.min(8, width / 4)}" fill="${motion.fill}" stroke="rgba(18, 44, 62, 0.24)" stroke-width="1.1" />
          <text x="${currentX}" y="${currentY + 4}" text-anchor="middle" class="sort-merge-entry-label">${escapeHtml(String(motion.value))}</text>
        </g>
      `;
    }).join("");
  }

  function collectMergeAuxWriteMotions(side, fromEntries, fromCursor, toEntries, toCursor, fromWriteIndex, toWriteIndex, plotGeometry, auxGeometry) {
    if (fromCursor === toCursor) {
      return [];
    }

    const laneCenterY = (side === "left" ? auxGeometry.leftLaneY : auxGeometry.rightLaneY) + auxGeometry.laneHeight / 2;
    const topY = 10;

    if (fromCursor < toCursor) {
      const entry = fromEntries[fromCursor];
      const writeIndex = Number.isInteger(toWriteIndex) ? toWriteIndex : fromWriteIndex;

      if (!entry || !Number.isInteger(writeIndex)) {
        return [];
      }

      return [{
        value: entry.value,
        fill: getMergeAuxEntryFill(side, { consumed: false, active: true }, "write"),
        fromX: getSlotCenter(entry.sourceIndex, plotGeometry),
        toX: getSlotCenter(writeIndex, plotGeometry),
        fromY: laneCenterY,
        toY: topY
      }];
    }

    const entry = toEntries[toCursor];
    const writeIndex = Number.isInteger(fromWriteIndex) ? fromWriteIndex : toWriteIndex;

    if (!entry || !Number.isInteger(writeIndex)) {
      return [];
    }

    return [{
      value: entry.value,
      fill: getMergeAuxEntryFill(side, { consumed: false, active: true }, "write"),
      fromX: getSlotCenter(writeIndex, plotGeometry),
      toX: getSlotCenter(entry.sourceIndex, plotGeometry),
      fromY: topY,
      toY: laneCenterY
    }];
  }

  function buildValueMotionBarEntries(fromStep, toStep, geometry, motionProgress, pulse, fromState, toState, maxValue) {
    const fromValueIndex = buildValueIndexMap(fromStep.array);
    const toValueIndex = buildValueIndexMap(toStep.array);

    return toStep.array.map((value) => buildBarEntry({
      x: lerp(getBarX(fromValueIndex.get(value), geometry), getBarX(toValueIndex.get(value), geometry), motionProgress),
      value,
      fromIndex: fromValueIndex.get(value),
      toIndex: toValueIndex.get(value),
      fromStep,
      toStep,
      fromState,
      toState,
      geometry,
      pulse,
      maxValue,
      motionProgress,
      movingWeight: fromValueIndex.get(value) === toValueIndex.get(value) ? 1 : 0.58
    }));
  }

  function buildSlotMotionBarEntries(fromStep, toStep, geometry, motionProgress, pulse, fromState, toState, maxValue) {
    return toStep.array.map((value, index) => {
      const fromValue = fromStep.array[index] ?? value;
      const tweenValue = lerp(fromValue, value, motionProgress);

      return buildBarEntry({
        x: getBarX(index, geometry),
        value,
        labelValue: motionProgress < 0.5 && fromValue !== value ? fromValue : value,
        fromIndex: index,
        toIndex: index,
        fromStep,
        toStep,
        fromState,
        toState,
        geometry,
        pulse,
        maxValue,
        motionProgress,
        baseValue: tweenValue,
        movingWeight: 1
      });
    });
  }

  function buildInsertionBarEntries(fromStep, toStep, geometry, motionProgress, pulse, fromState, toState, maxValue) {
    return toStep.array.map((value, index) => {
      if (isInsertionHoleAtIndex(toStep, index)) {
        return null;
      }

      return buildBarEntry({
        x: getBarX(index, geometry),
        value,
        labelValue: value,
        fromIndex: index,
        toIndex: index,
        fromStep: toStep,
        toStep,
        fromState: toState,
        toState,
        geometry,
        pulse,
        maxValue,
        motionProgress: 1,
        baseValue: value,
        movingWeight: 1
      });
    }).filter(Boolean);
  }

  function buildBarEntry({
    x,
    value,
    labelValue = value,
    fromIndex,
    toIndex,
    fromStep,
    toStep,
    fromState,
    toState,
    geometry,
    pulse,
    maxValue,
    motionProgress,
    baseValue = value,
    movingWeight
  }) {
    const baseHeight = Math.max(10, (baseValue / maxValue) * geometry.plotHeight);
    const isHighlighted = isPlotIndexHighlighted(toIndex, toStep, toState.active);
    const emphasis = isHighlighted ? pulse * movingWeight : 0;
    const fromHole = isInsertionHoleAtIndex(fromStep, fromIndex);
    const toHole = isInsertionHoleAtIndex(toStep, toIndex);
    const holdOpacity = lerp(fromHole ? 0.08 : 1, toHole ? 0.08 : 1, motionProgress);
    const barHeight = baseHeight + emphasis * 10;
    const y = geometry.padTop + geometry.plotHeight - barHeight - emphasis * 7;
    const fill = mixColor(
      getBarFill(fromIndex, fromStep, fromState.active, fromState.sorted),
      getBarFill(toIndex, toStep, toState.active, toState.sorted),
      motionProgress
    );
    const stroke = mixColor(
      getBarStroke(fromIndex, fromStep, fromState.active),
      getBarStroke(toIndex, toStep, toState.active),
      motionProgress
    );
    const radius = Math.min(8, geometry.barWidth / 4);
    const textY = y + 16;
    const valueLabel = geometry.showValueLabels
      ? `<text x="${x + geometry.barWidth / 2}" y="${textY}" text-anchor="middle" class="sort-plot-bar-value" opacity="${holdOpacity}">${escapeHtml(String(Math.round(labelValue)))}</text>`
      : "";
    const glow = isHighlighted
      ? `<rect class="sort-plot-bar-glow" x="${x - 2}" y="${y - 3}" width="${geometry.barWidth + 4}" height="${barHeight + 6}" rx="${radius + 2}" ry="${radius + 2}" fill="${fill}" opacity="${0.09 + emphasis * 0.16}" />`
      : "";
    const rectOpacity = holdOpacity;

    return {
      currentX: x,
      highlighted: isHighlighted,
      markup: `
        <g class="sort-plot-bar">
          ${glow}
          <rect x="${x}" y="${y}" width="${geometry.barWidth}" height="${barHeight}" rx="${radius}" ry="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${1.2 + emphasis * 0.25}" opacity="${rectOpacity}" />
          ${valueLabel}
        </g>
      `
    };
  }

  function createInsertionOverlayMarkup(fromStep, toStep, geometry, progress, pulse, maxValue) {
    const sourceKey = hasInsertionHold(fromStep) ? fromStep.insertionKey : toStep.insertionKey;
    const targetKey = hasInsertionHold(toStep) ? toStep.insertionKey : fromStep.insertionKey;

    if (!Number.isFinite(sourceKey) && !Number.isFinite(targetKey)) {
      return "";
    }

    const keyValue = Number.isFinite(targetKey) ? targetKey : sourceKey;
    const sourceHole = Number.isInteger(fromStep.insertionHoleIndex) ? fromStep.insertionHoleIndex : toStep.insertionHoleIndex;
    const targetHole = Number.isInteger(toStep.insertionHoleIndex) ? toStep.insertionHoleIndex : fromStep.insertionHoleIndex;

    if (!Number.isInteger(sourceHole) || !Number.isInteger(targetHole)) {
      return "";
    }

    const x = lerp(getBarX(sourceHole, geometry), getBarX(targetHole, geometry), progress);
    const holeOpacity = lerp(hasInsertionHold(fromStep) ? 1 : 0, hasInsertionHold(toStep) ? 1 : 0, progress);
    const keyOpacity = holeOpacity;
    const keyHeight = Math.max(10, (Math.abs(keyValue) / maxValue) * geometry.plotHeight);
    const holeY = geometry.padTop + geometry.plotHeight - keyHeight;
    const chipLabel = `key ${Math.round(keyValue)}`;
    const chipWidth = Math.max(56, geometry.barWidth + 10, chipLabel.length * 8.2);
    const chipHeight = 24 + pulse * 2;
    const chipX = x + geometry.barWidth / 2 - chipWidth / 2;
    const chipY = Math.max(geometry.padTop + 10, holeY - 36);
    const chipRadius = Math.min(10, chipHeight / 2);
    const holeStroke = mixColor(COLORS.compare, COLORS.line, 0.28);
    const guideY1 = chipY + chipHeight + 4;
    const guideY2 = Math.max(guideY1 + 8, holeY - 6);

    return `
      <g class="sort-insertion-overlay" opacity="${holeOpacity}">
        <rect
          x="${x}"
          y="${holeY}"
          width="${geometry.barWidth}"
          height="${keyHeight}"
          rx="${Math.min(8, geometry.barWidth / 4)}"
          ry="${Math.min(8, geometry.barWidth / 4)}"
          fill="rgba(227, 190, 85, 0.08)"
          stroke="${holeStroke}"
          stroke-width="1.6"
          stroke-dasharray="5 4"
        />
        <line
          x1="${x + geometry.barWidth / 2}"
          y1="${guideY1}"
          x2="${x + geometry.barWidth / 2}"
          y2="${guideY2}"
          stroke="rgba(180, 134, 33, 0.42)"
          stroke-width="1.2"
          stroke-dasharray="4 4"
          opacity="${keyOpacity}"
        />
        <rect
          x="${chipX}"
          y="${chipY}"
          width="${chipWidth}"
          height="${chipHeight}"
          rx="${chipRadius}"
          ry="${chipRadius}"
          fill="rgba(244, 229, 185, 0.9)"
          stroke="rgba(180, 134, 33, 0.62)"
          stroke-width="1.2"
          opacity="${keyOpacity}"
        />
        <text
          x="${chipX + chipWidth / 2}"
          y="${chipY + chipHeight / 2 + 5}"
          text-anchor="middle"
          class="sort-plot-bar-value"
          opacity="${keyOpacity}"
        >${escapeHtml(chipLabel)}</text>
      </g>
    `;
  }

  function hasInsertionHold(step) {
    return step && Number.isFinite(step.insertionKey) && Number.isInteger(step.insertionHoleIndex);
  }

  function isInsertionHoleAtIndex(step, index) {
    return hasInsertionHold(step) && step.insertionHoleIndex === index;
  }

  function createGridMarkup(geometry) {
    return [0.25, 0.5, 0.75, 1].map((ratio) => {
      const y = geometry.padTop + geometry.plotHeight - geometry.plotHeight * ratio;
      return `<line x1="${geometry.padLeft}" y1="${y}" x2="${geometry.width - geometry.padRight}" y2="${y}" stroke="${COLORS.line}" stroke-width="1" />`;
    }).join("");
  }

  function createMergeMarkup(fromStep, toStep, geometry, progress, pulse) {
    const pairs = pairMergeRegions(fromStep.mergeRegions, toStep.mergeRegions);

    return pairs.map(({ fromRegion, toRegion }) => {
      const source = fromRegion || toRegion;
      const target = toRegion || fromRegion;

      if (!source || !target) {
        return "";
      }

      const start = lerp(source.start, target.start, progress);
      const end = lerp(source.end, target.end, progress);
      const depth = lerp(source.depth, target.depth, progress);
      const startX = getBarX(start, geometry);
      const endX = getBarX(end, geometry) + geometry.barWidth;
      const y = 12 + depth * 12;
      const opacity = lerp(fromRegion ? 0.34 : 0, toRegion ? 0.55 : 0, progress);
      const color = target.color || source.color || COLORS.structure;

      return `<path class="sort-plot-merge-region" d="M ${startX} ${y + 11} V ${y} H ${endX} V ${y + 11}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}" />`;
    }).join("");
  }

  function pairMergeRegions(fromRegions, toRegions) {
    const fromGroups = groupRegionsByDepth(fromRegions);
    const toGroups = groupRegionsByDepth(toRegions);
    const depths = Array.from(new Set([...Object.keys(fromGroups), ...Object.keys(toGroups)].map(Number))).sort((left, right) => left - right);
    const pairs = [];

    depths.forEach((depth) => {
      const left = fromGroups[depth] || [];
      const right = toGroups[depth] || [];
      const count = Math.max(left.length, right.length);

      for (let index = 0; index < count; index += 1) {
        pairs.push({
          fromRegion: left[index] || null,
          toRegion: right[index] || null
        });
      }
    });

    return pairs;
  }

  function groupRegionsByDepth(regions) {
    return regions.reduce((accumulator, region) => {
      const key = region.depth;

      if (!accumulator[key]) {
        accumulator[key] = [];
      }

      accumulator[key].push(region);
      return accumulator;
    }, {});
  }

  function createAnimatedPointerMarkup(fromIndex, toIndex, label, y, color, geometry, progress, pulse) {
    const fromIsNumber = Number.isInteger(fromIndex);
    const toIsNumber = Number.isInteger(toIndex);

    if (!fromIsNumber && !toIsNumber) {
      return "";
    }

    const xFrom = getSlotCenter(fromIsNumber ? fromIndex : toIndex, geometry);
    const xTo = getSlotCenter(toIsNumber ? toIndex : fromIndex, geometry);
    const x = lerp(xFrom, xTo, progress);
    const opacity = lerp(fromIsNumber ? 0.8 : 0, toIsNumber ? 0.82 : 0, progress);

    if (opacity <= 0.01) {
      return "";
    }

    return `
      <text x="${x}" y="${y}" text-anchor="middle" class="sort-plot-pointer-label" fill="${color}" opacity="${opacity}">${escapeHtml(label)}</text>
      <line x1="${x}" y1="${y + 4}" x2="${x}" y2="62" class="sort-plot-pointer-line" stroke="${color}" stroke-width="1.6" stroke-linecap="round" opacity="${opacity}" />
    `;
  }

  function getBarFill(index, step, active, sorted) {
    if (active.has(index)) {
      if (step.phase === "compare") {
        return COLORS.compare;
      }

      if (step.phase === "pivot") {
        return COLORS.pivot;
      }

      if (step.phase === "divide" || step.phase === "merge" || step.phase === "partition") {
        return COLORS.structure;
      }

      return COLORS.action;
    }

    if (step.pivot === index) {
      return COLORS.pivot;
    }

    if (step.lo === index || step.hi === index) {
      return COLORS.pointer;
    }

    if (sorted.has(index)) {
      return COLORS.done;
    }

    return COLORS.base;
  }

  function getBarStroke(index, step, active) {
    return active.has(index) || step.pivot === index || step.lo === index || step.hi === index
      ? "rgba(18, 44, 62, 0.42)"
      : "rgba(18, 44, 62, 0.12)";
  }

  function getStepStateSets(step) {
    return {
      active: new Set(step.activeIndices),
      sorted: new Set(step.sortedIndices)
    };
  }

  function isPlotIndexHighlighted(index, step, active) {
    return active.has(index) || step.pivot === index || step.lo === index || step.hi === index;
  }

  function getBarX(index, geometry) {
    return geometry.padLeft + index * (geometry.barWidth + geometry.gap);
  }

  function getSlotCenter(index, geometry) {
    return getBarX(index, geometry) + geometry.barWidth / 2;
  }

  function buildValueIndexMap(array) {
    return array.reduce((map, value, index) => map.set(value, index), new Map());
  }

  function canAnimateByValueIdentity(fromArray, toArray) {
    return hasUniqueValues(fromArray) && hasUniqueValues(toArray) && haveSameMultiset(fromArray, toArray);
  }

  function hasUniqueValues(array) {
    return new Set(array).size === array.length;
  }

  function haveSameMultiset(left, right) {
    if (left.length !== right.length) {
      return false;
    }

    const counts = new Map();

    left.forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1);
    });

    for (const value of right) {
      if (!counts.has(value)) {
        return false;
      }

      const next = counts.get(value) - 1;

      if (next === 0) {
        counts.delete(value);
      } else {
        counts.set(value, next);
      }
    }

    return counts.size === 0;
  }

  function getHeapActiveEdges(step) {
    const active = step.activeIndices || [];
    const edges = new Set();

    for (let left = 0; left < active.length; left += 1) {
      for (let right = left + 1; right < active.length; right += 1) {
        const a = active[left];
        const b = active[right];

        if (Math.floor((b - 1) / 2) === a) {
          edges.add(`${a}-${b}`);
        } else if (Math.floor((a - 1) / 2) === b) {
          edges.add(`${b}-${a}`);
        }
      }
    }

    return edges;
  }

  function getPhaseColor(phase) {
    switch (phase) {
      case "compare":
        return COLORS.compare;
      case "pivot":
        return COLORS.pivot;
      case "divide":
      case "merge":
      case "partition":
      case "setup":
        return COLORS.structure;
      case "finalize":
      case "done":
        return COLORS.done;
      default:
        return COLORS.action;
    }
  }

  function easeInOutCubic(value) {
    return value < 0.5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;
  }

  function lerp(start, end, progress) {
    return start + (end - start) * progress;
  }

  function mixColor(left, right, progress) {
    const source = parseColor(left);
    const target = parseColor(right);

    if (!source || !target) {
      return progress < 0.5 ? left : right;
    }

    const color = {
      r: lerp(source.r, target.r, progress),
      g: lerp(source.g, target.g, progress),
      b: lerp(source.b, target.b, progress),
      a: lerp(source.a, target.a, progress)
    };

    return color.a >= 0.999
      ? `rgb(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)})`
      : `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${color.a.toFixed(3)})`;
  }

  function parseColor(value) {
    if (typeof value !== "string") {
      return null;
    }

    const normalized = value.trim();

    if (/^#([0-9a-f]{6})$/i.test(normalized)) {
      const hex = normalized.slice(1);

      return {
        r: Number.parseInt(hex.slice(0, 2), 16),
        g: Number.parseInt(hex.slice(2, 4), 16),
        b: Number.parseInt(hex.slice(4, 6), 16),
        a: 1
      };
    }

    const rgbaMatch = normalized.match(/^rgba?\(([^)]+)\)$/i);

    if (!rgbaMatch) {
      return null;
    }

    const parts = rgbaMatch[1].split(",").map((part) => part.trim());

    if (parts.length < 3) {
      return null;
    }

    return {
      r: Number(parts[0]),
      g: Number(parts[1]),
      b: Number(parts[2]),
      a: parts.length >= 4 ? Number(parts[3]) : 1
    };
  }

  function setActiveFamilyTab(family) {
    const tabs = Array.from(refs.familyTabs.querySelectorAll(".aqua-tabview-tab"));

    tabs.forEach((tab) => {
      const isActive = tab.dataset.tab === family;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    ["iterative", "divide", "radix"].forEach((name) => {
      const pane = document.getElementById(`sort-family-${name}`);

      if (pane) {
        pane.classList.toggle("active", name === family);
      }
    });

    const indicator = refs.familyTabs.querySelector(".aqua-tabview-indicator");
    const activeTab = refs.familyTabs.querySelector(`.aqua-tabview-tab[data-tab="${family}"]`);

    if (indicator && activeTab) {
      indicator.style.left = `${activeTab.offsetLeft}px`;
      indicator.style.width = `${activeTab.offsetWidth}px`;
    }

    refs.stageNote.textContent = FAMILY_META[family].note;
  }

  function filterAlgorithmOptions() {
    const options = Array.from(refs.algoSelect.querySelectorAll(".aqua-select-option"));
    const previousAlgorithm = state.algorithm;

    options.forEach((option) => {
      option.hidden = option.dataset.family !== state.family;
    });

    const visibleOptions = getVisibleOptions(refs.algoSelect);

    if (!visibleOptions.some((option) => option.dataset.value === state.algorithm)) {
      state.algorithm = visibleOptions[0]?.dataset.value || state.algorithm;
    }

    return previousAlgorithm !== state.algorithm;
  }

  function filterPresetOptions() {
    const options = Array.from(refs.presetSelect.querySelectorAll(".aqua-select-option"));
    const previousPreset = state.preset;

    options.forEach((option) => {
      const meta = DATASET_META[option.dataset.value || ""];
      option.hidden = Boolean(meta?.algorithms && !meta.algorithms.includes(state.algorithm));
    });

    const visibleOptions = getVisibleOptions(refs.presetSelect);

    if (!visibleOptions.some((option) => option.dataset.value === state.preset)) {
      state.preset = visibleOptions[0]?.dataset.value || state.preset;
    }

    setSelectValue(refs.presetSelect, state.preset);
    return previousPreset !== state.preset;
  }

  function openSelect(select) {
    select.classList.add("open");
    syncSelectExpansion(select);
  }

  function closeSelect(select) {
    select.classList.remove("open");
    syncSelectExpansion(select);
  }

  function syncSelectExpansion(select) {
    const trigger = select.querySelector(".aqua-select-trigger");

    if (trigger) {
      trigger.setAttribute("aria-expanded", String(select.classList.contains("open")));
    }
  }

  function getVisibleOptions(select) {
    return Array.from(select.querySelectorAll(".aqua-select-option")).filter((option) => !option.hidden);
  }

  function setSelectValue(select, value) {
    const triggerValue = select.querySelector(".aqua-select-trigger .aqua-select-value");
    const panelValue = select.querySelector(".aqua-select-panel-header .aqua-select-value");
    const options = Array.from(select.querySelectorAll(".aqua-select-option"));
    const target = options.find((option) => option.dataset.value === value && !option.hidden) || options.find((option) => option.dataset.value === value);

    if (!target || !triggerValue || !panelValue) {
      return;
    }

    options.forEach((option) => {
      option.classList.toggle("chosen", option === target);
      option.setAttribute("aria-selected", String(option === target));
    });

    triggerValue.textContent = target.textContent || "";
    panelValue.textContent = target.textContent || "";
    triggerValue.classList.add("selected");
    select.dataset.value = value;
    closeSelect(select);
  }

  function updateSliderA11y(slider, value) {
    slider.setAttribute("aria-valuenow", String(value));
  }

  function setSliderDisabledState(slider, disabled) {
    slider.dataset.disabled = String(disabled);
    slider.classList.toggle("is-disabled", disabled);
    slider.setAttribute("aria-disabled", String(disabled));
    slider.tabIndex = disabled ? -1 : 0;
    const field = slider.closest(".sort-slider-field");

    if (field) {
      field.classList.toggle("is-disabled", disabled);
    }
  }

  function setSliderValue(slider, value) {
    const min = Number.parseInt(slider.dataset.min || "0", 10);
    const max = Number.parseInt(slider.dataset.max || "100", 10);
    const fraction = max === min ? 0 : (clamp(value, min, max) - min) / (max - min);
    const percentage = fraction * 100;
    const fill = slider.querySelector(".aqua-slider-fill");
    const thumb = slider.querySelector(".aqua-slider-thumb");

    slider.dataset.value = String(clamp(value, min, max));

    if (fill) {
      fill.style.width = `calc(${percentage}% + 1px)`;
    }

    if (thumb) {
      thumb.style.left = `${percentage}%`;
    }

    updateSliderA11y(slider, clamp(value, min, max));
  }

  function getSizeControlConfig() {
    if (state.algorithm === "radix") {
      if (state.preset === "lecture") {
        return { min: 11, max: 11, disabled: true };
      }

      return { min: 6, max: 18, disabled: false };
    }

    return { min: 6, max: 28, disabled: false };
  }

  function syncSizeControl() {
    const config = getSizeControlConfig();
    const nextSize = config.disabled ? config.min : clamp(state.size, config.min, config.max);
    const sizeChanged = nextSize !== state.size;

    state.size = nextSize;
    refs.sizeSlider.dataset.min = String(config.min);
    refs.sizeSlider.dataset.max = String(config.max);
    refs.sizeSlider.setAttribute("aria-valuemin", String(config.min));
    refs.sizeSlider.setAttribute("aria-valuemax", String(config.max));
    refs.sizeMin.textContent = String(config.min);
    refs.sizeMax.textContent = String(config.max);
    refs.sizeOutput.textContent = String(state.size);
    setSliderDisabledState(refs.sizeSlider, config.disabled);
    setSliderValue(refs.sizeSlider, state.size);

    return sizeChanged;
  }

  function getCurrentStep() {
    return state.steps[state.stepIndex] || makeStep(state.baseArray, {
      description: "The current run is empty.",
      phase: "setup"
    });
  }

  function generateSteps(algorithm, baseArray, runSeed, heapVariant) {
    switch (algorithm) {
      case "bubble":
        return generateBubbleSteps(baseArray);
      case "selection":
        return generateSelectionSteps(baseArray);
      case "insertion":
        return generateInsertionSteps(baseArray);
      case "heap":
        return generateHeapSteps(baseArray, heapVariant);
      case "merge":
        return generateMergeSteps(baseArray);
      case "quick":
        return generateQuickSteps(baseArray, runSeed);
      case "radix":
        return generateRadixSteps(baseArray);
      default:
        return [makeStep(baseArray, { description: "Unsupported algorithm.", phase: "setup" })];
    }
  }

  function generateBubbleSteps(baseArray) {
    const array = [...baseArray];
    const settled = new Set();
    const steps = [];
    let comparisons = 0;
    let operations = 0;

    steps.push(makeStep(array, {
      description: "Bubble sort sweeps across the array and compares adjacent pairs.",
      comparisons,
      writesOrSwaps: operations,
      phase: "setup"
    }));

    for (let pass = 0; pass < array.length - 1; pass += 1) {
      let swapped = false;

      for (let index = 0; index < array.length - pass - 1; index += 1) {
        comparisons += 1;
        steps.push(makeStep(array, {
          description: `Compare a[${index}] = ${array[index]} with a[${index + 1}] = ${array[index + 1]}.`,
          comparisons,
          writesOrSwaps: operations,
          activeIndices: [index, index + 1],
          sortedIndices: Array.from(settled),
          phase: "compare"
        }));

        if (array[index] > array[index + 1]) {
          [array[index], array[index + 1]] = [array[index + 1], array[index]];
          operations += 1;
          swapped = true;

          steps.push(makeStep(array, {
            description: `Swap the pair so the larger value keeps moving right.`,
            comparisons,
            writesOrSwaps: operations,
            activeIndices: [index, index + 1],
            sortedIndices: Array.from(settled),
            phase: "swap"
          }));
        }
      }

      settled.add(array.length - pass - 1);
      steps.push(makeStep(array, {
        description: `${array[array.length - pass - 1]} has bubbled into its final position at the right edge.`,
        comparisons,
        writesOrSwaps: operations,
        sortedIndices: Array.from(settled),
        phase: "finalize"
      }));

      if (!swapped) {
        steps.push(makeStep(array, {
          description: "No swaps happened on this pass, so the array is already sorted and bubble sort stops early.",
          comparisons,
          writesOrSwaps: operations,
          sortedIndices: range(0, array.length - 1),
          phase: "done"
        }));
        return steps;
      }
    }

    steps.push(makeStep(array, {
      description: "Bubble sort is complete.",
      comparisons,
      writesOrSwaps: operations,
      sortedIndices: range(0, array.length - 1),
      phase: "done"
    }));

    return steps;
  }

  function generateSelectionSteps(baseArray) {
    const array = [...baseArray];
    const settled = new Set();
    const steps = [];
    let comparisons = 0;
    let operations = 0;

    steps.push(makeStep(array, {
      description: "Selection sort scans the unsorted suffix for the minimum value.",
      comparisons,
      writesOrSwaps: operations,
      phase: "setup"
    }));

    for (let start = 0; start < array.length - 1; start += 1) {
      let minIndex = start;

      steps.push(makeStep(array, {
        description: `Pass ${start + 1}: search a[${start}..${array.length - 1}] for the smallest remaining value.`,
        comparisons,
        writesOrSwaps: operations,
        activeIndices: [start],
        sortedIndices: Array.from(settled),
        phase: "setup"
      }));

      for (let scan = start + 1; scan < array.length; scan += 1) {
        comparisons += 1;
        steps.push(makeStep(array, {
          description: `Compare current minimum ${array[minIndex]} with a[${scan}] = ${array[scan]}.`,
          comparisons,
          writesOrSwaps: operations,
          activeIndices: [minIndex, scan],
          sortedIndices: Array.from(settled),
          phase: "compare"
        }));

        if (array[scan] < array[minIndex]) {
          minIndex = scan;
          steps.push(makeStep(array, {
            description: `${array[minIndex]} becomes the new minimum candidate for this pass.`,
            comparisons,
            writesOrSwaps: operations,
            activeIndices: [minIndex],
            sortedIndices: Array.from(settled),
            phase: "finalize"
          }));
        }
      }

      if (minIndex !== start) {
        [array[start], array[minIndex]] = [array[minIndex], array[start]];
        operations += 1;

        steps.push(makeStep(array, {
          description: `Swap the minimum into index ${start}.`,
          comparisons,
          writesOrSwaps: operations,
          activeIndices: [start, minIndex],
          sortedIndices: Array.from(settled),
          phase: "swap"
        }));
      } else {
        steps.push(makeStep(array, {
          description: `The smallest value was already in position ${start}, so no swap is needed.`,
          comparisons,
          writesOrSwaps: operations,
          activeIndices: [start],
          sortedIndices: Array.from(settled),
          phase: "finalize"
        }));
      }

      settled.add(start);
      steps.push(makeStep(array, {
        description: `Index ${start} is now settled.`,
        comparisons,
        writesOrSwaps: operations,
        sortedIndices: Array.from(settled),
        phase: "finalize"
      }));
    }

    steps.push(makeStep(array, {
      description: "Selection sort is complete.",
      comparisons,
      writesOrSwaps: operations,
      sortedIndices: range(0, array.length - 1),
      phase: "done"
    }));

    return steps;
  }

  function generateInsertionSteps(baseArray) {
    const array = [...baseArray];
    const steps = [];
    let comparisons = 0;
    let operations = 0;

    steps.push(makeStep(array, {
      description: "Insertion sort starts with a sorted prefix of length 1.",
      comparisons,
      writesOrSwaps: operations,
      sortedIndices: [0],
      phase: "setup"
    }));

    for (let index = 1; index < array.length; index += 1) {
      const key = array[index];
      let scan = index - 1;

      steps.push(makeStep(array, {
        description: `Take key ${key} from the unsorted region and insert it into the sorted prefix.`,
        comparisons,
        writesOrSwaps: operations,
        activeIndices: [index],
        sortedIndices: range(0, index - 1),
        insertionKey: key,
        insertionHoleIndex: index,
        phase: "setup"
      }));

      while (scan >= 0) {
        comparisons += 1;
        steps.push(makeStep(array, {
          description: `Compare key ${key} with a[${scan}] = ${array[scan]}.`,
          comparisons,
          writesOrSwaps: operations,
          activeIndices: [scan, scan + 1],
          sortedIndices: range(0, index - 1),
          insertionKey: key,
          insertionHoleIndex: scan + 1,
          phase: "compare"
        }));

        if (array[scan] > key) {
          array[scan + 1] = array[scan];
          operations += 1;

          steps.push(makeStep(array, {
            description: `Shift ${array[scan + 1]} one position to the right to make space for ${key}.`,
            comparisons,
            writesOrSwaps: operations,
            activeIndices: [scan, scan + 1],
            sortedIndices: range(0, index - 1),
            insertionKey: key,
            insertionHoleIndex: scan,
            phase: "write"
          }));
          scan -= 1;
        } else {
          break;
        }
      }

      array[scan + 1] = key;
      operations += 1;

      steps.push(makeStep(array, {
        description: `Insert ${key} at index ${scan + 1}; the sorted prefix now extends through index ${index}.`,
        comparisons,
        writesOrSwaps: operations,
        activeIndices: [scan + 1],
        sortedIndices: range(0, index),
        phase: "finalize"
      }));
    }

    steps.push(makeStep(array, {
      description: "Insertion sort is complete.",
      comparisons,
      writesOrSwaps: operations,
      sortedIndices: range(0, array.length - 1),
      phase: "done"
    }));

    return steps;
  }

  function generateHeapSteps(baseArray, variantKey) {
    const variant = HEAP_VARIANT_META[variantKey] || HEAP_VARIANT_META["lecture-min"];
    const isMinHeap = variant.heapKind === "min";
    const prefersChild = isMinHeap
      ? (child, parent) => child < parent
      : (child, parent) => child > parent;
    const array = [...baseArray];
    const sorted = new Set();
    const steps = [];
    let comparisons = 0;
    let operations = 0;
    let heapSize = 1;

    steps.push(makeStep(array, {
      description: `Start with the first value as a trivial ${variant.heapKind}-heap of size 1.`,
      comparisons,
      writesOrSwaps: operations,
      heapSize,
      phase: "setup"
    }));

    for (let index = 1; index < array.length; index += 1) {
      heapSize = index + 1;
      steps.push(makeStep(array, {
        description: `Extend the heap region to index ${index}, then bubble the new value upward if it is ${variant.childLabel} than its parent.`,
        comparisons,
        writesOrSwaps: operations,
        activeIndices: [index],
        heapSize,
        phase: "setup"
      }));

      let child = index;

      while (child > 0) {
        const parent = Math.floor((child - 1) / 2);
        comparisons += 1;

        steps.push(makeStep(array, {
          description: `Compare child a[${child}] = ${array[child]} with parent a[${parent}] = ${array[parent]}.`,
          comparisons,
          writesOrSwaps: operations,
          activeIndices: [parent, child],
          heapSize,
          phase: "compare"
        }));

        if (prefersChild(array[child], array[parent])) {
          [array[parent], array[child]] = [array[child], array[parent]];
          operations += 1;

          steps.push(makeStep(array, {
            description: `Because this is a ${variant.heapKind}-heap, swap the ${variant.childLabel} child upward.`,
            comparisons,
            writesOrSwaps: operations,
            activeIndices: [parent, child],
            heapSize,
            phase: "swap"
          }));

          child = parent;
        } else {
          steps.push(makeStep(array, {
            description: "Heap order already holds here, so bubbling up stops.",
            comparisons,
            writesOrSwaps: operations,
            activeIndices: [child],
            heapSize,
            phase: "finalize"
          }));
          break;
        }
      }
    }

    heapSize = array.length;
    steps.push(makeStep(array, {
      description: `The ${variant.heapKind}-heap is built. Repeated delete${capitalize(variant.deletedLabel)} operations will place values into the right side of the array, creating ${variant.order} output.`,
      comparisons,
      writesOrSwaps: operations,
      heapSize,
      phase: "finalize"
    }));

    for (let end = array.length - 1; end > 0; end -= 1) {
      const deletedRoot = array[0];
      [array[0], array[end]] = [array[end], array[0]];
      operations += 1;
      sorted.add(end);
      heapSize = end;

      steps.push(makeStep(array, {
        description: `Delete the ${variant.deletedLabel} ${deletedRoot}: move the last heap value to the root and place ${deletedRoot} into index ${end}.`,
        comparisons,
        writesOrSwaps: operations,
        activeIndices: [0, end],
        sortedIndices: Array.from(sorted),
        heapSize,
        phase: "extract"
      }));

      let root = 0;

      while (true) {
        const left = 2 * root + 1;
        const right = left + 1;

        if (left >= heapSize) {
          steps.push(makeStep(array, {
            description: "This node has no children inside the heap, so bubble-down stops.",
            comparisons,
            writesOrSwaps: operations,
            activeIndices: [root],
            sortedIndices: Array.from(sorted),
            heapSize,
            phase: "finalize"
          }));
          break;
        }

        let selected = root;
        comparisons += 1;
        steps.push(makeStep(array, {
          description: `Compare root a[${root}] = ${array[root]} with left child a[${left}] = ${array[left]}.`,
          comparisons,
          writesOrSwaps: operations,
          activeIndices: [root, left],
          sortedIndices: Array.from(sorted),
          heapSize,
          phase: "compare"
        }));

        if (prefersChild(array[left], array[selected])) {
          selected = left;
        }

        if (right < heapSize) {
          comparisons += 1;
          steps.push(makeStep(array, {
            description: `Compare the current ${variant.childLabel} candidate with right child a[${right}] = ${array[right]}.`,
            comparisons,
            writesOrSwaps: operations,
            activeIndices: [selected, right],
            sortedIndices: Array.from(sorted),
            heapSize,
            phase: "compare"
          }));

          if (prefersChild(array[right], array[selected])) {
            selected = right;
          }
        }

        if (selected === root) {
          steps.push(makeStep(array, {
            description: `The ${variant.heapKind}-heap property has been restored at this node.`,
            comparisons,
            writesOrSwaps: operations,
            activeIndices: [root],
            sortedIndices: Array.from(sorted),
            heapSize,
            phase: "finalize"
          }));
          break;
        }

        [array[root], array[selected]] = [array[selected], array[root]];
        operations += 1;
        steps.push(makeStep(array, {
          description: `Swap the ${variant.childLabel} child upward so the parent remains the ${variant.parentLabel} of its subtree.`,
          comparisons,
          writesOrSwaps: operations,
          activeIndices: [root, selected],
          sortedIndices: Array.from(sorted),
          heapSize,
          phase: "swap"
        }));

        root = selected;
      }
    }

    sorted.add(0);
    steps.push(makeStep(array, {
      description: `Heap sort is complete. Because each ${variant.deletedLabel} was placed at the right edge, the final array is in ${variant.order} order.`,
      comparisons,
      writesOrSwaps: operations,
      sortedIndices: Array.from(sorted),
      heapSize: 0,
      phase: "done"
    }));

    return steps;
  }

  function generateMergeSteps(baseArray) {
    const array = [...baseArray];
    const steps = [];
    const regions = [];
    let comparisons = 0;
    let operations = 0;

    steps.push(makeStep(array, {
      description: "Merge sort divides the array until each subarray has size 1, then merges those sorted pieces back together.",
      comparisons,
      writesOrSwaps: operations,
      phase: "setup"
    }));

    function buildAuxEntries(values, startIndex, mergeKey, side) {
      return values.map((value, offset) => ({
        id: `${mergeKey}-${side}-${startIndex + offset}`,
        value,
        sourceIndex: startIndex + offset
      }));
    }

    function pushStep(description, extra) {
      steps.push(makeStep(array, {
        description,
        comparisons,
        writesOrSwaps: operations,
        mergeRegions: regions,
        ...extra
      }));
    }

    function mergeSort(left, right, depth) {
      if (left === right) {
        pushStep(`Base case: a[${left}] is a subarray of size 1, so it is already sorted.`, {
          activeIndices: [left],
          mergeRegions: regions,
          phase: "finalize"
        });
        return;
      }

      const middle = Math.floor((left + right) / 2);
      regions.push({
        start: left,
        end: right,
        depth,
        color: COLORS.region[depth % COLORS.region.length]
      });
      pushStep(`Divide [${left}..${right}] into [${left}..${middle}] and [${middle + 1}..${right}].`, {
        phase: "divide"
      });

      mergeSort(left, middle, depth + 1);
      mergeSort(middle + 1, right, depth + 1);

      const leftPart = array.slice(left, middle + 1);
      const rightPart = array.slice(middle + 1, right + 1);
      const mergeKey = `${left}-${middle}-${right}`;
      const auxRange = { left, middle, right };
      const auxLeft = buildAuxEntries(leftPart, left, mergeKey, "L");
      const auxRight = buildAuxEntries(rightPart, middle + 1, mergeKey, "R");
      let leftIndex = 0;
      let rightIndex = 0;
      let writeIndex = left;

      pushStep(`Start merging the sorted halves [${left}..${middle}] and [${middle + 1}..${right}].`, {
        activeIndices: range(left, right),
        phase: "merge",
        auxWriteIndex: writeIndex,
        auxRange,
        auxPhase: "idle"
      });

      pushStep(`Copy the left half [${left}..${middle}] into Left temp.`, {
        activeIndices: range(left, middle),
        phase: "merge",
        auxLeft,
        auxRight: [],
        auxLeftCursor: leftIndex,
        auxRightCursor: rightIndex,
        auxWriteIndex: writeIndex,
        auxRange,
        auxPhase: "load"
      });

      pushStep(`Copy the right half [${middle + 1}..${right}] into Right temp.`, {
        activeIndices: range(middle + 1, right),
        phase: "merge",
        auxLeft,
        auxRight,
        auxLeftCursor: leftIndex,
        auxRightCursor: rightIndex,
        auxWriteIndex: writeIndex,
        auxRange,
        auxPhase: "load"
      });

      while (leftIndex < leftPart.length && rightIndex < rightPart.length) {
        comparisons += 1;
        pushStep(`Compare Left temp ${leftPart[leftIndex]} with Right temp ${rightPart[rightIndex]}.`, {
          activeIndices: [left + leftIndex, middle + 1 + rightIndex],
          phase: "compare",
          auxLeft,
          auxRight,
          auxLeftCursor: leftIndex,
          auxRightCursor: rightIndex,
          auxWriteIndex: writeIndex,
          auxRange,
          auxPhase: "compare"
        });

        if (leftPart[leftIndex] <= rightPart[rightIndex]) {
          const value = leftPart[leftIndex];
          array[writeIndex] = value;
          operations += 1;
          leftIndex += 1;
          pushStep(`Write ${value} back into index ${writeIndex} from Left temp.`, {
            activeIndices: [writeIndex],
            phase: "write",
            auxLeft,
            auxRight,
            auxLeftCursor: leftIndex,
            auxRightCursor: rightIndex,
            auxWriteIndex: writeIndex,
            auxRange,
            auxPhase: "write"
          });
        } else {
          const value = rightPart[rightIndex];
          array[writeIndex] = value;
          operations += 1;
          rightIndex += 1;
          pushStep(`Write ${value} back into index ${writeIndex} from Right temp.`, {
            activeIndices: [writeIndex],
            phase: "write",
            auxLeft,
            auxRight,
            auxLeftCursor: leftIndex,
            auxRightCursor: rightIndex,
            auxWriteIndex: writeIndex,
            auxRange,
            auxPhase: "write"
          });
        }

        writeIndex += 1;
      }

      while (leftIndex < leftPart.length) {
        const value = leftPart[leftIndex];
        array[writeIndex] = value;
        operations += 1;
        leftIndex += 1;
        pushStep(`Copy the remaining Left temp value ${value} into index ${writeIndex}.`, {
          activeIndices: [writeIndex],
          phase: "write",
          auxLeft,
          auxRight,
          auxLeftCursor: leftIndex,
          auxRightCursor: rightIndex,
          auxWriteIndex: writeIndex,
          auxRange,
          auxPhase: "write"
        });
        writeIndex += 1;
      }

      while (rightIndex < rightPart.length) {
        const value = rightPart[rightIndex];
        array[writeIndex] = value;
        operations += 1;
        rightIndex += 1;
        pushStep(`Copy the remaining Right temp value ${value} into index ${writeIndex}.`, {
          activeIndices: [writeIndex],
          phase: "write",
          auxLeft,
          auxRight,
          auxLeftCursor: leftIndex,
          auxRightCursor: rightIndex,
          auxWriteIndex: writeIndex,
          auxRange,
          auxPhase: "write"
        });
        writeIndex += 1;
      }

      pushStep(`Region [${left}..${right}] is now internally sorted.`, {
        sortedIndices: range(left, right),
        phase: "finalize",
        auxLeft,
        auxRight,
        auxLeftCursor: auxLeft.length,
        auxRightCursor: auxRight.length,
        auxRange,
        auxPhase: "idle"
      });

      regions.pop();
    }

    mergeSort(0, array.length - 1, 0);

    steps.push(makeStep(array, {
      description: "Merge sort is complete.",
      comparisons,
      writesOrSwaps: operations,
      sortedIndices: range(0, array.length - 1),
      phase: "done"
    }));

    return steps;
  }

  function generateQuickSteps(baseArray, runSeed) {
    const array = [...baseArray];
    const steps = [];
    const sorted = new Set();
    const rng = createRng(runSeed ^ 0xa5a5a5a5);
    let comparisons = 0;
    let operations = 0;

    steps.push(makeStep(array, {
      description: "Quicksort chooses a pivot, partitions smaller values left and larger values right, then recurses on both sides.",
      comparisons,
      writesOrSwaps: operations,
      phase: "setup"
    }));

    function pushStep(description, extra) {
      steps.push(makeStep(array, {
        description,
        comparisons,
        writesOrSwaps: operations,
        sortedIndices: Array.from(sorted),
        ...extra
      }));
    }

    function quickSort(left, right) {
      if (left > right) {
        return;
      }

      if (left === right) {
        sorted.add(left);
        pushStep(`Index ${left} is a subarray of size 1, so it is already sorted.`, {
          activeIndices: [left],
          phase: "finalize"
        });
        return;
      }

      const pivotIndex = left + Math.floor(rng() * (right - left + 1));
      const pivotValue = array[pivotIndex];

      pushStep(`Pick a random pivot a[${pivotIndex}] = ${pivotValue} inside [${left}..${right}].`, {
        activeIndices: [pivotIndex],
        pivot: pivotIndex,
        lo: left,
        hi: right,
        phase: "pivot"
      });

      if (pivotIndex !== right) {
        [array[pivotIndex], array[right]] = [array[right], array[pivotIndex]];
        operations += 1;
        pushStep("Move the pivot to the end so the two scouts can partition the remaining values.", {
          activeIndices: [pivotIndex, right],
          pivot: right,
          lo: left,
          hi: right - 1,
          phase: "swap"
        });
      }

      const pivot = array[right];
      let lo = left;
      let hi = right - 1;

      pushStep(`Scan from both ends to partition values around pivot ${pivot}.`, {
        pivot: right,
        lo,
        hi,
        phase: "partition"
      });

      while (true) {
        while (lo <= hi) {
          comparisons += 1;
          pushStep(`lo checks whether a[${lo}] = ${array[lo]} is smaller than pivot ${pivot}.`, {
            activeIndices: [lo, right],
            pivot: right,
            lo,
            hi,
            phase: "compare"
          });

          if (array[lo] < pivot) {
            lo += 1;
          } else {
            break;
          }
        }

        while (hi >= lo) {
          comparisons += 1;
          pushStep(`hi checks whether a[${hi}] = ${array[hi]} belongs on the right side of pivot ${pivot}.`, {
            activeIndices: [hi, right],
            pivot: right,
            lo,
            hi,
            phase: "compare"
          });

          if (array[hi] >= pivot) {
            hi -= 1;
          } else {
            break;
          }
        }

        if (lo > hi) {
          break;
        }

        [array[lo], array[hi]] = [array[hi], array[lo]];
        operations += 1;
        pushStep("Both scouts are stuck, so swap the out-of-place pair and keep scanning.", {
          activeIndices: [lo, hi],
          pivot: right,
          lo,
          hi,
          phase: "swap"
        });

        lo += 1;
        hi -= 1;
        pushStep("Continue scanning until the two scouts cross.", {
          pivot: right,
          lo,
          hi,
          phase: "partition"
        });
      }

      [array[lo], array[right]] = [array[right], array[lo]];
      operations += 1;
      sorted.add(lo);
      pushStep(`The scouts crossed, so place pivot ${pivot} into index ${lo}.`, {
        activeIndices: [lo, right],
        pivot: lo,
        lo: left,
        hi: right,
        phase: "finalize"
      });

      quickSort(left, lo - 1);
      quickSort(lo + 1, right);
    }

    quickSort(0, array.length - 1);

    steps.push(makeStep(array, {
      description: "Quicksort is complete.",
      comparisons,
      writesOrSwaps: operations,
      sortedIndices: range(0, array.length - 1),
      phase: "done"
    }));

    return steps;
  }

  function generateRadixSteps(baseArray) {
    const entries = baseArray.map((value, index) => ({
      id: `radix-${index}`,
      value
    }));
    const entryMap = new Map(entries.map((entry) => [entry.id, entry]));
    const totalPlaces = getRadixPlaces(baseArray);
    let mainSlots = entries.map((entry) => entry.id);
    let buckets = createEmptyRadixBuckets();
    let moves = 0;
    const steps = [];

    function pushRadixStep(description, {
      phase,
      passIndex,
      place,
      digitLabel,
      activeEntryId = null,
      activeBucket = null,
      main = mainSlots,
      bucketState = buckets
    }) {
      steps.push(makeStep(buildRadixArrayPreview(main, bucketState, entryMap), {
        description,
        comparisons: passIndex,
        writesOrSwaps: moves,
        phase,
        radixEntries: entries,
        radixMainSlots: main,
        radixBuckets: bucketState,
        radixPlace: place,
        radixDigitLabel: digitLabel,
        radixPassIndex: passIndex,
        radixPhase: phase === "setup" ? "idle" : phase,
        radixActiveEntryId: activeEntryId,
        radixActiveBucket: activeBucket,
        radixMoves: moves
      }));
    }

    pushRadixStep("Radix sort starts with the full array in the main lane. Each pass will distribute values into digit buckets, then gather them back.", {
      phase: "setup",
      passIndex: 0,
      place: totalPlaces[0],
      digitLabel: getRadixDigitLabel(totalPlaces[0])
    });

    totalPlaces.forEach((place, passIndexZeroBased) => {
      const passIndex = passIndexZeroBased + 1;
      const digitLabel = getRadixDigitLabel(place);
      const finalDigitPass = passIndex === totalPlaces.length;
      const hasNegatives = entries.some((entry) => entry.value < 0);
      const useSignGather = finalDigitPass && hasNegatives;

      buckets = createEmptyRadixBuckets();
      pushRadixStep(`Pass ${passIndex}: distribute values by the ${digitLabel} digit of their absolute value.`, {
        phase: "setup",
        passIndex,
        place,
        digitLabel
      });

      const sourceOrder = [...mainSlots];

      sourceOrder.forEach((entryId) => {
        const entry = entryMap.get(entryId);
        const digit = getRadixDigit(entry.value, place);
        const slotIndex = mainSlots.indexOf(entryId);

        mainSlots[slotIndex] = null;
        buckets[digit].push(entryId);
        moves += 1;
        pushRadixStep(`${entry.value} has ${digit} in the ${digitLabel} place, so it drops into bucket ${digit}.`, {
          phase: "distribute",
          passIndex,
          place,
          digitLabel,
          activeEntryId: entryId,
          activeBucket: digit
        });
      });

      const nextMain = Array.from({ length: entries.length }, () => null);

      if (useSignGather) {
        const signGatherOrder = buildRadixSignGatherOrder(buckets, entryMap);

        signGatherOrder.forEach((entryId, writeIndex) => {
          const entry = entryMap.get(entryId);
          const bucketIndex = findRadixBucketIndex(buckets, entryId);
          const bucket = buckets[bucketIndex];
          const removalIndex = bucket.indexOf(entryId);

          bucket.splice(removalIndex, 1);
          nextMain[writeIndex] = entryId;
          moves += 1;
          pushRadixStep(
            entry.value < 0
              ? `Final sign-aware gather: ${entry.value} is negative, so negatives leave the buckets first in reversed order. Write it into index ${writeIndex}.`
              : `Final sign-aware gather: after the reversed negative block, place non-negative ${entry.value} into index ${writeIndex}.`,
            {
              phase: "sign-gather",
              passIndex,
              place,
              digitLabel,
              activeEntryId: entryId,
              activeBucket: bucketIndex,
              main: nextMain,
              bucketState: buckets
            }
          );
        });
      } else {
        let writeIndex = 0;

        for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex += 1) {
          while (buckets[bucketIndex].length > 0) {
            const entryId = buckets[bucketIndex].shift();
            const entry = entryMap.get(entryId);

            nextMain[writeIndex] = entryId;
            moves += 1;
            pushRadixStep(`Gather bucket ${bucketIndex}: write ${entry.value} back into array index ${writeIndex}.`, {
              phase: "gather",
              passIndex,
              place,
              digitLabel,
              activeEntryId: entryId,
              activeBucket: bucketIndex,
              main: nextMain,
              bucketState: buckets
            });
            writeIndex += 1;
          }
        }
      }

      mainSlots = [...nextMain];

      if (!finalDigitPass) {
        pushRadixStep(`The ${digitLabel} pass is complete. The array is now ordered by that digit while preserving earlier bucket order.`, {
          phase: "pass-complete",
          passIndex,
          place,
          digitLabel
        });
      }
    });

    pushRadixStep("Radix sort is complete.", {
      phase: "done",
      passIndex: totalPlaces.length,
      place: totalPlaces[totalPlaces.length - 1],
      digitLabel: getRadixDigitLabel(totalPlaces[totalPlaces.length - 1])
    });

    return steps;
  }

  function buildBaseArray(size, preset, seed, algorithm) {
    if (algorithm === "radix") {
      return buildRadixBaseArray(size, preset, seed);
    }

    switch (preset) {
      case "sorted":
        return Array.from({ length: size }, (_, index) => index + 1);
      case "reverse":
        return Array.from({ length: size }, (_, index) => size - index);
      case "random":
      default:
        return shuffleWithRng(Array.from({ length: size }, (_, index) => index + 1), createRng(seed ^ 0x517cc1b7));
    }
  }

  function buildRadixBaseArray(size, preset, seed) {
    if (preset === "lecture") {
      return [...RADIX_LECTURE_ARRAY];
    }

    const rng = createRng(seed ^ 0x3b92dc41);
    const selected = new Set(RADIX_REQUIRED_VALUES);
    const remainder = shuffleWithRng(
      RADIX_BALANCED_POOL.filter((value) => !selected.has(value)),
      rng
    );

    for (const value of remainder) {
      if (selected.size >= size) {
        break;
      }

      selected.add(value);
    }

    const values = Array.from(selected).slice(0, size);

    switch (preset) {
      case "sorted":
        return [...values].sort((left, right) => left - right);
      case "reverse":
        return [...values].sort((left, right) => right - left);
      case "random":
      default:
        return shuffleWithRng(values, createRng(seed ^ 0x517cc1b7));
    }
  }

  function createEmptyRadixBuckets() {
    return Array.from({ length: 10 }, () => []);
  }

  function getRadixPlaces(values) {
    const maxAbs = Math.max(...values.map((value) => Math.abs(value)), 0);
    const places = [];

    for (let place = 1; place <= Math.max(1, maxAbs); place *= 10) {
      places.push(place);
    }

    return places;
  }

  function getRadixDigit(value, place) {
    return Math.floor(Math.abs(value) / place) % 10;
  }

  function getRadixDigitLabel(place) {
    switch (place) {
      case 1:
        return "ones";
      case 10:
        return "tens";
      case 100:
        return "hundreds";
      case 1000:
        return "thousands";
      default:
        return `10^${Math.round(Math.log10(place))}`;
    }
  }

  function buildRadixSignGatherOrder(buckets, entryMap) {
    const negatives = [];
    const nonNegatives = [];

    for (let bucketIndex = buckets.length - 1; bucketIndex >= 0; bucketIndex -= 1) {
      const negativeBucketValues = buckets[bucketIndex]
        .filter((entryId) => entryMap.get(entryId)?.value < 0)
        .reverse();

      negatives.push(...negativeBucketValues);
    }

    for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex += 1) {
      const positiveBucketValues = buckets[bucketIndex]
        .filter((entryId) => entryMap.get(entryId)?.value >= 0);

      nonNegatives.push(...positiveBucketValues);
    }

    return negatives.concat(nonNegatives);
  }

  function findRadixBucketIndex(buckets, entryId) {
    return buckets.findIndex((bucket) => bucket.includes(entryId));
  }

  function buildRadixArrayPreview(mainSlots, buckets, entryMap) {
    const visibleMain = mainSlots
      .map((entryId) => entryId ? entryMap.get(entryId)?.value : null)
      .filter((value) => value !== null);
    const bucketValues = buckets
      .flat()
      .map((entryId) => entryMap.get(entryId)?.value)
      .filter((value) => value !== null);

    return visibleMain.concat(bucketValues);
  }

  function shuffleWithRng(values, rng) {
    const array = [...values];

    for (let index = array.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(rng() * (index + 1));
      [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
    }

    return array;
  }

  function nextSeed() {
    state.seedCursor = (state.seedCursor * 1664525 + 1013904223) >>> 0;
    return state.seedCursor;
  }

  function createRng(seed) {
    let value = seed >>> 0;

    return function next() {
      value += 0x6d2b79f5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function getHeapPoint(index, levels, width, height) {
    const level = Math.floor(Math.log2(index + 1));
    const offset = index - (2 ** level - 1);
    const slots = 2 ** level;

    return {
      x: ((offset + 0.5) / slots) * width,
      y: ((level + 0.65) / levels) * (height - 24) + 12
    };
  }

  function makeStep(array, {
    description = "",
    comparisons = 0,
    writesOrSwaps = 0,
    activeIndices = [],
    sortedIndices = [],
    phase = "setup",
    pivot = null,
    lo = null,
    hi = null,
    heapSize = null,
    mergeRegions = [],
    auxLeft = [],
    auxRight = [],
    auxLeftCursor = 0,
    auxRightCursor = 0,
    auxWriteIndex = null,
    auxRange = null,
    auxPhase = "idle",
    insertionKey = null,
    insertionHoleIndex = null,
    radixEntries = [],
    radixMainSlots = [],
    radixBuckets = [],
    radixPlace = null,
    radixDigitLabel = "",
    radixPassIndex = 0,
    radixPhase = "idle",
    radixActiveEntryId = null,
    radixActiveBucket = null,
    radixMoves = 0
  } = {}) {
    return {
      array: [...array],
      description,
      comparisons,
      writesOrSwaps,
      activeIndices: [...new Set(activeIndices)].sort((left, right) => left - right),
      sortedIndices: [...new Set(sortedIndices)].sort((left, right) => left - right),
      phase,
      pivot,
      lo,
      hi,
      heapSize,
      mergeRegions: mergeRegions.map((region) => ({ ...region })),
      auxLeft: auxLeft.map((entry) => ({ ...entry })),
      auxRight: auxRight.map((entry) => ({ ...entry })),
      auxLeftCursor,
      auxRightCursor,
      auxWriteIndex,
      auxRange: auxRange ? { ...auxRange } : null,
      auxPhase,
      insertionKey,
      insertionHoleIndex,
      radixEntries: radixEntries.map((entry) => ({ ...entry })),
      radixMainSlots: [...radixMainSlots],
      radixBuckets: radixBuckets.map((bucket) => [...bucket]),
      radixPlace,
      radixDigitLabel,
      radixPassIndex,
      radixPhase,
      radixActiveEntryId,
      radixActiveBucket,
      radixMoves
    };
  }

  function range(start, end) {
    if (start > end) {
      return [];
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function capitalize(value) {
    const text = String(value || "");
    return text ? text[0].toUpperCase() + text.slice(1) : text;
  }

  init();
})();

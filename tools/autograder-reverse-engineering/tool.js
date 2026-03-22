function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatTestLabel(testNumber) {
  return `test${String(testNumber).padStart(2, "0")}`;
}

function normalizeTestNotes(rawNotes) {
  if (!rawNotes) {
    return [];
  }

  const noteList = Array.isArray(rawNotes) ? rawNotes : [rawNotes];

  return noteList
    .map((note) => {
      if (typeof note === "string") {
        return {
          text: note,
          source: "",
        };
      }

      if (note && typeof note === "object") {
        return {
          text: note.text || note.note || "",
          source: note.source || "",
        };
      }

      return null;
    })
    .filter((note) => note && note.text);
}

function normalizeContributors(rawContributors) {
  return (Array.isArray(rawContributors) ? rawContributors : [])
    .map((entry) => {
      if (typeof entry === "string") {
        return entry;
      }

      if (entry && typeof entry === "object") {
        return entry.name || entry.handle || entry.label || "";
      }

      return "";
    })
    .filter(Boolean);
}

function deriveSharedSetupCommands(testCommands, testNumbers) {
  if (testNumbers.length === 0) {
    return new Set();
  }

  const firstTestCommands = Array.isArray(testCommands[testNumbers[0]]) ? testCommands[testNumbers[0]] : [];

  return new Set(
    firstTestCommands.filter((command) =>
      testNumbers.every((testNumber) => Array.isArray(testCommands[testNumber]) && testCommands[testNumber].includes(command))
    )
  );
}

function createAutograderAnalyzer({
  root,
  dataset,
  projectLabel,
  analyzerTitle,
  sectionPrefix,
  emptyCopy,
  introCopy,
}) {
  if (!root || !dataset) {
    return null;
  }

  const TEST_COMMANDS = dataset.TEST_COMMANDS || {};
  const TEST_NOTES = dataset.TEST_NOTES || {};
  const CONTRIBUTORS = normalizeContributors(dataset.CONTRIBUTORS || []);
  const KNOWN_EDGE_CASES = Array.isArray(dataset.KNOWN_EDGE_CASES) ? dataset.KNOWN_EDGE_CASES : [];
  const COMMAND_INFO = dataset.COMMAND_INFO || {};
  const NEVER_TESTED = Array.isArray(dataset.NEVER_TESTED) ? dataset.NEVER_TESTED : [];
  const TEST_NUMBERS = Object.keys(TEST_COMMANDS).map(Number).sort((left, right) => left - right);
  const SHARED_SETUP_COMMANDS = deriveSharedSetupCommands(TEST_COMMANDS, TEST_NUMBERS);

  const state = {
    failed: new Set(),
  };

  const refs = {
    root,
    testGrid: null,
    commands: null,
    edgeCases: null,
    diagnosis: null,
    footer: null,
  };

  function getTestNotes(testNumber) {
    return normalizeTestNotes(TEST_NOTES[testNumber]);
  }

  function getDerivedState() {
    const commandCounts = {};

    for (const testNumber of state.failed) {
      for (const command of TEST_COMMANDS[testNumber]) {
        if (!commandCounts[command]) {
          commandCounts[command] = new Set();
        }

        commandCounts[command].add(testNumber);
      }
    }

    const implicatedCommands = Object.keys(commandCounts);
    const allTestsFailed = state.failed.size === TEST_NUMBERS.length && TEST_NUMBERS.length > 0;
    const hasSpecificCommands = implicatedCommands.some((command) => !SHARED_SETUP_COMMANDS.has(command));

    const suspects = Object.entries(commandCounts)
      .filter(([command]) => allTestsFailed || !SHARED_SETUP_COMMANDS.has(command) || !hasSpecificCommands)
      .sort((left, right) => right[1].size - left[1].size);

    const loadFailed = commandCounts.LOAD_P3?.size > 0 && suspects.length === 0;
    const relevantEdgeCases = KNOWN_EDGE_CASES.filter((edgeCase) =>
      edgeCase.affectedTests.some((testNumber) => state.failed.has(testNumber))
    );

    return {
      suspects,
      loadFailed,
      relevantEdgeCases,
    };
  }

  function renderCommandBadge(command) {
    return `<span class="autograder-command-badge" data-command="${escapeHtml(command)}">${escapeHtml(command)}</span>`;
  }

  function renderNoteCard(note) {
    return `
      <article class="autograder-note-card">
        <div class="autograder-note-card-header">
          <p class="autograder-note-card-text">${escapeHtml(note.text)}</p>
          ${note.source ? `<span class="autograder-note-card-source">${escapeHtml(note.source)}</span>` : ""}
        </div>
      </article>
    `;
  }

  function renderTestGrid() {
    return TEST_NUMBERS.map((testNumber) => {
      const isFailed = state.failed.has(testNumber);

      return `
        <div
          class="autograder-test-toggle"
          data-on="${isFailed}"
          role="checkbox"
          aria-checked="${isFailed ? "true" : "false"}"
          aria-label="Test ${String(testNumber).padStart(2, "0")}"
          tabindex="0"
        >
          <label class="aqua-checkbox">
            <input type="checkbox" data-test-index="${testNumber}" ${isFailed ? "checked" : ""} aria-label="Toggle Test ${String(testNumber).padStart(2, "0")} failure">
            <span class="aqua-checkbox-control"><span class="aqua-checkbox-left"></span><span class="aqua-checkbox-right"></span></span>
          </label>
          <div class="autograder-test-toggle-layout">
            <span class="autograder-test-toggle-index">${String(testNumber).padStart(2, "0")}</span>
            <span class="autograder-test-toggle-label">Test ${String(testNumber).padStart(2, "0")}</span>
          </div>
        </div>
      `;
    }).join("");
  }

  function renderCommandsInFailedTests() {
    if (state.failed.size === 0) {
      return "";
    }

    const rows = [...state.failed]
      .sort((left, right) => left - right)
      .map((testNumber) => {
        const notes = getTestNotes(testNumber);

        return `
          <article class="autograder-command-row">
            <div class="autograder-command-row-heading">
              <span class="autograder-command-row-test">${formatTestLabel(testNumber)}</span>
            </div>
            <div class="autograder-command-row-badges">
              ${TEST_COMMANDS[testNumber].map((command) => renderCommandBadge(command)).join("")}
            </div>
            ${
              notes.length > 0
                ? `
                  <div class="autograder-command-row-note-list">
                    ${notes.map((note) => renderNoteCard(note)).join("")}
                  </div>
                `
                : ""
            }
          </article>
        `;
      })
      .join("");

    return `
      <section class="autograder-panel autograder-panel-section" aria-labelledby="${sectionPrefix}-commands-heading">
        <div class="autograder-section-header">
          <div>
            <p class="content-page-eyebrow">Breakdown</p>
            <h3 id="${sectionPrefix}-commands-heading" class="autograder-panel-title autograder-panel-title-small">Commands in failed tests</h3>
          </div>
        </div>
        <div class="autograder-command-list">
          ${rows}
        </div>
      </section>
    `;
  }

  function renderEdgeCases(relevantEdgeCases) {
    if (relevantEdgeCases.length === 0) {
      return "";
    }

    const content = relevantEdgeCases
      .map((edgeCase) => {
        const tests = edgeCase.affectedTests.map((testNumber) => formatTestLabel(testNumber)).join(", ");

        return `
          <article class="autograder-edge-case-card">
            <div class="autograder-edge-case-meta">
              ${renderCommandBadge(edgeCase.command)}
              <span class="autograder-edge-case-tests">affects ${escapeHtml(tests)}</span>
              <span class="autograder-edge-case-source">${escapeHtml(edgeCase.source)}</span>
            </div>
            <pre class="autograder-edge-case-input">${escapeHtml(edgeCase.input)}</pre>
            <p class="autograder-edge-case-description">${escapeHtml(edgeCase.description)}</p>
          </article>
        `;
      })
      .join("");

    return `
      <section class="autograder-panel autograder-panel-section autograder-panel-warning" aria-labelledby="${sectionPrefix}-edge-cases-heading">
        <div class="autograder-section-header">
          <div>
            <p class="content-page-eyebrow">Known Edge Cases</p>
            <h3 id="${sectionPrefix}-edge-cases-heading" class="autograder-panel-title autograder-panel-title-small">Reports from other students</h3>
          </div>
        </div>
        <div class="autograder-edge-case-list">
          ${content}
        </div>
      </section>
    `;
  }

  function renderSuspectCard(command, testSet, rank) {
    const info = COMMAND_INFO[command] || { description: "No description added yet." };

    return `
      <article class="autograder-suspect-card${rank === 0 ? " autograder-suspect-card-top" : ""}">
        <div class="autograder-suspect-header">
          <div class="autograder-suspect-title-row">
            ${rank === 0 ? '<span class="autograder-suspect-rank">Top Suspect</span>' : ""}
            ${renderCommandBadge(command)}
            <span class="autograder-suspect-coverage">appears in ${testSet.size} failed test${testSet.size > 1 ? "s" : ""}</span>
          </div>
          <p class="autograder-suspect-description">${escapeHtml(info.description)}</p>
        </div>
      </article>
    `;
  }

  function renderDiagnosis(suspects, loadFailed) {
    let body = "";

    if (state.failed.size === 0) {
      body += `
        <div class="autograder-diagnosis-empty">
          <p class="autograder-diagnosis-empty-title">Select failed tests above</p>
          <p class="autograder-diagnosis-empty-copy">${escapeHtml(emptyCopy)}</p>
        </div>
      `;
    }

    if (loadFailed) {
      body += `
        <div class="autograder-load-warning">
          <p class="autograder-load-warning-title">LOAD_P3 is broken</p>
          <p class="autograder-load-warning-copy">Data::loadAllCountries() is likely the issue — everything depends on this.</p>
        </div>
      `;
    }

    if (suspects.length > 0) {
      body += `
        <div class="autograder-suspect-list">
          ${suspects.map(([command, testSet], index) => renderSuspectCard(command, testSet, index)).join("")}
        </div>
      `;
    }

    return `
      <section class="autograder-panel autograder-panel-section" aria-labelledby="${sectionPrefix}-diagnosis-heading">
        <div class="autograder-section-header">
          <div>
            <p class="content-page-eyebrow">Diagnosis</p>
            <h3 id="${sectionPrefix}-diagnosis-heading" class="autograder-panel-title autograder-panel-title-small">${state.failed.size === 0 ? "Waiting for failed tests" : "Most likely culprits"}</h3>
          </div>
        </div>
        ${body}
      </section>
    `;
  }

  function renderContributors() {
    return `
      <section class="autograder-panel autograder-panel-section" aria-labelledby="${sectionPrefix}-contributors-heading">
        <div class="autograder-section-header">
          <div>
            <p class="content-page-eyebrow">Contributors</p>
            <h3 id="${sectionPrefix}-contributors-heading" class="autograder-panel-title autograder-panel-title-small">Community contributors</h3>
          </div>
        </div>
        ${
          CONTRIBUTORS.length > 0
            ? `
              <div class="autograder-contributor-list">
                ${CONTRIBUTORS.map((contributor) => `<span class="autograder-contributor-chip">${escapeHtml(contributor)}</span>`).join("")}
              </div>
            `
            : `
              <p class="autograder-panel-copy">No contributors added yet.</p>
            `
        }
      </section>
    `;
  }

  function renderShell() {
    refs.root.innerHTML = `
      <div class="autograder-project-layout">
        <section class="autograder-panel autograder-panel-section autograder-panel-intro" aria-labelledby="${sectionPrefix}-heading">
          <div class="autograder-section-header">
            <div>
              <p class="content-page-eyebrow">${escapeHtml(projectLabel)}</p>
              <h2 id="${sectionPrefix}-heading" class="autograder-panel-title">${escapeHtml(analyzerTitle)}</h2>
            </div>
          </div>
          <p class="autograder-panel-copy">${escapeHtml(introCopy)}</p>
        </section>

        ${renderContributors()}

        <section class="autograder-panel autograder-panel-section" aria-labelledby="${sectionPrefix}-tests-heading">
          <div class="autograder-section-header autograder-section-header-split">
            <div>
              <p class="content-page-eyebrow">Failed Tests</p>
              <h3 id="${sectionPrefix}-tests-heading" class="autograder-panel-title autograder-panel-title-small">Mark the cases that failed</h3>
            </div>
            <div class="autograder-test-actions">
              <button class="autograder-toolbar-button" type="button" data-action="select-all" data-tone="primary">Select all</button>
              <button class="autograder-toolbar-button" type="button" data-action="clear-all" data-tone="danger">Clear all</button>
            </div>
          </div>
          <div class="autograder-test-grid" data-autograder-test-grid></div>
        </section>

        <div data-autograder-commands></div>
        <div data-autograder-edge-cases></div>
        <div data-autograder-diagnosis></div>

        <p class="autograder-never-tested" data-autograder-footer></p>
      </div>
    `;

    refs.testGrid = refs.root.querySelector("[data-autograder-test-grid]");
    refs.commands = refs.root.querySelector("[data-autograder-commands]");
    refs.edgeCases = refs.root.querySelector("[data-autograder-edge-cases]");
    refs.diagnosis = refs.root.querySelector("[data-autograder-diagnosis]");
    refs.footer = refs.root.querySelector("[data-autograder-footer]");
  }

  function syncTestToggleElement(toggle, testNumber) {
    const isFailed = state.failed.has(testNumber);
    const input = toggle.querySelector("input[data-test-index]");

    toggle.dataset.on = String(isFailed);
    toggle.setAttribute("aria-checked", String(isFailed));

    if (input) {
      input.checked = isFailed;
    }
  }

  function syncRenderedTestToggles() {
    if (!refs.testGrid) {
      return;
    }

    refs.testGrid.querySelectorAll("input[data-test-index]").forEach((input) => {
      const toggle = input.closest(".autograder-test-toggle");

      if (toggle) {
        syncTestToggleElement(toggle, Number(input.dataset.testIndex));
      }
    });
  }

  function renderDerivedSections() {
    if (!refs.commands || !refs.edgeCases || !refs.diagnosis || !refs.footer) {
      return;
    }

    const { suspects, loadFailed, relevantEdgeCases } = getDerivedState();

    refs.commands.innerHTML = renderCommandsInFailedTests();
    refs.edgeCases.innerHTML = renderEdgeCases(relevantEdgeCases);
    refs.diagnosis.innerHTML = renderDiagnosis(suspects, loadFailed);
    refs.footer.textContent = NEVER_TESTED.length > 0 ? `Never tested: ${NEVER_TESTED.join(", ")}` : "";
  }

  function render() {
    if (!refs.testGrid) {
      renderShell();
    }

    if (refs.testGrid && refs.testGrid.childElementCount === 0) {
      refs.testGrid.innerHTML = renderTestGrid();
    }

    syncRenderedTestToggles();
    renderDerivedSections();
  }

  function selectAll() {
    state.failed = new Set(TEST_NUMBERS);
    render();
  }

  function clearAll() {
    state.failed = new Set();
    render();
  }

  function handleTestToggleChange(event) {
    const input = event.target.closest("input[data-test-index]");

    if (!input) {
      return;
    }

    const testNumber = Number(input.getAttribute("data-test-index"));

    if (!Number.isNaN(testNumber)) {
      const next = new Set(state.failed);

      if (input.checked) {
        next.add(testNumber);
      } else {
        next.delete(testNumber);
      }

      state.failed = next;

      const toggle = input.closest(".autograder-test-toggle");
      if (toggle) {
        syncTestToggleElement(toggle, testNumber);
      }

      renderDerivedSections();
    }
  }

  function handleClick(event) {
    const actionButton = event.target.closest("[data-action]");

    if (actionButton) {
      const action = actionButton.getAttribute("data-action");

      if (action === "select-all") {
        selectAll();
        return;
      }

      if (action === "clear-all") {
        clearAll();
        return;
      }
    }

    const toggle = event.target.closest(".autograder-test-toggle");

    if (!toggle) {
      return;
    }

    if (event.target.closest(".aqua-checkbox")) {
      return;
    }

    const input = toggle.querySelector("input[data-test-index]");

    if (input) {
      input.click();
    }
  }

  function handleKeydown(event) {
    const toggle = event.target.closest(".autograder-test-toggle");

    if (!toggle) {
      return;
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      const input = toggle.querySelector("input[data-test-index]");

      if (input) {
        input.click();
      }
    }
  }

  root.addEventListener("click", handleClick);
  root.addEventListener("change", handleTestToggleChange);
  root.addEventListener("keydown", handleKeydown);
  render();

  return {
    render,
  };
}

function setActiveAutograderTab(tabName) {
  const tabView = document.querySelector('.aqua-tabview[data-content-prefix="autograder-project"]');

  if (!tabView) {
    return;
  }

  const allTabs = Array.from(tabView.querySelectorAll(".aqua-tabview-tab"));
  const nextTab = tabView.querySelector(`.aqua-tabview-tab[data-tab="${tabName}"]:not(.disabled)`);

  if (!nextTab) {
    return;
  }

  allTabs.forEach((tab) => {
    tab.classList.remove("active");
    const pane = document.getElementById(`autograder-project-${tab.dataset.tab}`);

    if (pane) {
      pane.classList.remove("active");
    }
  });

  nextTab.classList.add("active");
  const nextPane = document.getElementById(`autograder-project-${tabName}`);

  if (nextPane) {
    nextPane.classList.add("active");
  }

  const indicator = tabView.querySelector(".aqua-tabview-indicator");

  if (indicator) {
    indicator.style.left = `${nextTab.offsetLeft}px`;
    indicator.style.width = `${nextTab.offsetWidth}px`;
  }
}

function getPreferredAutograderTab() {
  const hashTab = window.location.hash.replace(/^#/, "");

  if (hashTab) {
    return hashTab;
  }

  try {
    return window.localStorage.getItem("watthehex.autograder.activeTab") || "";
  } catch {
    return "";
  }
}

function syncAutograderTabFromHash() {
  const tabName = getPreferredAutograderTab();

  if (tabName) {
    setActiveAutograderTab(tabName);
  }
}

function bindAutograderTabPersistence() {
  const tabView = document.querySelector('.aqua-tabview[data-content-prefix="autograder-project"]');

  if (!tabView) {
    return;
  }

  syncAutograderTabFromHash();

  tabView.addEventListener("pointerup", () => {
    const tab = tabView.querySelector(".aqua-tabview-tab.active:not(.disabled)");

    if (!tab) {
      return;
    }

    const tabName = tab.dataset.tab;

    if (tabName && window.location.hash !== `#${tabName}`) {
      window.location.hash = tabName;
    }

    try {
      window.localStorage.setItem("watthehex.autograder.activeTab", tabName);
    } catch {
      // localStorage unavailable; hash persistence is still enough
    }
  });

  window.addEventListener("hashchange", syncAutograderTabFromHash);

  window.addEventListener("load", syncAutograderTabFromHash);

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      syncAutograderTabFromHash();
    });
  }

  requestAnimationFrame(() => {
    syncAutograderTabFromHash();
  });
}

function initAutograderAnalyzers() {
  bindAutograderTabPersistence();

  const project3Root = document.getElementById("autograder-project-3-root");
  const project4Root = document.getElementById("autograder-project-4-root");
  const project5Root = document.getElementById("autograder-project-5-root");

  createAutograderAnalyzer({
    root: project3Root,
    dataset: globalThis.WatTheHex?.project3Data,
    projectLabel: "Project 3",
    analyzerTitle: "P3 Test Failure Analyzer",
    sectionPrefix: "autograder-p3",
    emptyCopy: "Nothing is selected yet. Start by marking the Project 3 tests that failed in your autograder results.",
    introCopy: "Select the tests you failed and this analyzer will narrow the likely culprit commands, edge cases, and graph operations worth checking first.",
  });

  createAutograderAnalyzer({
    root: project4Root,
    dataset: globalThis.WatTheHex?.project4Data,
    projectLabel: "Project 4",
    analyzerTitle: "P4 Test Failure Analyzer",
    sectionPrefix: "autograder-p4",
    emptyCopy: "Nothing is selected yet. Start by marking the Project 4 tests that failed in your autograder results.",
    introCopy: "Select the tests you failed and this analyzer will narrow the likely culprit commands, edge cases, and graph operations worth checking first.",
  });

  createAutograderAnalyzer({
    root: project5Root,
    dataset: globalThis.WatTheHex?.project5Data,
    projectLabel: "Project 5",
    analyzerTitle: "P5 Test Failure Analyzer",
    sectionPrefix: "autograder-p5",
    emptyCopy: "Nothing is selected yet. Start by marking the Project 5 tests that failed in your autograder results.",
    introCopy: "Select the tests you failed and this analyzer will narrow the likely culprit commands, edge cases, and graph operations worth checking first.",
  });
}

initAutograderAnalyzers();

(function () {
  "use strict";

  var PRESETS = {
    lecture: {
      name: "Lecture Example",
      adjacency: {
        A: ["B", "C"],
        B: ["A", "D", "E"],
        C: ["A", "D", "F"],
        D: ["B", "C"],
        E: ["B"],
        F: ["C"]
      },
      positions: {
        A: { x: 80, y: 222 },
        B: { x: 258, y: 112 },
        C: { x: 258, y: 332 },
        D: { x: 440, y: 222 },
        E: { x: 466, y: 72 },
        F: { x: 466, y: 372 }
      },
      defaultStart: "A",
      defaultTarget: "F"
    },
    cycle: {
      name: "Cycle-Heavy",
      adjacency: {
        A: ["B", "C", "D"],
        B: ["A", "C"],
        C: ["A", "B", "D"],
        D: ["A", "C", "E"],
        E: ["D"]
      },
      positions: {
        A: { x: 105, y: 220 },
        B: { x: 278, y: 94 },
        C: { x: 278, y: 346 },
        D: { x: 452, y: 220 },
        E: { x: 535, y: 220 }
      },
      defaultStart: "A",
      defaultTarget: "E"
    },
    disconnected: {
      name: "Disconnected (No Path)",
      adjacency: {
        A: ["B", "C"],
        B: ["A", "C"],
        C: ["A", "B"],
        D: ["E", "F"],
        E: ["D", "F"],
        F: ["D", "E"]
      },
      positions: {
        A: { x: 100, y: 220 },
        B: { x: 228, y: 90 },
        C: { x: 228, y: 350 },
        D: { x: 378, y: 220 },
        E: { x: 506, y: 90 },
        F: { x: 506, y: 350 }
      },
      defaultStart: "A",
      defaultTarget: "F"
    }
  };

  var ALGORITHM_META = {
    dfs: {
      chip: "Depth-first search · stack frontier",
      stageNote: "DFS uses a stack and keeps pushing deeper until it must backtrack.",
      summaryIdea: "Depth-first search dives down one path until it must backtrack.",
      summaryFrontier: "Stack (LIFO)",
      summaryPattern: "Deeper paths first",
      summaryStrength: "Fast to follow one branch to completion",
      summaryTradeoff: "Tradeoff: it can find a path quickly, but not necessarily the shallowest one."
    },
    bfs: {
      chip: "Breadth-first search · queue frontier",
      stageNote: "BFS uses a queue and expands the traversal level by level from the start.",
      summaryIdea: "Breadth-first search explores the graph layer by layer from the start node.",
      summaryFrontier: "Queue (FIFO)",
      summaryPattern: "Shallower paths first",
      summaryStrength: "Finds the shortest path in an unweighted graph",
      summaryTradeoff: "Tradeoff: it guarantees the shallowest path, but it usually keeps a wider frontier in memory."
    }
  };

  var CODE_LINES = [
    { id: "l1", indent: 0, dfs: "stack = [[start]]", bfs: "queue = [[start]]" },
    { id: "l2", indent: 0, dfs: "visited = {}", bfs: "visited = {}" },
    { id: "l3", indent: 0, dfs: "while stack is not empty:", bfs: "while queue is not empty:" },
    { id: "l4", indent: 1, dfs: "path = stack.pop()", bfs: "path = queue.dequeue()" },
    { id: "l5", indent: 1, dfs: "current = last node in path", bfs: "current = last node in path" },
    { id: "l6", indent: 1, dfs: "if current == target:", bfs: "if current == target:" },
    { id: "l7", indent: 2, dfs: "return path", bfs: "return path" },
    { id: "l8", indent: 1, dfs: "if current is in visited:", bfs: "if current is in visited:" },
    { id: "l9", indent: 2, dfs: "continue", bfs: "continue" },
    { id: "l10", indent: 1, dfs: "add current to visited", bfs: "add current to visited" },
    { id: "l11", indent: 1, dfs: "for each node N adjacent to current:", bfs: "for each node N adjacent to current:" },
    { id: "l12", indent: 2, dfs: "if N is not in visited:", bfs: "if N is not in visited:" },
    { id: "l13", indent: 3, dfs: "stack.push(path + [N])", bfs: "queue.enqueue(path + [N])" },
    { id: "l14", indent: 0, dfs: "return NO_PATH", bfs: "return NO_PATH" }
  ];

  var SPEED_MS = [2000, 1000, 500, 200, 80];
  var SPEED_LABELS = ["0.5×", "1×", "2×", "5×", "12×"];

  var state = {
    algorithm: "dfs",
    preset: "lecture",
    adjacency: null,
    nodes: [],
    positions: null,
    start: "A",
    target: "F",
    steps: [],
    stepIdx: 0,
    playing: false,
    timer: null,
    speedIdx: 1,
    reducedMotion: false
  };

  var refs = {};

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function edgeKey(a, b) {
    return a + "__to__" + b;
  }

  function bidirectionalEdgeKey(a, b) {
    return a < b ? a + "__both__" + b : b + "__both__" + a;
  }

  function fmtPath(path) {
    return path.join(" \u2192 ");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pathHighlights(path, type) {
    var highlights = {};
    var i;

    for (i = 0; i < path.length; i += 1) {
      highlights[path[i]] = type;
    }

    return highlights;
  }

  function pathEdgeHighlights(path, type) {
    var highlights = {};
    var i;

    for (i = 0; i < path.length - 1; i += 1) {
      highlights[edgeKey(path[i], path[i + 1])] = type;
    }

    return highlights;
  }

  function mergeObj(a, b) {
    var out = {};
    var key;

    for (key in a) {
      if (Object.prototype.hasOwnProperty.call(a, key)) {
        out[key] = a[key];
      }
    }

    for (key in b) {
      if (Object.prototype.hasOwnProperty.call(b, key)) {
        out[key] = b[key];
      }
    }

    return out;
  }

  function getEdges(adjacency) {
    var edges = [];
    var seen = {};
    var nodes = Object.keys(adjacency);
    var i;
    var j;

    for (i = 0; i < nodes.length; i += 1) {
      var node = nodes[i];
      var neighbors = adjacency[node];

      for (j = 0; j < neighbors.length; j += 1) {
        var neighbor = neighbors[j];
        var reverseExists = Boolean(adjacency[neighbor] && adjacency[neighbor].indexOf(node) >= 0);
        var from = node;
        var to = neighbor;
        var key = edgeKey(node, neighbor);
        var highlightKeys = [edgeKey(node, neighbor)];

        if (reverseExists) {
          from = node < neighbor ? node : neighbor;
          to = node < neighbor ? neighbor : node;
          key = bidirectionalEdgeKey(from, to);
          highlightKeys = [edgeKey(from, to), edgeKey(to, from)];
        }

        if (seen[key]) {
          continue;
        }

        seen[key] = true;

        edges.push({
          key: key,
          from: from,
          to: to,
          bidirectional: reverseExists,
          highlightKeys: highlightKeys
        });
      }
    }

    return edges;
  }

  function closestWithin(node, selector, root) {
    var current = node;

    while (current && current !== root && current !== document) {
      if (current.matches && current.matches(selector)) {
        return current;
      }

      current = current.parentNode;
    }

    if (current && current.matches && current.matches(selector)) {
      return current;
    }

    return null;
  }

  function revealPageWhenReady() {
    function reveal() {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          refs.tool.classList.remove("gt-tool-pending");
          refs.tool.setAttribute("aria-busy", "false");
          document.body.classList.remove("gt-page-loading");
          document.documentElement.classList.remove("gt-page-pending");
          requestAnimationFrame(function () {
            setActiveAlgorithmTab(state.algorithm);
            requestAnimationFrame(function () {
              setActiveAlgorithmTab(state.algorithm);
            });
            window.setTimeout(function () {
              setActiveAlgorithmTab(state.algorithm);
            }, 80);
          });
          requestAnimationFrame(function () {
            setActiveAlgorithmTab(state.algorithm);
          });
        });
      });
    }

    if (document.readyState === "complete") {
      reveal();
      return;
    }

    window.addEventListener("load", reveal, { once: true });
  }

  function setActiveAlgorithmTab(algorithm) {
    var tabs = Array.prototype.slice.call(refs.algoTabs.querySelectorAll(".aqua-tabview-tab"));
    var indicator = refs.algoTabs.querySelector(".aqua-tabview-indicator");
    var activeTab = null;
    var i;

    for (i = 0; i < tabs.length; i += 1) {
      var isActive = tabs[i].dataset.tab === algorithm;
      tabs[i].classList.toggle("active", isActive);
      tabs[i].setAttribute("aria-selected", String(isActive));

      if (isActive) {
        activeTab = tabs[i];
      }
    }

    if (indicator && activeTab) {
      indicator.style.left = activeTab.offsetLeft + "px";
      indicator.style.width = activeTab.offsetWidth + "px";
    }
  }

  function bindAlgorithmTabs() {
    var tabs = Array.prototype.slice.call(refs.algoTabs.querySelectorAll(".aqua-tabview-tab"));

    refs.algoTabs.addEventListener("pointerup", function () {
      var activeTab = refs.algoTabs.querySelector(".aqua-tabview-tab.active");

      if (!activeTab) {
        return;
      }

      handleAlgorithmSelect(activeTab.dataset.tab);
    });

    tabs.forEach(function (tab, index) {
      tab.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleAlgorithmSelect(tab.dataset.tab);
          return;
        }

        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
          return;
        }

        event.preventDefault();
        var direction = event.key === "ArrowRight" ? 1 : -1;
        var nextIndex = clamp(index + direction, 0, tabs.length - 1);
        var nextTab = tabs[nextIndex];

        if (!nextTab) {
          return;
        }

        nextTab.focus();
        handleAlgorithmSelect(nextTab.dataset.tab);
      });
    });

    window.addEventListener("resize", function () {
      setActiveAlgorithmTab(state.algorithm);
    });
  }

  function openSelect(select) {
    Array.prototype.slice.call(document.querySelectorAll(".aqua-select.open")).forEach(function (openEl) {
      if (openEl !== select) {
        closeSelect(openEl);
      }
    });

    select.classList.add("open");
    syncSelectExpansion(select);
  }

  function closeSelect(select) {
    select.classList.remove("open");
    syncSelectExpansion(select);
  }

  function syncSelectExpansion(select) {
    var trigger = select.querySelector(".aqua-select-trigger");

    if (trigger) {
      trigger.setAttribute("aria-expanded", String(select.classList.contains("open")));
    }
  }

  function getVisibleOptions(select) {
    return Array.prototype.slice.call(select.querySelectorAll(".aqua-select-option")).filter(function (option) {
      return !option.hidden;
    });
  }

  function setSelectValue(select, value) {
    var triggerValue = select.querySelector(".aqua-select-trigger .aqua-select-value");
    var panelValue = select.querySelector(".aqua-select-panel-header .aqua-select-value");
    var options = Array.prototype.slice.call(select.querySelectorAll(".aqua-select-option"));
    var target = options.find(function (option) {
      return option.dataset.value === value && !option.hidden;
    }) || options.find(function (option) {
      return option.dataset.value === value;
    });

    if (!target || !triggerValue || !panelValue) {
      return;
    }

    options.forEach(function (option) {
      var isTarget = option === target;
      option.classList.toggle("chosen", isTarget);
      option.setAttribute("aria-selected", String(isTarget));
      option.tabIndex = -1;
    });

    triggerValue.textContent = target.textContent || "";
    panelValue.textContent = target.textContent || "";
    triggerValue.classList.add("selected");
    select.dataset.value = value;
    closeSelect(select);
  }

  function setSelectOptions(select, entries) {
    var container = select.querySelector(".gt-select-options");
    var markup = "";
    var i;

    if (!container) {
      return;
    }

    for (i = 0; i < entries.length; i += 1) {
      markup += "<div class=\"aqua-select-option\" data-value=\"" + escapeHtml(entries[i].value) + "\" tabindex=\"-1\" role=\"option\">"
        + escapeHtml(entries[i].label)
        + "</div>";
    }

    container.innerHTML = markup;
    decorateSelectOptions(select);
  }

  function decorateSelectOptions(select) {
    Array.prototype.slice.call(select.querySelectorAll(".aqua-select-option")).forEach(function (option) {
      option.tabIndex = -1;
      option.setAttribute("role", "option");
    });
  }

  function bindSelect(select, onChange) {
    var trigger = select.querySelector(".aqua-select-trigger");
    var panel = select.querySelector(".aqua-select-panel");
    var panelHeader = select.querySelector(".aqua-select-panel-header");

    if (!trigger || !panel || !panelHeader) {
      return;
    }

    trigger.tabIndex = 0;
    trigger.setAttribute("role", "button");
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    panel.setAttribute("role", "listbox");
    decorateSelectOptions(select);

    panelHeader.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeSelect(select);
    }, true);

    trigger.addEventListener("click", function () {
      requestAnimationFrame(function () {
        if (select.classList.contains("open")) {
          Array.prototype.slice.call(document.querySelectorAll(".aqua-select.open")).forEach(function (openEl) {
            if (openEl !== select) {
              closeSelect(openEl);
            }
          });
        }

        syncSelectExpansion(select);
      });
    });

    panel.addEventListener("click", function (event) {
      var option = closestWithin(event.target, ".aqua-select-option", select);

      if (!option || option.hidden) {
        return;
      }

      onChange(option.dataset.value || "");
      syncSelectExpansion(select);
    }, true);

    panel.addEventListener("keydown", function (event) {
      var option = closestWithin(event.target, ".aqua-select-option", select);
      var visibleOptions;
      var currentIndex;
      var delta;
      var nextIndex;

      if (!option) {
        return;
      }

      visibleOptions = getVisibleOptions(select);
      currentIndex = visibleOptions.indexOf(option);

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

      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
        return;
      }

      event.preventDefault();
      delta = event.key === "ArrowDown" ? 1 : -1;
      nextIndex = clamp(currentIndex + delta, 0, visibleOptions.length - 1);

      if (visibleOptions[nextIndex]) {
        visibleOptions[nextIndex].focus();
      }
    });

    trigger.addEventListener("keydown", function (event) {
      var visibleOptions = getVisibleOptions(select);
      var chosen;

      if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        openSelect(select);
        chosen = select.querySelector(".aqua-select-option.chosen:not([hidden])");
        (chosen || visibleOptions[0] || trigger).focus();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeSelect(select);
      }
    });
  }

  function updateSliderA11y(slider, value) {
    slider.setAttribute("aria-valuenow", String(value));
  }

  function setSliderValue(slider, value) {
    var min = Number.parseInt(slider.dataset.min || "0", 10);
    var max = Number.parseInt(slider.dataset.max || "100", 10);
    var clamped = clamp(value, min, max);
    var fraction = max === min ? 0 : (clamped - min) / (max - min);
    var percentage = fraction * 100;
    var fill = slider.querySelector(".aqua-slider-fill");
    var thumb = slider.querySelector(".aqua-slider-thumb");

    slider.dataset.value = String(clamped);

    if (fill) {
      fill.style.width = "calc(" + percentage + "% + 1px)";
    }

    if (thumb) {
      thumb.style.left = percentage + "%";
    }

    updateSliderA11y(slider, clamped);
  }

  function bindSlider(slider, onChange) {
    function syncFromDom() {
      var value = Number.parseInt(slider.dataset.value || "0", 10);
      updateSliderA11y(slider, value);
      onChange(value);
    }

    function scheduleSync() {
      if (slider._syncFrame) {
        cancelAnimationFrame(slider._syncFrame);
      }

      slider._syncFrame = requestAnimationFrame(function () {
        slider._syncFrame = 0;
        syncFromDom();
      });
    }

    ["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach(function (eventName) {
      slider.addEventListener(eventName, scheduleSync);
    });

    slider.addEventListener("keydown", function (event) {
      var min = Number.parseInt(slider.dataset.min || "0", 10);
      var max = Number.parseInt(slider.dataset.max || "100", 10);
      var current = Number.parseInt(slider.dataset.value || "0", 10);
      var next = current;

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
          next = current - 1;
          break;
        case "PageUp":
          next = current + 1;
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

  function formatAdjacencyText(adjacency, nodes) {
    var order = nodes && nodes.length ? nodes.slice() : Object.keys(adjacency);
    var lines = [];
    var i;

    for (i = 0; i < order.length; i += 1) {
      lines.push(order[i] + ": " + (adjacency[order[i]] || []).join(" "));
    }

    return lines.join("\n");
  }

  function generateSteps(adjacency, start, target, algorithm) {
    var isDFS = algorithm === "dfs";
    var steps = [];
    var frontier = [[start]];
    var visited = {};
    var currentPath = null;
    var currentNode = null;

    function snap(lineId, narration, extra) {
      var base = {
        lineId: lineId,
        narration: narration,
        frontier: frontier.map(function (path) { return path.slice(); }),
        visited: mergeObj(visited, {}),
        currentPath: currentPath ? currentPath.slice() : null,
        currentNode: currentNode,
        candidateNeighbor: null,
        resultPath: null,
        noPath: false,
        highlightNodes: {},
        highlightEdges: {}
      };

      if (extra) {
        Object.keys(extra).forEach(function (key) {
          base[key] = extra[key];
        });
      }

      return base;
    }

    steps.push(snap("l1", "Push [" + start + "] onto the " + (isDFS ? "stack" : "queue") + ".", {
      highlightNodes: { [start]: "start-node" }
    }));

    steps.push(snap("l2", "Initialize visited = {}.", {
      highlightNodes: { [start]: "start-node" }
    }));

    while (true) {
      var hasFrontier = frontier.length > 0;

      steps.push(snap("l3", hasFrontier
        ? (isDFS ? "Stack" : "Queue") + " has " + frontier.length + " path" + (frontier.length !== 1 ? "s" : "") + " — continue."
        : (isDFS ? "Stack" : "Queue") + " is empty — stop.", {}));

      if (!hasFrontier) {
        break;
      }

      var popped = isDFS ? frontier.pop() : frontier.shift();
      currentPath = popped;
      currentNode = null;

      steps.push(snap("l4", (isDFS ? "Pop" : "Dequeue") + " [" + fmtPath(popped) + "].", {
        highlightNodes: pathHighlights(popped, "path"),
        highlightEdges: pathEdgeHighlights(popped, "path")
      }));

      currentNode = popped[popped.length - 1];

      steps.push(snap("l5", "Current node is " + currentNode + ".", {
        highlightNodes: mergeObj(pathHighlights(popped, "path"), { [currentNode]: "current" }),
        highlightEdges: pathEdgeHighlights(popped, "path")
      }));

      var isTarget = currentNode === target;

      steps.push(snap("l6", currentNode + " == " + target + "? " + (isTarget ? "Yes — found the target!" : "No."), {
        highlightNodes: mergeObj(pathHighlights(popped, "path"), { [currentNode]: isTarget ? "success" : "current", [target]: "target" }),
        highlightEdges: pathEdgeHighlights(popped, "path")
      }));

      if (isTarget) {
        steps.push(snap("l7", "Return path: [" + fmtPath(popped) + "].", {
          resultPath: popped.slice(),
          highlightNodes: pathHighlights(popped, "success"),
          highlightEdges: pathEdgeHighlights(popped, "success")
        }));

        return steps;
      }

      var alreadyVisited = Object.prototype.hasOwnProperty.call(visited, currentNode);

      steps.push(snap("l8", currentNode + " in visited? " + (alreadyVisited ? "Yes — discard this path." : "No."), {
        highlightNodes: mergeObj(pathHighlights(popped, alreadyVisited ? "skip" : "path"), { [currentNode]: alreadyVisited ? "skip" : "current" }),
        highlightEdges: pathEdgeHighlights(popped, alreadyVisited ? "skip" : "path")
      }));

      if (alreadyVisited) {
        steps.push(snap("l9", "Discard path — " + currentNode + " was already processed.", {
          highlightNodes: { [currentNode]: "skip" }
        }));
        currentPath = null;
        currentNode = null;
        continue;
      }

      visited[currentNode] = true;

      steps.push(snap("l10", "Mark " + currentNode + " as visited.", {
        highlightNodes: mergeObj(pathHighlights(popped, "path"), { [currentNode]: "visited-new" }),
        highlightEdges: pathEdgeHighlights(popped, "path")
      }));

      var neighbors = adjacency[currentNode] || [];
      var iterOrder = isDFS ? neighbors.slice().reverse() : neighbors.slice();
      var ni;

      for (ni = 0; ni < iterOrder.length; ni += 1) {
        var neighbor = iterOrder[ni];
        var neighborVisited;

        steps.push(snap("l11", "Check neighbor " + neighbor + " of " + currentNode + "." + (isDFS && neighbors.length > 1 ? " (Iterating in reverse so " + neighbors[0] + " is explored first.)" : ""), {
          candidateNeighbor: neighbor,
          highlightNodes: mergeObj(pathHighlights(popped, "path"), { [currentNode]: "current", [neighbor]: "candidate" }),
          highlightEdges: mergeObj(pathEdgeHighlights(popped, "path"), { [edgeKey(currentNode, neighbor)]: "candidate" })
        }));

        neighborVisited = Object.prototype.hasOwnProperty.call(visited, neighbor);

        steps.push(snap("l12", neighbor + " in visited? " + (neighborVisited ? "Yes — skip." : "No — push."), {
          candidateNeighbor: neighbor,
          highlightNodes: mergeObj(pathHighlights(popped, "path"), { [currentNode]: "current", [neighbor]: neighborVisited ? "skip" : "candidate" }),
          highlightEdges: mergeObj(pathEdgeHighlights(popped, "path"), { [edgeKey(currentNode, neighbor)]: neighborVisited ? "skip" : "candidate" })
        }));

        if (!neighborVisited) {
          var newPath = popped.concat([neighbor]);
          frontier.push(newPath);

          steps.push(snap("l13", (isDFS ? "Push" : "Enqueue") + " [" + fmtPath(newPath) + "].", {
            candidateNeighbor: neighbor,
            highlightNodes: mergeObj(pathHighlights(popped, "path"), { [currentNode]: "current", [neighbor]: "pushed" }),
            highlightEdges: mergeObj(pathEdgeHighlights(popped, "path"), { [edgeKey(currentNode, neighbor)]: "pushed" })
          }));
        }
      }
    }

    steps.push(snap("l14", "All reachable nodes explored — no path to " + target + " found.", {
      noPath: true
    }));

    return steps;
  }

  function parseCustomGraph(text) {
    var adjacency = {};
    var nodeOrder = [];
    var seen = {};
    var lines = text.split("\n");
    var i;

    for (i = 0; i < lines.length; i += 1) {
      var line = lines[i].replace(/#.*$/, "").trim();

      if (!line) {
        continue;
      }

      var colonIdx = line.indexOf(":");

      if (colonIdx < 0) {
        return { error: "Line " + (i + 1) + ": missing \":\" — expected format: A: B C" };
      }

      var nodeId = line.slice(0, colonIdx).trim();

      if (!nodeId) {
        return { error: "Line " + (i + 1) + ": node name is empty." };
      }

      if (!/^[A-Za-z0-9_]+$/.test(nodeId)) {
        return { error: "Line " + (i + 1) + ": node name \"" + nodeId + "\" must use A-Z, 0-9, or _." };
      }

      if (!seen[nodeId]) {
        seen[nodeId] = true;
        nodeOrder.push(nodeId);
        adjacency[nodeId] = [];
      }

      var neighborStr = line.slice(colonIdx + 1).trim();
      var tokens = neighborStr ? neighborStr.split(/\s+/) : [];
      var j;

      for (j = 0; j < tokens.length; j += 1) {
        var neighbor = tokens[j];

        if (!/^[A-Za-z0-9_]+$/.test(neighbor)) {
          return { error: "Line " + (i + 1) + ": neighbor name \"" + neighbor + "\" must use A-Z, 0-9, or _." };
        }

        if (neighbor === nodeId) {
          continue;
        }

        if (adjacency[nodeId].indexOf(neighbor) < 0) {
          adjacency[nodeId].push(neighbor);
        }
      }
    }

    if (nodeOrder.length === 0) {
      return { error: "No nodes found. Add at least one line like: A: B C" };
    }

    for (i = 0; i < nodeOrder.length; i += 1) {
      var node = nodeOrder[i];
      var neighbors = adjacency[node];
      var ni;

      for (ni = 0; ni < neighbors.length; ni += 1) {
        var nextNeighbor = neighbors[ni];

        if (!adjacency[nextNeighbor]) {
          adjacency[nextNeighbor] = [];
          nodeOrder.push(nextNeighbor);
        }
      }
    }

    return { adjacency: adjacency, nodes: nodeOrder };
  }

  function circularLayout(nodes) {
    var cx = 290;
    var cy = 220;
    var radius = Math.max(70, Math.min(165, 900 / Math.max(nodes.length, 3)));
    var positions = {};
    var i;

    for (i = 0; i < nodes.length; i += 1) {
      var angle = (2 * Math.PI * i / nodes.length) - Math.PI / 2;
      positions[nodes[i]] = {
        x: Math.round(cx + radius * Math.cos(angle)),
        y: Math.round(cy + radius * Math.sin(angle))
      };
    }

    return positions;
  }

  function roundCoord(value) {
    return Math.round(value * 10) / 10;
  }

  function buildEdgePath(edge, positions) {
    var fromPoint = positions[edge.from];
    var toPoint = positions[edge.to];
    var dx;
    var dy;
    var length;
    var ux;
    var uy;
    var nx;
    var ny;
    var startInset;
    var endInset;
    var startX;
    var startY;
    var endX;
    var endY;
    var inset;

    if (!fromPoint || !toPoint) {
      return "";
    }

    dx = toPoint.x - fromPoint.x;
    dy = toPoint.y - fromPoint.y;
    length = Math.sqrt((dx * dx) + (dy * dy)) || 1;
    ux = dx / length;
    uy = dy / length;
    inset = Math.min(30, length * 0.3);
    startInset = edge.bidirectional ? inset : Math.min(24, length * 0.24);
    endInset = inset;
    startX = fromPoint.x + (ux * startInset);
    startY = fromPoint.y + (uy * startInset);
    endX = toPoint.x - (ux * endInset);
    endY = toPoint.y - (uy * endInset);

    return "M " + roundCoord(startX) + " " + roundCoord(startY)
      + " L " + roundCoord(endX) + " " + roundCoord(endY);
  }

  function pickEdgeHighlight(edge, highlightMap) {
    var best = "";
    var bestScore = -1;
    var priority = {
      skip: 1,
      path: 2,
      candidate: 3,
      pushed: 4,
      success: 5
    };

    edge.highlightKeys.forEach(function (key) {
      var value = highlightMap[key];
      var score;

      if (!value) {
        return;
      }

      score = priority[value] || 0;

      if (score > bestScore) {
        best = value;
        bestScore = score;
      }
    });

    return best;
  }

  function buildSVGContent(adjacency, nodes, positions) {
    var edges = getEdges(adjacency);
    var html = "";
    var ei;
    var ni;

    html += "<defs>"
      + "<marker id=\"gt-arrowhead\" viewBox=\"0 0 10 10\" refX=\"8\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\" markerUnits=\"strokeWidth\">"
      + "<path d=\"M 0 0 L 10 5 L 0 10 z\" fill=\"context-stroke\"></path>"
      + "</marker>"
      + "</defs><g class=\"gt-svg-edges\">";

    for (ei = 0; ei < edges.length; ei += 1) {
      var edge = edges[ei];
      var pathData = buildEdgePath(edge, positions);

      if (!pathData) {
        continue;
      }

      html += "<path class=\"gt-svg-edge\" id=\"gt-edge-" + escapeHtml(edge.key) + "\" d=\"" + pathData + "\""
        + (edge.bidirectional ? " marker-start=\"url(#gt-arrowhead)\"" : "")
        + " marker-end=\"url(#gt-arrowhead)\" />";
    }

    html += "</g><g class=\"gt-svg-nodes\">";

    for (ni = 0; ni < nodes.length; ni += 1) {
      var node = nodes[ni];
      var point = positions[node];

      if (!point) {
        continue;
      }

      html += "<g class=\"gt-svg-node\" id=\"gt-node-" + escapeHtml(node) + "\" transform=\"translate(" + point.x + "," + point.y + ")\" role=\"img\" aria-label=\"Node " + escapeHtml(node) + "\">"
        + "<circle class=\"gt-svg-node-ring\" r=\"30\"></circle>"
        + "<circle class=\"gt-svg-node-bg\" r=\"22\"></circle>"
        + "<text class=\"gt-svg-node-label\" dy=\"0.35em\">" + escapeHtml(node) + "</text>"
        + "</g>";
    }

    html += "</g>";

    return html;
  }

  function syncAlgorithmChrome() {
    var meta = ALGORITHM_META[state.algorithm];

    refs.stageNote.textContent = meta.stageNote;
    refs.phaseChip.textContent = meta.chip;
    refs.phaseChip.dataset.tone = state.algorithm;
    refs.summaryIdea.textContent = meta.summaryIdea;
    refs.summaryFrontier.textContent = meta.summaryFrontier;
    refs.summaryPattern.textContent = meta.summaryPattern;
    refs.summaryStrength.textContent = meta.summaryStrength;
    refs.summaryTradeoff.textContent = meta.summaryTradeoff;
    setActiveAlgorithmTab(state.algorithm);
  }

  function buildCodePanel() {
    var html = "";
    var i;

    for (i = 0; i < CODE_LINES.length; i += 1) {
      var line = CODE_LINES[i];
      var text = state.algorithm === "dfs" ? line.dfs : line.bfs;
      var indent = "";
      var depth;

      for (depth = 0; depth < line.indent; depth += 1) {
        indent += "  ";
      }

      html += "<div class=\"gt-code-line\" data-line-id=\"" + line.id + "\">"
        + "<span class=\"gt-code-num\">" + (i + 1) + "</span>"
        + "<span class=\"gt-code-text\">" + escapeHtml(indent + text) + "</span>"
        + "</div>";
    }

    refs.codePanel.innerHTML = html;
    refs.codePanel.scrollTop = 0;
  }

  function buildNodeSelectors() {
    var entries = state.nodes.map(function (node) {
      return { value: node, label: node };
    });

    setSelectOptions(refs.startSelect, entries);
    setSelectOptions(refs.targetSelect, entries);
    setSelectValue(refs.startSelect, state.start);
    setSelectValue(refs.targetSelect, state.target);
  }

  function renderGraph(step) {
    var edges = getEdges(state.adjacency);

    state.nodes.forEach(function (node) {
      var el = document.getElementById("gt-node-" + node);
      var classes = ["gt-svg-node"];
      var highlight = step.highlightNodes[node];

      if (!el) {
        return;
      }

      if (step.visited[node]) {
        classes.push("gt-svg-node--visited");
      }

      if (highlight) {
        classes.push("gt-svg-node--" + highlight);
      }

      if (node === state.start) {
        classes.push("gt-svg-node--is-start");
      }

      if (node === state.target) {
        classes.push("gt-svg-node--is-target");
      }

      el.setAttribute("class", classes.join(" "));
    });

    edges.forEach(function (edge) {
      var edgeEl = document.getElementById("gt-edge-" + edge.key);
      var highlight = pickEdgeHighlight(edge, step.highlightEdges);

      if (!edgeEl) {
        return;
      }

      edgeEl.setAttribute("class", "gt-svg-edge" + (highlight ? " gt-svg-edge--" + highlight : ""));
    });
  }

  function renderFrontier(step) {
    var isDFS = state.algorithm === "dfs";
    var frontier = isDFS ? step.frontier.slice().reverse() : step.frontier.slice();
    var html = "";
    var i;

    for (i = 0; i < frontier.length; i += 1) {
      html += "<div class=\"gt-frontier-item" + (i === 0 ? " gt-frontier-item--next" : "") + "\">"
        + escapeHtml(fmtPath(frontier[i]))
        + "</div>";
    }

    if (!html) {
      html = "<div class=\"gt-frontier-empty\">empty</div>";
    }

    refs.frontierItems.innerHTML = html;
    refs.frontierLabel.textContent = isDFS ? "Stack" : "Queue";
    refs.frontierPointer.textContent = isDFS ? "↑ top" : "↑ front";
  }

  function renderState(step) {
    var visitedNodes = Object.keys(step.visited);

    refs.visitedSet.textContent = visitedNodes.length ? "{ " + visitedNodes.join(", ") + " }" : "{ }";
    refs.currentPath.textContent = step.currentPath ? "[" + fmtPath(step.currentPath) + "]" : "—";

    if (step.resultPath) {
      refs.resultArea.hidden = false;
      refs.resultArea.className = "gt-result gt-result--success";
      refs.resultPath.textContent = "[" + fmtPath(step.resultPath) + "]";
      refs.resultPlaceholder.hidden = true;
    } else if (step.noPath) {
      refs.resultArea.hidden = false;
      refs.resultArea.className = "gt-result gt-result--failure";
      refs.resultPath.textContent = "NO_PATH";
      refs.resultPlaceholder.hidden = true;
    } else {
      refs.resultArea.hidden = true;
      refs.resultPlaceholder.hidden = false;
    }
  }

  function renderNarration(step) {
    refs.narration.textContent = step.narration;
  }

  function keepCodeLineVisible(lineEl) {
    var panel = refs.codePanel;
    var padding = 20;
    var currentTop;
    var currentBottom;
    var targetTop;
    var lineTop;
    var lineBottom;

    if (!panel) {
      return;
    }

    currentTop = panel.scrollTop;
    currentBottom = currentTop + panel.clientHeight;
    lineTop = lineEl.offsetTop;
    lineBottom = lineTop + lineEl.offsetHeight;

    if (lineTop < currentTop + padding) {
      targetTop = Math.max(0, lineTop - padding);
    } else if (lineBottom > currentBottom - padding) {
      targetTop = Math.max(0, lineBottom - panel.clientHeight + padding);
    } else {
      return;
    }

    if (state.reducedMotion) {
      panel.scrollTop = targetTop;
      return;
    }

    panel.scrollTo({ top: targetTop, behavior: "smooth" });
  }

  function renderCode(step) {
    Array.prototype.slice.call(refs.codePanel.querySelectorAll(".gt-code-line")).forEach(function (lineEl) {
      var active = lineEl.getAttribute("data-line-id") === step.lineId;

      lineEl.classList.toggle("gt-code-line--active", active);

      if (active) {
        keepCodeLineVisible(lineEl);
      }
    });
  }

  function renderPlayback() {
    var isFirst = state.stepIdx === 0;
    var isLast = state.stepIdx === state.steps.length - 1;
    var pct = state.steps.length > 1 ? (state.stepIdx / (state.steps.length - 1)) * 100 : 100;

    refs.playButton.textContent = state.playing ? "Pause" : (isLast ? "Replay" : "Play");
    refs.playButton.setAttribute("aria-label", state.playing ? "Pause" : (isLast ? "Replay" : "Play"));
    refs.playButton.dataset.playing = String(state.playing);

    refs.stepBackButton.disabled = isFirst;
    refs.stepForwardButton.disabled = isLast;
    refs.resetButton.disabled = isFirst;

    refs.stepNum.textContent = state.stepIdx + 1;
    refs.stepTotal.textContent = state.steps.length;
    refs.progress.dataset.value = String(Math.round(pct));
    refs.progressFill.style.width = pct + "%";
  }

  function render() {
    var step = state.steps[state.stepIdx];

    if (!step) {
      return;
    }

    renderGraph(step);
    renderFrontier(step);
    renderState(step);
    renderNarration(step);
    renderCode(step);
    renderPlayback();
    syncAlgorithmChrome();
  }

  function startTimer() {
    state.timer = setInterval(function () {
      if (state.stepIdx >= state.steps.length - 1) {
        pause();
        return;
      }

      state.stepIdx += 1;
      render();
    }, SPEED_MS[state.speedIdx]);
  }

  function play() {
    if (state.playing) {
      return;
    }

    if (state.stepIdx >= state.steps.length - 1) {
      state.stepIdx = 0;
      render();
    }

    state.playing = true;
    startTimer();
    renderPlayback();
  }

  function pause() {
    if (!state.playing) {
      return;
    }

    state.playing = false;
    clearInterval(state.timer);
    state.timer = null;
    renderPlayback();
  }

  function togglePlay() {
    if (state.playing) {
      pause();
      return;
    }

    play();
  }

  function stepForward() {
    pause();

    if (state.stepIdx < state.steps.length - 1) {
      state.stepIdx += 1;
      render();
    }
  }

  function stepBack() {
    pause();

    if (state.stepIdx > 0) {
      state.stepIdx -= 1;
      render();
    }
  }

  function resetToStart() {
    pause();
    state.stepIdx = 0;
    render();
  }

  function buildSVG() {
    refs.svg.innerHTML = buildSVGContent(state.adjacency, state.nodes, state.positions);
  }

  function regenerate() {
    pause();

    if (state.nodes.indexOf(state.start) < 0) {
      state.start = state.nodes[0];
    }

    if (state.nodes.indexOf(state.target) < 0) {
      state.target = state.nodes[state.nodes.length - 1] || state.nodes[0];
    }

    setSelectValue(refs.startSelect, state.start);
    setSelectValue(refs.targetSelect, state.target);

    state.steps = generateSteps(state.adjacency, state.start, state.target, state.algorithm);
    state.stepIdx = 0;
    buildSVG();
    render();
  }

  function loadPreset(key) {
    var preset = PRESETS[key];

    if (!preset) {
      return;
    }

    state.preset = key;
    state.adjacency = preset.adjacency;
    state.nodes = Object.keys(preset.adjacency);
    state.positions = preset.positions;
    state.start = preset.defaultStart;
    state.target = preset.defaultTarget;
    refs.customText.value = formatAdjacencyText(state.adjacency, state.nodes);
    buildNodeSelectors();
    setSelectValue(refs.presetSelect, key);
    regenerate();
  }

  function applyCustomGraph(text) {
    var result = parseCustomGraph(text);

    if (result.error) {
      refs.customError.textContent = result.error;
      refs.customError.hidden = false;
      return;
    }

    refs.customError.hidden = true;
    state.preset = "custom";
    state.adjacency = result.adjacency;
    state.nodes = result.nodes;
    state.positions = circularLayout(result.nodes);
    state.start = result.nodes[0];
    state.target = result.nodes.length > 1 ? result.nodes[result.nodes.length - 1] : result.nodes[0];
    refs.customText.value = formatAdjacencyText(state.adjacency, state.nodes);
    buildNodeSelectors();
    setSelectValue(refs.presetSelect, "custom");
    toggleCustomPanel(true);
    regenerate();
  }

  function toggleCustomPanel(visible) {
    refs.customPanel.hidden = !visible;
  }

  function handleAlgorithmSelect(value) {
    if (!ALGORITHM_META[value] || value === state.algorithm) {
      setActiveAlgorithmTab(state.algorithm);
      return;
    }

    state.algorithm = value;
    buildCodePanel();
    regenerate();
  }

  function handlePresetSelect(value) {
    setSelectValue(refs.presetSelect, value);

    if (value === "custom") {
      if (state.preset !== "custom" && !refs.customText.value.trim()) {
        refs.customText.value = formatAdjacencyText(state.adjacency, state.nodes);
      }

      state.preset = "custom";
      refs.customError.hidden = true;
      toggleCustomPanel(true);
      return;
    }

    refs.customError.hidden = true;
    toggleCustomPanel(false);
    loadPreset(value);
  }

  function handleStartSelect(value) {
    if (state.nodes.indexOf(value) < 0) {
      return;
    }

    state.start = value;
    setSelectValue(refs.startSelect, value);
    regenerate();
  }

  function handleTargetSelect(value) {
    if (state.nodes.indexOf(value) < 0) {
      return;
    }

    state.target = value;
    setSelectValue(refs.targetSelect, value);
    regenerate();
  }

  function handleSpeedChange(value) {
    state.speedIdx = value;
    refs.speedLabel.textContent = SPEED_LABELS[state.speedIdx];

    if (state.playing) {
      clearInterval(state.timer);
      startTimer();
    }
  }

  function isInteractiveFocusTarget(target) {
    return Boolean(closestWithin(target, "button, textarea, .aqua-select, .gt-slider, .aqua-tabview-tab", refs.tool));
  }

  function bindEvents() {
    bindAlgorithmTabs();
    bindSelect(refs.presetSelect, handlePresetSelect);
    bindSelect(refs.startSelect, handleStartSelect);
    bindSelect(refs.targetSelect, handleTargetSelect);
    bindSlider(refs.speedSlider, handleSpeedChange);

    refs.playButton.addEventListener("click", togglePlay);
    refs.stepForwardButton.addEventListener("click", stepForward);
    refs.stepBackButton.addEventListener("click", stepBack);
    refs.resetButton.addEventListener("click", resetToStart);

    refs.applyButton.addEventListener("click", function () {
      applyCustomGraph(refs.customText.value);
    });

    refs.customText.addEventListener("keydown", function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        applyCustomGraph(refs.customText.value);
      }
    });

    document.addEventListener("click", function (event) {
      if (!closestWithin(event.target, ".aqua-select", refs.tool)) {
        refs.selectRoots.forEach(closeSelect);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (isInteractiveFocusTarget(document.activeElement)) {
        return;
      }

      if (event.key === "ArrowRight" || event.key === "l") {
        event.preventDefault();
        stepForward();
      }

      if (event.key === "ArrowLeft" || event.key === "h") {
        event.preventDefault();
        stepBack();
      }

      if (event.key === " ") {
        event.preventDefault();
        togglePlay();
      }

      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        resetToStart();
      }
    });
  }

  function init() {
    var tool = document.getElementById("gt-tool");

    if (!tool) {
      return;
    }

    refs.tool = tool;
    refs.algoTabs = document.getElementById("gt-algo-tabs");
    refs.stageNote = document.getElementById("gt-stage-note");
    refs.phaseChip = document.getElementById("gt-phase-chip");
    refs.svg = document.getElementById("gt-svg");
    refs.frontierItems = document.getElementById("gt-frontier-items");
    refs.frontierLabel = document.getElementById("gt-frontier-label");
    refs.frontierPointer = document.getElementById("gt-frontier-pointer");
    refs.visitedSet = document.getElementById("gt-visited-set");
    refs.currentPath = document.getElementById("gt-current-path");
    refs.resultArea = document.getElementById("gt-result");
    refs.resultPath = document.getElementById("gt-result-path");
    refs.resultPlaceholder = document.getElementById("gt-result-placeholder");
    refs.narration = document.getElementById("gt-narration");
    refs.codePanel = document.getElementById("gt-code-panel");
    refs.stepNum = document.getElementById("gt-step-num");
    refs.stepTotal = document.getElementById("gt-step-total");
    refs.progress = document.getElementById("gt-progress");
    refs.progressFill = refs.progress.querySelector(".aqua-progress-fill");
    refs.presetSelect = document.getElementById("gt-preset-select");
    refs.startSelect = document.getElementById("gt-start-select");
    refs.targetSelect = document.getElementById("gt-target-select");
    refs.speedSlider = document.getElementById("gt-speed-slider");
    refs.speedLabel = document.getElementById("gt-speed-label");
    refs.playButton = document.getElementById("gt-play-button");
    refs.stepBackButton = document.getElementById("gt-step-back-button");
    refs.stepForwardButton = document.getElementById("gt-step-forward-button");
    refs.resetButton = document.getElementById("gt-reset-button");
    refs.customPanel = document.getElementById("gt-custom-panel");
    refs.customText = document.getElementById("gt-custom-text");
    refs.customError = document.getElementById("gt-custom-error");
    refs.applyButton = document.getElementById("gt-apply-button");
    refs.summaryIdea = document.getElementById("gt-summary-idea");
    refs.summaryFrontier = document.getElementById("gt-summary-frontier");
    refs.summaryPattern = document.getElementById("gt-summary-pattern");
    refs.summaryStrength = document.getElementById("gt-summary-strength");
    refs.summaryTradeoff = document.getElementById("gt-summary-tradeoff");
    refs.selectRoots = [refs.presetSelect, refs.startSelect, refs.targetSelect];

    state.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    buildCodePanel();
    setSliderValue(refs.speedSlider, state.speedIdx);
    refs.speedLabel.textContent = SPEED_LABELS[state.speedIdx];
    bindEvents();
    toggleCustomPanel(false);
    loadPreset("lecture");
    revealPageWhenReady();
  }

  document.addEventListener("DOMContentLoaded", init);
}());

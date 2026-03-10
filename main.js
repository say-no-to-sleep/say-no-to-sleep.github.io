const tools = window.WatTheHex?.tools ?? [];

const filtersRoot = document.getElementById("filters");
const toolGrid = document.getElementById("tool-grid");

const filterConfig = [
  { key: "course", label: "Course", sort: compareCourse },
  { key: "type", label: "Type", sort: compareText },
  { key: "term", label: "Term", sort: compareTerm }
];

const selectedFilters = {
  course: new Set(),
  type: new Set(),
  term: new Set()
};

const sortedTools = [...tools].sort((left, right) => compareDate(right.date, left.date));

const filterOptions = Object.fromEntries(
  filterConfig.map(({ key, sort }) => [
    key,
    Array.from(new Set(sortedTools.map((tool) => tool[key]))).sort(sort)
  ])
);

hydrateFiltersFromQuery();
renderFilters();
renderCards();

function renderFilters() {
  if (!filtersRoot) {
    return;
  }

  filtersRoot.textContent = "";

  filterConfig.forEach(({ key, label }) => {
    const group = document.createElement("section");
    group.className = "filter-group";

    const heading = document.createElement("h2");
    heading.className = "filter-group-title";
    heading.textContent = label;
    group.appendChild(heading);

    const options = document.createElement("div");
    options.className = "filter-options";

    filterOptions[key].forEach((value) => {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = selectedFilters[key].has(value)
        ? "filter-pill aqua-button aqua-button-focused"
        : "filter-pill aqua-button";
      pill.textContent = value;
      pill.setAttribute("aria-pressed", String(selectedFilters[key].has(value)));
      pill.addEventListener("click", () => {
        toggleFilter(key, value);
      });
      options.appendChild(pill);
    });

    group.appendChild(options);
    filtersRoot.appendChild(group);
  });
}

function renderCards() {
  if (!toolGrid) {
    return;
  }

  const visibleTools = sortedTools.filter((tool) => matchesSelection(tool, selectedFilters));

  toolGrid.textContent = "";

  if (visibleTools.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "No tools match this filter combination.";
    toolGrid.appendChild(emptyState);
    return;
  }

  const fragment = document.createDocumentFragment();

  visibleTools.forEach((tool) => {
    const card = document.createElement("a");
    card.className = "tool-card aqua-button";
    card.href = tool.url;

    const title = document.createElement("h2");
    title.className = "tool-card-title";
    title.textContent = tool.name;

    const description = document.createElement("p");
    description.className = "tool-card-description";
    description.textContent = tool.description;

    const meta = document.createElement("div");
    meta.className = "tool-card-meta";

    meta.appendChild(createBadge("tool-chip", tool.course));
    meta.appendChild(createBadge("tool-chip", tool.type));
    meta.appendChild(createBadge("tool-term", tool.term));

    card.append(title, description, meta);
    fragment.appendChild(card);
  });

  toolGrid.appendChild(fragment);
}

function toggleFilter(key, value) {
  if (selectedFilters[key].has(value)) {
    selectedFilters[key].delete(value);
  } else {
    selectedFilters[key].add(value);
  }

  syncFiltersToQuery();
  renderFilters();
  renderCards();
}

function hydrateFiltersFromQuery() {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);

  filterConfig.forEach(({ key }) => {
    params.getAll(key).forEach((value) => {
      if (filterOptions[key].includes(value)) {
        selectedFilters[key].add(value);
      }
    });
  });
}

function syncFiltersToQuery() {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams();

  filterConfig.forEach(({ key }) => {
    Array.from(selectedFilters[key]).sort(compareText).forEach((value) => {
      params.append(key, value);
    });
  });

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", nextUrl);
}

function matchesSelection(tool, selections) {
  return filterConfig.every(({ key }) => {
    const selected = selections[key];
    return selected.size === 0 || selected.has(tool[key]);
  });
}

function createBadge(className, text) {
  const badge = document.createElement("span");
  badge.className = className;
  badge.textContent = text;
  return badge;
}

function compareDate(left, right) {
  const leftTime = Date.parse(left);
  const rightTime = Date.parse(right);

  return (Number.isNaN(leftTime) ? 0 : leftTime) - (Number.isNaN(rightTime) ? 0 : rightTime);
}

function compareText(left, right) {
  return left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: "base"
  });
}

function compareCourse(left, right) {
  return compareText(left, right);
}

function compareTerm(left, right) {
  const leftOrder = parseTerm(left);
  const rightOrder = parseTerm(right);

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return compareText(left, right);
}

function parseTerm(term) {
  const match = /^(\d+)([AB])$/i.exec(term.trim());

  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }

  const year = Number(match[1]);
  const slot = match[2].toUpperCase() === "A" ? 0 : 1;
  return year * 2 + slot;
}

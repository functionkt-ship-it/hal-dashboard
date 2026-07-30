const state = {
  projects: [],
  tools: [],
  query: "",
  status: "all",
  ai: "all",
  location: "all",
};

const elements = {
  time: document.querySelector("#current-time"),
  search: document.querySelector("#project-search"),
  statusFilter: document.querySelector("#status-filter"),
  aiFilter: document.querySelector("#ai-filter"),
  locationFilter: document.querySelector("#location-filter"),
  projectGrid: document.querySelector("#project-grid"),
  projectCount: document.querySelector("#project-count"),
  projectTemplate: document.querySelector("#project-template"),
  toolGrid: document.querySelector("#tool-grid"),
  todayList: document.querySelector("#today-list"),
  updatesList: document.querySelector("#updates-list"),
  activeCount: document.querySelector("#active-project-count"),
  lastUpdated: document.querySelector("#last-updated"),
  leadAiCount: document.querySelector("#lead-ai-count"),
  themeToggle: document.querySelector("#theme-toggle"),
  themeLabel: document.querySelector("#theme-label"),
};

const statusColors = {
  "進行中": "#14b887",
  "準備中": "#e6a642",
  "レビュー待ち": "#7c93ff",
  "保留": "#98a7aa",
};

function formatDate(value, includeYear = false) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    year: includeYear ? "numeric" : undefined,
    month: "short",
    day: "numeric",
  }).format(date);
}

function updateClock() {
  elements.time.dateTime = new Date().toISOString();
  elements.time.textContent = new Intl.DateTimeFormat("ja-JP", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function makeLink(label, href) {
  const link = document.createElement("a");
  link.textContent = `${label} ↗`;
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

function populateFilters() {
  const statuses = [...new Set(state.projects.map((project) => project.status))];
  const ais = [...new Set(state.projects.map((project) => project.leadAi))];
  const locations = [...new Set(state.projects.map((project) => {
    if (project.location?.includes("会計事務所PC")) return "会計事務所PC";
    if (project.location?.includes("GitHub")) return "GitHub";
    return project.location;
  }).filter(Boolean))];
  const addOptions = (select, values) => {
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.append(option);
    });
  };

  addOptions(elements.statusFilter, statuses);
  addOptions(elements.aiFilter, ais);
  addOptions(elements.locationFilter, locations);
}

function visibleProjects() {
  const query = state.query.trim().toLocaleLowerCase("ja-JP");
  return state.projects.filter((project) => {
    const matchesQuery = !query || [
      project.name,
      project.summary,
      project.status,
      project.leadAi,
      project.nextAction,
      project.location,
    ].join(" ").toLocaleLowerCase("ja-JP").includes(query);
    const matchesStatus = state.status === "all" || project.status === state.status;
    const matchesAi = state.ai === "all" || project.leadAi === state.ai;
    const matchesLocation = state.location === "all"
      || project.location?.includes(state.location);
    return matchesQuery && matchesStatus && matchesAi && matchesLocation;
  });
}

function renderProjects() {
  const projects = visibleProjects();
  elements.projectGrid.replaceChildren();
  elements.projectCount.textContent = `${projects.length}件のプロジェクトを表示`;

  if (!projects.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "条件に合うプロジェクトはありません。検索条件を変更してください。";
    elements.projectGrid.append(empty);
    return;
  }

  projects.forEach((project) => {
    const card = elements.projectTemplate.content.cloneNode(true);
    const status = card.querySelector(".project-status");
    status.textContent = project.status;
    status.style.setProperty("--status-color", statusColors[project.status] || "var(--accent)");
    card.querySelector(".project-updated").textContent = `更新 ${formatDate(project.updatedAt)}`;
    card.querySelector("h3").textContent = project.name;
    card.querySelector(".project-summary").textContent = project.summary;
    card.querySelector(".project-lead").textContent = project.leadAi;
    card.querySelector(".project-next").textContent = project.nextAction;
    const location = card.querySelector(".project-location");
    location.textContent = project.location || "—";
    if (project.location?.includes("バックアップ対象外")) {
      location.classList.add("is-warning");
      location.textContent = `⚠ ${project.location}`;
    }
    const links = card.querySelector(".project-links");
    if (project.notionUrl) links.append(makeLink("Notion", project.notionUrl));
    if (project.githubUrl) links.append(makeLink("GitHub", project.githubUrl));
    if (project.outputUrl) links.append(makeLink("成果物", project.outputUrl));
    elements.projectGrid.append(card);
  });
}

function renderToday() {
  const tasks = state.projects
    .filter((project) => project.status === "進行中" || project.status === "レビュー待ち")
    .slice(0, 3);
  elements.todayList.replaceChildren();

  tasks.forEach((project) => {
    const item = document.createElement("li");
    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = project.nextAction;
    const source = document.createElement("span");
    source.className = "task-source";
    source.textContent = project.name;
    item.append(title, source);
    elements.todayList.append(item);
  });
}

function renderTools() {
  elements.toolGrid.replaceChildren();
  state.tools.forEach((tool) => {
    const link = document.createElement("a");
    link.className = "tool-card";
    link.href = tool.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.innerHTML = `
      <span class="tool-symbol" aria-hidden="true">${tool.symbol}</span>
      <span>
        <h3>${tool.name}</h3>
        <p>${tool.category}</p>
      </span>
      <span class="tool-link">開く ↗</span>
    `;
    elements.toolGrid.append(link);
  });
}

function renderUpdates() {
  const updates = [...state.projects]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);
  elements.updatesList.replaceChildren();

  updates.forEach((project) => {
    const item = document.createElement("li");
    const date = document.createElement("span");
    date.className = "update-date";
    date.textContent = formatDate(project.updatedAt, true);
    const content = document.createElement("span");
    content.innerHTML = `<span class="update-title">${project.name}</span><br><span class="update-type">${project.status} · ${project.leadAi}</span>`;
    const link = project.notionUrl ? makeLink("", project.notionUrl) : document.createElement("span");
    link.className = "update-link";
    link.setAttribute("aria-label", `${project.name}を開く`);
    link.textContent = "↗";
    item.append(date, content, link);
    elements.updatesList.append(item);
  });
}

function renderSummary() {
  const active = state.projects.filter((project) => project.status === "進行中");
  const latest = [...state.projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  elements.activeCount.textContent = active.length;
  elements.lastUpdated.textContent = latest ? formatDate(latest.updatedAt) : "—";
  elements.leadAiCount.textContent = new Set(active.map((project) => project.leadAi)).size;
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("hal-theme", theme);
  elements.themeLabel.textContent = theme === "dark" ? "ダーク" : "ライト";
}

function registerInteractions() {
  elements.search.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderProjects();
  });
  elements.statusFilter.addEventListener("change", (event) => {
    state.status = event.target.value;
    renderProjects();
  });
  elements.aiFilter.addEventListener("change", (event) => {
    state.ai = event.target.value;
    renderProjects();
  });
  elements.locationFilter.addEventListener("change", (event) => {
    state.location = event.target.value;
    renderProjects();
  });
  elements.themeToggle.addEventListener("click", () => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
      event.preventDefault();
      elements.search.focus();
    }
  });
}

async function loadDashboard() {
  try {
    const [projectsResponse, toolsResponse] = await Promise.all([
      fetch(`projects.json?v=${Date.now()}`, { cache: "no-store" }),
      fetch("tools.json"),
    ]);
    if (!projectsResponse.ok || !toolsResponse.ok) throw new Error("設定ファイルを読み込めませんでした。");
    const [projectsData, toolsData] = await Promise.all([projectsResponse.json(), toolsResponse.json()]);
    state.projects = projectsData.projects;
    state.tools = toolsData.tools;
    populateFilters();
    renderProjects();
    renderToday();
    renderTools();
    renderUpdates();
    renderSummary();
  } catch (error) {
    const message = `表示データの読み込みに失敗しました。${error.message}`;
    elements.projectGrid.innerHTML = `<p class="empty-state">${message}</p>`;
    elements.toolGrid.innerHTML = `<p class="empty-state">${message}</p>`;
  }
}

updateClock();
setInterval(updateClock, 1000 * 30);
setTheme(document.documentElement.dataset.theme || "dark");
registerInteractions();
loadDashboard();

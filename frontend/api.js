const API_BASE =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000"
    : "https://ai-kaizen-system.onrender.com";
const appState = {
  user: null,
  loginRole: null,
  refreshTimer: null,
  recorder: null,
  chunks: [],
  audioBlob: null,
  audioUrl: null,
  timerId: null,
  seconds: 0,
  suggestions: []
};

const STATUS_OPTIONS = ["Pending", "In Review", "Implemented", "Rejected"];
const EDITABLE_STATUS_OPTIONS = ["Pending", "In Review"];
const CATEGORY_OPTIONS = ["Safety", "Quality", "Productivity", "Maintenance", "Cost Saving"];
const PRIORITY_OPTIONS = ["Critical", "High", "Medium", "Low"];

async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, options);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || "Request failed");
    return body;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Cannot connect to the Flask backend at ${API_BASE}. Please make sure the server is running.`);
    }
    throw error;
  }
}

function showToast(message, type = "success") {
  let toast = document.querySelector(".app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "app-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.add("is-visible");
  window.clearTimeout(toast.hideTimer);
  toast.hideTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function setLoading(element, isLoading, label = "Loading...") {
  if (!element) return;
  if (isLoading) {
    element.dataset.originalText = element.textContent;
    element.textContent = label;
    element.disabled = true;
  } else {
    element.textContent = element.dataset.originalText || element.textContent;
    element.disabled = false;
  }
}

function showOnly(view) {
  ["landingView", "managerDashboard", "employeeDashboard"].forEach((id) => {
    document.querySelector(`#${id}`)?.classList.add("is-hidden");
  });
  view.classList.remove("is-hidden");
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function tagClass(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, "-");
}

function getUserId(user = appState.user) {
  return user?.userId || user?.id || "";
}

function isManagerVisible() {
  const dashboard = document.querySelector("#managerDashboard");
  return dashboard && !dashboard.classList.contains("is-hidden");
}

function isEmployeeVisible() {
  const dashboard = document.querySelector("#employeeDashboard");
  return dashboard && !dashboard.classList.contains("is-hidden");
}

async function refreshCurrentDashboard() {
  if (!appState.user) return;
  if (appState.user.role === "manager" && isManagerVisible()) {
    await loadManagerDashboard();
  } else if (appState.user.role === "employee" && isEmployeeVisible()) {
    await loadEmployeeSuggestions();
  }
}

function startDashboardAutoRefresh() {
  window.clearInterval(appState.refreshTimer);
  appState.refreshTimer = window.setInterval(() => {
    refreshCurrentDashboard().catch(() => {});
  }, 5000);
}

function stopDashboardAutoRefresh() {
  window.clearInterval(appState.refreshTimer);
  appState.refreshTimer = null;
}

function renderStatusBadge(status) {
  if (status === "Implemented") {
    return `<mark class="status-badge implemented-badge">✓ Implemented</mark>`;
  }
  if (status === "Rejected") {
    return `<mark class="status-badge rejected-badge">Rejected</mark>`;
  }
  return `<mark class="status-badge ${tagClass(status)}">${status || "-"}</mark>`;
}

function renderStatusCell(item) {
  if (EDITABLE_STATUS_OPTIONS.includes(item.status)) {
    return `<select class="status-select" data-id="${item.id}" aria-label="Update status">${STATUS_OPTIONS.map((status) => `<option ${status === item.status ? "selected" : ""}>${status}</option>`).join("")}</select>`;
  }
  return renderStatusBadge(item.status);
}

function createLoginModal() {
  const modal = document.createElement("div");
  modal.className = "login-modal is-hidden";
  modal.innerHTML = `
    <form class="login-card">
      <div>
        <p class="eyebrow" id="loginRoleLabel">Secure access</p>
        <h2>Login</h2>
      </div>
      <label>
        <span>User ID</span>
        <input id="loginUserId" autocomplete="username" required />
      </label>
      <label>
        <span>Password</span>
        <input id="loginPassword" type="password" autocomplete="current-password" required />
      </label>
      <div class="login-actions">
        <button class="ghost-button modal-cancel" type="button">Cancel</button>
        <button class="primary-button" id="loginSubmit" type="submit">Login</button>
      </div>
    </form>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".modal-cancel").addEventListener("click", () => modal.classList.add("is-hidden"));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.classList.add("is-hidden");
  });
  modal.querySelector("form").addEventListener("submit", handleLogin);
}

function openLogin(role) {
  appState.loginRole = role;
  document.querySelector("#loginRoleLabel").textContent = role === "manager" ? "Manager access" : "Employee access";
  document.querySelector("#loginUserId").value = "";
  document.querySelector("#loginPassword").value = "";
  document.querySelector(".login-modal").classList.remove("is-hidden");
  document.querySelector("#loginUserId").focus();
}

function resetSignupForm() {
  ["signupEmployeeId", "signupEmployeeName", "signupPassword", "signupConfirmPassword"].forEach((id) => {
    const field = document.querySelector(`#${id}`);
    if (field) field.value = "";
  });
}

function closeSignupModal() {
  document.querySelector("#signupModal")?.classList.add("hidden");
}

async function handleSignup() {
  const button = document.querySelector("#createAccountBtn");
  const userId = document.querySelector("#signupEmployeeId")?.value.trim() || "";
  const name = document.querySelector("#signupEmployeeName")?.value.trim() || "";
  const password = document.querySelector("#signupPassword")?.value || "";
  const confirmPassword = document.querySelector("#signupConfirmPassword")?.value || "";

  if (!userId || !name || !password || !confirmPassword) {
    showToast("All fields are required", "error");
    return;
  }
  if (password !== confirmPassword) {
    showToast("Passwords do not match", "error");
    return;
  }

  setLoading(button, true, "Creating...");
  try {
    const result = await request("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, name, password, confirmPassword })
    });
    showOnly(document.querySelector("#landingView"));
    closeSignupModal();
    resetSignupForm();
    showToast(result.message || "Account created successfully. Please login.");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setLoading(button, false);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const button = document.querySelector("#loginSubmit");
  setLoading(button, true, "Signing in...");
  try {
    const { user } = await request("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: document.querySelector("#loginUserId").value.trim(),
        password: document.querySelector("#loginPassword").value
      })
    });
    if (user.role !== appState.loginRole) throw new Error(`This account is registered as ${user.role}`);
    appState.user = user;
    localStorage.setItem("qualiflow-user", JSON.stringify(user));
    document.querySelector(".login-modal").classList.add("is-hidden");
    await enterDashboard(user);
    showToast(`Welcome ${getUserId(user)}`);
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setLoading(button, false);
  }
}

async function enterDashboard(user) {
  startDashboardAutoRefresh();
  if (user.role === "manager") {
    showOnly(document.querySelector("#managerDashboard"));
    await loadManagerDashboard();
  } else {
    showOnly(document.querySelector("#employeeDashboard"));
    await loadEmployeeSuggestions();
  }
}

function buildRecorderUi() {
  const firstStep = document.querySelector(".workflow-panel .pipeline-step");
  const submitButton = document.querySelector(".submit-button");
  if (!firstStep || !submitButton || document.querySelector(".recorder-panel")) return;
  const panel = document.createElement("div");
  panel.className = "recorder-panel";
  panel.innerHTML = `
    <div class="recorder-status"><i></i><strong id="recordingState">Ready</strong><span id="recordingTimer">00:00</span></div>
    <div class="recorder-controls">
      <button class="secondary-button compact" id="startRecording" type="button">Record</button>
      <button class="secondary-button compact" id="pauseRecording" type="button" disabled>Pause</button>
      <button class="secondary-button compact" id="resumeRecording" type="button" disabled>Resume</button>
      <button class="secondary-button compact" id="stopRecording" type="button" disabled>Stop</button>
    </div>
    <audio id="recordingPlayback" controls></audio>
  `;
  firstStep.after(panel);
  document.querySelector("#startRecording").addEventListener("click", startRecording);
  document.querySelector("#pauseRecording").addEventListener("click", pauseRecording);
  document.querySelector("#resumeRecording").addEventListener("click", resumeRecording);
  document.querySelector("#stopRecording").addEventListener("click", stopRecording);
  document.querySelector("#recordButton")?.addEventListener("click", startRecording, true);
  submitButton.addEventListener("click", submitSuggestion);
}

function setRecorderState(state) {
  document.querySelector("#recordingState").textContent = state;
  const isRecording = state === "Recording";
  const isPaused = state === "Paused";
  document.querySelector("#startRecording").disabled = isRecording || isPaused;
  document.querySelector("#pauseRecording").disabled = !isRecording;
  document.querySelector("#resumeRecording").disabled = !isPaused;
  document.querySelector("#stopRecording").disabled = !(isRecording || isPaused);
}

function updateTimer() {
  appState.seconds += 1;
  const minutes = String(Math.floor(appState.seconds / 60)).padStart(2, "0");
  const seconds = String(appState.seconds % 60).padStart(2, "0");
  document.querySelector("#recordingTimer").textContent = `${minutes}:${seconds}`;
}

async function startRecording(event) {
  event?.preventDefault();
  event?.stopImmediatePropagation();
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    appState.chunks = [];
    appState.audioBlob = null;
    appState.seconds = 0;
    document.querySelector("#recordingTimer").textContent = "00:00";
    document.querySelector("#recordingPlayback").removeAttribute("src");
    appState.recorder = new MediaRecorder(stream);
    appState.recorder.ondataavailable = (event) => {
      if (event.data.size) appState.chunks.push(event.data);
    };
    appState.recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      appState.audioBlob = new Blob(appState.chunks, { type: appState.recorder.mimeType || "audio/webm" });
      if (appState.audioUrl) URL.revokeObjectURL(appState.audioUrl);
      appState.audioUrl = URL.createObjectURL(appState.audioBlob);
      document.querySelector("#recordingPlayback").src = appState.audioUrl;
      setRecorderState("Stopped");
    };
    appState.recorder.start();
    window.clearInterval(appState.timerId);
    appState.timerId = window.setInterval(updateTimer, 1000);
    setRecorderState("Recording");
  } catch (error) {
    showToast("Microphone access is required to record suggestions", "error");
  }
}

function pauseRecording() {
  if (appState.recorder?.state === "recording") {
    appState.recorder.pause();
    window.clearInterval(appState.timerId);
    setRecorderState("Paused");
  }
}

function resumeRecording() {
  if (appState.recorder?.state === "paused") {
    appState.recorder.resume();
    appState.timerId = window.setInterval(updateTimer, 1000);
    setRecorderState("Recording");
  }
}

function stopRecording() {
  if (appState.recorder && appState.recorder.state !== "inactive") {
    window.clearInterval(appState.timerId);
    appState.recorder.stop();
  }
}

async function submitSuggestion(event) {
  event.preventDefault();
  if (!appState.user) return showToast("Please login first", "error");
  if (!appState.audioBlob) return showToast("Record audio before submitting", "error");
  const button = event.currentTarget;
  const formData = new FormData();
  formData.append("employeeId", getUserId());
  formData.append("employeeName", appState.user.name);
  formData.append("audio", appState.audioBlob, "suggestion.webm");
  setLoading(button, true, "Processing...");

  console.log("Submitting for:", getUserId());
  console.log("User object:", appState.user);
  try {
    const { suggestion } = await request("/submit-suggestion", { method: "POST", body: formData });
    renderEmployeeAnalysis(suggestion);
    appState.suggestions = [
    suggestion,
    ...appState.suggestions.filter(
        (item) => item.id !== suggestion.id
    )
];

renderEmployeeTable(appState.suggestions);

resetRecorderUI();

setTimeout(async () => {
    await loadEmployeeSuggestions();
}, 1000);
    window.localStorage.setItem("qualiflow-suggestions-updated", String(Date.now()));
    showToast("Suggestion submitted successfully");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setLoading(button, false);
  }
}

function resetRecorderUI() {
  // stop any running recorder and timer
  try {
    if (appState.recorder && appState.recorder.state !== "inactive") {
      try { appState.recorder.stop(); } catch (e) {}
    }
    window.clearInterval(appState.timerId);
  } catch (e) {}

  // revoke and clear audio url/blob
  if (appState.audioUrl) {
    try { URL.revokeObjectURL(appState.audioUrl); } catch (e) {}
  }
  appState.chunks = [];
  appState.audioBlob = null;
  appState.audioUrl = null;
  appState.seconds = 0;
  appState.timerId = null;

  // reset playback element and timer text/state
  const playback = document.querySelector("#recordingPlayback");
  if (playback) playback.removeAttribute("src");
  const timer = document.querySelector("#recordingTimer");
  if (timer) timer.textContent = "00:00";
  const stateLabel = document.querySelector("#recordingState");
  if (stateLabel) stateLabel.textContent = "Ready";
  // ensure buttons are in ready state
  try { setRecorderState("Ready"); } catch (e) {}
}

function renderEmployeeAnalysis(suggestion) {
  document.querySelector("#recognizedText").textContent = suggestion.originalText || "-";
  const steps = document.querySelectorAll(".workflow-panel .pipeline-step");
  steps[2].querySelector("p").textContent = suggestion.translatedText || "-";
  steps[3].querySelector(".badge-row").innerHTML = `
    <mark class="tag ${tagClass(suggestion.category)}">${suggestion.category}</mark>
    <mark class="tag ${tagClass(suggestion.priority)}">${suggestion.priority}</mark>
    <mark class="tag">${suggestion.language}</mark>
    <mark class="tag">${suggestion.status}</mark>
  `;
}

async function loadEmployeeSuggestions() {
  const employeeId = getUserId();

  console.log("Logged-in user:", appState.user);
  console.log("getUserId():", employeeId);

  const { suggestions } =
    await request(`/employee-suggestions/${encodeURIComponent(employeeId)}`);

  console.log("Suggestions returned:", suggestions);

  appState.suggestions =
    suggestions.filter((item) => item.employeeId === employeeId);

  renderEmployeeTable(appState.suggestions);
}

function renderEmployeeTable(suggestions) {
  const table = document.querySelector(".mini-table");
  table.innerHTML = `
    <div class="mini-row mini-head"><span>Suggestion</span><span>Category</span><span>Priority</span><span>Status</span><span>Date</span></div>
    ${suggestions.map((item) => `
      <div class="mini-row">
        <span>${item.translatedText || "-"}</span>
        <span>${item.category || "-"}</span>
        <span>${item.priority || "-"}</span>
        <span>${renderStatusBadge(item.status)}</span>
        <span>${formatDate(item.timestamp)}</span>
      </div>
    `).join("") || `<div class="mini-row empty-row"><span>No suggestions submitted yet</span><span></span><span></span><span></span><span></span></div>`}
  `;
}

async function loadManagerDashboard() {
  const [{ suggestions }, { analytics }] = await Promise.all([request("/all-suggestions"), request("/analytics")]);
  appState.suggestions = suggestions;
  renderManagerTable();
  renderAnalytics(analytics);
}

function getFilteredSuggestions() {
  const [searchInput, categorySelect, prioritySelect, statusSelect, dateInput] = document.querySelectorAll(".filter-bar input, .filter-bar select");
  const search = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const priority = prioritySelect.value;
  const status = statusSelect.value;
  const date = dateInput.value;
  return appState.suggestions.filter((item) => {
    const text = `${item.translatedText || ""} ${item.originalText || ""} ${item.employeeId || ""}`.toLowerCase();
    const itemDate = item.timestamp ? new Date(item.timestamp).toISOString().slice(0, 10) : "";
    return (!search || text.includes(search))
      && (category === "All Categories" || item.category === category)
      && (priority === "All Priorities" || item.priority === priority)
      && (status === "All Statuses" || item.status === status)
      && (!date || itemDate === date);
  });
}

function renderManagerTable() {
  const suggestions = getFilteredSuggestions();
  const table = document.querySelector(".suggestion-table");
  table.innerHTML = `
    <div class="table-row table-head" role="row">
      <span role="columnheader">Employee ID</span><span role="columnheader">Suggestion</span><span role="columnheader">Category</span>
      <span role="columnheader">Priority</span><span role="columnheader">Status</span><span role="columnheader">Timestamp</span><span role="columnheader">Action</span>
    </div>
    ${suggestions.map((item) => `
      <div class="table-row" role="row">
        <span role="cell">${item.employeeId || "-"}</span>
        <span role="cell">${item.translatedText || "-"}</span>
        <span role="cell">${item.category || "-"}</span>
        <span role="cell"><mark class="tag ${tagClass(item.priority)}">${item.priority || "-"}</mark></span>
        <span role="cell">${renderStatusCell(item)}</span>
        <span role="cell">${formatDate(item.timestamp)}</span>
        <span role="cell"><button class="danger-button compact delete-suggestion" data-id="${item.id}" type="button">Delete</button></span>
      </div>
    `).join("") || `<div class="table-row empty-row" role="row"><span role="cell">No suggestions submitted yet</span><span></span><span></span><span></span><span></span><span></span><span></span></div>`}
  `;
  table.querySelectorAll(".status-select").forEach((select) => select.addEventListener("change", updateStatus));
  table.querySelectorAll(".delete-suggestion").forEach((button) => button.addEventListener("click", deleteSuggestion));
  renderCriticalList(appState.suggestions);
}

function renderCriticalList(suggestions) {
  const list = document.querySelector(".critical-list");
  const critical = suggestions.filter((item) => item.priority === "Critical" || item.priority === "High").slice(0, 5);
  list.innerHTML = critical.map((item) => `
    <article><strong>${item.translatedText || item.originalText || "-"}</strong><span>${item.category || "General"} - ${item.status || "Pending"}</span></article>
  `).join("") || `<article><strong>No critical suggestions</strong><span>High-risk queue is clear.</span></article>`;
}

async function updateStatus(event) {
  const select = event.currentTarget;
  try {
    await request(`/update-status/${select.dataset.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: select.value })
    });
    await loadManagerDashboard();
    window.localStorage.setItem("qualiflow-suggestions-updated", String(Date.now()));
    showToast("Status updated");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function deleteSuggestion(event) {
  const button = event.currentTarget;
  const confirmed = window.confirm("Delete this suggestion permanently?");
  if (!confirmed) return;

  setLoading(button, true, "Deleting...");
  try {
    await request(`/delete-suggestion/${button.dataset.id}`, { method: "DELETE" });
    if (appState.user?.role === "manager") {
      await loadManagerDashboard();
    } else {
      await loadEmployeeSuggestions();
    }
    showToast("Suggestion deleted");
  } catch (error) {
    showToast(error.message, "error");
    setLoading(button, false);
  }
}

function renderAnalytics(analytics) {
  const stripValues = document.querySelectorAll(".operation-strip strong");
  stripValues[1].textContent = analytics.today;
  stripValues[2].textContent = analytics.pending;
  stripValues[3].textContent = analytics.critical;
  const kpis = document.querySelectorAll(".kpi-card strong");
  kpis[0].textContent = analytics.total;
  kpis[1].textContent = analytics.pending;
  kpis[2].textContent = analytics.implemented;
  kpis[3].textContent = analytics.categoryDistribution.Safety || 0;
  const categoryTotal = Object.values(analytics.categoryDistribution).reduce((sum, value) => sum + value, 0) || 1;
  document.querySelector(".chart-legend").innerHTML = CATEGORY_OPTIONS.map((category) => {
    const count = analytics.categoryDistribution[category] || 0;
    return `<span><i class="legend ${tagClass(category)}"></i>${category} ${Math.round((count / categoryTotal) * 100)}%</span>`;
  }).join("");
  const priorityMax = Math.max(...Object.values(analytics.priorityDistribution), 1);
  document.querySelector(".priority-bars").innerHTML = PRIORITY_OPTIONS.map((priority) => {
    const count = analytics.priorityDistribution[priority] || 0;
    return `<div><span>${priority}</span><strong>${count}</strong><progress value="${count}" max="${priorityMax}"></progress></div>`;
  }).join("");
}

function setupManagerFilters() {
  document.querySelectorAll(".filter-bar input, .filter-bar select").forEach((control) => {
    control.addEventListener("input", renderManagerTable);
    control.addEventListener("change", renderManagerTable);
  });
}

function setupExport() {
  const button = document.querySelector("#exportReportButton");
  if (!button) return;
  const clone = button.cloneNode(true);
  button.replaceWith(clone);
  clone.addEventListener("click", () => {
    const rows = getFilteredSuggestions();
    const header = ["Employee", "Suggestion", "Category", "Priority", "Status", "Timestamp"];
    const csv = [header, ...rows.map((item) => [
      item.employeeId || "",
      item.translatedText || item.originalText || "",
      item.category || "",
      item.priority || "",
      item.status || "",
      item.timestamp || ""
    ])].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "qualiflow-suggestions-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  });
}

function restoreSession() {
  try {
    const user = JSON.parse(localStorage.getItem("qualiflow-user") || "null");
    if (user?.userId) {
      appState.user = user;
      enterDashboard(user).catch(() => localStorage.removeItem("qualiflow-user"));
    }
  } catch (error) {
    localStorage.removeItem("qualiflow-user");
  }
}

function init() {
  createLoginModal();
  buildRecorderUi();
  setupManagerFilters();
  setupExport();
  document.querySelector("#managerLogin")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    openLogin("manager");
  }, true);
  document.querySelector("#employeeLogin")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    openLogin("employee");
  }, true);
  document.querySelector("#createAccountBtn")?.addEventListener("click", handleSignup);
  document.querySelector("#cancelSignupBtn")?.addEventListener("click", resetSignupForm);
  document.querySelector("#signupModal")?.addEventListener("click", (event) => {
    if (event.target.id === "signupModal") {
      closeSignupModal();
      resetSignupForm();
    }
  });
  document.querySelectorAll("[data-view='landing']").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.removeItem("qualiflow-user");
      appState.user = null;
      stopDashboardAutoRefresh();
    });
  });
  window.addEventListener("storage", (event) => {
    if (event.key === "qualiflow-suggestions-updated") {
      refreshCurrentDashboard().catch(() => {});
    }
  });
  restoreSession();
}

init();

const configuredApiBase = window.QUALIFLOW_API_BASE || "";
const productionApiBase = "https://aikaizensystem-production.up.railway.app";

const defaultApiBase =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:8080"
        : productionApiBase;

const API_BASE = (configuredApiBase || defaultApiBase).replace(/\/$/, "");
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
  suggestions: [],
  reviewSuggestion: null,
  displayTranslationCache: new Map(),
  employeeRenderToken: 0
};

const STATUS_OPTIONS = ["Pending", "In Review", "Implemented", "Rejected"];
const EDITABLE_STATUS_OPTIONS = ["Pending", "In Review"];
const REVIEW_STATUS_OPTIONS = ["Pending", "In Review", "Implemented"];
const DECISION_OPTIONS = ["Select Decision", "Approve", "Reject"];
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
      throw new Error(`Cannot connect to the Flask backend${API_BASE ? ` at ${API_BASE}` : ""}. Please make sure the server is running.`);
    }
    throw error;
  }
}

function translateUiText(value) {
  return window.translateAppText ? window.translateAppText(value) : value;
}

async function translateDynamicTexts(texts, targetLanguage) {
    if (!texts || texts.length === 0 || targetLanguage === "en") {
        const result = {};
        (texts || []).forEach(text => {
            result[text] = text;
        });
        return result;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/translate-display`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                texts,
                targetLanguage
            })
        });

        if (!response.ok) {
            throw new Error("Translation request failed");
        }

        const data = await response.json();
        return data.translations || {};
    } catch (error) {
        console.error("Translation Error:", error);

        const fallback = {};
        texts.forEach(text => {
            fallback[text] = text;
        });

        return fallback;
    }
}

function getSelectedLanguage() {
  return window.getAppLanguage ? window.getAppLanguage() : document.documentElement.lang || "en";
}

function dynamicTranslationKey(language, value) {
  return `${language}::${String(value || "").trim()}`;
}

function getCachedDisplayText(value, language = getSelectedLanguage()) {
  const text = String(value || "").trim();
  if (!text || text === "-") return text || "-";
  if (language === "en") return text;
  return appState.displayTranslationCache.get(dynamicTranslationKey(language, text)) || translateUiText(text);
}

async function loadDisplayTranslations(values, language = getSelectedLanguage()) {
  if (language === "en") return false;

  const texts = [...new Set(values
    .map((value) => String(value || "").trim())
    .filter((value) => value && value !== "-")
  )].filter((value) => !appState.displayTranslationCache.has(dynamicTranslationKey(language, value)));

  if (!texts.length) return false;

  const { translations = {} } = await request("/translate-display", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetLanguage: language, texts })
  });

  Object.entries(translations).forEach(([source, translated]) => {
    appState.displayTranslationCache.set(dynamicTranslationKey(language, source), translated || source);
  });
  return true;
}

function showToast(message, type = "success") {
  let toast = document.querySelector(".app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "app-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = translateUiText(message);
  toast.dataset.type = type;
  toast.classList.add("is-visible");
  window.clearTimeout(toast.hideTimer);
  toast.hideTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function setLoading(element, isLoading, label = "Loading...") {
  if (!element) return;
  if (isLoading) {
    element.dataset.originalText = element.textContent;
    element.textContent = translateUiText(label);
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

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
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
  const safeStatus = escapeHtml(
    translateUiText(status || "-")
);
  if (status === "Implemented" || status === "Approved") {
    return `<mark class="status-badge implemented-badge">${safeStatus}</mark>`;
  }
  if (status === "Rejected") {
    return `<mark class="status-badge rejected-badge">${safeStatus}</mark>`;
  }
  if (status === "Pending") {
    return `<mark class="status-badge pending-badge">${safeStatus}</mark>`;
  }
  if (status === "In Review") {
    return `<mark class="status-badge review-badge">${safeStatus}</mark>`;
  }
  return `<mark class="status-badge ${tagClass(status)}">${safeStatus}</mark>`;
}

function renderStatusCell(item) {
  if (EDITABLE_STATUS_OPTIONS.includes(item.status)) {
    return `<select class="status-select" data-id="${item.id}" aria-label="Update status">${STATUS_OPTIONS.map((status) => `<option ${status === item.status ? "selected" : ""}>${status}</option>`).join("")}</select>`;
  }
  return renderStatusBadge(item.status);
}

function isEditableReviewStatus(status) {
  return status === "Pending" || status === "In Review";
}

function normalizeSuggestionFields(item) {
  const approval = normalizeApprovalValue(item.approval, item.status);
  return {
    ...item,
    approval,
    status: approval === "Rejected" ? "Rejected" : normalizeStatusValue(item.status),
    feedback: item.feedback || "",
    rejectionReason: item.rejectionReason || ""
  };
}

function normalizeApprovalValue(approval, status) {
  const value = String(approval || "").trim().toLowerCase();
  const statusValue = String(status || "").trim().toLowerCase();
  if (value === "rejected" || statusValue === "rejected") return "Rejected";
  if (value === "approved") return "Approved";
  return "Pending";
}

function normalizeStatusValue(status) {
  const value = String(status || "").trim().toLowerCase();
  if (value === "implemented") return "Implemented";
  if (value === "in review" || value === "in-review") return "In Review";
  if (value === "rejected") return "Rejected";
  return "Pending";
}

function renderDecisionCell(item) {
  if (item.approval === "Rejected") {
    return renderStatusBadge("Rejected");
  }

  if (item.approval === "Approved") {
    if (isEditableReviewStatus(item.status)) {
      return `
        <button
          class="status-badge status-update-button ${item.status === "In Review" ? "review-badge" : "pending-badge"}"
          data-id="${escapeHtml(item.id)}"
          title="Click to update status."
          type="button"
        >
          ${escapeHtml(item.status || "Pending")}
        </button>
      `;
    }
    return renderStatusBadge(item.status || "Pending");
  }

  return `
    <select class="decision-select status-select" data-id="${item.id}" aria-label="Decision">
      ${DECISION_OPTIONS.map((decision) => `<option>${decision}</option>`).join("")}
    </select>
  `;
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
    <span>Company Name</span>

    <input
        id="loginCompany"
        type="text"
        placeholder="Enter Company Name"
        autocomplete="organization"
        required
    />

<label>
  <span id="loginIdLabel">Employee ID</span>

  <input
      id="loginUserId"
      autocomplete="username"
      required
  />
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
  window.registerTranslatableContent?.(modal);
  modal.querySelector(".modal-cancel").addEventListener("click", () => modal.classList.add("is-hidden"));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.classList.add("is-hidden");
  });
  modal.querySelector("form").addEventListener("submit", handleLogin);
}

function createReviewModal() {
  if (document.querySelector("#reviewModal")) return;
  const modal = document.createElement("div");
  modal.id = "reviewModal";
  modal.className = "modal hidden";
  modal.innerHTML = `
    <form class="modal-content" id="reviewSuggestionForm">
      <h2>Review Suggestion</h2>
      <div class="review-summary">
        <label>
          <span>Suggestion</span>
          <output id="reviewSuggestionText">-</output>
        </label>
        <label>
          <span>Employee Name</span>
          <output id="reviewEmployeeName">-</output>
        </label>
        <label>
          <span>Category</span>
          <output id="reviewCategory">-</output>
        </label>
        <label>
          <span>Priority</span>
          <output id="reviewPriority">-</output>
        </label>
        <label>
          <span>Decision</span>
          <input id="reviewDecision" type="text" readonly />
        </label>
      </div>
      <label id="reviewStatusGroup">
        <span>Status</span>
        <select id="reviewStatus">
          ${REVIEW_STATUS_OPTIONS.map((status) => `<option>${status}</option>`).join("")}
        </select>
      </label>
      <label id="reviewFeedbackGroup">
        <span>Manager Feedback</span>
        <textarea id="reviewFeedback" placeholder="Describe what action was taken..." rows="4"></textarea>
      </label>
      <label id="reviewReasonGroup" class="hidden">
        <span>Rejection Reason</span>
        <textarea id="reviewRejectionReason" placeholder="Explain why this suggestion was rejected..." rows="4"></textarea>
      </label>
      <div class="modal-actions">
        <button class="ghost-button" id="cancelReviewBtn" type="button">Cancel</button>
        <button class="primary-button" id="saveReviewBtn" type="submit">Save</button>
      </div>
    </form>
  `;
  document.body.appendChild(modal);
  modal.querySelector("#cancelReviewBtn").addEventListener("click", closeReviewModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeReviewModal();
  });
  modal.querySelector("form").addEventListener("submit", saveReviewSuggestion);
  modal.querySelector("#reviewStatus").addEventListener("change", (event) => {
    event.currentTarget.classList.toggle("implemented-badge", event.currentTarget.value === "Implemented");
  });
}

function closeReviewModal() {
  document.querySelector("#reviewModal")?.classList.add("hidden");
  appState.reviewSuggestion = null;
}

function openReviewModal(event) {
  const trigger = event.currentTarget;
  const isStatusUpdate = trigger.classList.contains("status-update-button");
  const selectedDecision = isStatusUpdate ? "Approve" : trigger.value;
  if (selectedDecision === "Select Decision") return;

  const suggestion = appState.suggestions.find((item) => item.id === trigger.dataset.id);
  if (!suggestion) {
    showToast("Suggestion not found", "error");
    if (!isStatusUpdate) {
      trigger.value = "Select Decision";
    }
    return;
  }

  if (isStatusUpdate && !isEditableReviewStatus(suggestion.status)) {
    return;
  }

  appState.reviewSuggestion = suggestion;
  const decision = selectedDecision === "Approve" ? "Approve" : "Reject";
  const modal = document.querySelector("#reviewModal");
  modal.querySelector("#reviewSuggestionText").textContent = suggestion.translatedText || suggestion.originalText || "-";
  modal.querySelector("#reviewEmployeeName").textContent = suggestion.employeeName || suggestion.employeeId || "-";
  modal.querySelector("#reviewCategory").textContent = suggestion.category || "-";
  modal.querySelector("#reviewPriority").innerHTML = `<mark class="tag ${tagClass(suggestion.priority)}">${escapeHtml(suggestion.priority || "-")}</mark>`;
  modal.querySelector("#reviewDecision").value = decision;
  modal.querySelector("#reviewStatus").value = suggestion.status || "Pending";
  modal.querySelector("#reviewStatus").classList.toggle("implemented-badge", suggestion.status === "Implemented");
  modal.querySelector("#reviewFeedback").value = suggestion.feedback || "";
  modal.querySelector("#reviewRejectionReason").value = suggestion.rejectionReason || "";

  const isApprove = decision === "Approve";
  modal.querySelector("#reviewStatusGroup").classList.toggle("hidden", !isApprove);
  modal.querySelector("#reviewFeedbackGroup").classList.toggle("hidden", !isApprove);
  modal.querySelector("#reviewReasonGroup").classList.toggle("hidden", isApprove);
  modal.classList.remove("hidden");
  modal.querySelector(isApprove ? "#reviewStatus" : "#reviewRejectionReason").focus();
  if (!isStatusUpdate) {
    trigger.value = "Select Decision";
  }
}

async function saveReviewSuggestion(event) {
  event.preventDefault();
  const suggestion = appState.reviewSuggestion;
  if (!suggestion) return;

  const modal = document.querySelector("#reviewModal");
  const decision = modal.querySelector("#reviewDecision").value;
  const button = modal.querySelector("#saveReviewBtn");
  const payload = decision === "Approve"
    ? {
        approval: "Approved",
        status: modal.querySelector("#reviewStatus").value,
        feedback: modal.querySelector("#reviewFeedback").value.trim()
      }
    : {
        approval: "Rejected",
        rejectionReason: modal.querySelector("#reviewRejectionReason").value.trim()
      };

  setLoading(button, true, "Saving...");
  try {
    await request(`/review-suggestion/${suggestion.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const updatedSuggestion = normalizeSuggestionFields({
      ...suggestion,
      ...payload,
      managerUpdatedAt: new Date().toISOString()
    });
    appState.suggestions = appState.suggestions.map((item) => (
      item.id === updatedSuggestion.id ? updatedSuggestion : item
    ));
    closeReviewModal();
    refreshManagerRow(updatedSuggestion);
    window.localStorage.setItem("qualiflow-suggestions-updated", String(Date.now()));
    showToast("Review saved");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setLoading(button, false);
  }
}

function openLogin(role) {
  appState.loginRole = role;

  document.querySelector("#loginRoleLabel").textContent =
    role === "manager" ? "Manager access" : "Employee access";

  document.querySelector("#loginIdLabel").textContent =
    role === "manager" ? "Manager ID" : "Employee ID";
  window.registerTranslatableContent?.(document.querySelector(".login-modal"));

  document.querySelector("#loginCompany").value = "";
  document.querySelector("#loginUserId").value = "";
  document.querySelector("#loginPassword").value = "";

  document.querySelector(".login-modal").classList.remove("is-hidden");
  document.querySelector("#loginUserId").focus();
}

function resetSignupForm() {
  ["signupCompany","signupEmployeeId", "signupEmployeeName", "signupPassword", "signupConfirmPassword"].forEach((id) => {
    const field = document.querySelector(`#${id}`);
    if (field) field.value = "";
  });
}

function closeSignupModal() {
  document.querySelector("#signupModal")?.classList.add("hidden");
}

async function handleSignup() {
  const button = document.querySelector("#createAccountBtn");
  const company = document.querySelector("#signupCompany")?.value.trim() || "";
  const userId = document.querySelector("#signupEmployeeId")?.value.trim() || "";
  const name = document.querySelector("#signupEmployeeName")?.value.trim() || "";
  const password = document.querySelector("#signupPassword")?.value || "";
  const confirmPassword = document.querySelector("#signupConfirmPassword")?.value || "";

  if (!company || !userId || !name || !password || !confirmPassword) {
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
      body: JSON.stringify({
        company,
        userId,
        name,
        password,
        confirmPassword
      })
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

  const company = document.querySelector("#loginCompany").value.trim();

  if (!company) {
    showToast("Please enter a company name", "error");
    return;
  }

  const button = document.querySelector("#loginSubmit");

  setLoading(button, true, "Signing in.");
  try {
    const { user } = await request("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company,
        userId: document.querySelector("#loginUserId").value.trim(),
        password: document.querySelector("#loginPassword").value
      })
    });
    if (user.role !== appState.loginRole) throw new Error(`${translateUiText("This account is registered as")} ${user.role}`);
    appState.user = {
      company: user.company,
      userId: user.userId,
      name: user.name,
      role: user.role
    };
    localStorage.setItem("qualiflow-user", JSON.stringify(appState.user));
    document.querySelector(".login-modal").classList.add("is-hidden");
    await enterDashboard(appState.user);
    showToast(`${translateUiText("Welcome")} ${appState.user.name || getUserId(appState.user)}`);
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setLoading(button, false);
  }
}

async function enterDashboard(user) {
  const welcome = document.querySelector("#employeeWelcomeName");

  if (welcome) {
    welcome.textContent = user.name || user.userId;
}
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
  if (!appState.user.company || !getUserId() || !appState.user.name) {
    return showToast("Your login session is missing employee details. Please login again.", "error");
  }
  if (!appState.audioBlob) return showToast("Record audio before submitting", "error");
  const button = event.currentTarget;
  const formData = new FormData();
  formData.append("company", appState.user.company);
  formData.append("employeeId", getUserId());
  formData.append("employeeName", appState.user.name);
  formData.append("audio", appState.audioBlob, "suggestion.webm");
  setLoading(button, true, "Processing...");

  try {
    const { suggestion } = await request("/submit-suggestion", { method: "POST", body: formData });
    const normalizedSuggestion = normalizeSuggestionFields(suggestion);
    renderEmployeeAnalysis(normalizedSuggestion);
    appState.suggestions = [
      normalizedSuggestion,
      ...appState.suggestions.filter(
        (item) => item.id !== normalizedSuggestion.id
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
  try {
    if (appState.recorder && appState.recorder.state !== "inactive") {
      try { appState.recorder.stop(); } catch (e) {}
    }
    window.clearInterval(appState.timerId);
  } catch (e) {}

  if (appState.audioUrl) {
    try { URL.revokeObjectURL(appState.audioUrl); } catch (e) {}
  }
  appState.chunks = [];
  appState.audioBlob = null;
  appState.audioUrl = null;
  appState.seconds = 0;
  appState.timerId = null;

  const playback = document.querySelector("#recordingPlayback");
  if (playback) playback.removeAttribute("src");
  const timer = document.querySelector("#recordingTimer");
  if (timer) timer.textContent = "00:00";
  const stateLabel = document.querySelector("#recordingState");
  if (stateLabel) stateLabel.textContent = "Ready";
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
  if (!appState.user?.company || !employeeId) {
    throw new Error("Your login session is missing employee details. Please login again.");
  }

  const company = encodeURIComponent(appState.user.company);

  const { suggestions } = await request(
    `/employee-suggestions/${company}/${encodeURIComponent(employeeId)}`
);

  const previousSuggestions = appState.suggestions;
  appState.suggestions = suggestions.map(normalizeSuggestionFields);

  notifyEmployeeReviews(appState.suggestions, previousSuggestions);
  renderEmployeeTable(appState.suggestions);
}

function employeeNotificationStorageKey(name) {
  const company = appState.user?.company || "company";
  const employeeId = getUserId() || "employee";
  return `qualiflow-${name}-${company}-${employeeId}`;
}

function getStoredReviewKeys(name) {
  try {
    return JSON.parse(localStorage.getItem(employeeNotificationStorageKey(name)) || "[]");
  } catch (error) {
    return [];
  }
}

function setStoredReviewKeys(name, keys) {
  localStorage.setItem(employeeNotificationStorageKey(name), JSON.stringify([...new Set(keys)]));
}

function reviewNotificationKey(item) {
  return `${item.id}:${item.approval}:${item.managerUpdatedAt || ""}`;
}

function getReviewMessage(item) {
  if (item.approval === "Approved") {
    return "Your suggestion has been approved.";
  }
  if (item.approval === "Rejected") {
    return `Your suggestion has been rejected.${item.rejectionReason ? ` Reason: ${item.rejectionReason}` : ""}`;
  }
  return "";
}

function notifyEmployeeReviews(suggestions, previousSuggestions = []) {
  const previousById = new Map(previousSuggestions.map((item) => [item.id, item]));
  const seen = getStoredReviewKeys("seen-reviews");
  let changed = false;

  suggestions.forEach((item) => {
    if (!["Approved", "Rejected"].includes(item.approval) || !item.managerUpdatedAt) return;
    const key = reviewNotificationKey(item);
    const previous = previousById.get(item.id);
    const changedInRefresh = previous && (
      previous.approval !== item.approval ||
      previous.managerUpdatedAt !== item.managerUpdatedAt
    );

    if (!seen.includes(key) && (changedInRefresh || previousSuggestions.length === 0)) {
      showToast(getReviewMessage(item), item.approval === "Rejected" ? "error" : "success");
      seen.push(key);
      changed = true;
    }
  });

  if (changed) setStoredReviewKeys("seen-reviews", seen);
}

function renderEmployeeNotifications(suggestions) {
  //Notifications removed intentionally.
}

function getProgressTimelineStage(item) {
  const normalizedItem = normalizeSuggestionFields(item);
  if (normalizedItem.approval === "Rejected" || normalizedItem.status === "Rejected") {
    return "Rejected";
  }
  if (normalizedItem.status === "Implemented") {
    return "Implemented";
  }
  if (normalizedItem.status === "In Review") {
    return "In Review";
  }
  return "Pending";
}

function renderProgressTimeline(item) {
  const normalizedItem = normalizeSuggestionFields(item);
  const currentStage = getProgressTimelineStage(normalizedItem);

  if (currentStage === "Rejected") {
    return `
      <div class="progress-timeline rejected-timeline" aria-label="${escapeHtml(`${translateUiText("Suggestion progress")}: ${translateUiText("Rejected")}`)}">
        ${["Submitted", "Rejected"].map((stage, index) => `
          <div class="progress-step ${index === 0 ? "is-complete" : "is-rejected"}">
            <span class="progress-dot" aria-hidden="true"></span>
            <span class="progress-label">${escapeHtml(translateUiText(stage))}</span>
            ${index === 0 ? `<span class="progress-connector is-rejected" aria-hidden="true"></span>` : ""}
          </div>
        `).join("")}
      </div>
    `;
}

  const stages = ["Submitted", "Pending", "In Review", "Implemented"];
  const currentIndex = stages.indexOf(currentStage);
  return `
    <div class="progress-timeline" aria-label="${escapeHtml(`${translateUiText("Suggestion progress")}: ${translateUiText(currentStage)}`)}">
      ${stages.map((stage, index) => {
        const isComplete = currentStage === "Implemented" || index < currentIndex;
        const isCurrent = currentStage !== "Implemented" && index === currentIndex;
        const stepClass = isComplete ? "is-complete" : isCurrent ? "is-current" : "is-future";
        const connectorClass = index < currentIndex ? "is-complete" : "";
        return `
          <div class="progress-step ${stepClass}">
            <span class="progress-dot" aria-hidden="true"></span>
            <span class="progress-label">${escapeHtml(translateUiText(stage))}</span>
            ${index < stages.length - 1 ? `<span class="progress-connector ${connectorClass}" aria-hidden="true"></span>` : ""}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

async function renderEmployeeTable(suggestions) {
  const selectedLanguage = languageSelect?.value || "en";

  const table = document.querySelector(".mini-table");
  if (!table) return;
  const language = getSelectedLanguage();
  const renderToken = ++appState.employeeRenderToken;
  renderEmployeeNotifications(suggestions);
  table.innerHTML = `
    <div class="mini-row mini-head"><span>${escapeHtml(translateUiText("Suggestion"))}</span><span>${escapeHtml(translateUiText("Category"))}</span><span>${escapeHtml(translateUiText("Priority"))}</span><span>${escapeHtml(translateUiText("Approval"))}</span><span>${escapeHtml(translateUiText("Status"))}</span><span>${escapeHtml(translateUiText("Manager Feedback / Rejection Reason"))}</span></div>
    ${suggestions.map((rawItem) => {
      const item = normalizeSuggestionFields(rawItem);
      const isRejected = item.approval === "Rejected" || item.status === "Rejected";
      const suggestionText = item.translatedText || item.originalText || "-";
      const feedbackText = isRejected ? item.rejectionReason || "-" : item.feedback || "-";
      return `
        <div class="mini-row">
          <span>${escapeHtml(
    getCachedDisplayText(suggestionText, language)
)}</span>
          <span>${escapeHtml(
    translateUiText(item.category || "-")
)}</span>
          <span>${escapeHtml(
    translateUiText(item.priority || "-")
)}</span>
          <span>${renderStatusBadge(item.approval || "Pending")}</span>
          <span>${isRejected ? "" : renderStatusBadge(item.status || "Pending")}</span>
          <span>${
    escapeHtml(getCachedDisplayText(feedbackText, language))
}</span>
          <div class="mini-row-detail">${renderProgressTimeline(item)}</div>
        </div>
      `;
    }).join("") || `<div class="mini-row empty-row"><span>${escapeHtml(translateUiText("No suggestions submitted yet"))}</span><span></span><span></span><span></span><span></span><span></span></div>`}
  `;

  const dynamicTexts = suggestions.flatMap((rawItem) => {
    const item = normalizeSuggestionFields(rawItem);
    const isRejected = item.approval === "Rejected" || item.status === "Rejected";
    return [
      item.translatedText || item.originalText || "",
      isRejected ? item.rejectionReason || "" : item.feedback || ""
    ];
  });

  loadDisplayTranslations(dynamicTexts, language)
    .then((loadedTranslations) => {
      if (loadedTranslations && renderToken === appState.employeeRenderToken && language === getSelectedLanguage()) {
        renderEmployeeTable(appState.suggestions);
      }
    })
    .catch(() => {});
}

async function loadManagerDashboard() {
    if (!appState.user?.company) {
      throw new Error("Your login session is missing company details. Please login again.");
    }

    const company = encodeURIComponent(appState.user.company);

    const [{ suggestions }, { analytics }] = await Promise.all([

        request(`/company-suggestions/${company}`),

        request(`/analytics/${company}`)

    ]);

    appState.suggestions = suggestions.map(normalizeSuggestionFields);

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
      <span role="columnheader">Priority</span><span role="columnheader">Decision</span><span role="columnheader">Timestamp</span>
    </div>
    ${suggestions.map(renderManagerRow).join("") || renderEmptyManagerRow()}
  `;
  bindManagerReviewControls(table);
  renderCriticalList(appState.suggestions);
}

function renderManagerRow(item) {
  return `
    <div class="table-row" data-id="${escapeHtml(item.id)}" role="row">
      <span role="cell">${escapeHtml(item.employeeId || "-")}</span>
      <span role="cell">${escapeHtml(item.translatedText || item.originalText || "-")}</span>
      <span role="cell">${escapeHtml(item.category || "-")}</span>
      <span role="cell"><mark class="tag ${tagClass(item.priority)}">${escapeHtml(item.priority || "-")}</mark></span>
      <span role="cell">${renderDecisionCell(item)}</span>
      <span role="cell">${formatDate(item.timestamp)}</span>
    </div>
  `;
}

function renderEmptyManagerRow() {
  return `<div class="table-row empty-row" role="row"><span role="cell">No suggestions submitted yet</span><span></span><span></span><span></span><span></span><span></span></div>`;
}

function bindManagerReviewControls(scope = document) {
  scope.querySelectorAll(".decision-select").forEach((select) => {
    select.addEventListener("change", openReviewModal);
  });
  scope.querySelectorAll(".status-update-button").forEach((button) => {
    button.addEventListener("click", openReviewModal);
  });
}

function refreshManagerRow(item) {
  const table = document.querySelector(".suggestion-table");
  const currentRow = [...(table?.querySelectorAll(".table-row[data-id]") || [])]
    .find((row) => row.dataset.id === item.id);
  if (!table || !currentRow) {
    return;
  }

  const isStillVisible = getFilteredSuggestions().some((suggestion) => suggestion.id === item.id);
  if (!isStillVisible) {
    currentRow.remove();
    if (!table.querySelector(".table-row:not(.table-head)")) {
      table.insertAdjacentHTML("beforeend", renderEmptyManagerRow());
    }
    renderCriticalList(appState.suggestions);
    return;
  }

  currentRow.outerHTML = renderManagerRow(item);
  const newRow = [...table.querySelectorAll(".table-row[data-id]")]
    .find((row) => row.dataset.id === item.id);
  if (newRow) {
    bindManagerReviewControls(newRow);
  }
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
  if (stripValues[1]) stripValues[1].textContent = analytics.today;
  if (stripValues[2]) stripValues[2].textContent = analytics.pending;
  if (stripValues[3]) stripValues[3].textContent = analytics.critical;
  const kpis = document.querySelectorAll(".kpi-card strong");
  if (kpis[0]) kpis[0].textContent = analytics.total;
  if (kpis[1]) kpis[1].textContent = analytics.pending;
  if (kpis[2]) kpis[2].textContent = analytics.implemented;
  if (kpis[3]) kpis[3].textContent = analytics.categoryDistribution.Safety || 0;
  const chartLegend = document.querySelector(".chart-legend");
  if (chartLegend) {
    const categoryTotal = Object.values(analytics.categoryDistribution).reduce((sum, value) => sum + value, 0) || 1;
    chartLegend.innerHTML = CATEGORY_OPTIONS.map((category) => {
      const count = analytics.categoryDistribution[category] || 0;
      return `<span><i class="legend ${tagClass(category)}"></i>${category} ${Math.round((count / categoryTotal) * 100)}%</span>`;
    }).join("");
  }
  const priorityBars = document.querySelector(".priority-bars");
  if (priorityBars) {
    const priorityMax = Math.max(...Object.values(analytics.priorityDistribution), 1);
    priorityBars.innerHTML = PRIORITY_OPTIONS.map((priority) => {
      const count = analytics.priorityDistribution[priority] || 0;
      return `<div><span>${priority}</span><strong>${count}</strong><progress value="${count}" max="${priorityMax}"></progress></div>`;
    }).join("");
  }
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
  createReviewModal();
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
  window.addEventListener("app-language-changed", () => {
    if (appState.user?.role === "employee" && isEmployeeVisible()) {
      renderEmployeeTable(appState.suggestions);
    }
  });
  restoreSession();
}

init();

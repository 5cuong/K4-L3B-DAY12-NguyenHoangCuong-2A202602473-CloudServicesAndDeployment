const byId = (id) => document.getElementById(id);

function setProbe(id, state, label, detail) {
  const card = byId(`${id}-card`);
  card.dataset.state = state;
  byId(`${id}-state`).innerHTML = `<i></i>${label}`;
  byId(`${id}-result`).textContent = detail;
}

async function requestJson(path, options = {}) {
  const response = await fetch(path, { cache: "no-store", ...options });
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { response, body };
}

async function runChecks() {
  const button = byId("refresh-checks");
  const grid = byId("probe-grid");
  button.disabled = true;
  grid.setAttribute("aria-busy", "true");
  byId("overall-status").textContent = "Đang kiểm tra endpoint";

  let healthy = false;
  let ready = false;
  let redisConfirmed = false;
  let authProtected = false;

  try {
    const { response, body } = await requestJson("/health");
    healthy = response.ok && body?.status === "ok";
    const version = body?.version ? ` · v${body.version}` : "";
    const environment = body?.environment ? ` · ${body.environment}` : "";
    setProbe(
      "health",
      healthy ? "pass" : "fail",
      healthy ? "Đang hoạt động" : `HTTP ${response.status}`,
      healthy ? `HTTP ${response.status}${version}${environment}` : "Health check không xác nhận dịch vụ khỏe."
    );
  } catch {
    setProbe("health", "fail", "Không kết nối", "Không gọi được /health; thử tải lại sau.");
  }

  try {
    const { response, body } = await requestJson("/ready");
    ready = response.ok && (body?.status === "ready" || body?.ready === true);
    redisConfirmed = body?.redis === true;
    const redisFailed = body?.redis === false;
    const label = redisConfirmed
      ? "Redis đã kết nối"
      : redisFailed
        ? "Redis chưa sẵn sàng"
        : response.ok
          ? "Readiness trả lời"
          : `HTTP ${response.status}`;
    const detail = redisConfirmed
      ? `HTTP ${response.status} · redis: true`
      : redisFailed
        ? `HTTP ${response.status} · redis: false`
        : response.ok
          ? `HTTP ${response.status} · API không trả trường redis`
          : "Readiness check chưa thành công.";
    setProbe("ready", ready && !redisFailed ? (redisConfirmed ? "pass" : "warn") : "fail", label, detail);
  } catch {
    setProbe("ready", "fail", "Không kết nối", "Không gọi được /ready; xác minh Redis trên platform.");
  }

  try {
    const { response } = await requestJson("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Public auth smoke check" }),
    });
    authProtected = response.status === 401;
    setProbe(
      "auth",
      authProtected ? "pass" : "fail",
      authProtected ? "Đã chặn đúng" : `HTTP ${response.status}`,
      authProtected ? "HTTP 401 · không gửi API key hoặc gọi LLM" : "Auth guard cần được kiểm tra lại."
    );
  } catch {
    setProbe("auth", "fail", "Không kết nối", "Không gọi được auth smoke check.");
  }

  const allHealthy = healthy && ready && redisConfirmed && authProtected;
  const overall = byId("overall-status");
  overall.textContent = allHealthy
    ? "Health, Redis và auth đều đạt"
    : healthy && ready && authProtected
      ? "Endpoints đạt · cần xác nhận Redis"
      : "Có probe cần kiểm tra";
  overall.parentElement.dataset.state = allHealthy ? "pass" : healthy && ready && authProtected ? "warn" : "fail";
  byId("checked-at").textContent = `Cập nhật ${new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date())}`;
  grid.setAttribute("aria-busy", "false");
  button.disabled = false;
}

byId("refresh-checks").addEventListener("click", runChecks);
runChecks();

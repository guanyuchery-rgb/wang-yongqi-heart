const button = document.querySelector("#heartButton");
const counter = document.querySelector("#counter");
const message = document.querySelector("#message");
const surprise = document.querySelector("#surprise");
const surpriseHint = document.querySelector("#surpriseHint");
const siteStats = document.querySelector("#siteStats");
const visitorCount = document.querySelector("#visitorCount");
const completeCount = document.querySelector("#completeCount");

const COUNT_API_BASE = "https://countapi.mileshilliard.com/api/v1";
const VISITOR_KEY = "wang_yongqi_heart_visitors_v1";
const COMPLETE_KEY = "wang_yongqi_heart_99_complete_v1";
const LOVE_KEY = "wang_yongqi_heart_999_love_v1";

let count = Number(localStorage.getItem("heartCount") || 0);
let surpriseShown = localStorage.getItem("surpriseShown") === "true";
let loveShown = localStorage.getItem("loveShown") === "true";
let allowContinueAfter99 = false;

function applyAdminQuery() {
  const params = new URLSearchParams(window.location.search);

  if (params.get("admin") === "xiaoyu") {
    localStorage.setItem("showPrivateStats", "true");
  }

  if (params.get("admin") === "off") {
    localStorage.removeItem("showPrivateStats");
  }
}

function canShowPrivateStats() {
  return (
    window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    localStorage.getItem("showPrivateStats") === "true"
  );
}

function showPrivateStatsIfAllowed() {
  if (canShowPrivateStats()) {
    siteStats.hidden = false;
  }
}

async function loadRemoteConfig() {
  try {
    const response = await fetch(`remote-config.json?v=${Date.now()}`, { cache: "no-store" });

    if (!response.ok) {
      return;
    }

    const config = await response.json();
    allowContinueAfter99 = config.allowContinueAfter99 === true;
    updateSurpriseHint();
  } catch {
    // Keep the page usable even if GitHub Pages or the network is slow.
  }
}

function updateCounter() {
  counter.textContent = `已经送出 ${count} 颗小爱心`;
}

function getMessage() {
  if (count < 10) {
    return "点一下嘛";
  }

  if (count < 30) {
    return "等你再点一下";
  }

  if (count < 60) {
    return "加油快到了，点一下";
  }

  if (count < 99) {
    return "嘻嘻，加油加油";
  }

  if (count < 521) {
    return "小禹一直陪着你";
  }

  return "停在 521，刚刚好";
}

function updateButtonState() {
  if (count >= 521) {
    button.disabled = true;
    button.textContent = "已经到 521 啦";
    return;
  }

  button.disabled = false;
  button.textContent = "点一下收下爱心";
}

function updateMessage() {
  message.textContent = getMessage();
}

function renderStat(element, value) {
  if (!canShowPrivateStats()) {
    return;
  }

  element.textContent = Number.isFinite(value) ? String(value) : "--";
}

async function getGlobalCount(key) {
  const response = await fetch(`${COUNT_API_BASE}/get/${key}`);

  if (response.status === 404) {
    return 0;
  }

  if (!response.ok) {
    throw new Error(`Count read failed: ${response.status}`);
  }

  const data = await response.json();
  return Number(data.value || 0);
}

async function hitGlobalCount(key) {
  const response = await fetch(`${COUNT_API_BASE}/hit/${key}`);

  if (!response.ok) {
    throw new Error(`Count update failed: ${response.status}`);
  }

  const data = await response.json();
  return Number(data.value || 0);
}

async function updateGlobalStats() {
  try {
    const [visitors, completed] = await Promise.all([
      getGlobalCount(VISITOR_KEY),
      getGlobalCount(COMPLETE_KEY),
    ]);

    renderStat(visitorCount, visitors);
    renderStat(completeCount, completed);
  } catch {
    renderStat(visitorCount, NaN);
    renderStat(completeCount, NaN);
  }
}

async function countVisitOnce() {
  try {
    if (localStorage.getItem("visitCounted") === "true") {
      renderStat(visitorCount, await getGlobalCount(VISITOR_KEY));
      return;
    }

    const visitors = await hitGlobalCount(VISITOR_KEY);
    localStorage.setItem("visitCounted", "true");
    renderStat(visitorCount, visitors);
  } catch {
    renderStat(visitorCount, NaN);
  }
}

async function countCompletionOnce() {
  try {
    if (localStorage.getItem("completionCounted") === "true") {
      renderStat(completeCount, await getGlobalCount(COMPLETE_KEY));
      return;
    }

    const completed = await hitGlobalCount(COMPLETE_KEY);
    localStorage.setItem("completionCounted", "true");
    renderStat(completeCount, completed);
  } catch {
    renderStat(completeCount, NaN);
  }
}

async function countLoveOnce() {
  try {
    if (localStorage.getItem("loveCounted") === "true") {
      return;
    }

    await hitGlobalCount(LOVE_KEY);
    localStorage.setItem("loveCounted", "true");
  } catch {
    // The 999-heart surprise should still work if the counter service is unavailable.
  }
}

function popHeart(x, y) {
  const heart = document.createElement("span");
  heart.className = "pop-heart";
  heart.textContent = "♥";
  heart.style.setProperty("--left", `${x}px`);
  heart.style.setProperty("--top", `${y}px`);
  document.body.appendChild(heart);
  window.setTimeout(() => heart.remove(), 900);
}

function burstHearts(total = 36) {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  for (let i = 0; i < total; i += 1) {
    const heart = document.createElement("span");
    const angle = (Math.PI * 2 * i) / total;
    const distance = 120 + (i % 6) * 18;

    heart.className = "burst-heart";
    heart.textContent = i % 3 === 0 ? "♡" : "♥";
    heart.style.setProperty("--start-x", `${centerX}px`);
    heart.style.setProperty("--start-y", `${centerY}px`);
    heart.style.setProperty("--move-x", `${Math.cos(angle) * distance}px`);
    heart.style.setProperty("--move-y", `${Math.sin(angle) * distance}px`);
    heart.style.setProperty("--delay", `${(i % 6) * 35}ms`);
    document.body.appendChild(heart);
    window.setTimeout(() => heart.remove(), 1700);
  }
}

function setSurpriseText(kicker, text, isMega = false) {
  surprise.querySelector(".surprise-kicker").textContent = kicker;
  surprise.querySelector(".surprise-text").textContent = text;
  surprise.classList.toggle("is-mega", isMega);
  updateSurpriseHint();
}

function revealSurprise() {
  surprise.setAttribute("aria-hidden", "false");
  surprise.classList.add("is-visible");
}

function hideSurprise() {
  if (count >= 521) {
    return;
  }

  if (count >= 99 && count < 521 && !allowContinueAfter99) {
    updateSurpriseHint();
    return;
  }

  surprise.classList.remove("is-visible");
  surprise.setAttribute("aria-hidden", "true");
}

function updateSurpriseHint() {
  if (count >= 521) {
    surpriseHint.textContent = "停在 521，刚刚好";
    return;
  }

  surpriseHint.textContent = allowContinueAfter99 ? "小禹已开启，点一下继续" : "等待小禹开启继续";
}

function showSurprise() {
  surpriseShown = true;
  localStorage.setItem("surpriseShown", "true");
  setSurpriseText("第 99 颗爱心达成", "小禹一直陪着你");
  revealSurprise();
  burstHearts();
  countCompletionOnce();
}

function showLoveSurprise() {
  loveShown = true;
  localStorage.setItem("loveShown", "true");
  setSurpriseText("第 521 颗爱心达成", "停在 521，刚刚好", true);
  revealSurprise();
  burstHearts(72);
  countLoveOnce();
}

button.addEventListener("click", (event) => {
  if (count >= 521) {
    return;
  }

  count += 1;
  localStorage.setItem("heartCount", String(count));
  updateCounter();
  updateMessage();
  updateButtonState();
  popHeart(event.clientX, event.clientY);

  if (count >= 521 && !loveShown) {
    showLoveSurprise();
    return;
  }

  if (count >= 99 && !surpriseShown) {
    showSurprise();
  }
});

surprise.addEventListener("click", hideSurprise);

updateCounter();
updateMessage();
updateButtonState();
applyAdminQuery();
showPrivateStatsIfAllowed();
updateGlobalStats();
countVisitOnce();
loadRemoteConfig();
window.setInterval(loadRemoteConfig, 5000);

if (count >= 521 && loveShown) {
  setSurpriseText("第 521 颗爱心达成", "停在 521，刚刚好", true);
  updateButtonState();
  countLoveOnce();
} else if (count >= 99 && surpriseShown) {
  setSurpriseText("第 99 颗爱心达成", "小禹一直陪着你");
  countCompletionOnce();
}

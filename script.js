const button = document.querySelector("#heartButton");
const counter = document.querySelector("#counter");
const surprise = document.querySelector("#surprise");

let count = Number(localStorage.getItem("heartCount") || 0);
let surpriseShown = localStorage.getItem("surpriseShown") === "true";

function updateCounter() {
  counter.textContent = `已经送出 ${count} 颗小爱心`;
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

function burstHearts() {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  for (let i = 0; i < 36; i += 1) {
    const heart = document.createElement("span");
    const angle = (Math.PI * 2 * i) / 36;
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

function showSurprise() {
  surpriseShown = true;
  localStorage.setItem("surpriseShown", "true");
  surprise.setAttribute("aria-hidden", "false");
  surprise.classList.add("is-visible");
  burstHearts();
}

button.addEventListener("click", (event) => {
  count += 1;
  localStorage.setItem("heartCount", String(count));
  updateCounter();
  popHeart(event.clientX, event.clientY);

  if (count >= 99 && !surpriseShown) {
    showSurprise();
  }
});

updateCounter();

if (count >= 99 && surpriseShown) {
  surprise.setAttribute("aria-hidden", "false");
  surprise.classList.add("is-visible");
}

const button = document.querySelector("#heartButton");
const counter = document.querySelector("#counter");

let count = Number(localStorage.getItem("heartCount") || 0);

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

button.addEventListener("click", (event) => {
  count += 1;
  localStorage.setItem("heartCount", String(count));
  updateCounter();
  popHeart(event.clientX, event.clientY);
});

updateCounter();

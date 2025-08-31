

const state ={currentRange: "weekly"}

const labels = {
    daily: "Yesterday",
    weekly: "Last Week",
    monthly: "Last Month"
};

async function getData() {
    const dataUrl = new URL("./data.json", import.meta.url);
    try {
        const res = await fetch(dataUrl, {cache:"no-store"});
        if (!res.ok) {
            throw new Error(`Response status: ${res.status}`);
        }
        const result = await res.json();
        if (!Array.isArray(result)) throw new Error("Expected an array at data.json root");
        return result;
    } catch (error) {
        console.error(error.message);
    }
}

const normalize = s => String(s).trim();

function buildIndex(arr) {
    const map = new Map();
    for (const item of arr) map.set(normalize(item.title), item);
    return map;
}


let byTitle = new Map();



const nav = document.querySelector(".timeframe .time-nav");
const cards = Array.from(document.querySelectorAll(".list .list-item[data-title]"));

function render() {
    for (const card of cards) {
        const key = normalize(card.dataset.title);
        const item = byTitle.get(key);
        if (!item) { console.warn("No data for", key); continue; }
        const frame = item.timeframes?.[state.currentRange];
        if (!frame) { console.warn("No frame for", key, state.currentRange); continue; }

        const hoursEl = card.querySelector(".data-hours");
        const prevEl = card.querySelector(".data-prev");
        const prevLabelEl = card.querySelector(".data-prev-label");

        if (hoursEl) hoursEl.textContent = frame.current;
        if (prevEl) prevEl.textContent = frame.previous;
        if (prevLabelEl) prevLabelEl.textContent = labels[state.currentRange];

    }
    setActive(state.currentRange);
};

function setActive(range) {
    if (!nav) return;
    nav.querySelectorAll("[data-range]").forEach(el => {
        const on = el.dataset.range === range;
        el.classList.toggle("is-active", on);
        if (el.tagName === "BUTTON") el.setAttribute("aria-pressed", String(on));
    });
};

function bindSwitcher() {
    if (!nav) return;
    nav.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-range]");
        if (!btn) return;
        const range = btn.dataset.range;
        if (!range || range === state.currentRange) return;
        state.currentRange = range;
        render();
    });
};
(async function init() {
  const data = await getData();
  if (!data) return;
  byTitle = buildIndex(data);
  bindSwitcher();
  render();
})();


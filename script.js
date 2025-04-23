
function getStoredLinks() {
  return JSON.parse(localStorage.getItem("quickLinks") || "[]");
}

function loadDashboardName() {
  const name = localStorage.getItem("dashBoardName");
  if (name) {
    document.querySelector("#greeting").innerHTML = `${name} Dashboard`;
  }
}

function saveLinks(links) {
  localStorage.setItem("quickLinks", JSON.stringify(links));
}

function padTime(value) {
  return String(value).padStart(2, "0");
}

function setupNotes() {
  const notesEl = document.querySelector("#notes");
  const savedNotes = localStorage.getItem("dashboardNotes");

  if (savedNotes) {
    notesEl.value = savedNotes;
  }

  notesEl.addEventListener("input", () => {
    localStorage.setItem("dashboardNotes", notesEl.value);
  });
}


function getTimeDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const h = today.getHours();
  const min = padTime(today.getMinutes());

  document.getElementById("clock").innerHTML = `${h}:${min} ${day}/${month}/${year}`;
}


function renameDashboard() {
  document.querySelector("#greeting").addEventListener("click", () => {
    const input = prompt("Please enter your name");
    if (!input || input.trim().length < 2) {
      alert("Please enter a valid name.");
    } else {
      const trimmed = input.trim();
      document.querySelector("#greeting").innerHTML = `${trimmed} Dashboard`;
      localStorage.setItem("dashBoardName", trimmed);
    }
  });
}

function quickLinkAdd() {
  document.querySelector("#addLink").addEventListener("click", async () => {
    const input = prompt("Please add the URL you wish to add");
    if (!input || input.trim() === "") return alert("Please enter a URL.");

    try {
      const link = new URL(input.trim());
      const customTitle = prompt("Enter a name for this link or leave blank for auto title");
      if (customTitle === null) return;

      const title = customTitle.trim() || link.hostname.replace(/^www\./, "").split(".")[0];
      const favicon = `https://www.google.com/s2/favicons?sz=64&domain_url=${link.origin}`;

      const listItem = document.createElement("div");
      listItem.className = "quick-link";
      listItem.innerHTML = `
        <article class="link-item">
          <img src="${favicon}" alt="favicon" class="link-favicon">
          <a href="${link.href}" target="_blank" class="link-title">${title}</a>
          <i class="fa-solid fa-xmark delete-icon"></i>
        </article>`;

      document.querySelector("#linkList").appendChild(listItem);

      const currentLinks = getStoredLinks();
      currentLinks.push({ href: link.href, title, favicon });
      saveLinks(currentLinks);
    } catch {
      alert("Invalid URL, please try again.");
    }
  });
}

function loadSavedLinks() {
  const linkList = document.querySelector("#linkList");
  const savedLinks = getStoredLinks();

  savedLinks.forEach(({ href, title, favicon }) => {
    const listItem = document.createElement("div");
    listItem.className = "quick-link";
    listItem.innerHTML = `
      <div class="link-item">
        <img src="${favicon}" alt="favicon" class="link-favicon">
        <a href="${href}" target="_blank" class="link-title">${title}</a>
        <i class="fa-solid fa-xmark delete-icon"></i>
      </div>`;
    linkList.appendChild(listItem);
  });
}

function LinkDeletion() {
  document.querySelector("#linkList").addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-icon")) {
      const listItem = event.target.closest(".quick-link");
      const linkHref = listItem.querySelector("a").href;
      listItem.remove();

      const currentLinks = getStoredLinks().filter((l) => l.href !== linkHref);
      saveLinks(currentLinks);
    }
  });
}


function getWeather() {
  if (!navigator.geolocation) {
    console.error("Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&timezone=auto&forecast_days=3`;

    fetch(url)
      .then((res) => res.ok ? res.json() : Promise.reject("Fetch failed"))
      .then((data) => {
        const { temperature_2m, weathercode } = data.hourly;
        const icons = {
          0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️",
          51: "🌦️", 61: "🌧️", 71: "🌨️", 95: "⛈️", 99: "🌩️"
        };

        const weatherItems = [0, 24, 48].map(i => `
          <div class="weather-item">
            <span class="weather-icon">${icons[weathercode[i]] || "🌈"}</span>
            <span class="weather-temp">${temperature_2m[i]}°C</span>
            <span class="weather-label">${["Today", "Tomorrow", "Day After"][i / 24]}</span>
          </div>`).join("");

        document.querySelector(".weather").innerHTML = weatherItems;
      })
      .catch(err => console.error("Weather error:", err));
  }, () => {
    document.querySelector(".weather").innerHTML = `
      <div class="weather-item">
        <span class="weather-icon">🌍</span>
        <span class="weather-temp">Location not available</span>
        <span class="weather-time">Enable location access</span>
      </div>`;
  });
}


const apiKey = "xOXPYFwTqqGW9ryHyevYMbeuDYZDEBxR";
const tickers = ["TSLA", "NVDA", "MSFT"];
const container = document.querySelector(".stocks");

async function fetchStockChange(ticker) {
  try {
    const res = await fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${apiKey}`);
    if (!res.ok) throw new Error("Error");

    const data = await res.json();
    const stock = data?.results?.[0];
    if (!stock) return `<div><strong>${ticker}</strong>: No data</div>`;

    const change = (stock.c - stock.o).toFixed(2);
    const percent = ((change / stock.o) * 100).toFixed(2);
    return `<div><strong>${ticker}</strong>: $${stock.c} (${change >= 0 ? "+" : ""}${change}, ${percent}%)</div>`;
  } catch {
    return `<div><strong>${ticker}</strong>: Error</div>`;
  }
}

async function updateStocks() {
  container.innerHTML = "Updating...";
  const results = [];
  for (const ticker of tickers) {
    results.push(await fetchStockChange(ticker));
    await new Promise((r) => setTimeout(r, 1000));
  }
  container.innerHTML = results.join("");
}
getTimeDate();
setInterval(getTimeDate, 60000);

renameDashboard();

setupNotes();

loadDashboardName()

loadSavedLinks();

LinkDeletion();

quickLinkAdd();

updateStocks();
setInterval(updateStocks, 3600000);

getWeather();

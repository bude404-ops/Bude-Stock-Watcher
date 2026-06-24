const API_KEY = "YOUR_FINNHUB_KEY"; // optional but recommended

const symbols = [
  "AAPL","MSFT","NVDA","TSLA","AMZN","META","GOOGL",
  "AMD","PLTR","COIN","MSTR","NFLX","JPM","BAC",
  "TQQQ","SQQQ","SOXL","SOXS"
];

let marketData = [];
let watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");

async function fetchStock(symbol) {
  try {
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);
    const data = await res.json();

    const change = ((data.c - data.pc) / data.pc) * 100;

    return {
      symbol,
      price: data.c,
      change: change.toFixed(2),
      volatility: Math.abs(change)
    };
  } catch (e) {
    return null;
  }
}

async function loadMarket() {
  marketData = [];

  for (let s of symbols) {
    const d = await fetchStock(s);
    if (d) marketData.push(d);
  }

  renderHeatmap();
  renderRisk();
}

function renderHeatmap() {
  const labels = marketData.map(d => d.symbol);
  const values = marketData.map(d => Math.abs(d.change));
  const colors = marketData.map(d => d.change);

  const data = [{
    type: "treemap",
    labels,
    parents: labels.map(() => ""),
    values,
    textinfo: "label+value",
    marker: {
      colors,
      colorscale: [
        [0, "red"],
        [0.5, "gray"],
        [1, "green"]
      ]
    }
  }];

  Plotly.newPlot("heatmapChart", data, {paper_bgcolor:"#0b0f14"});
}

function renderRisk() {
  const container = document.getElementById("riskList");
  container.innerHTML = "";

  marketData
    .sort((a,b) => Math.abs(b.change) - Math.abs(a.change))
    .forEach(stock => {

      let level = "SAFE";
      if (Math.abs(stock.change) > 3) level = "HIGH RISK";
      if (Math.abs(stock.change) > 5) level = "LIQUIDATION ZONE";

      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <b>${stock.symbol}</b><br/>
        Price: $${stock.price}<br/>
        Change: ${stock.change}%<br/>
        Risk: ${level}
      `;

      container.appendChild(div);
    });
}

/* WATCHLIST */
function addWatch() {
  const val = document.getElementById("watchInput").value.toUpperCase();
  if (!watchlist.includes(val)) {
    watchlist.push(val);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }
  renderWatch();
}

function renderWatch() {
  const div = document.getElementById("watchList");
  div.innerHTML = watchlist.map(w => `<div class="card">${w}</div>`).join("");
}

/* TABS */
function setTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(tab).classList.add("active");
}

/* INIT */
renderWatch();
loadMarket();
setInterval(loadMarket, 60000); // refresh every 60s

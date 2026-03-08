// ── CONFIG ──
const NEWSAPI_KEY = "5108f706fdac48b1a9448bfb0a0a6331"; // Get from https://newsapi.org
const GNEWS_KEY = "badd9a868904cb3b6d287a973ae8ec6f"; // Get from https://gnews.io
const NEWS_DATA_KEY = "your_newsdata_key_here"; // Optional: Get from https://newsdata.io
const MEDIAPI_KEY = "your_mediastack_key_here"; // Optional: Get from https://mediastack.com

// Emoji per category
const CAT_EMOJI = {
  general: "🌐",
  technology: "💻",
  business: "📈",
  science: "🔬",
  health: "🏥",
  sports: "⚽",
  entertainment: "🎬",
};

// Time formatter
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// Sanitize text
function safe(str) {
  return (str || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Simplified: Use only GNews for now
async function fetchNews(category = "general", q = "") {
  // Try GNews only
  if (GNEWS_KEY && GNEWS_KEY !== "your_gnews_key_here") {
    try {
      // Map categories to GNews topics
      const topicMap = {
        general: "breaking-news",
        technology: "technology",
        business: "business",
        science: "science",
        health: "health",
        sports: "sports",
        entertainment: "entertainment",
      };

      const topic = topicMap[category] || "breaking-news";
      const lang = "en";

      // Special handling for sports: mix of Kenya sports and England football
      if (category === "sports") {
        console.log("🏈 Fetching mixed sports content...");

        const corsProxy = "https://api.allorigins.win/raw?url=";

        // Get some Kenyan sports (limited)
        const kenyaSportsUrl =
          corsProxy +
          encodeURIComponent(
            `https://gnews.io/api/v4/top-headlines?topic=sports&country=ke&lang=${lang}&max=5&apikey=${GNEWS_KEY}`,
          );
        const kenyaResponse = await fetch(kenyaSportsUrl);
        let kenyaArticles = [];
        if (kenyaResponse.ok) {
          const kenyaData = await kenyaResponse.json();
          if (kenyaData.articles) {
            kenyaArticles = kenyaData.articles.slice(0, 3).map((article) => ({
              title: article.title,
              description: article.description,
              url: article.url,
              urlToImage: article.image || null,
              publishedAt: article.publishedAt,
              source: { name: article.source?.name || "Unknown" },
              _api: "gnews",
              _region: "kenya",
            }));
          }
        }

        // Get mostly England football
        const englandUrl =
          corsProxy +
          encodeURIComponent(
            `https://gnews.io/api/v4/search?q=England%20football%20OR%20Premier%20League&lang=${lang}&max=15&apikey=${GNEWS_KEY}`,
          );
        const englandResponse = await fetch(englandUrl);
        let englandArticles = [];
        if (englandResponse.ok) {
          const englandData = await englandResponse.json();
          if (englandData.articles) {
            englandArticles = englandData.articles
              .slice(0, 17)
              .map((article) => ({
                title: article.title,
                description: article.description,
                url: article.url,
                urlToImage: article.image || null,
                publishedAt: article.publishedAt,
                source: { name: article.source?.name || "Unknown" },
                _api: "gnews",
                _region: "england",
              }));
          }
        }

        // Combine and return mixed sports content
        const allSportsArticles = [...kenyaArticles, ...englandArticles];
        if (allSportsArticles.length > 0) {
          console.log(
            "📊 Returning",
            allSportsArticles.length,
            "mixed sports articles (",
            kenyaArticles.length,
            "Kenya,",
            englandArticles.length,
            "England)",
          );
          return allSportsArticles;
        }
      }

      // Regular GNews logic for other categories
      // Build GNews URL
      let gnewsUrl;
      if (q) {
        // Search query
        gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q + " Kenya")}&lang=${lang}&max=20&apikey=${GNEWS_KEY}`;
      } else {
        // Top headlines by topic and country
        gnewsUrl = `https://gnews.io/api/v4/top-headlines?topic=${topic}&country=ke&lang=${lang}&max=20&apikey=${GNEWS_KEY}`;
      }

      // Use a different CORS proxy
      const corsProxy = "https://api.allorigins.win/raw?url=";
      const proxiedUrl = corsProxy + encodeURIComponent(gnewsUrl);

      console.log("🔍 Fetching from GNews (via proxy):", proxiedUrl);

      const response = await fetch(proxiedUrl);
      if (response.ok) {
        const data = await response.json();
        console.log(
          "✅ GNews response:",
          data.articles?.length || 0,
          "articles",
        );

        if (data.articles && data.articles.length > 0) {
          const articles = data.articles.map((article) => ({
            title: article.title,
            description: article.description,
            url: article.url,
            urlToImage: article.image || null, // GNews uses 'image' field
            publishedAt: article.publishedAt,
            source: { name: article.source?.name || "Unknown" },
            _api: "gnews",
            _region: "kenya",
          }));

          console.log("📊 Returning", articles.length, "articles from GNews");
          return articles;
        }
      } else {
        console.log("❌ GNews failed with status:", response.status);
      }
    } catch (e) {
      console.log("💥 GNews error:", e.message);
    }
  } else {
    console.log("⚠️ GNews key not configured");
  }

  // Fallback: sample curated articles
  console.log("🔄 Using fallback sample articles");
  return getSampleArticles(category);
}

// Curated sample articles (displayed when APIs unavailable / demo mode)
function getSampleArticles(cat) {
  const banks = {
    general: [
      {
        title: "Global Leaders Convene for Emergency Climate Summit",
        description:
          "World leaders gathered in Geneva today for an emergency summit on accelerating climate action, with over 140 nations pledging to cut emissions by 50% before 2035. The agreement represents the most ambitious multinational climate commitment to date.",
        source: { name: "Reuters" },
        publishedAt: new Date(Date.now() - 1800000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🌍",
      },
      {
        title:
          "Breakthrough in Quantum Communication Achieved by MIT Researchers",
        description:
          "Scientists at MIT have demonstrated quantum-encrypted data transmission over 1,000 kilometers of standard fiber optic cables, breaking all previous distance records and paving the way for an unhackable global internet.",
        source: { name: "Nature" },
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔬",
      },
      {
        title:
          "WHO Declares New Global Health Initiative to Eliminate Malaria by 2035",
        description:
          "The World Health Organization launched a $30 billion initiative to eradicate malaria across sub-Saharan Africa using advanced mRNA vaccine technology, drone delivery networks, and AI-powered outbreak prediction systems.",
        source: { name: "AP News" },
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🏥",
      },
      {
        title: "Major Central Banks Signal Coordinated Rate Cut Strategy",
        description:
          "The Federal Reserve, ECB, and Bank of England issued rare joint guidance indicating synchronized interest rate reductions over Q3, triggering a global equity rally and boosting emerging market currencies.",
        source: { name: "Financial Times" },
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "📉",
      },
      {
        title: "SpaceX Successfully Lands Starship on Mars for First Time",
        description:
          "In a historic achievement, SpaceX's Starship completed its first uncrewed Mars landing, transmitting high-definition footage from the Martian surface. The mission carries scientific instruments and precursor technology for future crewed missions.",
        source: { name: "The Verge" },
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🚀",
      },
      {
        title: "UN Security Council Passes Landmark AI Governance Resolution",
        description:
          "A unanimous UN Security Council resolution established the first global framework for artificial intelligence governance, mandating transparency requirements and safety audits for frontier AI systems deployed by nation-states.",
        source: { name: "BBC News" },
        publishedAt: new Date(Date.now() - 18000000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🤖",
      },
    ],
    technology: [
      {
        title:
          "Apple Unveils Neural Processing Chip 10x Faster Than Previous Generation",
        description:
          "Apple's new M4 Ultra chip features a dedicated neural engine capable of running large language models entirely on-device, marking a significant milestone in edge AI computing. The chip is expected to power the next iPhone lineup.",
        source: { name: "TechCrunch" },
        publishedAt: new Date(Date.now() - 2700000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🍎",
      },
      {
        title: "Google DeepMind Solves 50-Year-Old Protein Folding Mystery",
        description:
          "DeepMind researchers have published findings resolving a fundamental mystery in protein dynamics that eluded scientists for decades. The breakthrough could accelerate drug discovery for cancer and neurodegenerative diseases.",
        source: { name: "Wired" },
        publishedAt: new Date(Date.now() - 5400000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🧬",
      },
      {
        title: "Open-Source AI Model Surpasses GPT-4 on All Major Benchmarks",
        description:
          "A coalition of European AI labs released an open-source language model that outperforms all proprietary competitors on reasoning, coding, and multilingual tasks, reigniting debates about the democratization of AI.",
        source: { name: "Ars Technica" },
        publishedAt: new Date(Date.now() - 9000000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🧠",
      },
      {
        title: "Samsung Launches World's First Rollable Smartphone",
        description:
          "Samsung Galaxy Roll features a display that expands from phone to tablet size using micro-LED flexible technology. The device, priced at $1,899, is already seeing record pre-orders in Asian markets.",
        source: { name: "The Verge" },
        publishedAt: new Date(Date.now() - 12600000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "📱",
      },
    ],
    business: [
      {
        title:
          "NVIDIA Market Cap Crosses $5 Trillion, Now World's Largest Company",
        description:
          "NVIDIA surpassed Apple and Microsoft to become the world's most valuable company, driven by insatiable demand for its H200 GPUs powering AI datacenters globally. The stock has risen 600% in two years.",
        source: { name: "Bloomberg" },
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "📊",
      },
      {
        title: "Amazon Acquires Slack in $40 Billion All-Stock Deal",
        description:
          "The surprise acquisition, announced after markets closed, would combine Amazon's AWS cloud dominance with Slack's enterprise communication platform, directly challenging Microsoft Teams and Google Workspace.",
        source: { name: "WSJ" },
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "💼",
      },
    ],
    science: [
      {
        title:
          "James Webb Telescope Discovers Potentially Habitable Ocean World",
        description:
          "Astronomers using JWST have detected chemical signatures of liquid water oceans and biological precursor molecules in the atmosphere of a rocky exoplanet 42 light-years away, marking the most promising sign of extraterrestrial life yet.",
        source: { name: "NASA" },
        publishedAt: new Date(Date.now() - 5400000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔭",
      },
      {
        title:
          "Scientists Achieve Room-Temperature Superconductivity at Atmospheric Pressure",
        description:
          "A team at the University of Rochester confirmed room-temperature superconductivity in a novel hydrogen-rich compound, a discovery that could transform energy transmission, MRI technology, and quantum computing.",
        source: { name: "Science" },
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "⚡",
      },
    ],
    health: [
      {
        title: "mRNA Cancer Vaccine Shows 93% Efficacy in Phase III Trial",
        description:
          "Moderna and Merck's personalized mRNA cancer vaccine demonstrated 93% efficacy in preventing melanoma recurrence in a landmark Phase III trial involving 1,800 patients. FDA approval is expected within 18 months.",
        source: { name: "NEJM" },
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "💉",
      },
    ],
    sports: [
      // Kenyan sports (few)
      {
        title: "Kenyan Athletes Dominate Boston Marathon",
        description:
          "Eliud Kipchoge leads Kenyan sweep of top positions, with women athletes also claiming victory in the prestigious 127th running of the race.",
        source: { name: "Daily Nation" },
        publishedAt: new Date(Date.now() - 1800000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🏃",
        _region: "kenya",
      },
      {
        title: "Gor Mahia Wins Kenyan Premier League Title",
        description:
          "K'Ogalo secures their 18th league championship in dramatic fashion, defeating AFC Leopards 2-1 in the final match of the season.",
        source: { name: "The Star Kenya" },
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "⚽",
        _region: "kenya",
      },
      // England football (most)
      {
        title: "Manchester City Clinches Premier League Title",
        description:
          "Pep Guardiola's side secures their fourth Premier League championship in five years, finishing 8 points ahead of nearest rivals Arsenal.",
        source: { name: "BBC Sport" },
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🏆",
        _region: "england",
      },
      {
        title: "Liverpool Stuns Manchester United in FA Cup Final",
        description:
          "Mohamed Salah's brace helps Jurgen Klopp's team claim their tenth FA Cup victory, ending a 15-year wait for the prestigious trophy.",
        source: { name: "Sky Sports" },
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🏆",
        _region: "england",
      },
      {
        title: "Chelsea Secures Champions League Qualification",
        description:
          "Todd Boehly's investment pays dividends as the Blues finish in the top four, booking their place in Europe's elite competition next season.",
        source: { name: "The Guardian" },
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "⚽",
        _region: "england",
      },
      {
        title: "Arsenal's Title Challenge Falters Late in Season",
        description:
          "Mikel Arteta's team drops crucial points in final weeks, finishing second but setting the stage for next season's title assault.",
        source: { name: "BBC Sport" },
        publishedAt: new Date(Date.now() - 18000000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "⚽",
        _region: "england",
      },
      {
        title: "Tottenham Hotspur Appoints New Manager",
        description:
          "Club legend Ange Postecoglou takes charge of Spurs, bringing his attacking philosophy from Celtic to north London.",
        source: { name: "Sky Sports" },
        publishedAt: new Date(Date.now() - 21600000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "👔",
        _region: "england",
      },
      {
        title: "Newcastle United Breaks Transfer Record",
        description:
          "Saudi-backed club signs Brazilian superstar for £120 million, signaling their intent to challenge for major honors.",
        source: { name: "The Times" },
        publishedAt: new Date(Date.now() - 25200000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "💰",
        _region: "england",
      },
    ],
    entertainment: [
      {
        title:
          "Netflix Greenlit 200-Episode Animated Series with $4 Billion Budget",
        description:
          "Netflix announced the most expensive television production in history — an animated fantasy epic spanning 200 episodes with a $4 billion budget, created by the teams behind Studio Ghibli and Pixar veterans.",
        source: { name: "Variety" },
        publishedAt: new Date(Date.now() - 5400000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🎬",
      },
    ],
  };

  // Fill missing categories with general
  return banks[cat] && banks[cat].length > 0 ? banks[cat] : banks.general;
}

// ── STATE ──
let currentCat = "general";
let allArticles = [];
let filtered = [];
let searchQ = "";
let currentArticleIndex = -1;

// ── RENDER ──
function renderFeed(articles) {
  const featuredArea = document.getElementById("featuredArea");
  const feedGrid = document.getElementById("feedGrid");
  const skeleton = document.getElementById("skeletonLoader");
  skeleton.style.display = "none";

  if (!articles.length) {
    feedGrid.innerHTML = `<div style="text-align:center;padding:60px;color:var(--muted)">No articles found.</div>`;
    featuredArea.innerHTML = "";
    return;
  }

  // Featured
  const f = articles[0];
  featuredArea.innerHTML = `
<div class="featured-card" onclick="openArticle(${0})">
  ${
    f.urlToImage
      ? `<img class="featured-img" src="${safe(f.urlToImage)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" alt="" />`
      : ""
  }
  <div class="featured-img-placeholder" style="${f.urlToImage ? "display:none" : ""}">${f._emoji || CAT_EMOJI[currentCat]}</div>
  <div class="featured-body">
    <div class="source-tag">📰 ${safe(f.source.name)}</div>
    <h2 class="featured-title">${safe(f.title)}</h2>
    <p class="featured-desc">${safe(f.description || "")}</p>
    <div class="card-meta">
      <span>${timeAgo(f.publishedAt)}</span>
      <span class="dot">•</span>
      <span>${safe(f.source.name)}</span>
    </div>
  </div>
</div>
`;

  // Feed
  const rest = articles.slice(1);
  feedGrid.innerHTML = `
<div class="section-title">Latest Stories</div>
<div class="news-grid">
  ${rest
    .map(
      (a, i) => `
    <a class="news-card" href="javascript:void(0)" onclick="openArticle(${i + 1})">
      <div>
        <div class="news-card-source">${safe(a.source.name)}</div>
        <div class="news-card-title">${safe(a.title)}</div>
        <div class="news-card-time">${timeAgo(a.publishedAt)}</div>
      </div>
      ${
        a.urlToImage
          ? `<img class="news-card-thumb" src="${safe(a.urlToImage)}" 
                 onload="this.style.opacity='1'" 
                 onerror="this.outerHTML='<div class=news-card-thumb-placeholder>${a._emoji || CAT_EMOJI[currentCat]}</div>'" 
                 style="opacity:0.7" alt="" />`
          : `<div class="news-card-thumb-placeholder">${a._emoji || CAT_EMOJI[currentCat]}</div>`
      }
    </a>
  `,
    )
    .join("")}
</div>
`;
}

function renderTrending(articles) {
  const list = document.getElementById("trendingList");
  list.innerHTML = articles
    .slice(0, 5)
    .map(
      (a, i) => `
<div class="trending-item" onclick="openArticle(${i})">
  <div class="trend-num">${String(i + 1).padStart(2, "0")}</div>
  <div>
    <div class="trend-text">${safe(a.title)}</div>
    <div class="trend-source">${safe(a.source.name)}</div>
  </div>
</div>
`,
    )
    .join("");
}

function renderTicker(articles) {
  const wrap = document.getElementById("tickerWrap");
  const track = document.getElementById("tickerTrack");
  const items = articles
    .slice(0, 6)
    .map((a) => `<span class="ticker-item">${safe(a.title)}</span>`)
    .join("");
  track.innerHTML = items + items; // duplicate for seamless loop
  wrap.style.display = "flex";
}

// ── MODAL ──
function openArticle(idx) {
  const a = filtered[idx] || allArticles[idx];
  if (!a) return;
  currentArticleIndex = idx;
  const modal = document.getElementById("modalOverlay");
  const hasPrev = currentArticleIndex > 0;
  const hasNext = currentArticleIndex < filtered.length - 1;

  document.getElementById("modalContent").innerHTML = `
<div class="modal-nav">
  <button class="nav-btn ${hasPrev ? "" : "disabled"}" onclick="navigateArticle(-1)" ${hasPrev ? "" : "disabled"}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
    Previous
  </button>
  <div class="modal-source">📰 ${safe(a.source.name)}</div>
  <button class="nav-btn ${hasNext ? "" : "disabled"}" onclick="navigateArticle(1)" ${hasNext ? "" : "disabled"}>
    Next
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  </button>
</div>
<h2 class="modal-title">${safe(a.title)}</h2>
<div class="modal-meta">
  <span>${timeAgo(a.publishedAt)}</span>
  <span>•</span>
  <span>${safe(a.source.name)}</span>
</div>
<p class="modal-desc">${safe(a.description || "No description available.")}</p>
${
  a.url && a.url !== "#"
    ? `<a class="modal-link" href="${safe(a.url)}" target="_blank" rel="noopener">
  Read full article
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
</a>`
    : `<div style="color:var(--muted);font-size:.85rem">Full article link unavailable in demo mode.</div>`
}
`;
  modal.classList.add("open");
}

function navigateArticle(direction) {
  const newIndex = currentArticleIndex + direction;
  if (newIndex >= 0 && newIndex < filtered.length) {
    openArticle(newIndex);
  }
}

function closeModal(e) {
  if (e.target === document.getElementById("modalOverlay")) {
    document.getElementById("modalOverlay").classList.remove("open");
  }
}

// ── LOAD ──
async function load(cat, q = "") {
  currentCat = cat;
  searchQ = q;
  document.getElementById("skeletonLoader").style.display = "block";
  document.getElementById("featuredArea").innerHTML = "";
  document.getElementById("feedGrid").innerHTML = "";
  document.getElementById("statusText").textContent = `Loading ${cat} news…`;

  allArticles = await fetchNews(cat, q);
  filtered = allArticles;
  renderFeed(filtered);
  renderTrending(filtered);
  renderTicker(filtered);

  const count = filtered.length;
  document.getElementById("statusText").textContent =
    `${count} articles loaded · Updated just now`;
}

// ── CATEGORY BUTTONS ──
document.getElementById("catBar").addEventListener("click", (e) => {
  const btn = e.target.closest(".cat-btn");
  if (!btn) return;
  document
    .querySelectorAll(".cat-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  load(btn.dataset.cat);
});

// ── SEARCH ──
let searchTimer;
document.getElementById("searchInput").addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  const q = e.target.value.trim();
  searchTimer = setTimeout(() => {
    if (q.length > 2) load(currentCat, q);
    else if (!q) load(currentCat);
  }, 500);
});

// ── BOTTOM NAV ──
function setNav(el, cat) {
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  el.classList.add("active");
  document.querySelectorAll(".cat-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.cat === cat);
  });
  load(cat);
}

// ── PWA: Service Worker ──
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

// ── PWA: Install Banner ──
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById("installBtn").classList.add("visible");
});

document.getElementById("installBtn").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === "accepted") showToast("✅ Fab News installed!");
  deferredPrompt = null;
  document.getElementById("installBtn").classList.remove("visible");
});

// ── OFFLINE DETECTION ──
function updateOnline() {
  document
    .getElementById("offlineBanner")
    .classList.toggle("show", !navigator.onLine);
}
window.addEventListener("online", updateOnline);
window.addEventListener("offline", updateOnline);
updateOnline();

// ── TOAST ──
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

// ── AUTO REFRESH every 5 min ──
setInterval(() => load(currentCat, searchQ), 300000);

// ── INIT ──
load("general");

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
              content: article.content, // Full article content
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
                content: article.content, // Full article content
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
            content: article.content, // Full article content
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
        title: "🔄 Demo: Global Leaders Convene for Emergency Climate Summit",
        description:
          "We are still fetching real news... This is a demo article showing what the app will look like when connected to live news sources.",
        content:
          "We are still fetching real news from our sources. This demo article shows the full content display that will appear once the app connects to live news APIs. The real articles will contain current, up-to-date information from trusted news sources. Please wait while we establish the connection...",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 1800000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _isFallback: true,
      },
      {
        title:
          "🔄 Demo: Breakthrough in Quantum Communication Achieved by MIT Researchers",
        description:
          "We are still fetching real news... This demo shows the article format and layout that will be used for real news.",
        content:
          "We are still fetching real news from our sources. This is a placeholder article demonstrating the full content view. Once connected, you'll see real breaking news, technology updates, and current events from reputable news organizations. The app is working to establish API connections...",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _isFallback: true,
      },
      {
        title:
          "🔄 Demo: WHO Declares New Global Health Initiative to Eliminate Malaria by 2035",
        description:
          "We are still fetching real news... Demo content showing the app's article display capabilities.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _isFallback: true,
      },
      {
        title:
          "🔄 Demo: Major Central Banks Signal Coordinated Rate Cut Strategy",
        description:
          "We are still fetching real news... This placeholder demonstrates the business news section.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _isFallback: true,
      },
      {
        title:
          "🔄 Demo: SpaceX Successfully Lands Starship on Mars for First Time",
        description:
          "We are still fetching real news... Demo article showing science and technology news format.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _isFallback: true,
      },
      {
        title:
          "🔄 Demo: UN Security Council Passes Landmark AI Governance Resolution",
        description:
          "We are still fetching real news... This demonstrates the international news display.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 18000000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🤖",
      },
    ],
    technology: [
      {
        title:
          "🔄 Demo: Apple Unveils Neural Processing Chip 10x Faster Than Previous Generation",
        description:
          "We are still fetching real news... This demo shows technology news format and layout.",
        content:
          "We are still fetching real technology news from our sources. This placeholder demonstrates how tech articles will appear in the app, including chip announcements, AI breakthroughs, and product launches from companies like Apple, Google, and others. Please wait while we connect to live news feeds...",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 2700000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _isFallback: true,
      },
      {
        title:
          "🔄 Demo: Google DeepMind Solves 50-Year-Old Protein Folding Mystery",
        description:
          "We are still fetching real news... Demo content for science and technology section.",
        content:
          "We are still fetching real science and technology news. This demo article shows the format for AI research, scientific breakthroughs, and technological innovations that will appear once the app connects to live news sources.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 5400000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _isFallback: true,
      },
      {
        title:
          "🔄 Demo: Open-Source AI Model Surpasses GPT-4 on All Major Benchmarks",
        description:
          "We are still fetching real news... This demonstrates AI and tech news display.",
        content:
          "We are still fetching real AI and technology news from our sources. This placeholder shows how articles about artificial intelligence, machine learning, and open-source projects will be displayed in the app.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 9000000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _isFallback: true,
      },
      {
        title: "🔄 Demo: Samsung Launches World's First Rollable Smartphone",
        description:
          "We are still fetching real news... Demo showing mobile technology news format.",
        content:
          "We are still fetching real mobile and consumer technology news. This demo illustrates how smartphone launches, hardware announcements, and gadget news will appear in the technology section.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 12600000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _isFallback: true,
      },
    ],
    business: [
      {
        title:
          "🔄 Demo: NVIDIA Market Cap Crosses $5 Trillion, Now World's Largest Company",
        description:
          "We are still fetching real news... This demo shows business and finance news format.",
        content:
          "We are still fetching real business and financial news from our sources. This placeholder demonstrates how stock market updates, company valuations, and economic news will be displayed in the business section.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _isFallback: true,
      },
      {
        title: "🔄 Demo: Amazon Acquires Slack in $40 Billion All-Stock Deal",
        description:
          "We are still fetching real news... Demo content for business acquisitions and deals.",
        content:
          "We are still fetching real business news including mergers, acquisitions, and corporate deals. This demo shows the format for major business announcements and market-moving events.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _isFallback: true,
      },
    ],
    science: [
      {
        title:
          "🔄 Demo: James Webb Telescope Discovers Potentially Habitable Ocean World",
        description:
          "We are still fetching real news... This demo shows science news article format.",
        content:
          "We are still fetching real science news from our sources. This placeholder demonstrates how astronomy discoveries, space exploration, and scientific breakthroughs will appear in the science section.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 5400000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _isFallback: true,
      },
      {
        title:
          "🔄 Demo: Scientists Achieve Room-Temperature Superconductivity at Atmospheric Pressure",
        description:
          "We are still fetching real news... Demo content for physics and materials science.",
        content:
          "We are still fetching real science and research news. This demo illustrates how physics discoveries, materials science breakthroughs, and laboratory research will be presented in the app.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _isFallback: true,
      },
    ],
    health: [
      {
        title:
          "🔄 Demo: mRNA Cancer Vaccine Shows 93% Efficacy in Phase III Trial",
        description:
          "We are still fetching real news... This demo shows health and medical news format.",
        content:
          "We are still fetching real health and medical news from our sources. This placeholder demonstrates how medical breakthroughs, vaccine developments, and healthcare news will appear in the health section of the app.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _isFallback: true,
      },
    ],
    sports: [
      // Kenyan sports (few)
      {
        title: "🔄 Demo: Kenyan Athletes Dominate Boston Marathon",
        description:
          "We are still fetching real news... This demo shows Kenyan sports news format.",
        content:
          "We are still fetching real sports news from our sources. This placeholder demonstrates how Kenyan athletics, football, and sports events will appear in the sports section, including marathon results and local team performances.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 1800000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _region: "kenya",
        _isFallback: true,
      },
      {
        title: "🔄 Demo: Gor Mahia Wins Kenyan Premier League Title",
        description:
          "We are still fetching real news... Demo content for Kenyan football and sports.",
        content:
          "We are still fetching real Kenyan sports news. This demo shows how local football league results, team performances, and sports achievements will be displayed in the app.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _region: "kenya",
        _isFallback: true,
      },
      // England football (most)
      {
        title: "🔄 Demo: Manchester City Clinches Premier League Title",
        description:
          "We are still fetching real news... This demo shows English football news format.",
        content:
          "We are still fetching real English football news from our sources. This placeholder demonstrates how Premier League results, FA Cup matches, and European competitions will appear in the sports section.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _region: "england",
        _isFallback: true,
      },
      {
        title: "🔄 Demo: Liverpool Stuns Manchester United in FA Cup Final",
        description:
          "We are still fetching real news... Demo content for English football competitions.",
        content:
          "We are still fetching real English football news. This demo illustrates how cup competitions, derby matches, and major football events will be presented in the app.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _isFallback: true,
      },
      {
        title: "🔄 Demo: Chelsea Secures Champions League Qualification",
        description:
          "We are still fetching real news... Demo showing European football qualification news.",
        content:
          "We are still fetching real European football news. This demo shows how Champions League qualification, European competitions, and international football will appear in the sports section.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _isFallback: true,
      },
      {
        title: "🔄 Demo: Arsenal's Title Challenge Falters Late in Season",
        description:
          "We are still fetching real news... Demo content for Premier League season analysis.",
        content:
          "We are still fetching real Premier League news. This demo demonstrates how season reviews, team performances, and league standings will be displayed in the app.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 18000000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _region: "england",
        _isFallback: true,
      },
      {
        title: "🔄 Demo: Tottenham Hotspur Appoints New Manager",
        description:
          "We are still fetching real news... Demo content for football management changes.",
        content:
          "We are still fetching real football news. This demo shows how managerial appointments, coaching changes, and team news will appear in the sports section.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 21600000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _region: "england",
        _isFallback: true,
      },
      {
        title: "🔄 Demo: Newcastle United Breaks Transfer Record",
        description:
          "We are still fetching real news... Demo content for football transfer news.",
        content:
          "We are still fetching real transfer news and football stories. This demo illustrates how player transfers, record signings, and transfer market activity will be displayed in the app.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 25200000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _region: "england",
        _isFallback: true,
      },
    ],
    entertainment: [
      {
        title:
          "🔄 Demo: Netflix Greenlit 200-Episode Animated Series with $4 Billion Budget",
        description:
          "We are still fetching real news... This demo shows entertainment and media news format.",
        content:
          "We are still fetching real entertainment news from our sources. This placeholder demonstrates how movie releases, TV shows, streaming announcements, and entertainment industry news will appear in the entertainment section.",
        source: { name: "Demo Mode" },
        publishedAt: new Date(Date.now() - 5400000).toISOString(),
        url: "#",
        urlToImage: null,
        _emoji: "🔄",
        _isFallback: true,
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
  const isFallback = f._isFallback;
  featuredArea.innerHTML = `
<div class="featured-card ${isFallback ? "fallback-article" : ""}" onclick="openArticle(${0})">
  ${isFallback ? '<div class="loading-indicator"><div class="spinner"></div><span>Fetching live news...</span></div>' : ""}
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
    .map((a, i) => {
      const isFallback = a._isFallback;
      return `
    <a class="news-card ${isFallback ? "fallback-article" : ""}" href="javascript:void(0)" onclick="openArticle(${i + 1})">
      ${isFallback ? '<div class="loading-indicator"><div class="spinner"></div><span>Fetching live news...</span></div>' : ""}
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
  `;
    })
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

  const isFallback = a._isFallback;
  const articleId = btoa(a.title + (a.url || "")).replace(/[^a-zA-Z0-9]/g, ""); // Create unique ID for article
  document.getElementById("modalContent").innerHTML = `
${isFallback ? '<div class="fallback-notice"><div class="spinner"></div><span>We are still fetching real news from our sources. This is a demo article.</span></div>' : ""}
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
<p class="modal-desc">${safe(a.content || a.description || "No content available.")}</p>
<div class="modal-actions">
  ${
    a.url && a.url !== "#"
      ? `<a class="modal-link" href="${safe(a.url)}" target="_blank" rel="noopener">
    Read full article
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  </a>`
      : `<div style="color:var(--muted);font-size:.85rem">${isFallback ? "Full article link will be available when connected to live news sources." : "Full article link unavailable."}</div>`
  }
  <button class="comment-toggle-btn" onclick="toggleComments('${articleId}')">
    💬 Comments
  </button>
</div>
<div class="comments-section" id="comments-${articleId}" style="display:none">
  <div class="comments-list" id="comments-list-${articleId}">
    <!-- Comments will be loaded here -->
  </div>
  <div class="comment-form">
    <textarea id="comment-input-${articleId}" placeholder="Add a comment..." maxlength="500"></textarea>
    <button class="comment-submit-btn" onclick="addComment('${articleId}')">Post Comment</button>
  </div>
</div>
`;
  modal.classList.add("open");

  // Load comments if section is visible
  const commentsSection = document.getElementById(`comments-${articleId}`);
  if (commentsSection.style.display !== "none") {
    loadComments(articleId);
  }
}

function navigateArticle(direction) {
  const newIndex = currentArticleIndex + direction;
  if (newIndex >= 0 && newIndex < filtered.length) {
    openArticle(newIndex);
  }
}

// ── COMMENTS ──
function toggleComments(articleId) {
  const commentsSection = document.getElementById(`comments-${articleId}`);
  const isVisible = commentsSection.style.display !== "none";

  if (isVisible) {
    commentsSection.style.display = "none";
  } else {
    commentsSection.style.display = "block";
    loadComments(articleId);
  }
}

function loadComments(articleId) {
  const commentsList = document.getElementById(`comments-list-${articleId}`);
  const comments = getComments(articleId);

  if (comments.length === 0) {
    commentsList.innerHTML =
      '<div class="no-comments">No comments yet. Be the first to comment!</div>';
    return;
  }

  commentsList.innerHTML = comments
    .map(
      (comment) => `
    <div class="comment-item">
      <div class="comment-meta">
        <span class="comment-author">${safe(comment.author)}</span>
        <span class="comment-time">${timeAgo(comment.timestamp)}</span>
      </div>
      <div class="comment-text">${safe(comment.text)}</div>
    </div>
  `,
    )
    .join("");
}

function addComment(articleId) {
  const input = document.getElementById(`comment-input-${articleId}`);
  const text = input.value.trim();

  if (!text) return;

  const comment = {
    author: "Anonymous User",
    text: text,
    timestamp: new Date().toISOString(),
  };

  const comments = getComments(articleId);
  comments.push(comment);
  saveComments(articleId, comments);

  input.value = "";
  loadComments(articleId);
}

function getComments(articleId) {
  const stored = localStorage.getItem(`comments-${articleId}`);
  return stored ? JSON.parse(stored) : [];
}

function saveComments(articleId, comments) {
  localStorage.setItem(`comments-${articleId}`, JSON.stringify(comments));
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
  const isUsingFallbacks = allArticles.some((a) => a._isFallback);
  document.getElementById("statusText").textContent = isUsingFallbacks
    ? `🔄 Demo mode: ${count} sample articles loaded · Connect API for live news`
    : `${count} articles loaded · Updated just now`;
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

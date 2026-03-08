# 📰 Fab News PWA

A beautiful, installable Progressive Web App for live news.

## Files

- `index.html` — Main app (all UI, logic, API)
- `manifest.json` — PWA manifest (name, icons, theme)
- `sw.js` — Service worker (offline cache, push notifications)

## Getting a Free API Key

### Option 1: GNews (Recommended — CORS-friendly)

1. Go to https://gnews.io
2. Sign up for free (100 requests/day)
3. Replace `const GNEWS_KEY = 'demo'` in index.html with your key

### Option 2: NewsAPI.org

1. Go to https://newsapi.org
2. Sign up for free (developer plan)
3. Replace `const API_KEY = 'demo'` in index.html with your key
   > Note: NewsAPI requires a proxy server for production (CORS restriction on browser requests)

## Deployment

### Netlify (Free, HTTPS, PWA-ready)

1. Drag the output folder to https://app.netlify.com/drop
2. Your site gets a live HTTPS URL instantly
3. PWA install button appears automatically

### GitHub Pages

1. Push files to a GitHub repo
2. Enable Pages in Settings → Pages
3. Select branch `main`, folder `/root`

### Any Static Host

Just serve the 3 files. PWA works on any HTTPS host.

## PWA Features

- ✅ Installable on iOS, Android, and desktop
- ✅ Offline support (cached articles shown when offline)
- ✅ Responsive mobile layout with bottom navigation
- ✅ Push notification-ready (requires backend to send pushes)
- ✅ Background sync support
- ✅ App shortcuts (Home Screen long-press)

## Adding App Icons

Generate icons at https://maskable.app or https://favicon.io:

- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

Place them in the same folder as index.html.

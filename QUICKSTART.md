# Quick Start Guide 🚀

## 1️⃣ Install Dependencies

```bash
cd seafront-pulse
npm install
```

## 2️⃣ Configure Apify Token

The project uses your existing `.env` file from the parent folder. Make sure it has:

```
APIFY_API_TOKEN=apify_api_XXXXXXXXXXXXXXXXXXXXXXXX
```

If you need to use a different token for this project only, create `.env.local`:

```bash
cp .env.local.example .env.local
# Edit .env.local and add your token
```

## 3️⃣ Scrape Tweets (First Time)

```bash
npm run scrape
```

This will:
- Connect to Apify
- Run Tweet Scraper actor for 10 resorts
- Collect ~50 tweets total
- Save to `data/tweets.json`

**Cost:** ~$0.01 for 50 tweets on free plan

**Time:** 2-3 minutes

## 4️⃣ Analyze Sentiment

```bash
npm run analyze
```

This will:
- Read tweets from `data/tweets.json`
- Score sentiment (-1 to +1)
- Extract keywords
- Build resort statistics
- Save to `data/analysis.json`

**Time:** A few seconds

## 5️⃣ View Dashboard

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 What You'll See

✅ **Overall Vibe** - Sentiment meter for all resorts  
✅ **Resort Rankings** - Which resort is most loved  
✅ **Tweet Feed** - Photos, likes, sentiment badges  
✅ **Keyword Cloud** - Most talked about topics  

## 🎮 Dashboard Features

| Tab | What It Shows |
|-----|---------------|
| **Overview** | Resort leaderboard + sentiment breakdown |
| **Tweets** | All tweets with filtering by resort |
| **Keywords** | Interactive word cloud by popularity |

**Filters:**
- Click resort button to see only that resort's tweets
- Click keyword to filter tweets mentioning that word
- Click "All Resorts" to reset

## 🔄 Update Data

To get fresh tweets:

```bash
npm run scrape
npm run analyze
# Dashboard auto-reloads with new data
```

**Best practice:** Run scrape weekly to track sentiment changes

## ⚙️ Customization

### Change Number of Tweets
Edit `src/scripts/scrape.js`:
```javascript
const MAX_ITEMS_PER_SEARCH = 5; // Change to 10, 20, etc
```

### Add New Resorts
Edit `src/scripts/scrape.js`:
```javascript
const RESORTS = [
  { name: "Resort Name", search: "search terms" },
];
```

### Customize Theme
Edit `src/styles/globals.css`:
```css
--sand: #f4d9a6;       /* Beach color */
--sea: #2e7d9f;        /* Water color */
--sunset: #ff7f50;     /* Button color */
```

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "APIFY_API_TOKEN not set" | Check `.env` or `.env.local` has the token |
| No tweets found | Check Apify token is valid (`npm run scrape` will error if not) |
| Port 3000 in use | Run `npm run dev -- -p 3001` |
| Blank dashboard | Run scrape + analyze scripts first |
| Images not loading | Twitter CDN might be blocking - this is normal |

## 📚 Full Documentation

See [README.md](./README.md) for:
- Detailed setup
- File structure
- Sentiment algorithm
- Privacy info
- Tech stack
- Future ideas

## 💡 Pro Tips

1. **Batch multiple resorts** - Scraping 10 at once is faster than individual calls
2. **Track over time** - Keep old data to see sentiment trends
3. **Manual review** - Check a few tweets to validate sentiment scoring
4. **Test keywords** - Try different search terms to capture more relevant tweets
5. **Export data** - Copy `analysis.json` to share results

## 🎯 Next Steps

- [ ] Install dependencies: `npm install`
- [ ] Run scrape: `npm run scrape`
- [ ] Run analyze: `npm run analyze`
- [ ] Start dev: `npm run dev`
- [ ] Open browser: http://localhost:3000
- [ ] Explore tabs and filters
- [ ] Customize resorts/theme as needed

Enjoy exploring seafront sentiment! 🌊🏝️

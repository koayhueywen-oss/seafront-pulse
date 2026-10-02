# 🌊 Seafront Pulse

A pixel-themed Twitter sentiment analysis dashboard for West Malaysian seafront resorts. Built with Next.js and Apify.

## Features

- 🐦 **Tweet Scraping**: Pulls viral tweets about 10 West Malaysian resorts
- 💭 **Free Sentiment Analysis**: Word-list based mood detection (English + Malay)
- ☁️ **Keyword Cloud**: Interactive word cloud showing trending topics
- 🎮 **Pixel Theme**: Retro 8-bit aesthetic with Press Start 2P font
- 📊 **Resort Rankings**: Compare resorts by overall sentiment score
- 💬 **Tweet Feed**: Browse scraped tweets with images, likes, and replies
- 📱 **Responsive**: Works on desktop and mobile

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

The project uses the `APIFY_API_TOKEN` from the root `.env` file. Make sure it's configured with your Apify token.

```bash
# From the root Vibe Coding Training folder, you should already have:
# APIFY_API_TOKEN=your_apify_api_token_here
```

### 3. Scrape Tweets

```bash
npm run scrape
```

This runs the Apify Tweet Scraper V2 actor to collect tweets about the resorts.

**Input variables:**
- 10 resorts: Port Dickson, Desaru Coast, Langkawi, Pangkor, Teluk Batik, Cherating, Tioman Island, Redang Island, Perhentian, Avani Sepang
- 5 tweets per resort (50 total)
- Filters: Top sorted, minimum 5 favorites, English language

**Output:** `data/tweets.json` (raw tweet data)

### 4. Analyze Tweets

```bash
npm run analyze
```

This analyzes sentiment and extracts keywords.

**Sentiment scoring:**
- Positive words (beautiful, amazing, love, etc.) = +1 to +3 points
- Negative words (bad, dirty, expensive, etc.) = -1 to -3 points
- Malay words included (cantik, bagus, jelek, teruk, etc.)
- Score normalized to -1 to 1 range

**Output:** `data/analysis.json` (enriched with sentiment & keywords)

### 5. Run the Dashboard

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## File Structure

```
seafront-pulse/
├── src/
│   ├── pages/
│   │   ├── _app.js          # Next.js app wrapper
│   │   └── index.js         # Main dashboard page
│   ├── scripts/
│   │   ├── scrape.js        # Apify scraping script
│   │   └── analyze.js       # Sentiment analysis script
│   └── styles/
│       └── globals.css      # Pixel theme styles
├── data/
│   ├── tweets.json          # Raw scraped tweets
│   └── analysis.json        # Analyzed tweets + stats
├── public/                  # Static assets
├── package.json
├── next.config.js
└── README.md
```

## Dashboard Pages

### Overview Tab 📊
- Overall sentiment meter (negative ←→ positive)
- Resort rankings by average sentiment score
- Sentiment breakdown per resort (positive, neutral, negative counts)
- Click a resort to see its tweets

### Tweets Tab 💬
- Filter by resort or keyword
- See full tweet text, images, author
- Sentiment badge per tweet
- Like, retweet, and reply counts
- Date posted

### Keywords Tab ☁️
- 30 most common keywords
- Size = frequency, color = sentiment
- Green = positive context, red = negative, black = neutral
- Click keyword to filter tweets

## Sentiment Scoring

### Positive Words
beautiful, amazing, wonderful, great, good, excellent, perfect, love, awesome, fantastic, stunning, gorgeous, clean, relaxing, peaceful, best, recommend, friendly, delicious, comfortable, luxurious, sunset, paradise, bliss, heavenly

### Negative Words
bad, terrible, horrible, awful, hate, disappointing, disappointed, expensive, dirty, crowded, noisy, rude, slow, poor, worst, broken, damaged, overpriced, waste, avoid

### Malay Words Included
- Positive: bagus, cantik, indah, menakjubkan, sempurna, terbaik, suka, hebat, nyaman
- Negative: buruk, jelek, teruk, mahal, kotor, ramai, bising, kasar, lambat, rosak

## Customization

### Change Resorts
Edit `src/scripts/scrape.js`:
```javascript
const RESORTS = [
  { name: "Resort Name", search: "search term" },
  // ...
];
```

### Adjust Tweet Volume
Edit `src/scripts/scrape.js`:
```javascript
const MAX_ITEMS_PER_SEARCH = 5; // Change this number
```

### Add More Sentiment Words
Edit `src/scripts/analyze.js`:
```javascript
const POSITIVE_WORDS = {
  "yourword": 2, // Weight 1-3
  // ...
};
```

## Costs

- **Apify**: ~$0.0002 per tweet ($0.00015 for free plan)
- **50 tweets**: ~$0.01
- **100+ tweets**: ~$0.02-$0.05

Very affordable for research!

## Privacy

- Tweet text and public stats are shown
- Author handles are displayed (public data)
- Images are loaded from Twitter's servers
- No authentication required to view the dashboard

## Browser Support

- Chrome, Firefox, Safari (modern versions)
- Mobile responsive
- Pixel font works best in Chrome

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Custom CSS (pixel theme)
- **API**: Apify Tweet Scraper V2
- **Language**: JavaScript (Node.js)
- **Font**: Press Start 2P + VT323

## Troubleshooting

**No tweets showing?**
```bash
npm run scrape
npm run analyze
npm run dev
```

**Images not loading?**
Twitter image CDN might be blocking requests. This is expected behavior.

**Sentiment seems off?**
The free word-list approach works best for English. Mixed Malay-English tweets may need manual review.

**API rate limits?**
Apify's free plan has generous limits (several thousand tweets/month). Spread scrapes over time if needed.

## Future Ideas

- Add Claude Haiku sentiment for better accuracy
- Multi-language support
- Store historical trends
- Export reports as PNG
- Real-time updates
- Sentiment timeline charts
- Tweet reply threads
- Map view of resorts

---

**Made with ❤️ for analyzing West Malaysian tourism vibes** 🏝️

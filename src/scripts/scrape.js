const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env.local") });

const { ApifyClient } = require("apify-client");
const fs = require("fs");

const RESORTS = [
  { name: "Port Dickson", search: "Port Dickson resort" },
  { name: "Desaru Coast", search: "Desaru Coast resort" },
  { name: "Langkawi", search: "Langkawi resort beach" },
  { name: "Pangkor", search: "Pangkor resort" },
  { name: "Teluk Batik", search: "Teluk Batik resort" },
  { name: "Cherating", search: "Cherating resort beach" },
  { name: "Tioman Island", search: "Tioman resort" },
  { name: "Redang Island", search: "Redang resort" },
  { name: "Perhentian", search: "Perhentian resort" },
  { name: "Avani Sepang", search: "Avani Sepang resort" },
];

const ACTOR_ID = "61RPP7dywgiy0JPD0";
const MAX_ITEMS_PER_SEARCH = 5; // 50 tweets / 10 resorts

async function scrapeResorts() {
  const apiToken = process.env.APIFY_API_TOKEN;
  if (!apiToken) {
    throw new Error("APIFY_API_TOKEN not set in environment variables");
  }

  const client = new ApifyClient({ token: apiToken });
  const allTweets = [];

  console.log(`Starting scrape of ${RESORTS.length} resorts...`);

  for (const resort of RESORTS) {
    console.log(`\n📍 Scraping: ${resort.name}`);
    try {
      const run = await client.actor(ACTOR_ID).call({
        searchTerms: [resort.search],
        maxItems: MAX_ITEMS_PER_SEARCH,
        sort: "Top",
        minimumFavorites: 5,
        tweetLanguage: "en",
      });

      const dataset = await client.dataset(run.defaultDatasetId).listItems();
      const tweets = dataset.items.map((tweet) => ({
        ...tweet,
        resort: resort.name,
        scrapedAt: new Date().toISOString(),
      }));

      allTweets.push(...tweets);
      console.log(`  ✓ Found ${tweets.length} tweets`);
    } catch (error) {
      console.error(`  ✗ Error scraping ${resort.name}:`, error.message);
    }
  }

  // Save to JSON
  const dataDir = path.join(__dirname, "../../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const filePath = path.join(dataDir, "tweets.json");
  fs.writeFileSync(filePath, JSON.stringify(allTweets, null, 2));

  console.log(`\n✅ Scraped ${allTweets.length} tweets total`);
  console.log(`📁 Saved to ${filePath}`);
}

scrapeResorts().catch(console.error);

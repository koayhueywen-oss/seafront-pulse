const fs = require("fs");
const path = require("path");

// Sentiment word lists
const POSITIVE_WORDS = {
  // English
  beautiful: 3,
  amazing: 3,
  wonderful: 3,
  great: 2,
  good: 2,
  excellent: 3,
  perfect: 3,
  love: 3,
  awesome: 3,
  fantastic: 3,
  stunning: 3,
  gorgeous: 3,
  clean: 2,
  relaxing: 2,
  peaceful: 2,
  best: 3,
  recommend: 2,
  friendly: 2,
  delicious: 2,
  comfortable: 2,
  luxurious: 2,
  sunset: 2,
  paradise: 3,
  bliss: 3,
  heavenly: 3,
  // Malay
  bagus: 2,
  cantik: 3,
  indah: 3,
  menakjubkan: 3,
  luar: 2,
  sempurna: 3,
  terbaik: 3,
  suka: 2,
  hebat: 2,
  nyaman: 2,
  sejuk: 2,
  tenang: 2,
};

const NEGATIVE_WORDS = {
  // English
  bad: 2,
  terrible: 3,
  horrible: 3,
  awful: 3,
  hate: 3,
  disappointing: 3,
  disappointed: 3,
  expensive: 2,
  dirty: 3,
  crowded: 2,
  noisy: 2,
  rude: 2,
  slow: 1,
  poor: 2,
  worst: 3,
  broken: 2,
  damaged: 2,
  overpriced: 3,
  waste: 2,
  avoid: 2,
  // Malay
  buruk: 2,
  jelek: 3,
  teruk: 3,
  mahal: 2,
  kotor: 3,
  ramai: 2,
  bising: 2,
  kasar: 2,
  lambat: 1,
  rosak: 2,
};

const STOP_WORDS = new Set([
  // English
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "is",
  "was",
  "are",
  "am",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "can",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "my",
  "your",
  "his",
  "her",
  "its",
  "our",
  "their",
  // Malay
  "yang",
  "dan",
  "atau",
  "di",
  "ke",
  "dari",
  "untuk",
  "pada",
  "dengan",
  "oleh",
  "adalah",
  "ada",
  "ada",
  "telah",
  "akan",
  "ini",
  "itu",
  "saya",
  "anda",
  "dia",
  "kami",
  "mereka",
  "satu",
  "dua",
  "tidak",
  "ya",
  "juga",
  "pun",
  "pula",
]);

function calculateSentiment(text) {
  if (!text) return { score: 0, sentiment: "neutral", positiveCount: 0, negativeCount: 0 };

  const words = (text.toLowerCase().match(/\b\w+\b/g) || [])
    .map((w) => w.replace(/[^\w]/g, ""));

  let score = 0;
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach((word) => {
    if (POSITIVE_WORDS[word]) {
      score += POSITIVE_WORDS[word];
      positiveCount++;
    } else if (NEGATIVE_WORDS[word]) {
      score -= NEGATIVE_WORDS[word];
      negativeCount++;
    }
  });

  // Normalize score to -1 to 1
  const normalizedScore = Math.max(-1, Math.min(1, score / Math.max(1, words.length / 10)));

  let sentiment = "neutral";
  if (normalizedScore > 0.2) sentiment = "positive";
  else if (normalizedScore < -0.2) sentiment = "negative";

  return {
    score: normalizedScore,
    sentiment,
    positiveCount,
    negativeCount,
  };
}

function extractKeywords(text) {
  if (!text) return [];

  const words = (text.toLowerCase().match(/\b\w+\b/g) || [])
    .map((w) => w.replace(/[^\w]/g, ""));

  const filtered = words.filter((w) => w.length > 3 && !STOP_WORDS.has(w));

  // Extract 2-word phrases
  const phrases = [];
  for (let i = 0; i < filtered.length - 1; i++) {
    phrases.push(`${filtered[i]} ${filtered[i + 1]}`);
  }

  return [...filtered, ...phrases];
}

async function analyzeTweets() {
  const filePath = path.join(__dirname, "../../data/tweets.json");

  if (!fs.existsSync(filePath)) {
    console.error(`❌ tweets.json not found at ${filePath}`);
    console.error("Run: npm run scrape");
    process.exit(1);
  }

  const tweets = JSON.parse(fs.readFileSync(filePath, "utf8"));
  console.log(`Analyzing ${tweets.length} tweets...`);

  // Analyze each tweet
  const analyzedTweets = tweets.map((tweet) => {
    const text = tweet.text || tweet.fullText || "";
    const { score, sentiment, positiveCount, negativeCount } = calculateSentiment(text);
    const keywords = extractKeywords(text);

    return {
      ...tweet,
      analysis: {
        sentiment,
        score,
        positiveCount,
        negativeCount,
        keywords,
      },
    };
  });

  // Calculate resort-level stats
  const resortStats = {};
  const allKeywords = {};
  let totalScore = 0;

  analyzedTweets.forEach((tweet) => {
    const resort = tweet.resort;

    if (!resortStats[resort]) {
      resortStats[resort] = {
        total: 0,
        positive: 0,
        negative: 0,
        neutral: 0,
        avgScore: 0,
        scoreSum: 0,
      };
    }

    resortStats[resort].total++;
    resortStats[resort][tweet.analysis.sentiment]++;
    resortStats[resort].scoreSum += tweet.analysis.score;

    // Track keywords
    tweet.analysis.keywords.forEach((kw) => {
      if (!allKeywords[kw]) {
        allKeywords[kw] = { count: 0, score: 0 };
      }
      allKeywords[kw].count++;
      allKeywords[kw].score += tweet.analysis.score;
    });

    totalScore += tweet.analysis.score;
  });

  // Calculate averages
  Object.keys(resortStats).forEach((resort) => {
    resortStats[resort].avgScore = resortStats[resort].scoreSum / resortStats[resort].total;
  });

  // Top keywords
  const topKeywords = Object.entries(allKeywords)
    .map(([keyword, data]) => ({
      keyword,
      count: data.count,
      avgScore: data.score / data.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  const overallSentiment = totalScore / analyzedTweets.length;

  const analysis = {
    scrapedAt: new Date().toISOString(),
    totalTweets: analyzedTweets.length,
    overallSentiment: {
      score: overallSentiment,
      sentiment: overallSentiment > 0.2 ? "positive" : overallSentiment < -0.2 ? "negative" : "neutral",
    },
    resortStats,
    topKeywords,
    tweets: analyzedTweets,
  };

  const analysisPath = path.join(__dirname, "../../data/analysis.json");
  fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));

  console.log(`\n✅ Analysis complete!`);
  console.log(`📊 Overall sentiment: ${analysis.overallSentiment.sentiment} (${analysis.overallSentiment.score.toFixed(2)})`);
  console.log(`📁 Saved to ${analysisPath}`);
}

analyzeTweets().catch(console.error);

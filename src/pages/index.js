import React, { useState, useEffect } from "react";
import fs from "fs";
import path from "path";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", background: "#ffcccc", border: "2px solid red" }}>
          <h3>Error rendering tweets:</h3>
          <pre>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Dashboard({ initialData }) {
  const [data, setData] = useState(initialData);
  const [selectedResort, setSelectedResort] = useState(null);
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  if (!data) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h2>No Data Found</h2>
          <p>Run: npm run scrape && npm run analyze</p>
        </div>
      </div>
    );
  }

  const filteredTweets = selectedResort
    ? data.tweets.filter((t) => t.resort === selectedResort)
    : selectedKeyword
    ? data.tweets.filter((t) =>
        t.analysis.keywords.some((k) => k.includes(selectedKeyword))
      )
    : data.tweets;

  const getSentimentColor = (sentiment) => {
    if (sentiment === "positive") return "🟢";
    if (sentiment === "negative") return "🔴";
    return "⚪";
  };

  const getSentimentClass = (sentiment) => {
    return `sentiment-${sentiment[0]}`;
  };

  const getKeywordSize = (count) => {
    const max = Math.max(...data.topKeywords.map((k) => k.count));
    const normalized = (count / max) * 5;
    return Math.ceil(normalized) || 1;
  };

  const getKeywordSentiment = (keyword) => {
    const kwData = data.topKeywords.find((k) => k.keyword === keyword);
    return kwData?.avgScore > 0.2 ? "positive" : kwData?.avgScore < -0.2 ? "negative" : "neutral";
  };

  return (
    <div className="container">
      {/* Header */}
      <div style={{ marginBottom: "30px" }}>
        <h1>🌊 SEAFRONT PULSE 🏖️</h1>
        <p style={{ textAlign: "center", marginBottom: "10px" }}>
          West Malaysian Resort Sentiment Analysis
        </p>
        <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#555" }}>
          {data.totalTweets} tweets • Updated {new Date(data.scrapedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Overall Sentiment */}
      <div className="pixel-box pixel-box-dark" style={{ marginBottom: "30px" }}>
        <h2 style={{ color: "white", marginBottom: "15px" }}>⚡ OVERALL VIBE</h2>
        <div className="sentiment-meter">
          <div
            className={`sentiment-meter-fill sentiment-${data.overallSentiment.sentiment[0]}`}
            style={{
              width: `${((data.overallSentiment.score + 1) / 2) * 100}%`,
            }}
          >
            {data.overallSentiment.sentiment.toUpperCase()} ({data.overallSentiment.score.toFixed(2)})
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 OVERVIEW
        </div>
        <div
          className={`tab ${activeTab === "tweets" ? "active" : ""}`}
          onClick={() => setActiveTab("tweets")}
        >
          💬 TWEETS ({filteredTweets.length})
        </div>
        <div
          className={`tab ${activeTab === "keywords" ? "active" : ""}`}
          onClick={() => setActiveTab("keywords")}
        >
          ☁️ KEYWORDS
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          {/* Resort Leaderboard */}
          <div className="pixel-box">
            <h2>🏆 RESORT RANKINGS</h2>
            <div className="grid-3">
              {Object.entries(data.resortStats)
                .sort(([, a], [, b]) => b.avgScore - a.avgScore)
                .map(([resort, stats]) => (
                  <div
                    key={resort}
                    className="resort-card"
                    onClick={() => {
                      setSelectedResort(resort);
                      setActiveTab("tweets");
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="resort-name">{resort}</div>
                    <div className="resort-score">{stats.avgScore.toFixed(2)}</div>
                    <div className="resort-sentiment-bar">
                      <div
                        className={`resort-sentiment-bar-fill sentiment-${
                          stats.avgScore > 0.2
                            ? "positive"
                            : stats.avgScore < -0.2
                            ? "negative"
                            : "neutral"
                        }`}
                        style={{
                          width: `${((stats.avgScore + 1) / 2) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="sentiment-stat">
                      <div className="sentiment-stat-item">
                        <span className="sentiment-stat-num" style={{ color: "green" }}>
                          {stats.positive}
                        </span>
                        <span>Positive</span>
                      </div>
                      <div className="sentiment-stat-item">
                        <span className="sentiment-stat-num" style={{ color: "gray" }}>
                          {stats.neutral}
                        </span>
                        <span>Neutral</span>
                      </div>
                      <div className="sentiment-stat-item">
                        <span className="sentiment-stat-num" style={{ color: "red" }}>
                          {stats.negative}
                        </span>
                        <span>Negative</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Tweets Tab */}
      {activeTab === "tweets" && (
        <ErrorBoundary>
          <div className="pixel-box">
            <h2>💬 TWEET FEED</h2>
            <div style={{ marginBottom: "20px", fontSize: "0.9rem", color: "#666" }}>
              Showing {data.tweets?.length || 0} tweets
            </div>

            {data.tweets && Array.isArray(data.tweets) && data.tweets.length > 0 ? (
              <div>
                {data.tweets.slice(0, 10).map((tweet, idx) => {
                  if (!tweet || typeof tweet !== 'object') return null;
                  return (
                    <div key={`${tweet.id || idx}`} className="tweet-card">
                      <div className="tweet-header">
                        <div>
                          <span className="tweet-author">@{String(tweet.author || "unknown")}</span>
                          <span style={{ marginLeft: "15px", fontSize: "0.85rem", color: "#999" }}>
                            📍 {String(tweet.resort || "Unknown")}
                          </span>
                        </div>
                        {tweet.analysis && typeof tweet.analysis === 'object' && tweet.analysis.sentiment ? (
                          <div className={`tweet-sentiment sentiment-${String(tweet.analysis.sentiment)[0]}`}>
                            {getSentimentColor(tweet.analysis.sentiment)} {String(tweet.analysis.sentiment).toUpperCase()}
                          </div>
                        ) : null}
                      </div>

                      <div className="tweet-text">{String(tweet.text || "No text content")}</div>

                      <div className="tweet-stats">
                        <div className="stat">
                          <span className="stat-icon">❤️</span>
                          <span>{Number(tweet.likes) || 0}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-icon">🔄</span>
                          <span>{Number(tweet.retweets) || 0}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-icon">💬</span>
                          <span>{Number(tweet.replies) || 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <p>No tweets found</p>
              </div>
            )}
          </div>
        </ErrorBoundary>
      )}

      {/* Keywords Tab */}
      {activeTab === "keywords" && (
        <div className="pixel-box">
          <h2>TOP KEYWORDS</h2>
          <div className="keyword-cloud">
            {data.topKeywords.slice(0, 30).map((kw) => (
              <div
                key={kw.keyword}
                className={`keyword keyword-size-${getKeywordSize(kw.count)} ${
                  kw.avgScore > 0.2
                    ? "keyword-positive"
                    : kw.avgScore < -0.2
                    ? "keyword-negative"
                    : ""
                }`}
                onClick={() => {
                  setSelectedKeyword(kw.keyword);
                  setActiveTab("tweets");
                }}
                title={`Count: ${kw.count} | Avg Score: ${kw.avgScore.toFixed(2)}`}
              >
                {kw.keyword}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "40px", paddingBottom: "20px" }}>
        <p style={{ fontSize: "0.85rem", color: "#666" }}>
          Data collected using Apify • Sentiment analysis powered by free word-list engine
        </p>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const analysisPath = path.join(process.cwd(), "data", "analysis.json");

    if (!fs.existsSync(analysisPath)) {
      return {
        props: { initialData: null },
        revalidate: 60,
      };
    }

    const data = JSON.parse(fs.readFileSync(analysisPath, "utf8"));

    // Trim down tweet data to reduce payload size
    const trimmedTweets = data.tweets.map((tweet, idx) => {
      const tweetId = tweet.id ? String(tweet.id) : `tweet_${idx}`;
      // Extract author name - it could be a string or an object with username property
      let authorName = "Unknown";
      if (typeof tweet.author === "string") {
        authorName = tweet.author;
      } else if (typeof tweet.author === "object" && tweet.author !== null) {
        authorName = tweet.author.username || tweet.author.name || "Unknown";
      }

      return {
        id: tweetId,
        text: tweet.text || tweet.fullText || "",
        author: String(authorName),
        resort: String(tweet.resort || "Unknown"),
        likes: tweet.likeCount ? Number(tweet.likeCount) : 0,
        retweets: tweet.retweetCount ? Number(tweet.retweetCount) : 0,
        replies: tweet.replyCount ? Number(tweet.replyCount) : 0,
        analysis: tweet.analysis ? {
          sentiment: String(tweet.analysis.sentiment || "neutral"),
          score: tweet.analysis.score !== undefined ? Number(tweet.analysis.score) : 0,
          keywords: Array.isArray(tweet.analysis.keywords) ? tweet.analysis.keywords : [],
        } : {
          sentiment: "neutral",
          score: 0,
          keywords: [],
        },
      };
    });

    const trimmedData = {
      scrapedAt: data.scrapedAt,
      totalTweets: data.totalTweets,
      overallSentiment: data.overallSentiment,
      resortStats: data.resortStats,
      topKeywords: data.topKeywords.slice(0, 30),
      tweets: trimmedTweets,
    };

    return {
      props: { initialData: trimmedData },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error loading analysis:", error);
    return {
      props: { initialData: null },
      revalidate: 60,
    };
  }
}

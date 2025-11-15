import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { scrapeReddit } from './services/reddit-scraper.js';
import { fetchHackerNews } from './services/hackernews-api.js';
import { fetchNews } from './services/news-api.js';
import { analyzeSentiment, extractTopic } from './utils/helpers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let mentions = [];
let analytics = {
  totalMentions: 0,
  sentimentBreakdown: { positive: 0, negative: 0, neutral: 0 },
  topTopics: [],
  recentSpikes: []
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Get all mentions
app.get('/api/mentions', (req, res) => {
  try {
    const { sentiment, source, limit = 50 } = req.query;
    
    let filtered = [...mentions];
    
    if (sentiment) {
      filtered = filtered.filter(m => m.sentiment === sentiment);
    }
    
    if (source) {
      filtered = filtered.filter(m => m.source === source);
    }
    
    filtered = filtered.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching mentions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mentions'
    });
  }
});

// Get analytics
app.get('/api/analytics', (req, res) => {
  try {
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
});

// Start monitoring with REAL data
app.post('/api/monitor/start', async (req, res) => {
  const { brand } = req.body;
  
  if (!brand || typeof brand !== 'string' || brand.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid brand name is required'
    });
  }
  
  const sanitizedBrand = brand.trim();
  console.log(`\n🔍 Starting monitoring for: "${sanitizedBrand}"`);
  
  try {
    // Fetch from all sources in parallel
    const [redditData, hnData, newsData] = await Promise.allSettled([
      scrapeReddit(sanitizedBrand),
      fetchHackerNews(sanitizedBrand),
      fetchNews(sanitizedBrand)
    ]);
    
    // Extract successful results
    const redditMentions = redditData.status === 'fulfilled' ? redditData.value : [];
    const hnMentions = hnData.status === 'fulfilled' ? hnData.value : [];
    const newsMentions = newsData.status === 'fulfilled' ? newsData.value : [];
    
    // Combine all mentions
    const allMentions = [...redditMentions, ...hnMentions, ...newsMentions];
    
    // Process each mention
    mentions = allMentions.map(m => ({
      ...m,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      brand: sanitizedBrand,
      sentiment: analyzeSentiment(m.text),
      topic: extractTopic(m.text)
    }));
    
    // Update analytics
    updateAnalytics();
    
    console.log(`✅ Total mentions found: ${mentions.length}`);
    console.log(`   - Reddit: ${redditMentions.length}`);
    console.log(`   - HackerNews: ${hnMentions.length}`);
    console.log(`   - News: ${newsMentions.length}\n`);
    
    res.json({
      success: true,
      message: `Started monitoring mentions for "${sanitizedBrand}"`,
      initialCount: mentions.length,
      sources: {
        reddit: redditMentions.length,
        hackerNews: hnMentions.length,
        news: newsMentions.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching data:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching mentions. Please try again.'
    });
  }
});

// Update analytics
function updateAnalytics() {
  analytics.totalMentions = mentions.length;
  
  // Sentiment breakdown
  analytics.sentimentBreakdown = {
    positive: mentions.filter(m => m.sentiment === 'positive').length,
    negative: mentions.filter(m => m.sentiment === 'negative').length,
    neutral: mentions.filter(m => m.sentiment === 'neutral').length
  };
  
  // Top topics
  const topicCounts = {};
  mentions.forEach(m => {
    topicCounts[m.topic] = (topicCounts[m.topic] || 0) + 1;
  });
  
  analytics.topTopics = Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Detect spikes
  const recentHour = mentions.filter(m => {
    const diff = Date.now() - new Date(m.timestamp).getTime();
    return diff < 3600000;
  });
  
  if (recentHour.length > 10) {
    analytics.recentSpikes = [{
      topic: analytics.topTopics[0]?.topic || 'general',
      count: recentHour.length,
      timestamp: new Date().toISOString()
    }];
  } else {
    analytics.recentSpikes = [];
  }
}

// Periodic refresh (every 5 minutes for real data)
let refreshInterval = null;

async function autoRefresh() {
  if (mentions.length > 0 && mentions[0].brand) {
    const brand = mentions[0].brand;
    console.log(`🔄 Auto-refreshing data for "${brand}"...`);
    
    try {
      const [redditData, hnData] = await Promise.allSettled([
        scrapeReddit(brand),
        fetchHackerNews(brand)
      ]);
      
      const redditMentions = redditData.status === 'fulfilled' ? redditData.value : [];
      const hnMentions = hnData.status === 'fulfilled' ? hnData.value : [];
      
      const newMentions = [...redditMentions, ...hnMentions].map(m => ({
        ...m,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        brand,
        sentiment: analyzeSentiment(m.text),
        topic: extractTopic(m.text)
      }));
      
      // Add new unique mentions
      let addedCount = 0;
      newMentions.forEach(newMention => {
        const exists = mentions.some(m => m.url === newMention.url);
        if (!exists) {
          mentions.unshift(newMention);
          addedCount++;
        }
      });
      
      // Keep only last 100 mentions
      mentions = mentions.slice(0, 100);
      updateAnalytics();
      
      console.log(`✅ Added ${addedCount} new mentions`);
    } catch (error) {
      console.error('❌ Auto-refresh error:', error.message);
    }
  }
}

// Start auto-refresh interval
refreshInterval = setInterval(autoRefresh, 300000); // 5 minutes

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 Brand Tracker Backend Server Started!');
  console.log('='.repeat(50));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`\n📊 Available Endpoints:`);
  console.log(`   GET  /api/health        - Health check`);
  console.log(`   POST /api/monitor/start - Start monitoring`);
  console.log(`   GET  /api/mentions      - Get mentions`);
  console.log(`   GET  /api/analytics     - Get analytics`);
  console.log('\n💡 Tips:');
  console.log(`   - Reddit & HackerNews work without API keys ✅`);
  console.log(`   - Get News API key from: https://newsapi.org/register`);
  console.log(`   - Add to .env file: NEWS_API_KEY=your_key_here`);
  console.log('='.repeat(50) + '\n');
});

export default app;
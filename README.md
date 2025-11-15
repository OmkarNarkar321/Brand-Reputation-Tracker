**Brand Tracker Backend**

<img width="1898" height="908" alt="image" src="https://github.com/user-attachments/assets/3325dab0-c272-4168-8bcb-57688eac86d7" />


A production-ready backend API for real-time brand monitoring across multiple platforms (Reddit, HackerNews, News, YouTube).

**🚀 Features**
Multi-Platform Monitoring: Reddit, HackerNews, News API, YouTube
Real-time Analytics: Sentiment analysis, topic extraction, engagement metrics
Auto-refresh: Automatically fetches new mentions every 5 minutes
Production Ready: Error handling, timeouts, graceful shutdown
ES Modules: Modern JavaScript with clean imports/exports

**📋 Prerequisites**
Node.js >= 18.0.0
npm >= 9.0.0

**🔧 Installation**
Clone the repository
git clone <your-repo-url>
cd brand-tracker-backend

**Install dependencies**
npm install

**Configure environment variables**
cp .env.example .env

Edit .env and add your API keys (optional):
PORT=5000
NEWS_API_KEY=your_news_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here

Note: Reddit and HackerNews work without API keys! ✅

**🏃‍♂️ Running the Server**
Development Mode
npm run dev

**Production Mode**
npm start

Server will start at: http://localhost:5000

**📡 API Endpoints**
**Health Check**
GET /api/health

**Start Monitoring**
POST /api/monitor/start
Content-Type: application/json

{
  "brand": "OpenAI"
}

**Get Mentions**
GET /api/mentions?sentiment=positive&source=Reddit&limit=50

Query Parameters:
sentiment: Filter by sentiment (positive/negative/neutral)
source: Filter by source (Reddit/HackerNews/News/YouTube)
limit: Maximum number of results (default: 50)

**Get Analytics**
GET /api/analytics

Returns:
Total mentions count
Sentiment breakdown
Top topics
Recent spikes
**📁 Project Structure**
backend/
├── server.js                 # Main server file
├── services/
│   ├── reddit-scraper.js    # Reddit API integration
│   ├── hackernews-api.js    # HackerNews API integration
│   ├── news-api.js          # News API integration
│   ├── youtube-api.js       # YouTube API integration
│   └── nitter-scraper.js    # Twitter/X scraping (optional)
├── utils/
│   └── helpers.js           # Utility functions
├── package.json
├── .env.example
├── .gitignore
└── README.md

**🔑 API Keys Setup**
**News API (Optional)**
Visit: https://newsapi.org/register
Sign up for a free account
Copy your API key
Add to .env: NEWS_API_KEY=your_key_here

**YouTube API (Optional)**
Visit: https://console.cloud.google.com/
Create a new project
Enable YouTube Data API v3
Create credentials (API Key)
Add to .env: YOUTUBE_API_KEY=your_key_here

**🚀 Deployment**
Deploy to Heroku
heroku create your-app-name
heroku config:set NEWS_API_KEY=your_key_here
git push heroku main

**Deploy to Render**
Connect your GitHub repository
Set environment variables in Render dashboard
Deploy!

**Deploy to Railway**
Connect your GitHub repository
Add environment variables
Deploy automatically

**Deploy to DigitalOcean App Platform**
Connect your GitHub repository
Configure environment variables
Deploy!

**🛡️ Production Best Practices**
✅ Implemented:
Error handling with try-catch blocks
Request timeouts (10 seconds)
Graceful shutdown (SIGTERM handling)
Input validation and sanitization
Rate limiting ready
CORS configured
Environment variables
Logging for debugging

**🧪 Testing**
Test the API using curl:
# Health check
curl http://localhost:5000/api/health

# Start monitoring
curl -X POST http://localhost:5000/api/monitor/start \
  -H "Content-Type: application/json" \
  -d '{"brand":"Tesla"}'

# Get mentions
curl http://localhost:5000/api/mentions?limit=10

# Get analytics
curl http://localhost:5000/api/analytics

**📊 Response Examples**
Start Monitoring Response
{
  "success": true,
  "message": "Started monitoring mentions for \"Tesla\"",
  "initialCount": 25,
  "sources": {
    "reddit": 15,
    "hackerNews": 8,
    "news": 2
  }
}

**Analytics Response**
{
  "success": true,
  "data": {
    "totalMentions": 25,
    "sentimentBreakdown": {
      "positive": 12,
      "negative": 5,
      "neutral": 8
    },
    "topTopics": [
      { "topic": "product", "count": 10 },
      { "topic": "performance", "count": 7 }
    ],
    "recentSpikes": []
  }
}

**🐛 Troubleshooting**
Port already in use
# Change PORT in .env file
PORT=3001

**API rate limits**
News API: 100 requests/day (free tier)
YouTube API: 10,000 units/day (free tier)
Reddit & HackerNews: No limits!

**Module not found errors**
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

**📝 License**
MIT License - feel free to use in your projects!

**🤝 Contributing**
Contributions are welcome! Please open an issue or submit a pull request.

**📧 Support**
For issues or questions, please open a GitHub issue.

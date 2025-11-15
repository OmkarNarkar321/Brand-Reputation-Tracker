import axios from 'axios';

const NEWS_API_KEY = process.env.NEWS_API_KEY || '579eb4bb6dff47cda156484b60fb6043';

/**
 * Fetch news articles for a given brand
 * @param {string} brand - The brand name to search for
 * @returns {Promise<Array>} Array of news articles
 */
export async function fetchNews(brand) {
  if (!NEWS_API_KEY || NEWS_API_KEY === 'your_api_key_here') {
    console.warn('⚠️ News API key not configured. Skipping news fetch.');
    return [];
  }

  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(brand)}&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;
    const response = await axios.get(url, {
      timeout: 10000 // 10 second timeout
    });
    
    if (!response.data?.articles) {
      console.warn('⚠️ News API: No articles returned');
      return [];
    }
    
    const articles = response.data.articles
      .slice(0, 10)
      .map(article => {
        // Validate required fields
        if (!article.title || !article.publishedAt) {
          return null;
        }
        
        return {
          source: 'News',
          text: article.title + (article.description ? '. ' + article.description : ''),
          author: article.author || article.source?.name || 'unknown',
          timestamp: article.publishedAt,
          url: article.url,
          engagement: 0
        };
      })
      .filter(article => article !== null); // Remove invalid articles
    
    console.log(`✅ Fetched ${articles.length} news articles for "${brand}"`);
    return articles;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('❌ News API request timeout');
    } else if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        console.error('❌ News API: Invalid API key');
      } else if (status === 429) {
        console.error('❌ News API: Rate limit exceeded');
      } else {
        console.error(`❌ News API error: ${status} - ${error.response.statusText}`);
      }
    } else {
      console.error('❌ News API error:', error.message);
    }
    return [];
  }
}
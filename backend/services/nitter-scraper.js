import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrape Twitter/X posts via Nitter for a given brand
 * Note: Nitter instances are often unreliable. Consider using official Twitter API instead.
 * @param {string} brand - The brand name to search for
 * @returns {Promise<Array>} Array of tweets
 */
export async function scrapeNitter(brand) {
  // List of Nitter instances to try
  const nitterInstances = [
    'https://nitter.net',
    'https://nitter.poast.org',
    'https://nitter.privacydev.net'
  ];

  for (const instance of nitterInstances) {
    try {
      const url = `${instance}/search?f=tweets&q=${encodeURIComponent(brand)}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000 // 10 second timeout
      });
      
      const $ = cheerio.load(response.data);
      const tweets = [];
      
      $('.timeline-item').each((i, elem) => {
        const text = $(elem).find('.tweet-content').text().trim();
        const author = $(elem).find('.username').text().trim();
        const time = $(elem).find('.tweet-date').attr('title');
        
        if (text && text.length > 0) {
          tweets.push({
            source: 'Twitter',
            text: text,
            author: author || 'unknown',
            timestamp: time || new Date().toISOString(),
            url: `https://twitter.com/search?q=${encodeURIComponent(brand)}`,
            engagement: 0
          });
        }
      });
      
      if (tweets.length > 0) {
        console.log(`✅ Fetched ${tweets.length} tweets from ${instance} for "${brand}"`);
        return tweets.slice(0, 10);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to scrape from ${instance}:`, error.message);
      continue; // Try next instance
    }
  }
  
  console.warn('⚠️ All Nitter instances failed. Twitter data unavailable.');
  return [];
}
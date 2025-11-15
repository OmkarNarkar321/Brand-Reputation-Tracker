import axios from 'axios';

/**
 * Scrape Reddit posts for a given brand
 * @param {string} brand - The brand name to search for
 * @returns {Promise<Array>} Array of Reddit posts
 */
export async function scrapeReddit(brand) {
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(brand)}&sort=new&limit=15`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BrandTracker/1.0)'
      },
      timeout: 10000 // 10 second timeout
    });
    
    if (!response.data?.data?.children) {
      console.warn('⚠️ Reddit: No data returned');
      return [];
    }
    
    const posts = response.data.data.children
      .map(child => {
        const data = child.data;
        
        // Validate required fields
        if (!data.title || !data.created_utc) {
          return null;
        }
        
        return {
          source: 'Reddit',
          text: data.title + (data.selftext ? ' - ' + data.selftext.substring(0, 200) : ''),
          author: data.author || 'unknown',
          timestamp: new Date(data.created_utc * 1000).toISOString(),
          url: 'https://reddit.com' + data.permalink,
          engagement: (data.score || 0) + (data.num_comments || 0)
        };
      })
      .filter(post => post !== null); // Remove invalid posts
    
    console.log(`✅ Fetched ${posts.length} Reddit posts for "${brand}"`);
    return posts;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Reddit request timeout');
    } else if (error.response) {
      console.error(`❌ Reddit API error: ${error.response.status} - ${error.response.statusText}`);
    } else {
      console.error('❌ Reddit scraping error:', error.message);
    }
    return [];
  }
}
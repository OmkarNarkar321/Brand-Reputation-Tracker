import axios from 'axios';

/**
 * Fetch HackerNews stories for a given brand
 * @param {string} brand - The brand name to search for
 * @returns {Promise<Array>} Array of HackerNews stories
 */
export async function fetchHackerNews(brand) {
  try {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(brand)}&tags=story&hitsPerPage=10`;
    const response = await axios.get(url, {
      timeout: 10000 // 10 second timeout
    });
    
    if (!response.data?.hits) {
      console.warn('⚠️ HackerNews: No data returned');
      return [];
    }
    
    const stories = response.data.hits
      .map(hit => {
        // Validate required fields
        if (!hit.title || !hit.created_at) {
          return null;
        }
        
        return {
          source: 'HackerNews',
          text: hit.title + (hit.story_text ? ' - ' + hit.story_text : ''),
          author: hit.author || 'unknown',
          timestamp: hit.created_at,
          url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
          engagement: (hit.points || 0) + (hit.num_comments || 0)
        };
      })
      .filter(story => story !== null); // Remove invalid stories
    
    console.log(`✅ Fetched ${stories.length} HackerNews stories for "${brand}"`);
    return stories;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('❌ HackerNews request timeout');
    } else if (error.response) {
      console.error(`❌ HackerNews API error: ${error.response.status} - ${error.response.statusText}`);
    } else {
      console.error('❌ HackerNews API error:', error.message);
    }
    return [];
  }
}
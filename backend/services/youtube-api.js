import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyDCVkFdmoqdUbMckeeW9R2KDrlESkg3Bts';

/**
 * Fetch YouTube videos for a given brand
 * @param {string} brand - The brand name to search for
 * @returns {Promise<Array>} Array of YouTube videos
 */
export async function fetchYouTube(brand) {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'your_api_key_here') {
    console.warn('⚠️ YouTube API key not configured. Skipping YouTube fetch.');
    return [];
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(brand)}&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`;
    const response = await axios.get(url, {
      timeout: 10000 // 10 second timeout
    });
    
    if (!response.data?.items) {
      console.warn('⚠️ YouTube API: No videos returned');
      return [];
    }
    
    const videos = response.data.items
      .map(item => {
        // Validate required fields
        if (!item.snippet?.title || !item.snippet?.publishedAt || !item.id?.videoId) {
          return null;
        }
        
        return {
          source: 'YouTube',
          text: item.snippet.title + (item.snippet.description ? ' - ' + item.snippet.description : ''),
          author: item.snippet.channelTitle || 'unknown',
          timestamp: item.snippet.publishedAt,
          url: `https://youtube.com/watch?v=${item.id.videoId}`,
          engagement: 0
        };
      })
      .filter(video => video !== null); // Remove invalid videos
    
    console.log(`✅ Fetched ${videos.length} YouTube videos for "${brand}"`);
    return videos;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('❌ YouTube API request timeout');
    } else if (error.response) {
      const status = error.response.status;
      if (status === 400) {
        console.error('❌ YouTube API: Invalid request');
      } else if (status === 403) {
        console.error('❌ YouTube API: Invalid or exceeded quota for API key');
      } else {
        console.error(`❌ YouTube API error: ${status} - ${error.response.statusText}`);
      }
    } else {
      console.error('❌ YouTube API error:', error.message);
    }
    return [];
  }
}
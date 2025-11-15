/**
 * Analyze sentiment of text using keyword matching
 * @param {string} text - The text to analyze
 * @returns {string} Sentiment classification: 'positive', 'negative', or 'neutral'
 */
export function analyzeSentiment(text) {
  if (!text || typeof text !== 'string') {
    return 'neutral';
  }

  const positive = [
    'good', 'great', 'excellent', 'amazing', 'love', 'best', 'awesome', 
    'fantastic', 'wonderful', 'perfect', 'outstanding', 'brilliant',
    'impressive', 'superb', 'incredible', 'exceptional', 'remarkable',
    'pleased', 'satisfied', 'happy', 'delighted', 'thrilled'
  ];
  
  const negative = [
    'bad', 'terrible', 'worst', 'hate', 'awful', 'poor', 'disappointing', 
    'horrible', 'useless', 'broken', 'sucks', 'fail', 'failed', 'failure',
    'wrong', 'issue', 'problem', 'bug', 'error', 'frustrating', 'annoying',
    'upset', 'angry', 'disappointed', 'unhappy'
  ];
  
  const lowerText = text.toLowerCase();
  
  const posCount = positive.filter(word => lowerText.includes(word)).length;
  const negCount = negative.filter(word => lowerText.includes(word)).length;
  
  if (posCount > negCount) return 'positive';
  if (negCount > posCount) return 'negative';
  return 'neutral';
}

/**
 * Extract topic from text based on keyword matching
 * @param {string} text - The text to analyze
 * @returns {string} Extracted topic category
 */
export function extractTopic(text) {
  if (!text || typeof text !== 'string') {
    return 'general';
  }

  const topics = {
    'product': [
      'product', 'feature', 'quality', 'design', 'build', 'version', 
      'release', 'update', 'upgrade', 'functionality', 'interface'
    ],
    'support': [
      'support', 'help', 'service', 'customer', 'care', 'team', 
      'response', 'assist', 'contact', 'representative'
    ],
    'pricing': [
      'price', 'cost', 'expensive', 'cheap', 'value', 'worth', 
      'money', 'affordable', 'budget', 'subscription', 'payment', 'fee'
    ],
    'performance': [
      'fast', 'slow', 'speed', 'performance', 'lag', 'quick', 
      'efficient', 'responsive', 'loading', 'latency'
    ],
    'quality': [
      'quality', 'durable', 'reliable', 'sturdy', 'solid', 'premium',
      'dependable', 'trustworthy', 'consistent'
    ],
    'shipping': [
      'shipping', 'delivery', 'ship', 'delivered', 'package', 
      'tracking', 'arrived', 'transit'
    ],
    'bug': [
      'bug', 'error', 'crash', 'broken', 'issue', 'problem', 
      'glitch', 'malfunction', 'defect'
    ]
  };
  
  const lowerText = text.toLowerCase();
  
  // Find the topic with the most keyword matches
  let maxMatches = 0;
  let matchedTopic = 'general';
  
  for (const [topic, keywords] of Object.entries(topics)) {
    const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      matchedTopic = topic;
    }
  }
  
  return matchedTopic;
}

/**
 * Sanitize user input to prevent injection attacks
 * @param {string} input - The input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .substring(0, 200); // Limit length
}

/**
 * Format timestamp to human-readable string
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted timestamp
 */
export function formatTimestamp(timestamp) {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Calculate engagement score based on various metrics
 * @param {Object} mention - The mention object with engagement data
 * @returns {number} Calculated engagement score
 */
export function calculateEngagement(mention) {
  if (!mention) return 0;
  
  const baseScore = mention.engagement || 0;
  const sentimentMultiplier = {
    'positive': 1.2,
    'neutral': 1.0,
    'negative': 0.8
  };
  
  return Math.round(baseScore * (sentimentMultiplier[mention.sentiment] || 1.0));
}
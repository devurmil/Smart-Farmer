// NewsAPI Integration Service
// Provides real-time agricultural and market news

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: "market" | "policy" | "weather" | "export" | "technology" | "general";
  impact: "high" | "medium" | "low";
  date: string;
  source: string;
  readTime: string;
  tags: string[];
  url: string;
  imageUrl?: string;
  author?: string;
}

interface NewsResponse {
  success: boolean;
  articles: NewsArticle[];
  totalResults: number;
  error?: string;
}

interface MarketUpdate {
  id: string;
  type: "price_alert" | "volume_spike" | "trend_change" | "policy_update";
  crop: string;
  message: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
  source: string;
}

class NewsService {
  private apiKey: string;
  private baseUrl = 'https://newsapi.org/v2';
  
  // Agricultural keywords for filtering relevant news
  private agriculturalKeywords = [
    'agriculture', 'farming', 'crop', 'harvest', 'irrigation', 'fertilizer',
    'pesticide', 'cotton', 'wheat', 'rice', 'groundnut', 'sugarcane',
    'market price', 'APMC', 'mandi', 'export', 'import', 'subsidy',
    'monsoon', 'drought', 'flood', 'climate', 'soil', 'seed',
    'Gujarat agriculture', 'Indian agriculture', 'farm bill', 'MSP'
  ];

  constructor() {
    this.apiKey = import.meta.env.VITE_NEWS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('News API key not found. News features will use mock data.');
    }
  }

  /**
   * Fetch latest agricultural news
   */
  async getAgriculturalNews(category?: string, limit: number = 20): Promise<NewsResponse> {
    try {
      if (!this.apiKey) {
        return this.generateMockNews(limit);
      }

      // Build search query based on category
      let query = this.buildSearchQuery(category);
      
      const params = new URLSearchParams({
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: limit.toString(),
        apiKey: this.apiKey
      });

      const response = await fetch(`${this.baseUrl}/everything?${params}`);

      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status !== 'ok') {
        throw new Error(`NewsAPI error: ${data.message}`);
      }

      const articles = this.transformNewsData(data.articles);
      
      return {
        success: true,
        articles,
        totalResults: data.totalResults
      };

    } catch (error) {
      console.error('Error fetching news:', error);
      return this.generateMockNews(limit);
    }
  }

  /**
   * Get news by specific topics
   */
  async getNewsByTopic(topic: 'market' | 'policy' | 'weather' | 'technology', limit: number = 10): Promise<NewsArticle[]> {
    try {
      const response = await this.getAgriculturalNews(topic, limit);
      return response.articles.filter(article => article.category === topic);
    } catch (error) {
      console.error(`Error fetching ${topic} news:`, error);
      return [];
    }
  }

  /**
   * Get Gujarat-specific agricultural news
   */
  async getGujaratNews(limit: number = 15): Promise<NewsArticle[]> {
    try {
      if (!this.apiKey) {
        return this.generateMockGujaratNews();
      }

      const query = 'Gujarat AND (agriculture OR farming OR crop OR cotton OR groundnut OR APMC)';
      
      const params = new URLSearchParams({
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: limit.toString(),
        apiKey: this.apiKey
      });

      const response = await fetch(`${this.baseUrl}/everything?${params}`);

      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformNewsData(data.articles);

    } catch (error) {
      console.error('Error fetching Gujarat news:', error);
      return this.generateMockGujaratNews();
    }
  }

  /**
   * Get market updates and alerts
   */
  async getMarketUpdates(): Promise<MarketUpdate[]> {
    try {
      const marketNews = await this.getNewsByTopic('market', 10);
      return this.generateMarketUpdatesFromNews(marketNews);
    } catch (error) {
      console.error('Error generating market updates:', error);
      return this.generateMockMarketUpdates();
    }
  }

  /**
   * Search news by keywords
   */
  async searchNews(keywords: string, limit: number = 10): Promise<NewsArticle[]> {
    try {
      if (!this.apiKey) {
        return [];
      }

      const query = `${keywords} AND (agriculture OR farming OR crop)`;
      
      const params = new URLSearchParams({
        q: query,
        language: 'en',
        sortBy: 'relevancy',
        pageSize: limit.toString(),
        apiKey: this.apiKey
      });

      const response = await fetch(`${this.baseUrl}/everything?${params}`);

      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformNewsData(data.articles);

    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  }

  /**
   * Build search query based on category
   */
  private buildSearchQuery(category?: string): string {
    const baseKeywords = ['agriculture', 'farming', 'crop', 'harvest'];
    
    const categoryKeywords = {
      market: ['price', 'market', 'trading', 'APMC', 'mandi', 'export', 'import'],
      policy: ['policy', 'government', 'subsidy', 'scheme', 'bill', 'regulation'],
      weather: ['weather', 'monsoon', 'drought', 'rainfall', 'climate'],
      export: ['export', 'import', 'trade', 'international', 'shipment'],
      technology: ['technology', 'AI', 'drone', 'precision', 'digital', 'IoT']
    };

    let keywords = baseKeywords;
    if (category && categoryKeywords[category]) {
      keywords = [...baseKeywords, ...categoryKeywords[category]];
    }

    return keywords.join(' OR ');
  }

  /**
   * Transform NewsAPI data to our format
   */
  private transformNewsData(articles: any[]): NewsArticle[] {
    return articles
      .filter(article => article.title && article.description && article.url)
      .map((article, index) => {
        const category = this.categorizeArticle(article.title + ' ' + article.description);
        const impact = this.assessImpact(article.title + ' ' + article.description);
        const tags = this.extractTags(article.title + ' ' + article.description);
        
        return {
          id: `news-${Date.now()}-${index}`,
          title: article.title,
          summary: article.description || '',
          content: article.content || article.description || '',
          category,
          impact,
          date: this.formatDate(article.publishedAt),
          source: article.source?.name || 'Unknown',
          readTime: this.calculateReadTime(article.content || article.description || ''),
          tags,
          url: article.url,
          imageUrl: article.urlToImage,
          author: article.author
        };
      });
  }

  /**
   * Categorize article based on content
   */
  private categorizeArticle(content: string): NewsArticle['category'] {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('price') || lowerContent.includes('market') || lowerContent.includes('trading')) {
      return 'market';
    }
    if (lowerContent.includes('policy') || lowerContent.includes('government') || lowerContent.includes('subsidy')) {
      return 'policy';
    }
    if (lowerContent.includes('weather') || lowerContent.includes('monsoon') || lowerContent.includes('climate')) {
      return 'weather';
    }
    if (lowerContent.includes('export') || lowerContent.includes('import') || lowerContent.includes('trade')) {
      return 'export';
    }
    if (lowerContent.includes('technology') || lowerContent.includes('ai') || lowerContent.includes('digital')) {
      return 'technology';
    }
    
    return 'general';
  }

  /**
   * Assess impact level of news
   */
  private assessImpact(content: string): NewsArticle['impact'] {
    const lowerContent = content.toLowerCase();
    
    const highImpactKeywords = ['crisis', 'ban', 'shortage', 'surge', 'record', 'emergency', 'alert'];
    const mediumImpactKeywords = ['increase', 'decrease', 'change', 'new', 'update', 'announce'];
    
    if (highImpactKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'high';
    }
    if (mediumImpactKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Extract relevant tags from content
   */
  private extractTags(content: string): string[] {
    const lowerContent = content.toLowerCase();
    const tags: string[] = [];
    
    const cropKeywords = ['cotton', 'wheat', 'rice', 'groundnut', 'sugarcane', 'maize', 'bajra'];
    const actionKeywords = ['price rise', 'export', 'import', 'subsidy', 'harvest', 'planting'];
    
    cropKeywords.forEach(crop => {
      if (lowerContent.includes(crop)) {
        tags.push(crop.charAt(0).toUpperCase() + crop.slice(1));
      }
    });
    
    actionKeywords.forEach(action => {
      if (lowerContent.includes(action)) {
        tags.push(action.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '));
      }
    });
    
    return tags.slice(0, 3); // Limit to 3 tags
  }

  /**
   * Calculate estimated read time
   */
  private calculateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  }

  /**
   * Format date for display
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 48) {
      return '1 day ago';
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} days ago`;
    }
  }

  /**
   * Generate market updates from news articles
   */
  private generateMarketUpdatesFromNews(articles: NewsArticle[]): MarketUpdate[] {
    return articles.slice(0, 5).map((article, index) => {
      const crops = ['Cotton', 'Wheat', 'Rice', 'Groundnut', 'Sugarcane'];
      const types: MarketUpdate['type'][] = ['price_alert', 'volume_spike', 'trend_change', 'policy_update'];
      
      return {
        id: `update-${Date.now()}-${index}`,
        type: types[index % types.length],
        crop: crops[index % crops.length],
        message: article.title.substring(0, 100) + '...',
        timestamp: article.date,
        severity: article.impact === 'high' ? 'critical' : article.impact === 'medium' ? 'warning' : 'info',
        source: article.source
      };
    });
  }

  /**
   * Generate mock news data for fallback
   */
  private generateMockNews(limit: number): NewsResponse {
    const mockArticles: NewsArticle[] = [
      {
        id: "1",
        title: "Cotton Prices Surge 15% Following Export Demand from Bangladesh",
        summary: "Strong international demand and reduced domestic supply have pushed cotton prices to a 6-month high. Farmers are advised to consider selling strategies.",
        content: "Cotton prices in Gujarat markets have witnessed a significant surge of 15% over the past week, driven primarily by increased export demand from Bangladesh and Vietnam. The modal price in Rajkot APMC has reached ₹6,200 per quintal, marking the highest level in six months.",
        category: "market",
        impact: "high",
        date: "2 hours ago",
        source: "Agricultural Times",
        readTime: "3 min read",
        tags: ["Cotton", "Export", "Price Rise"],
        url: "#"
      },
      {
        id: "2",
        title: "New Government Subsidy Scheme for Wheat Farmers Announced",
        summary: "The Ministry of Agriculture announces a ₹5000 per hectare subsidy for wheat farmers adopting sustainable farming practices.",
        content: "The Government of India has announced a new subsidy scheme worth ₹5000 per hectare for wheat farmers who adopt sustainable and organic farming practices. This initiative aims to promote environmentally friendly agriculture while ensuring food security.",
        category: "policy",
        impact: "high",
        date: "4 hours ago",
        source: "Government Portal",
        readTime: "5 min read",
        tags: ["Wheat", "Subsidy", "Government"],
        url: "#"
      }
    ];

    return {
      success: true,
      articles: mockArticles.slice(0, limit),
      totalResults: mockArticles.length
    };
  }

  /**
   * Generate mock Gujarat-specific news
   */
  private generateMockGujaratNews(): NewsArticle[] {
    return [
      {
        id: "guj-1",
        title: "Gujarat APMC Introduces Digital Trading Platform",
        summary: "Gujarat Agricultural Produce Market Committee launches new digital platform to streamline crop trading and price discovery.",
        content: "The Gujarat APMC has launched a comprehensive digital trading platform that will revolutionize how farmers sell their produce and how buyers discover prices.",
        category: "technology",
        impact: "medium",
        date: "1 day ago",
        source: "Gujarat Samachar",
        readTime: "4 min read",
        tags: ["Gujarat", "APMC", "Digital"],
        url: "#"
      }
    ];
  }

  /**
   * Generate mock market updates
   */
  private generateMockMarketUpdates(): MarketUpdate[] {
    return [
      {
        id: "1",
        type: "price_alert",
        crop: "Wheat",
        message: "Wheat prices crossed ₹2,500/quintal in Delhi market",
        timestamp: "15 minutes ago",
        severity: "info",
        source: "Market Watch"
      },
      {
        id: "2",
        type: "volume_spike",
        crop: "Cotton",
        message: "Unusual high trading volume detected - 300% above average",
        timestamp: "1 hour ago",
        severity: "warning",
        source: "Trading Desk"
      }
    ];
  }
}

export default new NewsService();
export type { NewsArticle, NewsResponse, MarketUpdate };
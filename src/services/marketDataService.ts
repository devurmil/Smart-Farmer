// Market Data Service for Real-time Gujarat Market Prices
// This service integrates with various Indian agricultural market APIs

interface MarketDataSource {
  name: string;
  url: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

interface GujaratMarketPrice {
  crop: string;
  market: string;
  district: string;
  price: number;
  unit: string;
  date: string;
  quality: string;
  arrivals: number; // in quintals
}

interface APIResponse {
  success: boolean;
  data: GujaratMarketPrice[];
  error?: string;
}

class MarketDataService {
  private dataSources: MarketDataSource[] = [
    {
      name: "eNAM (National Agriculture Market)",
      url: "https://enam.gov.in/web/api",
      headers: {
        "Content-Type": "application/json"
      }
    },
    {
      name: "APMC Gujarat",
      url: "https://www.gujaratapmc.com/api",
      headers: {
        "Content-Type": "application/json"
      }
    },
    {
      name: "Agmarknet",
      url: "https://agmarknet.gov.in/api",
      headers: {
        "Content-Type": "application/json"
      }
    },
    {
      name: "Data.gov.in Agriculture",
      url: "https://api.data.gov.in/resource",
      apiKey: process.env.VITE_DATA_GOV_API_KEY,
      headers: {
        "Content-Type": "application/json"
      }
    }
  ];

  // Gujarat major agricultural markets
  private gujaratMarkets = [
    "Ahmedabad", "Rajkot", "Surat", "Vadodara", "Bhavnagar", 
    "Junagadh", "Gandhinagar", "Anand", "Mehsana", "Morbi",
    "Surendranagar", "Bharuch", "Navsari", "Veraval", "Gondal"
  ];

  // Major crops in Gujarat
  private gujaratCrops = [
    "Cotton", "Groundnut", "Wheat", "Bajra", "Castor", 
    "Cumin", "Fennel", "Sesame", "Mustard", "Jowar",
    "Maize", "Rice", "Sugarcane", "Onion", "Potato"
  ];

  /**
   * Fetch real-time market prices from eNAM API
   */
  async fetcheNAMPrices(crop?: string, market?: string): Promise<APIResponse> {
    try {
      // eNAM API endpoint for Gujarat markets
      const params = new URLSearchParams({
        state: "Gujarat",
        ...(crop && { commodity: crop }),
        ...(market && { market: market }),
        date: new Date().toISOString().split('T')[0]
      });

      const response = await fetch(`${this.dataSources[0].url}/prices?${params}`, {
        headers: this.dataSources[0].headers
      });

      if (!response.ok) {
        throw new Error(`eNAM API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: this.transformeNAMData(data)
      };
    } catch (error) {
      console.error("Error fetching eNAM data:", error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Fetch prices from Gujarat APMC
   */
  async fetchAPMCPrices(): Promise<APIResponse> {
    try {
      const response = await fetch(`${this.dataSources[1].url}/daily-prices`, {
        method: 'POST',
        headers: this.dataSources[1].headers,
        body: JSON.stringify({
          state: "Gujarat",
          date: new Date().toISOString().split('T')[0]
        })
      });

      if (!response.ok) {
        throw new Error(`APMC API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: this.transformAPMCData(data)
      };
    } catch (error) {
      console.error("Error fetching APMC data:", error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Fetch data from Data.gov.in
   */
  async fetchDataGovPrices(): Promise<APIResponse> {
    try {
      if (!this.dataSources[3].apiKey) {
        throw new Error("Data.gov.in API key not configured");
      }

      const params = new URLSearchParams({
        api_key: this.dataSources[3].apiKey,
        format: "json",
        filters: JSON.stringify({
          state: "Gujarat",
          date: new Date().toISOString().split('T')[0]
        })
      });

      const response = await fetch(`${this.dataSources[3].url}/agricultural-marketing?${params}`, {
        headers: this.dataSources[3].headers
      });

      if (!response.ok) {
        throw new Error(`Data.gov.in API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: this.transformDataGovData(data)
      };
    } catch (error) {
      console.error("Error fetching Data.gov.in data:", error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Aggregate data from multiple sources
   */
  async fetchRealTimeMarketData(crop?: string): Promise<GujaratMarketPrice[]> {
    const promises = [
      this.fetcheNAMPrices(crop),
      this.fetchAPMCPrices(),
      // this.fetchDataGovPrices() // Uncomment when API key is available
    ];

    try {
      const results = await Promise.allSettled(promises);
      const allData: GujaratMarketPrice[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          allData.push(...result.value.data);
        } else {
          console.warn(`Data source ${index} failed:`, 
            result.status === 'rejected' ? result.reason : result.value.error);
        }
      });

      // Remove duplicates and sort by date
      const uniqueData = this.removeDuplicates(allData);
      return uniqueData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    } catch (error) {
      console.error("Error aggregating market data:", error);
      // Fallback to mock data if all APIs fail
      return this.generateFallbackData(crop);
    }
  }

  /**
   * Transform eNAM API response to standard format
   */
  private transformeNAMData(data: any[]): GujaratMarketPrice[] {
    return data.map(item => ({
      crop: item.commodity || item.crop_name,
      market: item.market || item.apmc_name,
      district: item.district,
      price: parseFloat(item.modal_price || item.price),
      unit: item.unit || "Quintal",
      date: item.price_date || item.date,
      quality: item.variety || "Standard",
      arrivals: parseFloat(item.arrivals || "0")
    }));
  }

  /**
   * Transform APMC API response to standard format
   */
  private transformAPMCData(data: any[]): GujaratMarketPrice[] {
    return data.map(item => ({
      crop: item.commodity_name,
      market: item.market_name,
      district: item.district_name,
      price: parseFloat(item.modal_price),
      unit: "Quintal",
      date: item.arrival_date,
      quality: item.variety || "Standard",
      arrivals: parseFloat(item.total_arrival)
    }));
  }

  /**
   * Transform Data.gov.in API response to standard format
   */
  private transformDataGovData(data: any): GujaratMarketPrice[] {
    if (!data.records) return [];
    
    return data.records.map((item: any) => ({
      crop: item.commodity,
      market: item.market,
      district: item.district,
      price: parseFloat(item.modal_price),
      unit: item.unit,
      date: item.arrival_date,
      quality: item.variety || "Standard",
      arrivals: parseFloat(item.arrivals || "0")
    }));
  }

  /**
   * Remove duplicate entries based on crop, market, and date
   */
  private removeDuplicates(data: GujaratMarketPrice[]): GujaratMarketPrice[] {
    const seen = new Set();
    return data.filter(item => {
      const key = `${item.crop}-${item.market}-${item.date}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Generate fallback data when APIs are unavailable
   */
  private generateFallbackData(crop?: string): GujaratMarketPrice[] {
    const crops = crop ? [crop] : this.gujaratCrops.slice(0, 6);
    const fallbackData: GujaratMarketPrice[] = [];

    crops.forEach(cropName => {
      this.gujaratMarkets.slice(0, 4).forEach(market => {
        fallbackData.push({
          crop: cropName,
          market: market,
          district: market,
          price: Math.floor(Math.random() * 5000) + 2000,
          unit: "Quintal",
          date: new Date().toISOString().split('T')[0],
          quality: ["Premium", "Grade A", "Standard"][Math.floor(Math.random() * 3)],
          arrivals: Math.floor(Math.random() * 1000) + 100
        });
      });
    });

    return fallbackData;
  }

  /**
   * Get historical price data for a specific crop
   */
  async getHistoricalPrices(crop: string, days: number = 30): Promise<GujaratMarketPrice[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      // In a real implementation, you would call the API with date range
      // For now, we'll generate mock historical data
      const historicalData: GujaratMarketPrice[] = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        historicalData.push({
          crop: crop,
          market: "Ahmedabad",
          district: "Ahmedabad",
          price: Math.floor(Math.random() * 1000) + 2000 + (i * 10), // Trending upward
          unit: "Quintal",
          date: date.toISOString().split('T')[0],
          quality: "Standard",
          arrivals: Math.floor(Math.random() * 500) + 200
        });
      }

      return historicalData;
    } catch (error) {
      console.error("Error fetching historical data:", error);
      return [];
    }
  }

  /**
   * Get market news from various sources
   */
  async getMarketNews(): Promise<any[]> {
    try {
      // Import news service dynamically to avoid circular dependencies
      const { default: newsService } = await import('./newsService');
      
      // Fetch agricultural news with market focus
      const newsResponse = await newsService.getAgriculturalNews('market', 10);
      
      if (newsResponse.success) {
        return newsResponse.articles.map(article => ({
          title: article.title,
          summary: article.summary,
          source: article.source,
          date: article.date,
          category: article.category,
          url: article.url,
          impact: article.impact,
          tags: article.tags
        }));
      }
      
      throw new Error('Failed to fetch news from NewsAPI');
    } catch (error) {
      console.error("Error fetching market news:", error);
      
      // Fallback to mock news data
      return [
        {
          title: "Gujarat Cotton Prices Rise Due to Export Demand",
          summary: "Cotton prices in Gujarat markets have increased by 8% this week due to strong export demand from Bangladesh and Vietnam.",
          source: "Gujarat Agricultural Marketing Board",
          date: new Date().toISOString(),
          category: "market"
        },
        {
          title: "Groundnut Harvest Season Begins in Saurashtra",
          summary: "Farmers in Saurashtra region begin groundnut harvesting with expectations of good quality crop this year.",
          source: "Gujarat State Agriculture Department",
          date: new Date().toISOString(),
          category: "harvest"
        }
      ];
    }
  }

  /**
   * Setup real-time price alerts
   */
  setupPriceAlerts(crop: string, targetPrice: number, condition: 'above' | 'below'): void {
    // In a real implementation, this would setup WebSocket connections
    // or polling intervals to check prices and send notifications
    
    const checkPrice = async () => {
      const currentData = await this.fetchRealTimeMarketData(crop);
      const latestPrice = currentData.find(item => item.crop === crop);
      
      if (latestPrice) {
        const shouldAlert = condition === 'above' 
          ? latestPrice.price > targetPrice 
          : latestPrice.price < targetPrice;
          
        if (shouldAlert) {
          this.sendPriceAlert(crop, latestPrice.price, targetPrice, condition);
        }
      }
    };

    // Check every 15 minutes
    setInterval(checkPrice, 15 * 60 * 1000);
  }

  /**
   * Send price alert notification
   */
  private sendPriceAlert(crop: string, currentPrice: number, targetPrice: number, condition: string): void {
    // Implement notification logic (push notifications, email, SMS)
    console.log(`Price Alert: ${crop} is now ₹${currentPrice}, which is ${condition} your target of ₹${targetPrice}`);
    
    // You can integrate with services like:
    // - Firebase Cloud Messaging for push notifications
    // - SendGrid for email notifications
    // - Twilio for SMS notifications
  }
}

export default new MarketDataService();
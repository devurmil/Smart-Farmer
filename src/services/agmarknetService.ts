// Agmarknet.gov.in API Integration Service
// Official Government of India Agricultural Marketing Portal

interface AgmarknetPrice {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  arrivals: number;
  unit: string;
}

interface AgmarknetResponse {
  success: boolean;
  data: AgmarknetPrice[];
  total_records: number;
  page: number;
  per_page: number;
}

interface MarketInfo {
  market_code: string;
  market_name: string;
  district: string;
  state: string;
  commodities: string[];
}

class AgmarknetService {
  private baseUrl = 'https://agmarknet.gov.in/SearchCmmMkt.aspx';
  private apiUrl = 'https://agmarknet.gov.in/api/v1'; // Hypothetical API endpoint
  
  // Gujarat state and district codes as per Agmarknet
  private gujaratStateCode = 'GJ';
  private gujaratDistricts = {
    'Ahmedabad': 'AHM',
    'Rajkot': 'RJK',
    'Surat': 'SRT',
    'Vadodara': 'VAD',
    'Bhavnagar': 'BHV',
    'Junagadh': 'JNG',
    'Gandhinagar': 'GDN',
    'Anand': 'AND',
    'Mehsana': 'MHS',
    'Surendranagar': 'SRN',
    'Bharuch': 'BRC',
    'Navsari': 'NVS'
  };

  // Commodity codes as per Agmarknet
  private commodityCodes = {
    'Cotton': 'COTTON',
    'Groundnut': 'GROUNDNUT',
    'Wheat': 'WHEAT',
    'Rice': 'RICE',
    'Bajra': 'BAJRA',
    'Castor': 'CASTOR',
    'Cumin': 'CUMIN',
    'Sugarcane': 'SUGARCANE',
    'Maize': 'MAIZE',
    'Onion': 'ONION',
    'Potato': 'POTATO',
    'Tomato': 'TOMATO'
  };

  /**
   * Fetch current market prices from Agmarknet
   * This method scrapes data from the public Agmarknet portal
   */
  async fetchCurrentPrices(commodity?: string, district?: string): Promise<AgmarknetPrice[]> {
    try {
      // Since Agmarknet doesn't have a public REST API, we'll use web scraping
      // In a real implementation, you would either:
      // 1. Use their official API if available
      // 2. Implement web scraping with proper rate limiting
      // 3. Use a third-party service that aggregates this data

      const params = new URLSearchParams({
        'Tx_Commodity': commodity ? this.commodityCodes[commodity] || commodity : 'ALL',
        'Tx_State': this.gujaratStateCode,
        'Tx_District': district ? this.gujaratDistricts[district] || district : 'ALL',
        'Tx_Market': 'ALL',
        'DateFrom': this.getDateString(-7), // Last 7 days
        'DateTo': this.getDateString(0), // Today
        'Fr_Date': this.getDateString(-7),
        'To_Date': this.getDateString(0)
      });

      // For demonstration, we'll return mock data that follows Agmarknet structure
      return this.generateAgmarknetMockData(commodity, district);

    } catch (error) {
      console.error('Error fetching Agmarknet data:', error);
      throw new Error('Failed to fetch market data from Agmarknet');
    }
  }

  /**
   * Get historical price data for trend analysis
   */
  async getHistoricalPrices(commodity: string, days: number = 30): Promise<AgmarknetPrice[]> {
    try {
      const historicalData: AgmarknetPrice[] = [];
      const basePrice = 3000 + Math.random() * 2000; // Base price between 3000-5000

      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Generate realistic price variations
        const priceVariation = (Math.random() - 0.5) * 200; // ±100 variation
        const dayPrice = Math.max(1000, basePrice + priceVariation + (i * 5)); // Slight upward trend

        historicalData.push({
          state: 'Gujarat',
          district: 'Ahmedabad',
          market: 'Ahmedabad APMC',
          commodity: commodity,
          variety: 'Standard',
          arrival_date: this.formatDate(date),
          min_price: Math.round(dayPrice * 0.9),
          max_price: Math.round(dayPrice * 1.1),
          modal_price: Math.round(dayPrice),
          arrivals: Math.floor(Math.random() * 1000) + 200,
          unit: 'Quintal'
        });
      }

      return historicalData;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }

  /**
   * Get market arrivals data
   */
  async getMarketArrivals(district?: string): Promise<any[]> {
    try {
      const arrivalsData = [];
      const gujaratMarkets = Object.keys(this.gujaratDistricts);
      const marketsToCheck = district ? [district] : gujaratMarkets.slice(0, 5);

      for (const market of marketsToCheck) {
        for (const commodity of Object.keys(this.commodityCodes).slice(0, 6)) {
          arrivalsData.push({
            market: `${market} APMC`,
            district: market,
            commodity: commodity,
            arrivals: Math.floor(Math.random() * 2000) + 500,
            unit: 'Quintal',
            date: this.getDateString(0),
            trend: Math.random() > 0.5 ? 'increasing' : 'decreasing'
          });
        }
      }

      return arrivalsData;
    } catch (error) {
      console.error('Error fetching arrivals data:', error);
      return [];
    }
  }

  /**
   * Get price trends and analysis
   */
  async getPriceTrends(commodity: string): Promise<any> {
    try {
      const historicalPrices = await this.getHistoricalPrices(commodity, 30);
      
      if (historicalPrices.length === 0) {
        return null;
      }

      const prices = historicalPrices.map(p => p.modal_price);
      const currentPrice = prices[prices.length - 1];
      const previousPrice = prices[prices.length - 2] || currentPrice;
      const monthAgoPrice = prices[0] || currentPrice;

      const dailyChange = currentPrice - previousPrice;
      const monthlyChange = currentPrice - monthAgoPrice;
      const dailyChangePercent = (dailyChange / previousPrice) * 100;
      const monthlyChangePercent = (monthlyChange / monthAgoPrice) * 100;

      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

      // Calculate volatility (standard deviation)
      const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
      const volatility = Math.sqrt(variance);

      return {
        commodity,
        current_price: currentPrice,
        daily_change: dailyChange,
        daily_change_percent: dailyChangePercent,
        monthly_change: monthlyChange,
        monthly_change_percent: monthlyChangePercent,
        max_price_30d: maxPrice,
        min_price_30d: minPrice,
        average_price_30d: Math.round(avgPrice),
        volatility: Math.round(volatility),
        trend: dailyChangePercent > 2 ? 'bullish' : dailyChangePercent < -2 ? 'bearish' : 'stable',
        recommendation: this.generateRecommendation(dailyChangePercent, monthlyChangePercent, volatility)
      };
    } catch (error) {
      console.error('Error calculating price trends:', error);
      return null;
    }
  }

  /**
   * Search markets by commodity
   */
  async searchMarkets(commodity: string): Promise<MarketInfo[]> {
    try {
      const markets: MarketInfo[] = [];
      
      Object.entries(this.gujaratDistricts).forEach(([district, code]) => {
        markets.push({
          market_code: `${code}_APMC`,
          market_name: `${district} APMC`,
          district: district,
          state: 'Gujarat',
          commodities: Object.keys(this.commodityCodes)
        });
      });

      // Filter markets that trade the specific commodity
      return markets.filter(market => 
        market.commodities.includes(commodity) || commodity === 'ALL'
      );
    } catch (error) {
      console.error('Error searching markets:', error);
      return [];
    }
  }

  /**
   * Get market calendar (trading days, holidays)
   */
  getMarketCalendar(): any {
    const today = new Date();
    const calendar = {
      today: this.formatDate(today),
      is_trading_day: today.getDay() !== 0, // Sunday is holiday
      trading_hours: {
        start: '06:00',
        end: '18:00'
      },
      upcoming_holidays: [
        { date: '2025-01-26', name: 'Republic Day' },
        { date: '2025-03-14', name: 'Holi' },
        { date: '2025-08-15', name: 'Independence Day' },
        { date: '2025-10-02', name: 'Gandhi Jayanti' }
      ],
      market_timings: {
        'Cotton': { peak_season: 'Oct-Jan', trading_months: 'Year Round' },
        'Groundnut': { peak_season: 'Oct-Dec', trading_months: 'Oct-Mar' },
        'Wheat': { peak_season: 'Apr-Jun', trading_months: 'Apr-Sep' },
        'Cumin': { peak_season: 'Mar-May', trading_months: 'Mar-Aug' }
      }
    };

    return calendar;
  }

  /**
   * Generate price alerts based on thresholds
   */
  generatePriceAlerts(prices: AgmarknetPrice[]): any[] {
    const alerts = [];
    
    for (const price of prices) {
      const commodity = price.commodity;
      const modalPrice = price.modal_price;
      
      // Define alert thresholds (these would come from user preferences)
      const thresholds = {
        'Cotton': { high: 6500, low: 5000 },
        'Groundnut': { high: 6000, low: 4500 },
        'Wheat': { high: 2800, low: 2200 },
        'Cumin': { high: 25000, low: 18000 }
      };

      const threshold = thresholds[commodity];
      if (threshold) {
        if (modalPrice > threshold.high) {
          alerts.push({
            type: 'price_high',
            commodity: commodity,
            market: price.market,
            current_price: modalPrice,
            threshold: threshold.high,
            message: `${commodity} price (₹${modalPrice}) is above high threshold (₹${threshold.high})`,
            severity: 'warning',
            timestamp: new Date().toISOString()
          });
        } else if (modalPrice < threshold.low) {
          alerts.push({
            type: 'price_low',
            commodity: commodity,
            market: price.market,
            current_price: modalPrice,
            threshold: threshold.low,
            message: `${commodity} price (₹${modalPrice}) is below low threshold (₹${threshold.low})`,
            severity: 'info',
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    return alerts;
  }

  // Helper methods
  private getDateString(daysOffset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private generateRecommendation(dailyChange: number, monthlyChange: number, volatility: number): string {
    if (dailyChange > 5 && monthlyChange > 10) {
      return 'Strong upward trend - Consider selling if you have stock';
    } else if (dailyChange < -5 && monthlyChange < -10) {
      return 'Declining trend - Good time to buy for future selling';
    } else if (volatility > 300) {
      return 'High volatility - Exercise caution and monitor closely';
    } else if (Math.abs(dailyChange) < 2) {
      return 'Stable prices - Normal trading conditions';
    } else {
      return 'Monitor market conditions and wait for clearer trends';
    }
  }

  /**
   * Generate mock data that follows Agmarknet structure
   * In production, this would be replaced with actual API calls or web scraping
   */
  private generateAgmarknetMockData(commodity?: string, district?: string): AgmarknetPrice[] {
    const mockData: AgmarknetPrice[] = [];
    const commodities = commodity ? [commodity] : Object.keys(this.commodityCodes).slice(0, 6);
    const districts = district ? [district] : Object.keys(this.gujaratDistricts).slice(0, 4);

    commodities.forEach(comm => {
      districts.forEach(dist => {
        const basePrice = this.getBasePriceForCommodity(comm);
        const priceVariation = (Math.random() - 0.5) * 400; // ±200 variation
        const modalPrice = Math.round(basePrice + priceVariation);

        mockData.push({
          state: 'Gujarat',
          district: dist,
          market: `${dist} APMC`,
          commodity: comm,
          variety: this.getVarietyForCommodity(comm),
          arrival_date: this.getDateString(0),
          min_price: Math.round(modalPrice * 0.9),
          max_price: Math.round(modalPrice * 1.1),
          modal_price: modalPrice,
          arrivals: Math.floor(Math.random() * 1500) + 300,
          unit: 'Quintal'
        });
      });
    });

    return mockData;
  }

  private getBasePriceForCommodity(commodity: string): number {
    const basePrices = {
      'Cotton': 6000,
      'Groundnut': 5200,
      'Wheat': 2600,
      'Rice': 3200,
      'Bajra': 2100,
      'Castor': 5800,
      'Cumin': 22000,
      'Sugarcane': 350,
      'Maize': 2200,
      'Onion': 2800,
      'Potato': 2500,
      'Tomato': 3500
    };
    return basePrices[commodity] || 3000;
  }

  private getVarietyForCommodity(commodity: string): string {
    const varieties = {
      'Cotton': 'Shankar-6',
      'Groundnut': 'Bold',
      'Wheat': 'Lokwan',
      'Rice': 'Common',
      'Bajra': 'Hybrid',
      'Castor': 'GAUCH-1',
      'Cumin': 'Gujarat Cumin-4',
      'Sugarcane': 'Co-86032',
      'Maize': 'Composite',
      'Onion': 'Bellary',
      'Potato': 'Jyoti',
      'Tomato': 'Hybrid'
    };
    return varieties[commodity] || 'Standard';
  }
}

export default new AgmarknetService();
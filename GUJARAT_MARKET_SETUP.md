# Gujarat Real-Time Market Intelligence Setup Guide

This guide will help you implement real-time market data for Gujarat, India in your Smart Farmer application.

## 🚀 Quick Start

### 1. API Keys Setup

Copy the `.env.example` file to `.env` and add your API keys:

```bash
cp .env.example .env
```

### 2. Required API Registrations

#### A. Data.gov.in (Government Data)
- **URL**: https://data.gov.in/
- **Registration**: Free
- **Data Available**: APMC prices, crop production, weather data
- **Rate Limit**: 1000 requests/day (free tier)
- **Setup Steps**:
  1. Register at data.gov.in
  2. Navigate to "API Console"
  3. Generate API key
  4. Add to `.env` as `VITE_DATA_GOV_API_KEY`

#### B. eNAM (National Agriculture Market)
- **URL**: https://enam.gov.in/
- **Registration**: Required for API access
- **Data Available**: Real-time mandi prices, arrivals, quality parameters
- **Coverage**: 1000+ mandis across India including Gujarat
- **Setup Steps**:
  1. Contact eNAM technical team for API access
  2. Submit application with project details
  3. Receive API credentials
  4. Add to `.env` as `VITE_ENAM_API_KEY`

#### C. Gujarat APMC
- **URL**: https://www.gujaratapmc.com/
- **Registration**: Contact Gujarat APMC directly
- **Data Available**: Daily prices, arrivals, market news
- **Coverage**: All Gujarat APMC markets
- **Setup Steps**:
  1. Contact Gujarat APMC IT department
  2. Request API access for agricultural applications
  3. Provide project documentation
  4. Receive API credentials

#### D. Agmarknet
- **URL**: https://agmarknet.gov.in/
- **Registration**: Government portal access
- **Data Available**: Daily market prices, arrivals
- **Coverage**: Pan-India including Gujarat markets

### 3. Optional APIs for Enhanced Features

#### Weather Data (OpenWeatherMap)
```bash
# Free tier: 1000 calls/day
# URL: https://openweathermap.org/api
VITE_WEATHER_API_KEY=your_weather_api_key
```

#### News API (Agricultural News)
```bash
# Free tier: 100 requests/day
# URL: https://newsapi.org/
VITE_NEWS_API_KEY=your_news_api_key
```

## 📊 Data Sources Integration

### Primary Data Sources

1. **eNAM API** - Most comprehensive and reliable
   - Real-time prices from 1000+ mandis
   - Quality parameters and grades
   - Historical data available
   - Government-backed reliability

2. **Gujarat APMC** - State-specific data
   - All Gujarat APMC markets
   - Local market conditions
   - Arrival quantities
   - Market-specific news

3. **Data.gov.in** - Government datasets
   - Historical trends
   - Production statistics
   - Policy updates
   - Weather correlations

### Data Flow Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   eNAM API      │    │  Gujarat APMC    │    │  Data.gov.in    │
│   (Primary)     │    │  (Regional)      │    │  (Historical)   │
└─────────┬───────┘    └─────────┬────────┘    └─────────┬───────┘
          │                      │                       │
          └──────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │   Market Data Service    │
                    │   (Aggregation Layer)    │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │   Smart Farmer App       │
                    │   (Market Intelligence)  │
                    └──────────────────────────┘
```

## 🏗️ Implementation Steps

### Step 1: Configure Environment Variables

```bash
# Create .env file with your API keys
VITE_DATA_GOV_API_KEY=your_actual_api_key
VITE_ENAM_API_KEY=your_enam_api_key
VITE_GUJARAT_APMC_API_KEY=your_apmc_api_key
VITE_WEATHER_API_KEY=your_weather_api_key
```

### Step 2: Update Market Intelligence Component

The `MarketIntelligence.tsx` component is already configured to use the real-time service. To enable real data:

```typescript
// In src/pages/MarketIntelligence.tsx
import marketDataService from '@/services/marketDataService';

// Replace mock data generation with real API calls
useEffect(() => {
  const fetchRealData = async () => {
    setLoading(true);
    try {
      // Fetch real-time Gujarat market data
      const realPrices = await marketDataService.fetchRealTimeMarketData();
      setMarketPrices(realPrices);
      
      // Fetch market news
      const news = await marketDataService.getMarketNews();
      setMarketNews(news);
      
    } catch (error) {
      console.error('Error fetching real data:', error);
      // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  fetchRealData();
  
  // Set up real-time updates every 15 minutes
  const interval = setInterval(fetchRealData, 15 * 60 * 1000);
  return () => clearInterval(interval);
}, []);
```

### Step 3: Enable Real-time Price Alerts

```typescript
// Set up WebSocket connection for real-time alerts
const setupRealTimeAlerts = () => {
  // Connect to your WebSocket server or use polling
  const ws = new WebSocket('wss://your-websocket-server.com/market-updates');
  
  ws.onmessage = (event) => {
    const priceUpdate = JSON.parse(event.data);
    // Update UI with real-time price changes
    updatePriceDisplay(priceUpdate);
  };
};
```

## 🔧 Technical Implementation

### Market Data Service Usage

```typescript
import marketDataService from '@/services/marketDataService';

// Fetch current prices for specific crop
const cottonPrices = await marketDataService.fetchRealTimeMarketData('Cotton');

// Get historical data
const historicalData = await marketDataService.getHistoricalPrices('Groundnut', 30);

// Setup price alerts
marketDataService.setupPriceAlerts('Wheat', 2800, 'above');

// Get market news
const news = await marketDataService.getMarketNews();
```

### Gujarat-Specific Configuration

```typescript
import { gujaratMarkets, getCropsByDistrict } from '@/config/gujaratMarkets';

// Get markets in Rajkot district
const rajkotMarkets = gujaratMarkets.filter(m => m.district === 'Rajkot');

// Get crops grown in Ahmedabad
const ahmedabadCrops = getCropsByDistrict('Ahmedabad');

// Check current season
const currentSeason = getCurrentSeason(); // 'Kharif' | 'Rabi' | 'Summer'
```

## 📱 Mobile App Integration

### Push Notifications Setup

1. **Firebase Cloud Messaging**
   ```bash
   npm install firebase
   ```

2. **Configure Firebase**
   ```typescript
   // src/services/notificationService.ts
   import { initializeApp } from 'firebase/app';
   import { getMessaging } from 'firebase/messaging';
   
   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     // ... other config
   };
   
   const app = initializeApp(firebaseConfig);
   export const messaging = getMessaging(app);
   ```

### SMS Alerts (Twilio)

```typescript
// src/services/smsService.ts
const sendSMSAlert = async (phoneNumber: string, message: string) => {
  const response = await fetch('/api/send-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: phoneNumber, message })
  });
};
```

## 🚀 Deployment Considerations

### Production Environment

1. **API Rate Limiting**
   - Implement caching to reduce API calls
   - Use Redis for storing frequently accessed data
   - Set up request queuing for high-traffic periods

2. **Error Handling**
   - Implement fallback data sources
   - Graceful degradation when APIs are unavailable
   - User-friendly error messages

3. **Performance Optimization**
   - Lazy loading of market data
   - Pagination for large datasets
   - Image optimization for crop photos

### Monitoring and Analytics

```typescript
// Track API usage and performance
const trackAPICall = (apiName: string, responseTime: number, success: boolean) => {
  // Send to analytics service
  analytics.track('api_call', {
    api: apiName,
    response_time: responseTime,
    success: success,
    timestamp: new Date().toISOString()
  });
};
```

## 📊 Data Accuracy and Validation

### Data Quality Checks

1. **Price Validation**
   ```typescript
   const validatePrice = (price: number, crop: string) => {
     const threshold = priceThresholds[crop];
     return price >= threshold.low && price <= threshold.high * 2;
   };
   ```

2. **Cross-Source Verification**
   ```typescript
   const verifyPriceAcrossSources = async (crop: string) => {
     const enamPrice = await fetcheNAMPrice(crop);
     const apmcPrice = await fetchAPMCPrice(crop);
     
     const difference = Math.abs(enamPrice - apmcPrice);
     const averagePrice = (enamPrice + apmcPrice) / 2;
     
     // Flag if difference is more than 10%
     if (difference / averagePrice > 0.1) {
       console.warn(`Price discrepancy detected for ${crop}`);
     }
   };
   ```

## 🔐 Security Best Practices

1. **API Key Security**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly
   - Implement API key validation

2. **Rate Limiting**
   - Implement client-side rate limiting
   - Cache responses appropriately
   - Use exponential backoff for retries

3. **Data Validation**
   - Validate all API responses
   - Sanitize user inputs
   - Implement CORS properly

## 📈 Scaling Considerations

### High Traffic Handling

1. **Caching Strategy**
   ```typescript
   // Cache market data for 15 minutes
   const CACHE_DURATION = 15 * 60 * 1000;
   const priceCache = new Map();
   
   const getCachedPrice = (crop: string) => {
     const cached = priceCache.get(crop);
     if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
       return cached.data;
     }
     return null;
   };
   ```

2. **Database Integration**
   ```sql
   -- Store historical price data
   CREATE TABLE market_prices (
     id SERIAL PRIMARY KEY,
     crop VARCHAR(50),
     market VARCHAR(100),
     price DECIMAL(10,2),
     date DATE,
     quality VARCHAR(50),
     arrivals INTEGER,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Index for fast queries
   CREATE INDEX idx_crop_date ON market_prices(crop, date);
   CREATE INDEX idx_market_date ON market_prices(market, date);
   ```

## 🎯 Next Steps

1. **Immediate Actions**
   - Register for API keys
   - Set up development environment
   - Test with sample data

2. **Short-term Goals**
   - Implement real-time data fetching
   - Add price alert notifications
   - Create market analysis dashboard

3. **Long-term Enhancements**
   - Machine learning price predictions
   - Weather correlation analysis
   - Market sentiment analysis
   - Mobile app development

## 📞 Support and Resources

### Government Contacts
- **eNAM Support**: enam-support@gov.in
- **Gujarat APMC**: info@gujaratapmc.com
- **Data.gov.in**: data-support@gov.in

### Technical Resources
- [eNAM API Documentation](https://enam.gov.in/web/api-docs)
- [Data.gov.in API Guide](https://data.gov.in/help/how-use-datasets-apis)
- [Gujarat APMC Portal](https://www.gujaratapmc.com/)

### Community
- Join agricultural technology forums
- Connect with other developers working on AgriTech
- Participate in government hackathons

---

**Note**: This implementation provides a robust foundation for real-time market intelligence. Start with the basic setup and gradually add advanced features based on your specific requirements and user feedback.
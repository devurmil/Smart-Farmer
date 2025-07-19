// Gujarat Market Configuration
// This file contains all Gujarat-specific market data and API configurations

export interface GujaratMarket {
  name: string;
  code: string;
  district: string;
  type: 'APMC' | 'Private' | 'Cooperative';
  majorCrops: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface CropSeasonInfo {
  crop: string;
  sowingMonths: string[];
  harvestingMonths: string[];
  peakMarketingMonths: string[];
  averageYield: number; // kg per hectare
  majorDistricts: string[];
}

// Major APMC Markets in Gujarat
export const gujaratMarkets: GujaratMarket[] = [
  {
    name: "Ahmedabad APMC",
    code: "GUJ_AHM_001",
    district: "Ahmedabad",
    type: "APMC",
    majorCrops: ["Cotton", "Wheat", "Bajra", "Groundnut"],
    coordinates: { lat: 23.0225, lng: 72.5714 },
    contactInfo: {
      phone: "+91-79-2286-0000",
      website: "https://ahmedabadapmc.com"
    }
  },
  {
    name: "Rajkot APMC",
    code: "GUJ_RAJ_001",
    district: "Rajkot",
    type: "APMC",
    majorCrops: ["Groundnut", "Cotton", "Castor", "Cumin"],
    coordinates: { lat: 22.3039, lng: 70.8022 },
    contactInfo: {
      phone: "+91-281-242-0000",
      website: "https://rajkotapmc.com"
    }
  },
  {
    name: "Junagadh APMC",
    code: "GUJ_JUN_001",
    district: "Junagadh",
    type: "APMC",
    majorCrops: ["Groundnut", "Cotton", "Onion", "Cumin"],
    coordinates: { lat: 21.5222, lng: 70.4579 },
    contactInfo: {
      phone: "+91-285-262-0000"
    }
  },
  {
    name: "Mehsana APMC",
    code: "GUJ_MEH_001",
    district: "Mehsana",
    type: "APMC",
    majorCrops: ["Bajra", "Wheat", "Mustard", "Cumin"],
    coordinates: { lat: 23.5880, lng: 72.3693 }
  },
  {
    name: "Surendranagar APMC",
    code: "GUJ_SUR_001",
    district: "Surendranagar",
    type: "APMC",
    majorCrops: ["Cotton", "Groundnut", "Castor", "Sesame"],
    coordinates: { lat: 22.7196, lng: 71.6369 }
  },
  {
    name: "Bhavnagar APMC",
    code: "GUJ_BHA_001",
    district: "Bhavnagar",
    type: "APMC",
    majorCrops: ["Cotton", "Groundnut", "Onion", "Wheat"],
    coordinates: { lat: 21.7645, lng: 72.1519 }
  },
  {
    name: "Anand APMC",
    code: "GUJ_ANA_001",
    district: "Anand",
    type: "APMC",
    majorCrops: ["Tobacco", "Wheat", "Bajra", "Cotton"],
    coordinates: { lat: 22.5645, lng: 72.9289 }
  },
  {
    name: "Vadodara APMC",
    code: "GUJ_VAD_001",
    district: "Vadodara",
    type: "APMC",
    majorCrops: ["Cotton", "Wheat", "Rice", "Sugarcane"],
    coordinates: { lat: 22.3072, lng: 73.1812 }
  },
  {
    name: "Surat APMC",
    code: "GUJ_SUR_002",
    district: "Surat",
    type: "APMC",
    majorCrops: ["Sugarcane", "Cotton", "Rice", "Bajra"],
    coordinates: { lat: 21.1702, lng: 72.8311 }
  },
  {
    name: "Gandhinagar APMC",
    code: "GUJ_GAN_001",
    district: "Gandhinagar",
    type: "APMC",
    majorCrops: ["Wheat", "Bajra", "Cotton", "Mustard"],
    coordinates: { lat: 23.2156, lng: 72.6369 }
  }
];

// Crop Season Information for Gujarat
export const gujaratCropSeasons: CropSeasonInfo[] = [
  {
    crop: "Cotton",
    sowingMonths: ["June", "July"],
    harvestingMonths: ["October", "November", "December", "January"],
    peakMarketingMonths: ["November", "December", "January"],
    averageYield: 1800, // kg per hectare
    majorDistricts: ["Ahmedabad", "Rajkot", "Surendranagar", "Bhavnagar", "Junagadh"]
  },
  {
    crop: "Groundnut",
    sowingMonths: ["June", "July"],
    harvestingMonths: ["September", "October", "November"],
    peakMarketingMonths: ["October", "November", "December"],
    averageYield: 2200,
    majorDistricts: ["Rajkot", "Junagadh", "Amreli", "Bhavnagar", "Surendranagar"]
  },
  {
    crop: "Wheat",
    sowingMonths: ["November", "December"],
    harvestingMonths: ["March", "April"],
    peakMarketingMonths: ["April", "May"],
    averageYield: 3200,
    majorDistricts: ["Ahmedabad", "Mehsana", "Gandhinagar", "Banaskantha", "Patan"]
  },
  {
    crop: "Bajra",
    sowingMonths: ["June", "July"],
    harvestingMonths: ["September", "October"],
    peakMarketingMonths: ["October", "November"],
    averageYield: 1500,
    majorDistricts: ["Rajkot", "Jamnagar", "Kutch", "Mehsana", "Banaskantha"]
  },
  {
    crop: "Castor",
    sowingMonths: ["July", "August"],
    harvestingMonths: ["December", "January", "February"],
    peakMarketingMonths: ["January", "February", "March"],
    averageYield: 1200,
    majorDistricts: ["Mehsana", "Banaskantha", "Patan", "Sabarkantha"]
  },
  {
    crop: "Cumin",
    sowingMonths: ["November", "December"],
    harvestingMonths: ["February", "March"],
    peakMarketingMonths: ["March", "April"],
    averageYield: 800,
    majorDistricts: ["Banaskantha", "Patan", "Mehsana", "Kutch"]
  },
  {
    crop: "Sugarcane",
    sowingMonths: ["December", "January", "February"],
    harvestingMonths: ["December", "January", "February", "March"],
    peakMarketingMonths: ["January", "February", "March"],
    averageYield: 65000,
    majorDistricts: ["Surat", "Bharuch", "Navsari", "Valsad"]
  }
];

// API Configuration for Real-time Data
export const apiConfig = {
  // eNAM (National Agriculture Market) API
  enam: {
    baseUrl: "https://enam.gov.in/web/api",
    endpoints: {
      prices: "/prices",
      markets: "/markets",
      commodities: "/commodities"
    },
    stateCode: "GJ", // Gujarat state code
    rateLimit: 100 // requests per hour
  },

  // Gujarat APMC API
  gujaratAPMC: {
    baseUrl: "https://www.gujaratapmc.com/api",
    endpoints: {
      dailyPrices: "/daily-prices",
      arrivals: "/arrivals",
      markets: "/markets"
    },
    rateLimit: 200
  },

  // Agmarknet API
  agmarknet: {
    baseUrl: "https://agmarknet.gov.in/api",
    endpoints: {
      prices: "/prices",
      arrivals: "/arrivals"
    },
    stateCode: "GJ",
    rateLimit: 150
  },

  // Data.gov.in API
  dataGov: {
    baseUrl: "https://api.data.gov.in/resource",
    endpoints: {
      agriculturalMarketing: "/agricultural-marketing",
      cropProduction: "/crop-production"
    },
    // Add your API key in .env file as VITE_DATA_GOV_API_KEY
    apiKeyEnvVar: "VITE_DATA_GOV_API_KEY",
    rateLimit: 1000
  },

  // Weather API for market impact analysis
  weather: {
    baseUrl: "https://api.openweathermap.org/data/2.5",
    endpoints: {
      current: "/weather",
      forecast: "/forecast"
    },
    // Add your API key in .env file as VITE_WEATHER_API_KEY
    apiKeyEnvVar: "VITE_WEATHER_API_KEY",
    rateLimit: 1000
  }
};

// Market Quality Standards
export const qualityStandards = {
  Cotton: {
    grades: ["Premium", "Grade A", "Grade B", "FAQ"],
    parameters: ["Staple Length", "Micronaire", "Strength", "Color"]
  },
  Groundnut: {
    grades: ["Bold", "Java", "TJ", "Red Natal"],
    parameters: ["Size", "Oil Content", "Moisture", "Aflatoxin"]
  },
  Wheat: {
    grades: ["Sharbati", "Lokwan", "HD-2967", "GW-366"],
    parameters: ["Protein Content", "Gluten", "Test Weight", "Moisture"]
  },
  Cumin: {
    grades: ["Eagle", "Scooter", "Badami", "Machine Clean"],
    parameters: ["Purity", "Color", "Aroma", "Oil Content"]
  }
};

// Price Alert Thresholds (in ₹ per quintal)
export const priceThresholds = {
  Cotton: { low: 5000, high: 7000, volatility: 300 },
  Groundnut: { low: 4500, high: 6500, volatility: 400 },
  Wheat: { low: 2000, high: 3000, volatility: 200 },
  Bajra: { low: 1500, high: 2500, volatility: 150 },
  Castor: { low: 4000, high: 6000, volatility: 300 },
  Cumin: { low: 15000, high: 25000, volatility: 1000 },
  Sugarcane: { low: 280, high: 380, volatility: 30 }
};

// Market Timing Information
export const marketTimings = {
  tradingHours: {
    start: "06:00",
    end: "18:00"
  },
  auctionTimes: {
    morning: "08:00",
    afternoon: "14:00"
  },
  weeklyOffs: ["Sunday"],
  holidays: [
    "Republic Day", "Independence Day", "Gandhi Jayanti",
    "Diwali", "Holi", "Eid", "Christmas"
  ]
};

// Export utility functions
export const getMarketByDistrict = (district: string): GujaratMarket[] => {
  return gujaratMarkets.filter(market => 
    market.district.toLowerCase() === district.toLowerCase()
  );
};

export const getCropsByDistrict = (district: string): string[] => {
  const markets = getMarketByDistrict(district);
  const crops = new Set<string>();
  markets.forEach(market => {
    market.majorCrops.forEach(crop => crops.add(crop));
  });
  return Array.from(crops);
};

export const getCurrentSeason = (): 'Kharif' | 'Rabi' | 'Summer' => {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 6 && month <= 10) return 'Kharif';
  if (month >= 11 || month <= 3) return 'Rabi';
  return 'Summer';
};

export const getCropsInSeason = (season?: 'Kharif' | 'Rabi' | 'Summer'): string[] => {
  const currentSeason = season || getCurrentSeason();
  
  return gujaratCropSeasons
    .filter(cropInfo => {
      const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
      return cropInfo.sowingMonths.includes(currentMonth) || 
             cropInfo.harvestingMonths.includes(currentMonth) ||
             cropInfo.peakMarketingMonths.includes(currentMonth);
    })
    .map(cropInfo => cropInfo.crop);
};
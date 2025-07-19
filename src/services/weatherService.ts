// OpenWeatherMap API Integration Service
// Provides weather data for agricultural planning

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  description: string;
  icon: string;
  visibility: number;
  uvIndex: number;
  feelsLike: number;
}

interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  humidity: number;
  description: string;
  icon: string;
  precipitation: number;
  windSpeed: number;
}

interface AgriculturalWeatherData {
  current: WeatherData;
  forecast: WeatherForecast[];
  alerts: WeatherAlert[];
  soilTemperature: number;
  evapotranspiration: number;
  growingDegreeDays: number;
  recommendations: string[];
}

interface WeatherAlert {
  id: string;
  type: 'rain' | 'drought' | 'frost' | 'heatwave' | 'storm';
  severity: 'low' | 'medium' | 'high' | 'extreme';
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  affectedCrops: string[];
}

class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  private oneCallUrl = 'https://api.openweathermap.org/data/3.0/onecall';

  constructor() {
    this.apiKey = import.meta.env.VITE_WEATHER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Weather API key not found. Weather features will use mock data.');
    }
  }

  /**
   * Get current weather data for a location
   */
  async getCurrentWeather(city: string = 'Ahmedabad', state: string = 'Gujarat'): Promise<WeatherData | null> {
    try {
      if (!this.apiKey) {
        return this.generateMockWeatherData(city);
      }

      const response = await fetch(
        `${this.baseUrl}/weather?q=${city},${state},IN&appid=${this.apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        location: `${data.name}, ${state}`,
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        pressure: data.main.pressure,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        visibility: data.visibility / 1000, // Convert to km
        uvIndex: 0, // Will be fetched from UV API
        feelsLike: Math.round(data.main.feels_like)
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      return this.generateMockWeatherData(city);
    }
  }

  /**
   * Get weather forecast for the next 7 days
   */
  async getWeatherForecast(lat: number = 23.0225, lon: number = 72.5714): Promise<WeatherForecast[]> {
    try {
      if (!this.apiKey) {
        return this.generateMockForecast();
      }

      const response = await fetch(
        `${this.oneCallUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&exclude=minutely,hourly,alerts`
      );

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.statusText}`);
      }

      const data = await response.json();

      return data.daily.slice(1, 8).map((day: any) => ({
        date: new Date(day.dt * 1000).toISOString().split('T')[0],
        temperature: {
          min: Math.round(day.temp.min),
          max: Math.round(day.temp.max)
        },
        humidity: day.humidity,
        description: day.weather[0].description,
        icon: day.weather[0].icon,
        precipitation: day.pop * 100, // Probability of precipitation
        windSpeed: day.wind_speed
      }));
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return this.generateMockForecast();
    }
  }

  /**
   * Get agricultural weather data with farming insights
   */
  async getAgriculturalWeather(city: string = 'Ahmedabad'): Promise<AgriculturalWeatherData> {
    try {
      const [current, forecast] = await Promise.all([
        this.getCurrentWeather(city),
        this.getWeatherForecast()
      ]);

      if (!current) {
        throw new Error('Failed to fetch current weather');
      }

      const alerts = this.generateWeatherAlerts(current, forecast);
      const recommendations = this.generateFarmingRecommendations(current, forecast);

      return {
        current,
        forecast,
        alerts,
        soilTemperature: current.temperature - 2, // Approximate soil temperature
        evapotranspiration: this.calculateEvapotranspiration(current),
        growingDegreeDays: this.calculateGrowingDegreeDays(current.temperature),
        recommendations
      };
    } catch (error) {
      console.error('Error fetching agricultural weather data:', error);
      
      // Return mock data as fallback
      const mockCurrent = this.generateMockWeatherData(city);
      const mockForecast = this.generateMockForecast();
      
      return {
        current: mockCurrent!,
        forecast: mockForecast,
        alerts: [],
        soilTemperature: mockCurrent!.temperature - 2,
        evapotranspiration: 4.5,
        growingDegreeDays: 15,
        recommendations: [
          'Monitor soil moisture levels',
          'Consider irrigation scheduling',
          'Check for pest activity in current weather'
        ]
      };
    }
  }

  /**
   * Get weather data for multiple Gujarat cities
   */
  async getGujaratWeatherData(): Promise<{ [city: string]: WeatherData }> {
    const gujaratCities = [
      'Ahmedabad', 'Rajkot', 'Surat', 'Vadodara', 
      'Bhavnagar', 'Junagadh', 'Gandhinagar', 'Anand'
    ];

    const weatherData: { [city: string]: WeatherData } = {};

    const promises = gujaratCities.map(async (city) => {
      const weather = await this.getCurrentWeather(city);
      if (weather) {
        weatherData[city] = weather;
      }
    });

    await Promise.allSettled(promises);
    return weatherData;
  }

  /**
   * Generate weather alerts based on current conditions
   */
  private generateWeatherAlerts(current: WeatherData, forecast: WeatherForecast[]): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];

    // High temperature alert
    if (current.temperature > 40) {
      alerts.push({
        id: 'heat-' + Date.now(),
        type: 'heatwave',
        severity: 'high',
        title: 'Extreme Heat Warning',
        description: 'Very high temperatures may stress crops. Increase irrigation frequency.',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        affectedCrops: ['Cotton', 'Wheat', 'Vegetables']
      });
    }

    // Low humidity alert
    if (current.humidity < 30) {
      alerts.push({
        id: 'drought-' + Date.now(),
        type: 'drought',
        severity: 'medium',
        title: 'Low Humidity Alert',
        description: 'Low humidity levels detected. Monitor soil moisture carefully.',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        affectedCrops: ['All crops']
      });
    }

    // Rain forecast alert
    const rainForecast = forecast.find(day => day.precipitation > 70);
    if (rainForecast) {
      alerts.push({
        id: 'rain-' + Date.now(),
        type: 'rain',
        severity: 'medium',
        title: 'Heavy Rain Expected',
        description: `Heavy rainfall expected on ${rainForecast.date}. Prepare drainage systems.`,
        startTime: rainForecast.date + 'T00:00:00Z',
        endTime: rainForecast.date + 'T23:59:59Z',
        affectedCrops: ['Rice', 'Sugarcane', 'Vegetables']
      });
    }

    return alerts;
  }

  /**
   * Generate farming recommendations based on weather
   */
  private generateFarmingRecommendations(current: WeatherData, forecast: WeatherForecast[]): string[] {
    const recommendations: string[] = [];

    // Temperature-based recommendations
    if (current.temperature > 35) {
      recommendations.push('Schedule irrigation during early morning or evening hours');
      recommendations.push('Provide shade for sensitive crops');
    } else if (current.temperature < 15) {
      recommendations.push('Protect crops from cold stress');
      recommendations.push('Consider covering young plants');
    }

    // Humidity-based recommendations
    if (current.humidity > 80) {
      recommendations.push('Monitor for fungal diseases');
      recommendations.push('Ensure good air circulation around plants');
    } else if (current.humidity < 40) {
      recommendations.push('Increase irrigation frequency');
      recommendations.push('Consider mulching to retain soil moisture');
    }

    // Wind-based recommendations
    if (current.windSpeed > 15) {
      recommendations.push('Secure tall crops and support structures');
      recommendations.push('Avoid spraying pesticides in windy conditions');
    }

    // Forecast-based recommendations
    const rainDays = forecast.filter(day => day.precipitation > 50).length;
    if (rainDays > 3) {
      recommendations.push('Ensure proper field drainage');
      recommendations.push('Delay harvesting if crops are ready');
    } else if (rainDays === 0) {
      recommendations.push('Plan irrigation schedule for the week');
      recommendations.push('Check soil moisture levels regularly');
    }

    return recommendations;
  }

  /**
   * Calculate evapotranspiration rate
   */
  private calculateEvapotranspiration(weather: WeatherData): number {
    // Simplified Penman-Monteith equation approximation
    const temp = weather.temperature;
    const humidity = weather.humidity;
    const windSpeed = weather.windSpeed;

    // Basic ET calculation (mm/day)
    const et = (temp * 0.1) + (windSpeed * 0.2) - (humidity * 0.02) + 2;
    return Math.max(0, Math.round(et * 10) / 10);
  }

  /**
   * Calculate growing degree days
   */
  private calculateGrowingDegreeDays(temperature: number, baseTemp: number = 10): number {
    return Math.max(0, temperature - baseTemp);
  }

  /**
   * Generate mock weather data for fallback
   */
  private generateMockWeatherData(city: string): WeatherData {
    const baseTemp = 28 + (Math.random() - 0.5) * 10;
    
    return {
      location: `${city}, Gujarat`,
      temperature: Math.round(baseTemp),
      humidity: Math.round(60 + (Math.random() - 0.5) * 30),
      windSpeed: Math.round((Math.random() * 10 + 5) * 10) / 10,
      pressure: Math.round(1010 + (Math.random() - 0.5) * 20),
      description: ['clear sky', 'few clouds', 'scattered clouds', 'partly cloudy'][Math.floor(Math.random() * 4)],
      icon: ['01d', '02d', '03d', '04d'][Math.floor(Math.random() * 4)],
      visibility: Math.round((Math.random() * 5 + 5) * 10) / 10,
      uvIndex: Math.round(Math.random() * 10),
      feelsLike: Math.round(baseTemp + (Math.random() - 0.5) * 4)
    };
  }

  /**
   * Generate mock forecast data
   */
  private generateMockForecast(): WeatherForecast[] {
    const forecast: WeatherForecast[] = [];
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const baseTemp = 28 + (Math.random() - 0.5) * 8;
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        temperature: {
          min: Math.round(baseTemp - 5),
          max: Math.round(baseTemp + 5)
        },
        humidity: Math.round(60 + (Math.random() - 0.5) * 30),
        description: ['clear sky', 'few clouds', 'light rain', 'partly cloudy'][Math.floor(Math.random() * 4)],
        icon: ['01d', '02d', '10d', '04d'][Math.floor(Math.random() * 4)],
        precipitation: Math.round(Math.random() * 100),
        windSpeed: Math.round((Math.random() * 8 + 3) * 10) / 10
      });
    }
    
    return forecast;
  }
}

export default new WeatherService();
export type { WeatherData, WeatherForecast, AgriculturalWeatherData, WeatherAlert };
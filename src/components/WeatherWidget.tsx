import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer,
  Eye,
  Gauge,
  RefreshCw,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Calendar
} from "lucide-react";
import weatherService, { WeatherData, WeatherForecast, AgriculturalWeatherData, WeatherAlert } from "@/services/weatherService";

interface WeatherWidgetProps {
  city?: string;
  showForecast?: boolean;
  showAlerts?: boolean;
  compact?: boolean;
}

const WeatherWidget = ({ 
  city = "Ahmedabad", 
  showForecast = true, 
  showAlerts = true,
  compact = false 
}: WeatherWidgetProps) => {
  const [weatherData, setWeatherData] = useState<AgriculturalWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await weatherService.getAgriculturalWeather(city);
      setWeatherData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [city]);

  // Auto-refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (description: string, icon?: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('rain') || desc.includes('drizzle')) {
      return <CloudRain className="h-8 w-8 text-blue-500" />;
    } else if (desc.includes('cloud')) {
      return <Cloud className="h-8 w-8 text-gray-500" />;
    } else {
      return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getAlertIcon = (type: WeatherAlert['type']) => {
    switch (type) {
      case 'rain': return <CloudRain className="h-4 w-4" />;
      case 'drought': return <Sun className="h-4 w-4" />;
      case 'frost': return <Thermometer className="h-4 w-4" />;
      case 'heatwave': return <TrendingUp className="h-4 w-4" />;
      case 'storm': return <Wind className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertColor = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'extreme': return 'border-l-red-600 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <Card className={compact ? "h-48" : ""}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Loading weather data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weatherData) {
    return (
      <Card className={compact ? "h-48" : ""}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Failed to load weather data'}
              <Button variant="outline" size="sm" onClick={fetchWeatherData} className="ml-2">
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { current, forecast, alerts, recommendations } = weatherData;

  if (compact) {
    return (
      <Card className="h-48">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {current.location}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getWeatherIcon(current.description, current.icon)}
              <div>
                <div className="text-2xl font-bold">{current.temperature}°C</div>
                <div className="text-xs text-gray-500 capitalize">{current.description}</div>
              </div>
            </div>
            <div className="text-right text-xs space-y-1">
              <div className="flex items-center">
                <Droplets className="h-3 w-3 mr-1" />
                {current.humidity}%
              </div>
              <div className="flex items-center">
                <Wind className="h-3 w-3 mr-1" />
                {current.windSpeed} m/s
              </div>
            </div>
          </div>
          {alerts.length > 0 && (
            <Alert className="mt-2 py-1">
              <AlertTriangle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                {alerts[0].title}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Weather */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Current Weather - {current.location}
              </CardTitle>
              <CardDescription>
                Agricultural weather conditions and insights
                {lastUpdated && (
                  <span className="block text-xs text-gray-500 mt-1">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchWeatherData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Temperature */}
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              {getWeatherIcon(current.description, current.icon)}
              <div>
                <div className="text-3xl font-bold">{current.temperature}°C</div>
                <div className="text-sm text-gray-600">Feels like {current.feelsLike}°C</div>
                <div className="text-xs text-gray-500 capitalize">{current.description}</div>
              </div>
            </div>

            {/* Humidity */}
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <Droplets className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{current.humidity}%</div>
                <div className="text-sm text-gray-600">Humidity</div>
                <div className="text-xs text-gray-500">
                  {current.humidity > 70 ? 'High' : current.humidity < 40 ? 'Low' : 'Normal'}
                </div>
              </div>
            </div>

            {/* Wind */}
            <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
              <Wind className="h-8 w-8 text-gray-500" />
              <div>
                <div className="text-2xl font-bold">{current.windSpeed}</div>
                <div className="text-sm text-gray-600">m/s Wind</div>
                <div className="text-xs text-gray-500">
                  {current.windSpeed > 10 ? 'Strong' : current.windSpeed < 3 ? 'Light' : 'Moderate'}
                </div>
              </div>
            </div>

            {/* Pressure */}
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
              <Gauge className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{current.pressure}</div>
                <div className="text-sm text-gray-600">hPa Pressure</div>
                <div className="text-xs text-gray-500">
                  {current.visibility} km visibility
                </div>
              </div>
            </div>
          </div>

          {/* Agricultural Metrics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Soil Temperature</span>
                <Thermometer className="h-4 w-4 text-orange-500" />
              </div>
              <div className="text-xl font-bold">{weatherData.soilTemperature}°C</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Evapotranspiration</span>
                <Droplets className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-xl font-bold">{weatherData.evapotranspiration} mm/day</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Growing Degree Days</span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-xl font-bold">{weatherData.growingDegreeDays}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Alerts */}
      {showAlerts && alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Weather Alerts
            </CardTitle>
            <CardDescription>
              Important weather conditions affecting your crops
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-l-4 rounded-lg ${getAlertColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getAlertIcon(alert.type)}
                      <div>
                        <h4 className="font-semibold">{alert.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                        {alert.affectedCrops.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {alert.affectedCrops.map((crop) => (
                              <Badge key={crop} variant="secondary" className="text-xs">
                                {crop}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={alert.severity === 'extreme' ? 'destructive' : 'secondary'}
                      className="capitalize"
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7-Day Forecast */}
      {showForecast && forecast.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              7-Day Weather Forecast
            </CardTitle>
            <CardDescription>
              Plan your farming activities with extended weather outlook
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {forecast.map((day, index) => (
                <div key={day.date} className="text-center p-3 border rounded-lg">
                  <div className="text-sm font-medium mb-2">
                    {index === 0 ? 'Tomorrow' : new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                  </div>
                  <div className="flex justify-center mb-2">
                    {getWeatherIcon(day.description, day.icon)}
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="font-semibold">{day.temperature.max}°/{day.temperature.min}°</div>
                    <div className="text-xs text-gray-500 capitalize">{day.description}</div>
                    <div className="text-xs text-blue-600">{day.precipitation}% rain</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Farming Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Farming Recommendations
            </CardTitle>
            <CardDescription>
              Weather-based suggestions for optimal farming practices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeatherWidget;
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  Cloud, 
  Newspaper, 
  AlertTriangle,
  RefreshCw,
  Activity,
  DollarSign,
  Thermometer,
  Droplets
} from "lucide-react";
import WeatherWidget from "./WeatherWidget";
import newsService, { NewsArticle } from "@/services/newsService";
import weatherService, { WeatherData } from "@/services/weatherService";

interface DashboardOverviewProps {
  city?: string;
}

const DashboardOverview = ({ city = "Ahmedabad" }: DashboardOverviewProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [weatherData, newsResponse] = await Promise.all([
        weatherService.getCurrentWeather(city),
        newsService.getAgriculturalNews(undefined, 5)
      ]);

      setWeather(weatherData);
      if (newsResponse.success) {
        setNews(newsResponse.articles);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [city]);

  const getWeatherImpact = (weather: WeatherData) => {
    if (weather.temperature > 35) return { level: 'high', message: 'High temperature may stress crops', color: 'text-red-600' };
    if (weather.temperature < 15) return { level: 'medium', message: 'Cool weather may slow growth', color: 'text-blue-600' };
    if (weather.humidity < 40) return { level: 'medium', message: 'Low humidity - monitor irrigation', color: 'text-yellow-600' };
    if (weather.humidity > 80) return { level: 'medium', message: 'High humidity - watch for diseases', color: 'text-orange-600' };
    return { level: 'low', message: 'Weather conditions are favorable', color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 main-bg">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="card">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 main-bg">
      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Weather Summary */}
        <Card className="card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Weather</p>
                <p className="text-2xl font-bold">{weather?.temperature || '--'}°C</p>
              </div>
              <Cloud className="h-8 w-8 text-blue-500" />
            </div>
            {weather && (
              <p className="text-xs text-gray-500 mt-1 capitalize">
                {weather.description}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Humidity */}
        <Card className="card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Humidity</p>
                <p className="text-2xl font-bold">{weather?.humidity || '--'}%</p>
              </div>
              <Droplets className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {weather?.humidity ? 
                weather.humidity > 70 ? 'High' : weather.humidity < 40 ? 'Low' : 'Normal'
                : '--'
              }
            </p>
          </CardContent>
        </Card>

        {/* Market Activity */}
        <Card className="card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Market Activity</p>
                <p className="text-2xl font-bold">Active</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mt-1">Markets open</p>
          </CardContent>
        </Card>

        {/* News Updates */}
        <Card className="card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">News Updates</p>
                <p className="text-2xl font-bold">{news.length}</p>
              </div>
              <Newspaper className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-purple-600 mt-1">New articles today</p>
          </CardContent>
        </Card>
      </div>

      {/* Weather Impact Alert */}
      {weather && (
        <Alert>
          <Thermometer className="h-4 w-4" />
          <AlertDescription>
            <span className={getWeatherImpact(weather).color}>
              {getWeatherImpact(weather).message}
            </span>
            {" - Current conditions: "}
            {weather.temperature}°C, {weather.humidity}% humidity, {weather.windSpeed} m/s wind
          </AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Widget */}
        <div>
          <WeatherWidget city={city} compact={true} showForecast={false} showAlerts={true} />
        </div>

        {/* Latest News */}
        <Card className="card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Newspaper className="h-5 w-5 mr-2" />
                Latest Agricultural News
              </CardTitle>
              <Button variant="outline" size="sm" onClick={fetchDashboardData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <CardDescription>
              Stay updated with the latest market and agricultural news
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {news.length === 0 ? (
                <div className="text-center py-4">
                  <Newspaper className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No news available</p>
                </div>
              ) : (
                news.slice(0, 3).map((article) => (
                  <div key={article.id} className="border-l-4 border-l-green-500 pl-4 py-2">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-sm line-clamp-2">{article.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`ml-2 text-xs ${
                          article.impact === 'high' ? 'border-red-200 text-red-700' :
                          article.impact === 'medium' ? 'border-yellow-200 text-yellow-700' :
                          'border-green-200 text-green-700'
                        }`}
                      >
                        {article.impact}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{article.summary}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{article.source}</span>
                      <span>{article.date}</span>
                    </div>
                  </div>
                ))
              )}
              
              {news.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm">
                    View All News
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Insights */}
      <Card className="card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Today's Market Insights
          </CardTitle>
          <CardDescription>
            Key market movements and weather-based recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Cotton Market</h4>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Prices trending upward due to export demand
              </p>
              <div className="text-lg font-bold text-green-600">+5.2%</div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Weather Impact</h4>
                <Cloud className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {weather ? getWeatherImpact(weather).message : 'Loading weather data...'}
              </p>
              <div className="text-lg font-bold text-blue-600">
                {weather ? getWeatherImpact(weather).level.toUpperCase() : '--'}
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">News Sentiment</h4>
                <Newspaper className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Overall market sentiment from recent news
              </p>
              <div className="text-lg font-bold text-purple-600">POSITIVE</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" onClick={fetchDashboardData} className="ml-2">
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DashboardOverview;
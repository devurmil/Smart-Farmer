import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Newspaper,
  TrendingUp,
  AlertTriangle,
  Calendar,
  ExternalLink,
  Clock,
  Tag,
  Globe,
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react";
import newsService, { NewsArticle, MarketUpdate } from "@/services/newsService";

// Type alias for compatibility
type NewsItem = NewsArticle;

const MarketNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [marketUpdates, setMarketUpdates] = useState<MarketUpdate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch real news data
  const fetchNewsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch agricultural news and market updates
      const [newsResponse, updates] = await Promise.all([
        newsService.getAgriculturalNews(selectedCategory === "all" ? undefined : selectedCategory, 20),
        newsService.getMarketUpdates()
      ]);

      if (newsResponse.success) {
        setNews(newsResponse.articles);
        setMarketUpdates(updates);
        setIsOnline(true);
        setLastUpdated(new Date());
      } else {
        throw new Error(newsResponse.error || 'Failed to fetch news');
      }
    } catch (error) {
      console.error('Error fetching news data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch news data');
      setIsOnline(false);
      
      // Keep existing data if available, otherwise show empty state
      if (news.length === 0) {
        setNews([]);
        setMarketUpdates([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchNewsData();
  }, []);

  // Refetch when category changes
  useEffect(() => {
    if (selectedCategory !== "all") {
      fetchNewsData();
    }
  }, [selectedCategory]);

  // Auto-refresh every 15 minutes
  useEffect(() => {
    const interval = setInterval(fetchNewsData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchNewsData();
  };

  const filteredNews = selectedCategory === "all" 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "market": return <TrendingUp className="h-4 w-4" />;
      case "policy": return <AlertTriangle className="h-4 w-4" />;
      case "weather": return <Globe className="h-4 w-4" />;
      case "export": return <ExternalLink className="h-4 w-4" />;
      case "technology": return <Tag className="h-4 w-4" />;
      default: return <Newspaper className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-100 text-red-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "border-l-red-500 bg-red-50";
      case "warning": return "border-l-yellow-500 bg-yellow-50";
      case "info": return "border-l-blue-500 bg-blue-50";
      default: return "border-l-gray-500 bg-gray-50";
    }
  };

  if (loading && news.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Loading latest agricultural news...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Alert */}
      {error && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            {error}. Showing cached data if available.
            <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-2">
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="news" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="news">Market News</TabsTrigger>
          <TabsTrigger value="updates">Live Updates</TabsTrigger>
        </TabsList>

        {/* News Tab */}
        <TabsContent value="news" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Newspaper className="h-5 w-5 mr-2" />
                    Agricultural Market News
                    {isOnline ? (
                      <Wifi className="h-4 w-4 ml-2 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 ml-2 text-red-500" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    Latest news and updates affecting agricultural markets
                    {lastUpdated && (
                      <span className="block text-xs text-gray-500 mt-1">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Filter by Date
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  All News
                </Button>
                {["market", "policy", "weather", "export", "technology"].map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {getCategoryIcon(category)}
                    <span className="ml-1">{category}</span>
                  </Button>
                ))}
              </div>

              {/* News List */}
              <div className="space-y-4">
                {filteredNews.length === 0 ? (
                  <div className="text-center py-8">
                    <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {loading ? "Loading news..." : "No news articles found for this category."}
                    </p>
                    {!loading && (
                      <Button variant="outline" onClick={handleRefresh} className="mt-4">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredNews.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(item.category)}
                            <Badge variant="outline" className="capitalize">
                              {item.category}
                            </Badge>
                            <Badge className={getImpactColor(item.impact)}>
                              {item.impact} impact
                            </Badge>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {item.date}
                            </div>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-2 hover:text-green-600 cursor-pointer">
                          {item.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {item.summary}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{item.source}</span>
                            <span>•</span>
                            <span>{item.readTime}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {item.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {item.url && item.url !== "#" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(item.url, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Updates Tab */}
        <TabsContent value="updates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Live Market Updates
              </CardTitle>
              <CardDescription>
                Real-time alerts and market movements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketUpdates.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {loading ? "Loading market updates..." : "No market updates available."}
                    </p>
                  </div>
                ) : (
                  marketUpdates.map((update) => (
                    <div
                      key={update.id}
                      className={`p-4 border-l-4 rounded-lg ${getSeverityColor(update.severity)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{update.crop}</Badge>
                          <Badge
                            className={`capitalize ${
                              update.severity === "critical" ? "bg-red-100 text-red-700" :
                              update.severity === "warning" ? "bg-yellow-100 text-yellow-700" :
                              "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {update.type.replace("_", " ")}
                          </Badge>
                          {update.source && (
                            <Badge variant="secondary" className="text-xs">
                              {update.source}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{update.timestamp}</span>
                      </div>
                      <p className="text-sm font-medium">{update.message}</p>
                    </div>
                  ))
                )}
              </div>
              
              {marketUpdates.length > 0 && (
                <div className="mt-6 text-center">
                  <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Updates
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketNews;
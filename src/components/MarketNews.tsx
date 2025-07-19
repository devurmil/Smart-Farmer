import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Newspaper, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  ExternalLink,
  Clock,
  Tag,
  Globe
} from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: "market" | "policy" | "weather" | "export" | "technology";
  impact: "high" | "medium" | "low";
  date: string;
  source: string;
  readTime: string;
  tags: string[];
  url?: string;
}

interface MarketUpdate {
  id: string;
  type: "price_alert" | "volume_spike" | "trend_change";
  crop: string;
  message: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
}

const MarketNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [marketUpdates, setMarketUpdates] = useState<MarketUpdate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Mock data generation
  useEffect(() => {
    const generateMockNews = (): NewsItem[] => {
      const mockNews: NewsItem[] = [
        {
          id: "1",
          title: "Cotton Prices Surge 15% Following Export Demand from Bangladesh",
          summary: "Strong international demand and reduced domestic supply have pushed cotton prices to a 6-month high. Farmers are advised to consider selling strategies.",
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
          category: "policy",
          impact: "high",
          date: "4 hours ago",
          source: "Government Portal",
          readTime: "5 min read",
          tags: ["Wheat", "Subsidy", "Government"],
          url: "#"
        },
        {
          id: "3",
          title: "Monsoon Forecast: Above Normal Rainfall Expected",
          summary: "IMD predicts 105% of normal rainfall this season, potentially boosting Kharif crop yields but raising concerns about flooding in some regions.",
          category: "weather",
          impact: "medium",
          date: "6 hours ago",
          source: "Weather Bureau",
          readTime: "4 min read",
          tags: ["Monsoon", "Kharif", "Rainfall"],
          url: "#"
        },
        {
          id: "4",
          title: "Rice Export Ban Lifted: Prices Expected to Stabilize",
          summary: "Government lifts the temporary ban on rice exports, allowing farmers to access international markets again. Domestic prices may see adjustment.",
          category: "export",
          impact: "high",
          date: "8 hours ago",
          source: "Trade Ministry",
          readTime: "3 min read",
          tags: ["Rice", "Export", "Policy"],
          url: "#"
        },
        {
          id: "5",
          title: "AI-Powered Crop Monitoring Technology Gains Traction",
          summary: "New satellite-based monitoring systems help farmers optimize irrigation and detect diseases early, improving yields by up to 20%.",
          category: "technology",
          impact: "medium",
          date: "1 day ago",
          source: "AgriTech Today",
          readTime: "6 min read",
          tags: ["Technology", "AI", "Monitoring"],
          url: "#"
        },
        {
          id: "6",
          title: "Onion Prices Drop 30% as New Harvest Arrives",
          summary: "Fresh onion arrivals in major markets have caused a significant price correction. Storage holders are advised to release stock gradually.",
          category: "market",
          impact: "medium",
          date: "1 day ago",
          source: "Market Watch",
          readTime: "2 min read",
          tags: ["Onion", "Price Drop", "Harvest"],
          url: "#"
        }
      ];
      return mockNews;
    };

    const generateMockUpdates = (): MarketUpdate[] => {
      return [
        {
          id: "1",
          type: "price_alert",
          crop: "Wheat",
          message: "Wheat prices crossed ₹2,500/quintal in Delhi market",
          timestamp: "15 minutes ago",
          severity: "info"
        },
        {
          id: "2",
          type: "volume_spike",
          crop: "Cotton",
          message: "Unusual high trading volume detected - 300% above average",
          timestamp: "1 hour ago",
          severity: "warning"
        },
        {
          id: "3",
          type: "trend_change",
          crop: "Rice",
          message: "Price trend reversed from declining to rising",
          timestamp: "2 hours ago",
          severity: "critical"
        }
      ];
    };

    setTimeout(() => {
      setNews(generateMockNews());
      setMarketUpdates(generateMockUpdates());
      setLoading(false);
    }, 800);
  }, []);

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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
                  </CardTitle>
                  <CardDescription>
                    Latest news and updates affecting agricultural markets
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
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
                {filteredNews.map((item) => (
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
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                {marketUpdates.map((update) => (
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
                      </div>
                      <span className="text-xs text-gray-500">{update.timestamp}</span>
                    </div>
                    <p className="text-sm font-medium">{update.message}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button variant="outline">
                  Load More Updates
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketNews;
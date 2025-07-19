import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";
import { TrendingUp, Calendar, BarChart3 } from "lucide-react";
import agmarknetService from "@/services/agmarknetService";

interface PriceData {
  date: string;
  price: number;
  volume: number;
  high: number;
  low: number;
}

interface PriceChartProps {
  selectedCrop: string;
}

const PriceChart = ({ selectedCrop }: PriceChartProps) => {
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [chartType, setChartType] = useState<string>("line");
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real historical data from Agmarknet
  useEffect(() => {
    const fetchHistoricalData = async () => {
      setLoading(true);
      try {
        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
        const historicalPrices = await agmarknetService.getHistoricalPrices(selectedCrop, days);
        
        const transformedData: PriceData[] = historicalPrices.map((price) => ({
          date: new Date(price.arrival_date).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric'
          }),
          price: price.modal_price,
          volume: price.arrivals,
          high: price.max_price,
          low: price.min_price
        }));

        setPriceData(transformedData);
      } catch (error) {
        console.error('Error fetching historical data:', error);
        
        // Fallback to mock data
        const generateFallbackData = (days: number): PriceData[] => {
          const data: PriceData[] = [];
          const basePrice = Math.random() * 3000 + 2000;
          let currentPrice = basePrice;

          for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const change = (Math.random() - 0.5) * 200;
            currentPrice = Math.max(1000, currentPrice + change);
            
            const high = currentPrice + Math.random() * 100;
            const low = currentPrice - Math.random() * 100;
            const volume = Math.floor(Math.random() * 1000 + 500);

            data.push({
              date: date.toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric'
              }),
              price: Math.round(currentPrice),
              volume,
              high: Math.round(high),
              low: Math.round(Math.max(low, 1000))
            });
          }
          return data;
        };

        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
        setPriceData(generateFallbackData(days));
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [selectedCrop, timeRange]);

  const currentPrice = priceData.length > 0 ? priceData[priceData.length - 1].price : 0;
  const previousPrice = priceData.length > 1 ? priceData[priceData.length - 2].price : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            Price: ₹{payload[0].value.toLocaleString()}
          </p>
          {payload[0].payload.volume && (
            <p className="text-gray-600">
              Volume: {payload[0].payload.volume} tons
            </p>
          )}
        </div>
      );
    }
    return null;
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
      {/* Chart Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                {selectedCrop} Price Trends
              </CardTitle>
              <CardDescription>
                Historical price movements and market analysis
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7D</SelectItem>
                  <SelectItem value="30d">30D</SelectItem>
                  <SelectItem value="90d">90D</SelectItem>
                </SelectContent>
              </Select>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Price Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Current Price</p>
              <p className="text-xl font-bold">₹{currentPrice.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Change</p>
              <p className={`text-xl font-bold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceChange >= 0 ? '+' : ''}₹{Math.abs(priceChange)}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Change %</p>
              <p className={`text-xl font-bold ${priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Avg Volume</p>
              <p className="text-xl font-bold">
                {Math.round(priceData.reduce((sum, d) => sum + d.volume, 0) / priceData.length)} tons
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="h-80">
            {chartType === "line" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
            
            {chartType === "area" && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#16a34a"
                    fill="#16a34a"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
            
            {chartType === "bar" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="price" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Market Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Price Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Highest Price ({timeRange}):</span>
              <span className="font-semibold">₹{Math.max(...priceData.map(d => d.high)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Lowest Price ({timeRange}):</span>
              <span className="font-semibold">₹{Math.min(...priceData.map(d => d.low)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Price:</span>
              <span className="font-semibold">
                ₹{Math.round(priceData.reduce((sum, d) => sum + d.price, 0) / priceData.length).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Volatility:</span>
              <span className="font-semibold">
                {priceChangePercent > 5 ? "High" : priceChangePercent > 2 ? "Medium" : "Low"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Trend Analysis</p>
              <p className="text-xs text-blue-600 mt-1">
                {priceChangePercent > 0 
                  ? `${selectedCrop} prices are trending upward, indicating strong demand.`
                  : `${selectedCrop} prices are declining, suggesting oversupply or reduced demand.`
                }
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800">Recommendation</p>
              <p className="text-xs text-green-600 mt-1">
                {priceChangePercent > 5 
                  ? "Consider selling if you have stock. Prices are at a good level."
                  : priceChangePercent < -5
                  ? "Good time to buy for future selling. Prices are low."
                  : "Monitor closely. Prices are stable but watch for trend changes."
                }
              </p>
            </div>
            
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-orange-800">Risk Level</p>
              <p className="text-xs text-orange-600 mt-1">
                {Math.abs(priceChangePercent) > 10 ? "High volatility - exercise caution" : "Moderate risk - normal market conditions"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PriceChart;
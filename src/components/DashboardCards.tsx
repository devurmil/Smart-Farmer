
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

const DashboardCards = () => {
  const stats = [
    {
      title: "Total Farm Area",
      value: "12.5 acres",
      change: "+2.3 acres",
      trend: "up",
      description: "Across 3 locations"
    },
    {
      title: "Monthly Savings",
      value: "₹45,230",
      change: "+15%",
      trend: "up",
      description: "Compared to last month"
    },
    {
      title: "Disease Alerts",
      value: "2 Active",
      change: "-3 resolved",
      trend: "down",
      description: "Wheat crop needs attention"
    },
    {
      title: "Equipment Bookings",
      value: "3 Upcoming",
      change: "Next: Tomorrow",
      trend: "neutral",
      description: "Harvester scheduled"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  {stat.trend === "up" && (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  )}
                  {stat.trend === "down" && (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  {stat.trend === "neutral" && (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className={`text-sm ${
                    stat.trend === "up" ? "text-green-600 dark:text-green-400" :
                    stat.trend === "down" ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400"
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardCards;

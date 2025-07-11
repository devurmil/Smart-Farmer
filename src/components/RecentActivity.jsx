
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Calendar, TrendingUp } from "lucide-react";

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: "success",
      icon: CheckCircle,
      title: "Disease scan completed",
      description: "Wheat crop - No issues detected",
      time: "2 hours ago",
      badge: "Healthy"
    },
    {
      id: 2,
      type: "warning",
      icon: AlertTriangle,
      title: "Soil moisture low",
      description: "Field A requires irrigation",
      time: "4 hours ago",
      badge: "Action Required"
    },
    {
      id: 3,
      type: "info",
      icon: Calendar,
      title: "Equipment booked",
      description: "Harvester scheduled for tomorrow",
      time: "1 day ago",
      badge: "Upcoming"
    },
    {
      id: 4,
      type: "success",
      icon: TrendingUp,
      title: "Cost savings achieved",
      description: "Saved ₹12,450 on fertilizer purchase",
      time: "2 days ago",
      badge: "Savings"
    }
  ];

  const getIconColor = (type) => {
    switch (type) {
      case "success": return "text-green-500";
      case "warning": return "text-yellow-500";
      case "info": return "text-blue-500";
      default: return "text-gray-500";
    }
  };

  const getBadgeVariant = (type) => {
    switch (type) {
      case "success": return "bg-green-100 text-green-700";
      case "warning": return "bg-yellow-100 text-yellow-700";
      case "info": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`mt-0.5 ${getIconColor(activity.type)}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <Badge className={`text-xs ${getBadgeVariant(activity.type)}`}>
                      {activity.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;

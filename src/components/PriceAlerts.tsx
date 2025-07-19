import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Target,
  AlertTriangle,
  CheckCircle,
  Settings
} from "lucide-react";
import cropData from "@/lib/cropData.json";

interface PriceAlert {
  id: string;
  crop: string;
  targetPrice: number;
  currentPrice: number;
  condition: "above" | "below";
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
  status: "active" | "triggered" | "expired";
  notificationMethod: "email" | "sms" | "push";
}

const PriceAlerts = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    crop: "",
    targetPrice: "",
    condition: "above" as "above" | "below",
    notificationMethod: "push" as "email" | "sms" | "push"
  });

  // Mock current prices for demonstration
  const getCurrentPrice = (cropName: string): number => {
    return Math.floor(Math.random() * 5000) + 2000; // Random price between 2000-7000
  };

  // Load mock alerts on component mount
  useEffect(() => {
    const mockAlerts: PriceAlert[] = [
      {
        id: "1",
        crop: "Wheat",
        targetPrice: 2800,
        currentPrice: getCurrentPrice("Wheat"),
        condition: "above",
        isActive: true,
        createdAt: "2 days ago",
        status: "active",
        notificationMethod: "push"
      },
      {
        id: "2",
        crop: "Cotton",
        targetPrice: 6000,
        currentPrice: getCurrentPrice("Cotton"),
        condition: "below",
        isActive: true,
        createdAt: "1 week ago",
        status: "triggered",
        notificationMethod: "email",
        triggeredAt: "Yesterday"
      },
      {
        id: "3",
        crop: "Rice",
        targetPrice: 3200,
        currentPrice: getCurrentPrice("Rice"),
        condition: "above",
        isActive: false,
        createdAt: "3 days ago",
        status: "active",
        notificationMethod: "sms"
      }
    ];
    setAlerts(mockAlerts);
  }, []);

  const handleCreateAlert = () => {
    if (!newAlert.crop || !newAlert.targetPrice) return;

    const alert: PriceAlert = {
      id: Date.now().toString(),
      crop: newAlert.crop,
      targetPrice: parseFloat(newAlert.targetPrice),
      currentPrice: getCurrentPrice(newAlert.crop),
      condition: newAlert.condition,
      isActive: true,
      createdAt: "Just now",
      status: "active",
      notificationMethod: newAlert.notificationMethod
    };

    setAlerts(prev => [alert, ...prev]);
    setNewAlert({
      crop: "",
      targetPrice: "",
      condition: "above",
      notificationMethod: "push"
    });
    setIsDialogOpen(false);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "triggered": return "bg-blue-100 text-blue-700";
      case "expired": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getConditionIcon = (condition: string) => {
    return condition === "above" ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const activeAlerts = alerts.filter(alert => alert.isActive && alert.status === "active");
  const triggeredAlerts = alerts.filter(alert => alert.status === "triggered");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Price Alerts
              </CardTitle>
              <CardDescription>
                Get notified when crop prices reach your target
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Alert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Price Alert</DialogTitle>
                  <DialogDescription>
                    Set up a new price alert for your selected crop
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="crop">Select Crop</Label>
                    <Select value={newAlert.crop} onValueChange={(value) => setNewAlert(prev => ({ ...prev, crop: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a crop" />
                      </SelectTrigger>
                      <SelectContent>
                        {cropData.map((crop) => (
                          <SelectItem key={crop.name} value={crop.name}>
                            {crop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="targetPrice">Target Price (₹)</Label>
                    <Input
                      id="targetPrice"
                      type="number"
                      placeholder="Enter target price"
                      value={newAlert.targetPrice}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="condition">Alert Condition</Label>
                    <Select value={newAlert.condition} onValueChange={(value: "above" | "below") => setNewAlert(prev => ({ ...prev, condition: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">Price goes above target</SelectItem>
                        <SelectItem value="below">Price goes below target</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="notification">Notification Method</Label>
                    <Select value={newAlert.notificationMethod} onValueChange={(value: "email" | "sms" | "push") => setNewAlert(prev => ({ ...prev, notificationMethod: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="push">Push Notification</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={handleCreateAlert} className="w-full">
                    Create Alert
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Alert Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{activeAlerts.length}</div>
              <div className="text-sm text-green-600">Active Alerts</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{triggeredAlerts.length}</div>
              <div className="text-sm text-blue-600">Triggered</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{alerts.length}</div>
              <div className="text-sm text-gray-600">Total Alerts</div>
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No price alerts set up yet</p>
                <p className="text-sm">Create your first alert to get notified about price changes</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg ${
                    alert.status === "triggered" ? "border-blue-200 bg-blue-50" : 
                    alert.isActive ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getConditionIcon(alert.condition)}
                        <div>
                          <h4 className="font-semibold">{alert.crop}</h4>
                          <p className="text-sm text-gray-600">
                            Alert when price goes {alert.condition} ₹{alert.targetPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Current: ₹{alert.currentPrice.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {alert.status === "triggered" ? `Triggered ${alert.triggeredAt}` : `Created ${alert.createdAt}`}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(alert.status)}>
                          {alert.status === "triggered" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {alert.status === "active" && <Target className="h-3 w-3 mr-1" />}
                          {alert.status === "expired" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {alert.status}
                        </Badge>
                        
                        <Switch
                          checked={alert.isActive}
                          onCheckedChange={() => handleToggleAlert(alert.id)}
                          disabled={alert.status === "triggered"}
                        />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAlert(alert.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {alert.status === "triggered" && (
                    <div className="mt-3 p-2 bg-blue-100 rounded text-sm text-blue-700">
                      <CheckCircle className="h-4 w-4 inline mr-2" />
                      Alert triggered! {alert.crop} price went {alert.condition} your target of ₹{alert.targetPrice.toLocaleString()}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {alerts.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>Notification preferences:</span>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
                <span>Alerts check every 15 minutes</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceAlerts;
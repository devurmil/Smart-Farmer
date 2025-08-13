import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/contexts/UserContext";
import supplierService, { SupplierDashboardData } from "@/services/supplierService";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Star, 
  MapPin, 
  Clock,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Loader2,
  ChevronDown,
  ChevronUp,
  Truck,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Edit
} from "lucide-react";

const SupplierDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useUser();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<SupplierDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingOrdersExpanded, setPendingOrdersExpanded] = useState(true);
  const [recentOrdersExpanded, setRecentOrdersExpanded] = useState(true);
  const [inventoryExpanded, setInventoryExpanded] = useState(true);

  // Fetch real data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supplierService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching supplier dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading supplier dashboard...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No dashboard data available</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'out-of-stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name || 'Supplier'}! 📦
          </h1>
          <p className="text-muted-foreground">
            Great to see you! Your supply business is thriving with {dashboardData.stats.activeOrders} active orders and ₹{dashboardData.stats.monthlyRevenue.toLocaleString()} in monthly revenue.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate('/farm-supply')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supply
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/farm-supply')}>
            <Eye className="h-4 w-4 mr-2" />
            View All Supplies
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supplies</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalSupplies}</div>
            <p className="text-xs text-muted-foreground">+3 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">+{dashboardData.stats.pendingOrders} pending orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{dashboardData.stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{dashboardData.stats.revenueGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">{dashboardData.stats.totalReviews} reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{dashboardData.stats.pendingOrders}</div>
            <p className="text-sm text-muted-foreground">Orders awaiting confirmation</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/farm-supply')}>
              View Orders
            </Button>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardData.stats.lowStockAlerts}</div>
            <p className="text-sm text-muted-foreground">Supplies with low inventory</p>
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/farm-supply')}
              >
                Restock Supplies
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/farm-supply')}
              >
                View Inventory
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Order Fulfillment Rate</span>
                <span className="text-sm text-muted-foreground">{dashboardData.stats.orderFulfillmentRate}%</span>
              </div>
              <Progress value={dashboardData.stats.orderFulfillmentRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">Orders delivered on time</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Revenue Growth</span>
                <span className="text-sm text-green-600">+{dashboardData.stats.revenueGrowth}%</span>
              </div>
              <Progress value={dashboardData.stats.revenueGrowth * 2} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">Compared to last month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Orders and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setPendingOrdersExpanded(!pendingOrdersExpanded)}>
            <div className="flex items-center justify-between">
              <CardTitle>Pending Orders</CardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {dashboardData.pendingOrders.length} orders
                </span>
                {pendingOrdersExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
          {pendingOrdersExpanded && (
            <CardContent>
              <div className="space-y-4">
                {dashboardData.pendingOrders.length > 0 ? (
                  dashboardData.pendingOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">{order.supply}</p>
                          <p className="text-sm text-muted-foreground">{order.buyer}</p>
                          <p className="text-xs text-muted-foreground">{order.orderDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{order.totalPrice}</p>
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No pending orders</p>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setRecentOrdersExpanded(!recentOrdersExpanded)}>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {dashboardData.recentOrders.length} orders
                </span>
                {recentOrdersExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
          {recentOrdersExpanded && (
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentOrders.length > 0 ? (
                  dashboardData.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Truck className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{order.supply}</p>
                          <p className="text-sm text-muted-foreground">{order.buyer}</p>
                          <p className="text-xs text-muted-foreground">{order.orderDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{order.totalPrice}</p>
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent orders</p>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Supply Inventory */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setInventoryExpanded(!inventoryExpanded)}>
          <div className="flex items-center justify-between">
            <CardTitle>Supply Inventory</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {dashboardData.supplyInventory.length} supplies
              </span>
              {inventoryExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>
        {inventoryExpanded && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.supplyInventory.map((supply) => (
                <div key={supply.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm">{supply.name}</h3>
                    <Badge className={getStatusColor(supply.status)}>
                      {supply.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Category: {supply.category}</p>
                    <p>Price: ₹{supply.price}/{supply.unit}</p>
                    <p>Stock: {supply.stock} {supply.unit}</p>
                    <p>Updated: {supply.lastUpdated}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col" onClick={() => navigate('/farm-supply')}>
              <Plus className="h-6 w-6 mb-2" />
              Add Supply
            </Button>
            <Button variant="outline" className="h-20 flex flex-col" onClick={() => navigate('/farm-supply')}>
              <ShoppingCart className="h-6 w-6 mb-2" />
              View Orders
            </Button>
            <Button variant="outline" className="h-20 flex flex-col" onClick={() => navigate('/farm-supply')}>
              <Package className="h-6 w-6 mb-2" />
              Manage Inventory
            </Button>
            <Button variant="outline" className="h-20 flex flex-col" onClick={() => navigate('/market-intelligence')}>
              <BarChart3 className="h-6 w-6 mb-2" />
              Market Trends
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierDashboard;

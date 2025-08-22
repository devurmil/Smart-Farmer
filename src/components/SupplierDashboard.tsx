import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Star, 
  AlertTriangle, 
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Truck,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supplierService, SupplierDashboardData, SupplyItem, SupplyOrder } from '@/services/supplierService';

const SupplierDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<SupplierDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getDashboardData();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityUpdate = async (supplyId: number, newQuantity: number) => {
    try {
      await supplierService.updateSupplyQuantity(supplyId, newQuantity);
      // Refresh dashboard data
      await fetchDashboardData();
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await supplierService.updateOrderStatus(orderId, newStatus);
      // Refresh dashboard data
      await fetchDashboardData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertTriangle className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
        <Button onClick={fetchDashboardData} className="mt-2">Retry</Button>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="text-center text-gray-600 p-4">No data available</div>;
  }

  const { stats, recentOrders, pendingOrders, inventory, topSellingSupplies } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
          <p className="text-gray-600">Manage your farm supplies and track business performance</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Supply
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supplies</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSupplies}</div>
            <p className="text-xs text-muted-foreground">
              {stats.lowStockSupplies} low stock, {stats.outOfStockSupplies} out of stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">
              {pendingOrders.length} pending confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalInventoryValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Current stock value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Alerts Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.lowStockSupplies > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-800">
                    {stats.lowStockSupplies} supplies are running low on stock
                  </span>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              )}
              {stats.outOfStockSupplies > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-red-800">
                    {stats.outOfStockSupplies} supplies are out of stock
                  </span>
                  <Button variant="outline" size="sm">Restock Now</Button>
                </div>
              )}
              {pendingOrders.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-800">
                    {pendingOrders.length} orders pending confirmation
                  </span>
                  <Button variant="outline" size="sm">Review Orders</Button>
                </div>
              )}
              {stats.lowStockSupplies === 0 && stats.outOfStockSupplies === 0 && pendingOrders.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  All good! No alerts at the moment.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest completed orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{order.supply.name}</p>
                        <p className="text-sm text-gray-600">
                          {order.quantity} {order.supply.unit} • ₹{order.totalPrice}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                  {recentOrders.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No recent orders</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Selling Supplies */}
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Supplies</CardTitle>
                <CardDescription>Most popular items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topSellingSupplies.slice(0, 3).map((supply) => (
                    <div key={supply.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{supply.name}</p>
                        <p className="text-sm text-gray-600">
                          {supply.availableQuantity} {supply.unit} available
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{supply.price}</p>
                        <p className="text-sm text-gray-600">{supply.category}</p>
                      </div>
                    </div>
                  ))}
                  {topSellingSupplies.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No sales data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          {/* Pending Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Orders</CardTitle>
              <CardDescription>Orders awaiting confirmation or processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{order.supply.name}</h4>
                        <p className="text-sm text-gray-600">
                          Ordered by {order.buyer.name} • {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Quantity</p>
                        <p className="font-medium">{order.quantity} {order.supply.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Price</p>
                        <p className="font-medium">₹{order.totalPrice}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Available Stock</p>
                        <p className="font-medium">{order.supply.availableQuantity} {order.supply.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Order ID</p>
                        <p className="font-medium">#{order.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Confirm Order
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                          >
                            Cancel Order
                          </Button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusUpdate(order.id, 'shipped')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Mark Shipped
                        </Button>
                      )}
                      {order.status === 'shipped' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {pendingOrders.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No pending orders</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supply Inventory</CardTitle>
              <CardDescription>Manage your current stock levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventory.map((supply) => (
                  <div key={supply.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{supply.name}</h4>
                        <p className="text-sm text-gray-600">
                          {supply.category} • {supply.brand || 'No brand'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={supply.available ? 'default' : 'destructive'}>
                          {supply.available ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Total Quantity</p>
                        <p className="font-medium">{supply.quantity} {supply.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Available Quantity</p>
                        <p className="font-medium">{supply.availableQuantity} {supply.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="font-medium">₹{supply.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Stock Level</p>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(supply.availableQuantity / supply.quantity) * 100} 
                            className="w-20"
                          />
                          <span className="text-sm">
                            {Math.round((supply.availableQuantity / supply.quantity) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    {supply.availableQuantity <= 5 && supply.availableQuantity > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-yellow-800 text-sm">
                          ⚠️ Low stock alert: Only {supply.availableQuantity} {supply.unit}(s) remaining
                        </p>
                      </div>
                    )}
                    {supply.availableQuantity === 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-800 text-sm">
                          🚫 Out of stock: This item needs immediate restocking
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                {inventory.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No supplies in inventory</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Revenue chart will be displayed here
                </div>
              </CardContent>
            </Card>

            {/* Order Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Order Analytics</CardTitle>
                <CardDescription>Order status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Pending</span>
                    <span className="font-medium">{pendingOrders.filter(o => o.status === 'pending').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Confirmed</span>
                    <span className="font-medium">{pendingOrders.filter(o => o.status === 'confirmed').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipped</span>
                    <span className="font-medium">{pendingOrders.filter(o => o.status === 'shipped').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Delivered</span>
                    <span className="font-medium">{recentOrders.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplierDashboard;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/contexts/UserContext";
import equipmentOwnerService, { EquipmentOwnerDashboardData } from "@/services/equipmentOwnerService";
import MaintenanceScheduleModal from "./MaintenanceScheduleModal";
import MaintenanceRecordsModal from "./MaintenanceRecordsModal";
import { 
  Tractor, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Star, 
  MapPin, 
  Clock,
  Users,
  Package,
  BarChart3,
  Settings,
  Loader2,
  ChevronDown,
  ChevronUp,
  Wrench
} from "lucide-react";

const EquipmentOwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useUser();
  const [dashboardData, setDashboardData] = useState<EquipmentOwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingBookingsExpanded, setUpcomingBookingsExpanded] = useState(true);
  const [recentBookingsExpanded, setRecentBookingsExpanded] = useState(true);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [maintenanceRecordsModalOpen, setMaintenanceRecordsModalOpen] = useState(false);

  // Fetch real data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await equipmentOwnerService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle maintenance scheduled
  const handleMaintenanceScheduled = () => {
    // Refresh dashboard data to update maintenance alerts
    fetchDashboardData();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard data...</span>
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
          <Tractor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No dashboard data available</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'booked': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
             {/* Header Section */}
       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
         <div>
           <h1 className="text-3xl font-bold text-foreground">
             Welcome back, {user?.name || 'Equipment Owner'}! 🚜
           </h1>
                       <p className="text-muted-foreground">
              Great to see you! Your equipment business is thriving with {dashboardData.stats.activeBookings} active bookings and ₹{dashboardData.stats.monthlyRevenue.toLocaleString()} in monthly revenue.
            </p>
         </div>
         <div className="flex gap-2">
           <Button size="sm">
             <Package className="h-4 w-4 mr-2" />
             Add Equipment
           </Button>
         </div>
       </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <Tractor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
                     <CardContent>
             <div className="text-2xl font-bold">{dashboardData.stats.totalEquipment}</div>
             <p className="text-xs text-muted-foreground">+2 this month</p>
           </CardContent>
         </Card>

         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
             <Calendar className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{dashboardData.stats.activeBookings}</div>
             <p className="text-xs text-muted-foreground">+{dashboardData.stats.pendingRequests} pending requests</p>
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
              Pending Requests
            </CardTitle>
          </CardHeader>
                     <CardContent>
             <div className="text-2xl font-bold text-orange-600">{dashboardData.stats.pendingRequests}</div>
             <p className="text-sm text-muted-foreground">Equipment booking requests awaiting approval</p>
             <Button variant="outline" size="sm" className="mt-2">
               View Requests
             </Button>
           </CardContent>
         </Card>

         <Card className="border-red-200">
           <CardHeader>
             <CardTitle className="flex items-center text-red-800">
               <AlertTriangle className="h-5 w-5 mr-2" />
               Maintenance Alerts
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-red-600">{dashboardData.stats.maintenanceAlerts}</div>
                           <p className="text-sm text-muted-foreground">Equipment requiring maintenance</p>
             <div className="flex gap-2 mt-2">
               <Button 
                 variant="outline" 
                 size="sm"
                 onClick={() => setMaintenanceModalOpen(true)}
               >
                 Schedule Maintenance
               </Button>
               <Button 
                 variant="outline" 
                 size="sm"
                 onClick={() => setMaintenanceRecordsModalOpen(true)}
               >
                 <Wrench className="h-4 w-4 mr-1" />
                 View Records
               </Button>
             </div>
           </CardContent>
         </Card>
      </div>

      {/* Upcoming Bookings and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setUpcomingBookingsExpanded(!upcomingBookingsExpanded)}>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Bookings</CardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {dashboardData.upcomingBookings.length} bookings
                </span>
                {upcomingBookingsExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
          {upcomingBookingsExpanded && (
            <CardContent>
              <div className="space-y-4">
                {dashboardData.upcomingBookings.length > 0 ? (
                  dashboardData.upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{booking.equipment}</p>
                          <p className="text-sm text-muted-foreground">{booking.customer}</p>
                          <p className="text-xs text-muted-foreground">{booking.date} at {booking.time}</p>
                        </div>
                      </div>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No upcoming bookings</p>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setRecentBookingsExpanded(!recentBookingsExpanded)}>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Bookings</CardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {dashboardData.recentBookings.length} bookings
                </span>
                {recentBookingsExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
          {recentBookingsExpanded && (
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentBookings.length > 0 ? (
                  dashboardData.recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{booking.equipment}</p>
                          <p className="text-sm text-muted-foreground">{booking.customer}</p>
                          <p className="text-xs text-muted-foreground">{booking.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{booking.amount}</p>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs ml-1">{booking.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent bookings</p>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col">
              <Package className="h-6 w-6 mb-2" />
              Add Equipment
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              View Bookings
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Users className="h-6 w-6 mb-2" />
              Manage Customers
            </Button>
                     </div>
         </CardContent>
       </Card>

       {/* Maintenance Schedule Modal */}
       <MaintenanceScheduleModal
         isOpen={maintenanceModalOpen}
         onClose={() => setMaintenanceModalOpen(false)}
         equipmentList={dashboardData.equipmentStatus.map((equipment) => ({
           id: equipment.id.toString(),
           name: equipment.name,
           status: equipment.status
         }))}
         onMaintenanceScheduled={handleMaintenanceScheduled}
       />

       {/* Maintenance Records Modal */}
       <MaintenanceRecordsModal
         isOpen={maintenanceRecordsModalOpen}
         onClose={() => setMaintenanceRecordsModalOpen(false)}
       />
     </div>
   );
 };

export default EquipmentOwnerDashboard; 
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  Wrench,
  Tractor,
  Users,
  Calendar,
  TrendingUp,
  Shield,
  Star,
  MapPin,
  Clock,
  IndianRupee,
  Plus
} from 'lucide-react';
import AddEquipmentForm from '../components/AddEquipmentForm';
import OwnerEquipmentList from '../components/OwnerEquipmentList';
import EquipmentList from '../components/EquipmentList';
import UserBookingsList from '../components/UserBookingsList';
import { getBackendUrl } from '@/lib/utils';

const EquipmentRentalPage = () => {
  const { user, token } = useUser();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [ownerStats, setOwnerStats] = useState({
    totalEquipment: 0,
    activeBookings: 0,
    monthlyEarnings: 0
  });
  const [farmerStats, setFarmerStats] = useState({
    availableEquipment: 0,
    myBookings: 0,
    avgPrice: 0
  });

  const handleEquipmentAdded = () => {
    // Trigger a refresh of the equipment list
    setRefreshTrigger(prev => prev + 1);
    // Refresh stats when equipment is added
    fetchOwnerStats();
  };

  const fetchOwnerStats = async () => {
    if (!token || user?.role !== 'owner') return;
    
    try {
      // Fetch owner's equipment count
      const equipmentResponse = await fetch(`${getBackendUrl()}/api/equipment/owner`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (equipmentResponse.ok) {
        const equipmentData = await equipmentResponse.json();
        setOwnerStats(prev => ({
          ...prev,
          totalEquipment: equipmentData.length
        }));
      }

      // Fetch owner's bookings
      const bookingsResponse = await fetch(`${getBackendUrl()}/api/booking/owner`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        const activeBookings = bookingsData.filter(b => b.status === 'approved' || b.status === 'pending').length;
        
        // Calculate monthly earnings (this month's completed bookings)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyEarnings = bookingsData
          .filter(b => {
            const bookingDate = new Date(b.startDate);
            return b.status === 'completed' &&
                   bookingDate.getMonth() === currentMonth &&
                   bookingDate.getFullYear() === currentYear;
          })
          .reduce((sum, b) => {
            const days = Math.ceil((new Date(b.endDate) - new Date(b.startDate)) / (1000 * 60 * 60 * 24));
            return sum + (days * (b.equipment?.price || 0));
          }, 0);

        setOwnerStats(prev => ({
          ...prev,
          activeBookings,
          monthlyEarnings
        }));
      }
    } catch (error) {
      console.error('Error fetching owner stats:', error);
    }
  };

  const fetchFarmerStats = async () => {
    if (!token || user?.role === 'owner') return;

    try {
      // Fetch available equipment count
      const equipmentResponse = await fetch(`${getBackendUrl()}/api/equipment`);
      if (equipmentResponse.ok) {
        const equipmentData = await equipmentResponse.json();
        const totalEquipment = equipmentData.length; // Show total equipment count
        const avgPrice = equipmentData.length > 0 ?
          Math.round(equipmentData.reduce((sum, e) => sum + (parseFloat(e.price) || 0), 0) / equipmentData.length) : 0;
        
        setFarmerStats(prev => ({
          ...prev,
          availableEquipment: totalEquipment, // Show all equipment, not just available
          avgPrice
        }));
      }

      // Fetch farmer's bookings
      const bookingsResponse = await fetch(`${getBackendUrl()}/api/booking/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        const myBookings = bookingsData.length;

        setFarmerStats(prev => ({
          ...prev,
          myBookings
        }));
      }
    } catch (error) {
      console.error('Error fetching farmer stats:', error);
    }
  };


  React.useEffect(() => {
    if (token) {
      if (user?.role === 'owner') {
        fetchOwnerStats();
      } else if (user?.role === 'farmer') {
        fetchFarmerStats();
      }
    }
  }, [token, user?.role, refreshTrigger]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative px-6 py-16 mx-auto max-w-7xl">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-black bg-opacity-20 rounded-full">
                <Tractor className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {user?.role === 'owner' ? 'Manage Your Equipment' : 'Rent Farm Equipment'}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {user?.role === 'owner'
                ? 'List your agricultural equipment and earn extra income while helping fellow farmers'
                : 'Access modern agricultural equipment on-demand. Boost your farming efficiency without the upfront investment'
              }
            </p>
            <div className="flex justify-center gap-8 text-blue-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Verified Equipment</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Flexible Rentals</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>Trusted Platform</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(59 130 246 / 0.1)"/>
          </svg>
        </div>
      </div>

      <div className="px-6 py-12 mx-auto max-w-7xl">
        {user?.role === 'owner' ? (
          // Equipment Owner View
          <div className="space-y-8">
            {/* Owner Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-6 bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium">Total Equipment</p>
                      <p className="text-3xl font-bold">{ownerStats.totalEquipment}</p>
                    </div>
                    <Tractor className="w-10 h-10 text-emerald-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-6 bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium">Active Bookings</p>
                      <p className="text-3xl font-bold">{ownerStats.activeBookings}</p>
                    </div>
                    <Calendar className="w-10 h-10 text-emerald-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-6 bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium">Monthly Earnings</p>
                      <p className="text-3xl font-bold">₹{ownerStats.monthlyEarnings.toLocaleString()}</p>
                    </div>
                    <IndianRupee className="w-10 h-10 text-emerald-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add Equipment Form */}
            <Card className="shadow-xl border-border bg-card backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-8">
                <div className="flex items-center gap-3">
                  <Plus className="w-8 h-8" />
                  <div>
                    <CardTitle className="text-3xl font-bold">Add New Equipment</CardTitle>
                    <CardDescription className="text-emerald-100 text-lg">
                      List your equipment and start earning extra income
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <AddEquipmentForm onEquipmentAdded={handleEquipmentAdded} />
              </CardContent>
            </Card>

            {/* My Equipment Listings */}
            <Card className="shadow-xl border-border bg-card backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-8">
                <div className="flex items-center gap-3">
                  <Wrench className="w-8 h-8" />
                  <div>
                    <CardTitle className="text-3xl font-bold">My Equipment Listings</CardTitle>
                    <CardDescription className="text-emerald-100 text-lg">
                      Manage your equipment and track performance
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <OwnerEquipmentList refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </div>
        ) : (
          // Farmer View
          <div className="space-y-8">
            {/* Farmer Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-6 bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Available Equipment</p>
                      <p className="text-2xl font-bold">{farmerStats.availableEquipment}</p>
                    </div>
                    <Tractor className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-6 bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">My Bookings</p>
                      <p className="text-2xl font-bold">{farmerStats.myBookings}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-6 bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Avg. Price</p>
                      <p className="text-2xl font-bold">₹{farmerStats.avgPrice}/day</p>
                    </div>
                    <IndianRupee className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
              
            </div>

            {/* Available Equipment */}
            <Card className="shadow-xl border-border bg-card backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-8">
                <div className="flex items-center gap-3">
                  <Tractor className="w-8 h-8" />
                  <div>
                    <CardTitle className="text-3xl font-bold">Available Equipment for Rent</CardTitle>
                    <CardDescription className="text-blue-100 text-lg">
                      Browse and book high-quality agricultural equipment
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <EquipmentList />
              </CardContent>
            </Card>

            {/* My Bookings */}
            <Card className="shadow-xl border-border bg-card backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-8">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8" />
                  <div>
                    <CardTitle className="text-3xl font-bold">My Bookings</CardTitle>
                    <CardDescription className="text-emerald-100 text-lg">
                      Track your equipment rentals and booking history
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <UserBookingsList />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentRentalPage;
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';
import AddSupplyForm from '../components/AddSupplyForm';
import SupplierSupplyList from '../components/SupplierSupplyList';
import SupplyList from '../components/SupplyList';
import SupplyOrders from '../components/SupplyOrders';

const FarmSupplyPage = () => {
  const { user } = useUser();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSupplyAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundImage: "url('/Backgrounds/federico-respini-sYffw0LNr7s-unsplash.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Farm Supply</h1>
          </div>

          {user?.role === 'supplier' ? (
            // Supplier View
            <div className="space-y-8">
              {/* Add Supply Form */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/30">
                <CardContent>
                  <AddSupplyForm onSupplyAdded={handleSupplyAdded} />
                </CardContent>
              </Card>

              {/* My Supply Listings */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/30">
                <CardHeader>
                  <CardTitle>My Supply Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <SupplierSupplyList refreshTrigger={refreshTrigger} />
                </CardContent>
              </Card>

              {/* My Orders (as supplier) */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/30">
                <CardHeader>
                  <CardTitle>Orders Received</CardTitle>
                </CardHeader>
                <CardContent>
                  <SupplyOrders userRole="supplier" />
                </CardContent>
              </Card>
            </div>
          ) : (
            // Farmer/Owner View
            <div className="space-y-8">
              {/* Available Supplies */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/30">
                <CardHeader>
                  <CardTitle>Available Farm Supplies</CardTitle>
                </CardHeader>
                <CardContent>
                  <SupplyList />
                </CardContent>
              </Card>

              {/* My Orders (as buyer) */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/30">
                <CardHeader>
                  <CardTitle>My Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <SupplyOrders userRole="buyer" />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmSupplyPage; 
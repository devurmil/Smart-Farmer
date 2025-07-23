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
    // Trigger a refresh of the supply list
    setRefreshTrigger(prev => prev + 1);
  };

  console.log('FarmSupplyPage rendered, user:', user);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Farm Supply</h1>
        </div>

        {/* Debug info */}
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Debug Info:</strong> User role: {user?.role || 'Not set'}, 
            User ID: {user?.id || 'Not set'}
          </p>
        </div>

        {user?.role === 'supplier' ? (
          // Supplier View
          <div className="space-y-8">
            {/* Add Supply Form */}
            <AddSupplyForm onSupplyAdded={handleSupplyAdded} />

            {/* My Supply Listings */}
            <Card>
              <CardHeader>
                <CardTitle>My Supply Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <SupplierSupplyList refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>

            {/* My Orders (as supplier) */}
            <Card>
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
            <Card>
              <CardHeader>
                <CardTitle>Available Farm Supplies</CardTitle>
              </CardHeader>
              <CardContent>
                <SupplyList />
              </CardContent>
            </Card>

            {/* My Orders (as buyer) */}
            <Card>
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
  );
};

export default FarmSupplyPage; 
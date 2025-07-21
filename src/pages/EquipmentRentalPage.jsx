import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Wrench } from 'lucide-react';
import AddEquipmentForm from '../components/AddEquipmentForm';
import OwnerEquipmentList from '../components/OwnerEquipmentList';
import EquipmentList from '../components/EquipmentList';
import UserBookingsList from '../components/UserBookingsList';

const EquipmentRentalPage = () => {
  const { user } = useUser();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEquipmentAdded = () => {
    // Trigger a refresh of the equipment list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Wrench className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Equipment Rental</h1>
        </div>

        {user?.role === 'owner' ? (
          // Equipment Owner View
          <div className="space-y-8">
            {/* Add Equipment Form */}
            <AddEquipmentForm onEquipmentAdded={handleEquipmentAdded} />

            {/* My Equipment Listings */}
            <Card>
              <CardHeader>
                <CardTitle>My Equipment Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <OwnerEquipmentList refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </div>
        ) : (
          // Farmer View
          <div className="space-y-8">
            {/* Available Equipment */}
            <Card>
              <CardHeader>
                <CardTitle>Available Equipment for Rent</CardTitle>
              </CardHeader>
              <CardContent>
                <EquipmentList />
              </CardContent>
            </Card>

            {/* My Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
              </CardHeader>
              <CardContent>
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
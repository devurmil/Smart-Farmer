import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Calendar } from 'lucide-react';

const EquipmentList = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openBookingId, setOpenBookingId] = useState(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('http://localhost:5000/api/equipment');
        if (!response.ok) throw new Error('Failed to fetch equipment');
        const data = await response.json();
        setEquipment(data);
      } catch (err) {
        setError('Failed to fetch equipment');
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  const handleBookingClose = () => setOpenBookingId(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading equipment...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        No equipment available for rent.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {equipment.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          {item.imageUrl && (
            <div className="aspect-video overflow-hidden">
              <img
                src={`http://localhost:5000${item.imageUrl}`}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-lg">{item.name}</CardTitle>
            <p className="text-sm text-gray-600">{item.type}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-green-600">
                ₹{item.price} / day
              </p>
              <p className="text-sm text-gray-700">{item.description}</p>
              <Button
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
                onClick={() => setOpenBookingId(item.id)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Equipment
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EquipmentList;
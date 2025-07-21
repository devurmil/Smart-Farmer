import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, ShoppingCart, Package } from 'lucide-react';
import OrderSupplyModal from './OrderSupplyModal';

const SupplyList = () => {
  const { user, token } = useUser();
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openOrderModal, setOpenOrderModal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchSupplies = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('http://localhost:5000/api/supplies');
        if (!response.ok) throw new Error('Failed to fetch supplies');
        const data = await response.json();
        setSupplies(data);
      } catch (err) {
        setError('Failed to fetch supplies');
      } finally {
        setLoading(false);
      }
    };
    fetchSupplies();
  }, []);

  const handleOrderClose = () => setOpenOrderModal(null);

  const getCategoryColor = (category) => {
    const colors = {
      seeds: 'bg-blue-100 text-blue-800',
      fertilizers: 'bg-green-100 text-green-800',
      pesticides: 'bg-red-100 text-red-800',
      tools: 'bg-yellow-100 text-yellow-800',
      machinery: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      seeds: '🌱',
      fertilizers: '🌿',
      pesticides: '🧪',
      tools: '🔧',
      machinery: '🚜',
      other: '📦'
    };
    return icons[category] || icons.other;
  };

  const filteredSupplies = selectedCategory === 'all' 
    ? supplies 
    : supplies.filter(supply => supply.category === selectedCategory);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'seeds', label: 'Seeds' },
    { value: 'fertilizers', label: 'Fertilizers' },
    { value: 'pesticides', label: 'Pesticides' },
    { value: 'tools', label: 'Tools' },
    { value: 'machinery', label: 'Machinery' },
    { value: 'other', label: 'Other' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading supplies...</span>
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

  if (supplies.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p>No supplies available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.value)}
            className={selectedCategory === category.value ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {category.value !== 'all' && getCategoryIcon(category.value)}
            {category.label}
          </Button>
        ))}
      </div>

      {/* Supplies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSupplies.map((supply) => (
          <Card key={supply.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {supply.imageUrl && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={`http://localhost:5000${supply.imageUrl}`}
                  alt={supply.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{supply.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getCategoryColor(supply.category)}>
                      {getCategoryIcon(supply.category)} {supply.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-green-600">
                    ₹{supply.price}
                  </p>
                  <p className="text-sm text-gray-600">
                    per {supply.unit}
                  </p>
                </div>
                
                {supply.brand && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Brand:</span> {supply.brand}
                  </p>
                )}
                
                <p className="text-sm text-gray-700 line-clamp-2">
                  {supply.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Available: {supply.quantity} {supply.unit}</span>
                  <span>Supplier: {supply.supplier?.name}</span>
                </div>
                
                {supply.expiryDate && (
                  <p className="text-xs text-orange-600">
                    Expires: {new Date(supply.expiryDate).toLocaleDateString()}
                  </p>
                )}
                
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => setOpenOrderModal(supply)}
                  disabled={supply.quantity <= 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {supply.quantity > 0 ? 'Order Now' : 'Out of Stock'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Modal */}
      {openOrderModal && (
        <OrderSupplyModal
          supply={openOrderModal}
          onClose={handleOrderClose}
          onOrderSuccess={() => {
            handleOrderClose();
            // Refresh the supplies list
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default SupplyList; 
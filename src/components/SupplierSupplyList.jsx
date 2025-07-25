import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, Edit, Trash2, Package } from 'lucide-react';
import { getBackendUrl } from '@/lib/utils';

const SupplierSupplyList = ({ refreshTrigger }) => {
  const { user, token } = useUser();
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSupplies = async () => {
      setLoading(true);
      setError('');
      try {
        let url;
        if (user?.role === 'admin') {
          url = `${getBackendUrl()}/api/supplies`;
        } else if (user?.role === 'supplier') {
          url = `${getBackendUrl()}/api/supplies/my-supplies`;
        } else {
          // Not allowed
          setSupplies([]);
          setLoading(false);
          return;
        }
        
        console.log('SupplierSupplyList - User:', user);
        console.log('SupplierSupplyList - User Role:', user?.role);
        console.log('SupplierSupplyList - User ID:', user?.id);
        console.log('SupplierSupplyList - Token:', token ? 'Present' : 'Not Present');
        console.log('SupplierSupplyList - URL:', url);
        
        const response = await fetch(url, {
          credentials: 'include',
          headers: token ? { 'Authorization': `Bearer ${user}` } : {}
        });
        if (!response.ok) throw new Error('Failed to fetch supplies');
        const data = await response.json();
        setSupplies(data.data || data);
      } catch (err) {
        setError('Failed to fetch supplies');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchSupplies();
  }, [user, token, refreshTrigger]);

  const handleDelete = async (supplyId) => {
    if (!confirm('Are you sure you want to delete this supply?')) return;

    try {
      const response = await fetch(`${getBackendUrl()}/api/supplies/${supplyId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) throw new Error('Failed to delete supply');

      // Remove from local state
      setSupplies(supplies.filter(supply => supply.id !== supplyId));
    } catch (err) {
      alert('Failed to delete supply: ' + err.message);
    }
  };

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

  const getStatusColor = (available) => {
    return available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading your supplies...</span>
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
        <p>You haven't added any supplies yet.</p>
        <p className="text-sm">Add your first supply using the form above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {supplies.map((supply) => (
        <div key={supply.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">{supply.name}</h3>
                <Badge className={getCategoryColor(supply.category)}>
                  {getCategoryIcon(supply.category)} {supply.category}
                </Badge>
                <Badge className={getStatusColor(supply.available)}>
                  {supply.available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Price:</span> ₹{supply.price} per {supply.unit}
                </div>
                <div>
                  <span className="font-medium">Quantity:</span> {supply.quantity} {supply.unit}
                </div>
                <div>
                  <span className="font-medium">Added:</span> {new Date(supply.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              {supply.brand && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Brand:</span> {supply.brand}
                </p>
              )}
              
              {supply.expiryDate && (
                <p className="text-sm text-orange-600 mt-1">
                  <span className="font-medium">Expires:</span> {new Date(supply.expiryDate).toLocaleDateString()}
                </p>
              )}
              
              {supply.description && (
                <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                  {supply.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // TODO: Implement edit functionality
                  alert('Edit functionality coming soon!');
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(supply.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {supply.imageUrl && (
            <div className="mt-3">
              <img
                src={supply.imageUrl}
                alt={supply.name}
                className="w-24 h-24 object-cover rounded border"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SupplierSupplyList; 
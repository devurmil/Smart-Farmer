import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, Package, Truck, CheckCircle } from 'lucide-react';
import { getBackendUrl } from '@/lib/utils';

const SupplyOrders = ({ userRole }) => {
  const { user, token } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      console.log('SupplyOrders - User:', user);
      console.log('SupplyOrders - Token:', token ? 'Present' : 'Not Present');
      
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${getBackendUrl()}/api/supplies/orders`, {
          credentials: 'include',
          headers: {}
        });
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, token]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/supplies/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order status');

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      alert('Failed to update order status: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      shipped: '🚚',
      delivered: '📦',
      cancelled: '❌'
    };
    return icons[status] || icons.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading orders...</span>
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

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p>No orders found.</p>
        {userRole === 'buyer' && (
          <p className="text-sm">Start shopping for supplies to see your orders here!</p>
        )}
        {userRole === 'supplier' && (
          <p className="text-sm">Orders from customers will appear here.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">
                  {userRole === 'supplier' ? order.buyer?.name : order.seller?.name}
                </h3>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusIcon(order.status)} {order.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Supply:</span> {order.supply?.name}
                </div>
                <div>
                  <span className="font-medium">Quantity:</span> {order.quantity} {order.supply?.unit}
                </div>
                <div>
                  <span className="font-medium">Total Price:</span> ₹{order.totalPrice}
                </div>
                <div>
                  <span className="font-medium">Order Date:</span> {new Date(order.orderDate).toLocaleDateString()}
                </div>
              </div>
              
              {order.deliveryAddress && (
                <div className="mt-2">
                  <span className="font-medium text-sm">Delivery Address:</span>
                  <p className="text-sm text-gray-600 mt-1">{order.deliveryAddress}</p>
                </div>
              )}
              
              {order.contactPhone && (
                <div className="mt-1">
                  <span className="font-medium text-sm">Contact:</span>
                  <span className="text-sm text-gray-600 ml-1">{order.contactPhone}</span>
                </div>
              )}
              
              {order.notes && (
                <div className="mt-2">
                  <span className="font-medium text-sm">Notes:</span>
                  <p className="text-sm text-gray-600 mt-1">{order.notes}</p>
                </div>
              )}
            </div>
            
            {/* Status Update (for suppliers only) */}
            {userRole === 'supplier' && order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div className="ml-4">
                <Select
                  value={order.status}
                  onValueChange={(value) => handleStatusUpdate(order.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SupplyOrders; 
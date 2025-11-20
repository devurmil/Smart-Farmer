import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '../contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
import { getBackendUrl } from '@/lib/utils';

const OrderSupplyModal = ({ supply, onClose, onOrderSuccess }) => {
  const { user, token } = useUser();
  const [form, setForm] = useState({
    quantity: '1',
    deliveryAddress: '',
    contactPhone: user?.phone || '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    console.log('OrderSupplyModal - User:', user);
    console.log('OrderSupplyModal - Token:', token ? 'Present' : 'Not Present');

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${getBackendUrl()}/api/supplies/${supply.id}/order`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }

      setSuccess('Order placed successfully!');
      setTimeout(() => {
        onOrderSuccess();
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = supply.price * parseInt(form.quantity || 1);

  const modalBody = (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 999999999, position: 'fixed' }}
    >
      <div
        className="relative bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl"
        style={{ zIndex: 1000000000 }}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Order Supply</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {success && (
            <div className="flex items-center p-4 mb-4 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Supply Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{supply.name}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Category:</span> {supply.category}</p>
              <p><span className="font-medium">Price:</span> ₹{supply.price} per {supply.unit}</p>
              <p><span className="font-medium">Available:</span> {supply.quantity} {supply.unit}</p>
              {supply.brand && <p><span className="font-medium">Brand:</span> {supply.brand}</p>}
              {supply.supplier?.name && <p><span className="font-medium">Supplier:</span> {supply.supplier.name}</p>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                max={supply.quantity}
                value={form.quantity}
                onChange={handleChange}
                required
              />
              <p className="text-sm text-gray-600">
                Available: {supply.quantity} {supply.unit}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Delivery Address</Label>
              <Textarea
                id="deliveryAddress"
                name="deliveryAddress"
                value={form.deliveryAddress}
                onChange={handleChange}
                placeholder="Enter your complete delivery address..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                value={form.contactPhone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any special instructions or notes..."
                rows={2}
              />
            </div>

            {/* Order Summary */}
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Price:</span>
                <span className="text-lg font-semibold text-green-600">₹{totalPrice}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {form.quantity} × ₹{supply.price} per {supply.unit}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(modalBody, document.body);
};

export default OrderSupplyModal; 
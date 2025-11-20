import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '../contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Calendar,
  IndianRupee,
  Clock,
  MapPin,
  Shield,
  Star,
  Tractor
} from 'lucide-react';
import { getBackendUrl } from '@/lib/utils';

const EquipmentBookingModal = ({ equipment, onClose, onBookingSuccess, startDate: propStartDate, endDate: propEndDate, available }) => {
  const { user, token } = useUser();
  const [form, setForm] = useState({
    startDate: propStartDate || '',
    endDate: propEndDate || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [overlapError, setOverlapError] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // Clear error when user changes dates
  };

  const validateDates = () => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);
    const todayDate = new Date(today);

    // Check if start date is in the past
    if (form.startDate < today) {
      setError('Start date cannot be in the past');
      return false;
    }

    // Check if end date is in the past
    if (form.endDate < today) {
      setError('End date cannot be in the past');
      return false;
    }

    // Check if end date is before start date
    if (endDate < startDate) {
      setError('End date cannot be before start date');
      return false;
    }

    // Check if start date and end date are the same
    if (form.startDate === form.endDate) {
      setError('End date must be after start date (minimum 1 day rental)');
      return false;
    }

    return true;
  };

  const buildAuthHeaders = () => {
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
      };
    }
    return {};
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    setOverlapError(false);

    // Validate dates before submitting
    if (!validateDates()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${getBackendUrl()}/api/booking`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify({
          equipmentId: equipment.id,
          ...form,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 || response.status === 409) {
          setOverlapError(true);
        }
        throw new Error(errorData.message || 'Failed to book equipment');
      }
      setSuccess('Booking request sent! The equipment owner will be notified immediately.');
      setTimeout(() => {
        onBookingSuccess();
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to book equipment');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    if (!form.startDate || !form.endDate) return 0;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return daysDiff > 0 ? daysDiff * equipment.price : 0;
  };

  const totalCost = calculateTotalCost();
  const days = form.startDate && form.endDate ? Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24)) : 0;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-full">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Book Equipment</h2>
                <p className="text-blue-100">Reserve your equipment rental</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-8">
          {/* Status Messages */}
          {success && (
            <div className="flex items-center p-4 mb-6 bg-green-50 border border-green-200 rounded-xl">
              <div className="p-1 bg-green-100 rounded-full mr-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-green-800 font-semibold">Booking Successful!</h4>
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center p-4 mb-6 bg-red-50 border border-red-200 rounded-xl">
              <div className="p-1 bg-red-100 rounded-full mr-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-red-800 font-semibold">Booking Error</h4>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}
          
          {overlapError && (
            <div className="flex items-center p-4 mb-6 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="p-1 bg-amber-100 rounded-full mr-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-amber-800 font-semibold">Date Conflict</h4>
                <p className="text-amber-700 text-sm">This equipment is already booked for the selected dates. Please choose different dates.</p>
              </div>
            </div>
          )}

          {/* Equipment Details Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Tractor className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{equipment.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">Type:</span> {equipment.type}
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <IndianRupee className="w-4 h-4" />
                      <span className="font-medium">₹{equipment.price} per day</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>Available nearby</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Shield className="w-4 h-4" />
                      <span>Fully insured</span>
                    </div>
                  </div>
                </div>
                {equipment.description && (
                  <p className="mt-3 text-gray-600 text-sm">{equipment.description}</p>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Selection */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="startDate" className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="endDate" className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  End Date
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  min={form.startDate || new Date().toISOString().split('T')[0]}
                  required
                  className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                />
              </div>
            </div>

            {/* Booking Summary */}
            {days > 0 && (
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Booking Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Duration</span>
                    </div>
                    <span className="font-semibold">{days} day{days > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-600">
                      <IndianRupee className="w-4 h-4" />
                      <span>Rate per day</span>
                    </div>
                    <span className="font-semibold">₹{equipment.price}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold text-gray-800">Total Cost</span>
                    <span className="font-bold text-green-600 text-2xl">₹{totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-14 text-lg border-2 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-14 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                disabled={loading || available === false || days <= 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing Booking...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5 mr-2" />
                    Confirm Booking
                  </>
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

  return createPortal(modalContent, document.body);
};

export default EquipmentBookingModal; 
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader2, X, Calendar } from 'lucide-react';

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
      const response = await fetch('http://localhost:5000/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
      setSuccess('Booking request sent!');
      setTimeout(() => {
        onBookingSuccess();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to book equipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Book Equipment</h2>
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
          {overlapError && (
            <div className="flex items-center p-4 mt-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-700">This equipment is already booked for the selected dates. Please choose different dates.</span>
            </div>
          )}
          {/* Equipment Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{equipment.name}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Type:</span> {equipment.type}</p>
              <p><span className="font-medium">Price:</span> ₹{equipment.price} per day</p>
              {equipment.description && <p><span className="font-medium">Description:</span> {equipment.description}</p>}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]} // Prevent past dates
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                min={form.startDate || new Date().toISOString().split('T')[0]} // Prevent dates before start date or past dates
                required
              />
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
                disabled={loading || available === false}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Book Equipment'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EquipmentBookingModal; 
import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, XCircle, CheckCircle, Clock, Calendar, X } from 'lucide-react';
import { getBackendUrl } from '@/lib/utils';

const UserBookingsList = () => {
  const { user } = useUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${getBackendUrl()}/api/booking/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch your bookings');
      
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError('Failed to fetch your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      console.log('Canceling booking ID:', bookingId);
      console.log('Using token:', user ? 'Token present' : 'No token');
      
      // Test server connectivity first
      console.log('Testing server connectivity...');
      try {
        const testResponse = await fetch(`${getBackendUrl()}/api/booking/user`, {
          credentials: 'include'
        });
        console.log('Server connectivity test - Status:', testResponse.status);
        if (!testResponse.ok) {
          throw new Error(`Server test failed: ${testResponse.status}`);
        }
      } catch (serverError) {
        console.error('Server connectivity test failed:', serverError);
        throw new Error('Backend server is not responding. Please make sure the server is running.');
      }
      
      // Use the delete endpoint directly
      const url = `${getBackendUrl()}/api/booking/${bookingId}`;
      console.log('Delete URL:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Use cookie-based authentication
      });
      
      console.log('DELETE response status:', response.status);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.log('Error response data:', errorData);
        } catch (parseError) {
          console.log('Failed to parse error response as JSON:', parseError);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        throw new Error(errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Success response:', result);
      
      // Refresh the bookings list
      fetchUserBookings();
      alert('Booking cancelled successfully!');
    } catch (err) {
      console.error('Cancel booking error:', err);
      alert('Failed to cancel booking: ' + err.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading your bookings...</span>
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

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">No bookings found.</p>
        <p className="text-sm text-gray-500">
          Start by booking some equipment from the available listings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">
                  {booking.equipment?.name || 'Equipment'}
                </h3>
                <p className="text-sm text-gray-600">
                  {booking.equipment?.type || 'Unknown Type'}
                </p>
                <p className="text-sm text-green-600 font-medium">
                  ₹{booking.equipment?.price || 0} / day
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(booking.status)}
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="font-medium">{booking.startDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">End Date</p>
                <p className="font-medium">{booking.endDate}</p>
              </div>
            </div>

            {booking.equipment?.description && (
              <p className="text-sm text-gray-700 mb-3">
                {booking.equipment.description}
              </p>
            )}

            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Booking ID: {booking.id}
              </div>
              
              {/* Cancel button - only show for pending and approved bookings */}
              {(booking.status === 'pending' || booking.status === 'approved') && (
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                  title="Cancel this booking"
                >
                  Cancel Booking
                </button>
              )}
              {/* Decline button - only show for pending and approved bookings */}
              {(booking.status === 'pending' || booking.status === 'approved') && (
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  className="flex items-center gap-1 px-3 py-1 border border-red-600 bg-white text-red-600 hover:bg-red-50 text-xs rounded font-semibold shadow-sm transition-colors"
                  title="Delete this booking"
                >
                  <X className="w-4 h-4" /> Delete Booking
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserBookingsList;
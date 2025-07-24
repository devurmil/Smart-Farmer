import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert, CircularProgress, Box } from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const BookingCalendar = ({ open, onClose, equipmentId, onBooked }) => {
  const { user } = useUser();
  const [bookings, setBookings] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError('');
    axios.get(`/api/booking/equipment/${equipmentId}`)
      .then(res => setBookings(res.data))
      .catch(() => setError('Failed to fetch bookings'))
      .finally(() => setLoading(false));
  }, [open, equipmentId]);

  const isDateUnavailable = (date) => {
    return bookings.some(b => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      return date >= start && date <= end;
    });
  };

  const handleBook = async () => {
    setBookingLoading(true);
    setError('');
    setSuccess('');
    try {
      const [start, end] = dateRange;
      await axios.post('/api/booking', {
        equipmentId,
        startDate: start,
        endDate: end
      }, {
        withCredentials: true,
      });
      setSuccess('Booking successful!');
      if (onBooked) onBooked();
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Book Equipment</DialogTitle>
      <DialogContent>
        {loading ? <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} /> : (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              shouldDisableDate={isDateUnavailable}
              disablePast
              calendars={1}
              renderInput={(startProps, endProps) => (
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <input {...startProps.inputProps} placeholder="Start date" />
                  <input {...endProps.inputProps} placeholder="End date" />
                </Box>
              )}
            />
          </LocalizationProvider>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleBook} variant="contained" disabled={bookingLoading || !dateRange[0] || !dateRange[1]}>Book</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingCalendar; 
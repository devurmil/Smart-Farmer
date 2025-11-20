import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Edit, Trash2, Eye, ChevronDown, CheckCircle, XCircle, Upload, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getBackendUrl } from '@/lib/utils';
import { useSSE } from '@/hooks/useSSE';

const OwnerEquipmentList = ({ refreshTrigger }) => {
  const { user, token } = useUser();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    type: '',
    price: '',
    description: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bookingData, setBookingData] = useState({});
  const [bookingLoading, setBookingLoading] = useState({});
  const [notification, setNotification] = useState('');
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  // Collapsible history state
  const [collapsedHistory, setCollapsedHistory] = useState({});

  const normalizeId = (value) => {
    if (!value) return null;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;
      return trimmed;
    }
    if (typeof value === 'object') {
      if (value.$oid) return value.$oid;
      if (value._id) return normalizeId(value._id);
      if (value.id) return normalizeId(value.id);
      if (typeof value.toString === 'function') {
        const toStringValue = value.toString();
        if (toStringValue && toStringValue !== '[object Object]') return toStringValue;
      }
    }
    return null;
  };

  const getEquipmentId = (equipmentItem) => {
    if (!equipmentItem) return null;
    return (
      normalizeId(equipmentItem.id) ||
      normalizeId(equipmentItem._id) ||
      normalizeId(equipmentItem.equipmentId) ||
      normalizeId(equipmentItem.slug) ||
      null
    );
  };

  const getBookingId = (booking, fallbackIndex = 0) => {
    if (!booking) return null;
    return (
      normalizeId(booking.id) ||
      normalizeId(booking._id) ||
      normalizeId(booking.bookingId) ||
      normalizeId(booking.booking_id) ||
      `${normalizeId(booking.equipmentId) || 'booking'}-${booking.startDate || 'start'}-${fallbackIndex}`
    );
  };

  const getBookingApiId = (booking) => {
    if (!booking) return null;
    return (
      normalizeId(booking.id) ||
      normalizeId(booking._id) ||
      normalizeId(booking.bookingId) ||
      normalizeId(booking.booking_id) ||
      normalizeId(booking.referenceId) ||
      normalizeId(booking.reference_id) ||
      null
    );
  };

  const getEquipmentIdFromBookingPayload = (bookingPayload) => {
    if (!bookingPayload) return null;
    if (typeof bookingPayload === 'string') return bookingPayload;
    return (
      normalizeId(bookingPayload.equipmentId) ||
      normalizeId(bookingPayload.equipment_id) ||
      normalizeId(bookingPayload.equipment?.id) ||
      normalizeId(bookingPayload.equipment?._id) ||
      null
    );
  };

  const extractBookingUserInfo = (booking) => {
    const source = booking?.user || booking?.userId || booking?.userInfo || null;
    if (!source) {
      return {
        name: 'Unknown Farmer',
        email: null,
        phone: null,
        raw: null,
      };
    }
    if (typeof source === 'string') {
      return {
        name: source,
        email: null,
        phone: null,
        raw: source,
      };
    }
    return {
      name: source.name || source.fullName || source.email || source._id || 'Unknown Farmer',
      email: source.email || null,
      phone: source.phone || null,
      raw: source,
    };
  };

  // Helper function to separate active and historical bookings
  const separateBookings = (bookings) => {
    if (!Array.isArray(bookings)) return { active: [], history: [] };
    
    const active = bookings.filter(booking => 
      booking.status === 'pending' || booking.status === 'approved'
    );
    const history = bookings.filter(booking => 
      booking.status === 'completed' || booking.status === 'rejected'
    );
    
    return { active, history };
  };

  // Toggle history collapse state
  const toggleHistory = (equipmentId) => {
    setCollapsedHistory(prev => ({
      ...prev,
      [equipmentId]: !prev[equipmentId]
    }));
  };

  const buildAuthHeaders = () => {
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
      };
    }
    return {};
  };

  const fetchEquipment = async (pageParam = page) => {
    setLoading(true);
    setError('');
    try {
      let url;
      console.log('User:', user);
      console.log('Token:', token ? 'Present' : 'Not Present');
      console.log('User Role:', user?.role);
      
      if (user?.role === 'admin') {
        url = `${getBackendUrl()}/api/equipment`;
      } else if (user?.role === 'owner') {
        url = `${getBackendUrl()}/api/equipment/owner?page=${pageParam}&limit=${limit}&t=${Date.now()}`;
      } else {
        console.log('User role not admin or owner, aborting fetch');
        setEquipment([]);
        setTotal(0);
        setLoading(false);
        return;
      }
      
      console.log('Fetching from URL:', url);
      console.log('Headers will include: Cookie-based authentication');
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: buildAuthHeaders()
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error('Failed to fetch equipment');
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        const equipmentArray = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        setEquipment(equipmentArray);
        setTotal(data.total ?? equipmentArray.length ?? 0);
      } else {
        setEquipment([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Fetch equipment error:', err);
      setError('Failed to fetch your equipment');
      setEquipment([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Debug logging for state
  console.log('EQUIPMENT:', equipment, 'LOADING:', loading, 'ERROR:', error);

  // Fetch bookings for each equipment
  const fetchBookings = async (equipmentId) => {
    if (!equipmentId) {
      console.warn('fetchBookings called without equipmentId');
      return;
    }
    const trimmedId = equipmentId.trim();
    if (!trimmedId || trimmedId === 'undefined' || trimmedId === 'null') {
      console.warn('fetchBookings received invalid equipmentId:', equipmentId);
      return;
    }
    setBookingLoading((prev) => ({ ...prev, [trimmedId]: true }));
    try {
      const res = await fetch(`${getBackendUrl()}/api/booking/equipment/${trimmedId}`, {
        credentials: 'include',
        headers: buildAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      const bookingsArray = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];
      setBookingData((prev) => ({ ...prev, [trimmedId]: bookingsArray }));
    } catch {
      setBookingData((prev) => ({ ...prev, [trimmedId]: [] }));
    } finally {
      setBookingLoading((prev) => ({ ...prev, [trimmedId]: false }));
    }
  };

  // SSE hook for real-time updates
  useSSE({
    onNewBooking: (data) => {
      console.log('SSE: New booking event received:', data);
      setNotification(data.message);
      // Refresh equipment list to show new bookings
      fetchEquipment();
      // Refresh bookings for the specific equipment
      const equipmentId = getEquipmentIdFromBookingPayload(data.booking);
      if (equipmentId) {
        fetchBookings(equipmentId);
      }
      setTimeout(() => setNotification(''), 5000);
    },
    onBookingUpdated: (data) => {
      console.log('SSE: Booking updated event received:', data);
      setNotification(data.message);
      // Refresh equipment list
      fetchEquipment();
      // Refresh bookings for the specific equipment
      const equipmentId = getEquipmentIdFromBookingPayload(data.booking);
      if (equipmentId) {
        fetchBookings(equipmentId);
      }
      setTimeout(() => setNotification(''), 5000);
    },
    onBookingCancelled: (data) => {
      console.log('SSE: Booking cancelled event received:', data);
      setNotification(data.message);
      // Refresh equipment list
      fetchEquipment();
      // Refresh bookings for the specific equipment
      const equipmentId = getEquipmentIdFromBookingPayload(data.booking);
      if (equipmentId) {
        fetchBookings(equipmentId);
      }
      setTimeout(() => setNotification(''), 5000);
    },
    onBookingApproved: (data) => {
      console.log('SSE: Booking approved event received:', data);
      setNotification(data.message);
      // Refresh equipment list
      fetchEquipment();
      // Refresh bookings for the specific equipment
      const equipmentId = getEquipmentIdFromBookingPayload(data.booking);
      if (equipmentId) {
        fetchBookings(equipmentId);
      }
      setTimeout(() => setNotification(''), 5000);
    },
    onBookingRejected: (data) => {
      console.log('SSE: Booking rejected event received:', data);
      setNotification(data.message);
      // Refresh equipment list
      fetchEquipment();
      // Refresh bookings for the specific equipment
      const equipmentId = getEquipmentIdFromBookingPayload(data.booking);
      if (equipmentId) {
        fetchBookings(equipmentId);
      }
      setTimeout(() => setNotification(''), 5000);
    },
    onBookingCompleted: (data) => {
      console.log('SSE: Booking completed event received:', data);
      setNotification(data.message);
      // Refresh equipment list
      fetchEquipment();
      // Refresh bookings for the specific equipment
      const equipmentId = getEquipmentIdFromBookingPayload(data.booking);
      if (equipmentId) {
        fetchBookings(equipmentId);
      }
      setTimeout(() => setNotification(''), 5000);
    }
  });

  useEffect(() => {
    if (user) {
      fetchEquipment();
    }
  }, [user, refreshTrigger, page]);

  // Fetch bookings for all equipment when equipment list loads
  useEffect(() => {
    if (equipment.length > 0) {
      equipment.forEach((item) => {
        const equipmentId = getEquipmentId(item);
        if (equipmentId && !bookingData[equipmentId]) {
          fetchBookings(equipmentId);
        }
      });
    }
  }, [equipment]);

  const handleView = (item) => {
    const equipmentId = getEquipmentId(item);
    setSelectedEquipment(item);
    setSelectedEquipmentId(equipmentId);
    setIsViewOpen(true);
    if (equipmentId && !bookingData[equipmentId]) {
      fetchBookings(equipmentId);
    }
  };

  const handleEdit = (item) => {
    const equipmentId = getEquipmentId(item);
    setSelectedEquipment(item);
    setSelectedEquipmentId(equipmentId);
    setEditForm({
      name: item.name,
      type: item.type,
      price: item.price,
      description: item.description || ''
    });
    setIsEditOpen(true);
  };

  const handleDelete = (item) => {
    const equipmentId = getEquipmentId(item);
    setSelectedEquipment(item);
    setSelectedEquipmentId(equipmentId);
    setIsDeleteOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      if (!selectedEquipmentId) throw new Error('Missing equipment identifier');
      const response = await fetch(`${getBackendUrl()}/api/equipment/${selectedEquipmentId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify(editForm)
      });
      
      if (!response.ok) throw new Error('Failed to update equipment');
      
      setIsEditOpen(false);
      fetchEquipment(); // Refresh the list
    } catch (err) {
      alert('Failed to update equipment: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    
    try {
      if (!selectedEquipmentId) throw new Error('Missing equipment identifier');
      const response = await fetch(`${getBackendUrl()}/api/equipment/${selectedEquipmentId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to delete equipment');
      
      setIsDeleteOpen(false);
      fetchEquipment(); // Refresh the list
    } catch (err) {
      alert('Failed to delete equipment: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  // Pagination controls
  const totalPages = Math.ceil(total / limit);
  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchEquipment(newPage);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="p-4 bg-emerald-100 rounded-full mb-4">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Your Equipment</h3>
        <p className="text-gray-600">Fetching your equipment listings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="p-4 bg-red-100 rounded-full mb-4">
          <AlertCircle className="w-12 h-12 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Equipment</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button
          onClick={() => fetchEquipment()}
          variant="outline"
          className="bg-white hover:bg-gray-50"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (equipment.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <Upload className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Equipment Listed Yet</h3>
        <p className="text-gray-600 text-center max-w-md">
          Start by adding your first piece of equipment above to begin earning rental income from fellow farmers.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Real-time notification */}
      {notification && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">{notification}</span>
          </div>
        </div>
      )}
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mb-4 gap-2">
          <Button onClick={() => handlePageChange(page - 1)} disabled={page === 1} size="sm">Prev</Button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <Button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} size="sm">Next</Button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item, idx) => {
          const equipmentId = getEquipmentId(item);
          const uiKey = equipmentId || `equipment-${idx}`;
          const collapseKey = equipmentId || uiKey;
          const itemBookings = equipmentId ? bookingData[equipmentId] || [] : [];
          const isBookingLoading = equipmentId ? bookingLoading[equipmentId] : false;
          return (
          <Card key={uiKey} className="overflow-hidden">
            {item.imageUrl && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={item.imageUrl}
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
              <div className="space-y-3">
                <p className="text-lg font-semibold text-green-600">
                  ₹{item.price} / day
                </p>
                <p className="text-sm text-gray-700">{item.description}</p>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleView(item)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Available
                  </span>
                  <span className="text-xs text-gray-500">
                    {itemBookings.length}
                  </span>
                </div>
                
                {/* Bookings Section */}
                <div className="mt-4">
                  {isBookingLoading ? (
                    <div className="flex items-center text-gray-500 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading Bookings...
                    </div>
                  ) : itemBookings ? (
                    (() => {
                      const { active, history } = separateBookings(itemBookings);
                      
                      return (
                        <div className="space-y-3">
                          {/* Active Bookings - Always Visible */}
                          {active.length > 0 && (
                            <div className="bg-blue-50 rounded-lg p-3">
                              <div className="font-semibold text-sm text-blue-800 mb-2 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Active Bookings ({active.length})
                              </div>
                              <div className="space-y-2">
                                {active.map((booking, activeIdx) => {
                                  const bookingId = getBookingId(booking, activeIdx);
                                  const bookingApiId = getBookingApiId(booking);
                                  const bookingUser = extractBookingUserInfo(booking);
                                  return (
                                  <div key={bookingId} className="bg-white rounded p-2 border border-blue-200">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">{booking.startDate} to {booking.endDate}</div>
                                        <div className="text-xs text-gray-500">Farmer: {bookingUser.name}</div>
                                      </div>
                                      <div className="flex-shrink-0">
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                          booking.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                          {booking.status}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    {/* Action buttons */}
                                    <div className="flex gap-1 flex-wrap">
                                      {booking.status === 'pending' && (
                                        <>
                                          <button
                                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                                            title="Approve this booking"
                                            onClick={async () => {
                                              if (!bookingApiId) return;
                                              await fetch(`${getBackendUrl()}/api/booking/${bookingApiId}/approve`, {
                                                method: 'PATCH',
                                                credentials: 'include',
                                                headers: buildAuthHeaders()
                                              });
                                              if (equipmentId) {
                                                fetchBookings(equipmentId);
                                              }
                                            }}
                                          >
                                            ✓ Approve
                                          </button>
                                          <button
                                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                                            title="Decline this booking"
                                            onClick={async () => {
                                              if (!bookingApiId) return;
                                              await fetch(`${getBackendUrl()}/api/booking/${bookingApiId}/decline`, {
                                                method: 'PATCH',
                                                credentials: 'include',
                                                headers: buildAuthHeaders()
                                              });
                                              if (equipmentId) {
                                                fetchBookings(equipmentId);
                                              }
                                            }}
                                          >
                                            ✗ Decline
                                          </button>
                                          <button
                                            className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded"
                                            title="Delete this booking"
                                            onClick={async () => {
                                              if (!bookingApiId) return;
                                              await fetch(`${getBackendUrl()}/api/booking/${bookingApiId}`, {
                                                method: 'DELETE',
                                                credentials: 'include',
                                                headers: buildAuthHeaders()
                                              });
                                              if (equipmentId) {
                                                fetchBookings(equipmentId);
                                              }
                                            }}
                                          >
                                            🗑 Delete
                                          </button>
                                        </>
                                      )}
                                      {booking.status === 'approved' && (
                                        <>
                                          <button
                                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                                            onClick={async () => {
                                              if (!bookingApiId) return;
                                              await fetch(`${getBackendUrl()}/api/booking/${bookingApiId}/complete`, {
                                                method: 'PATCH',
                                                credentials: 'include',
                                                headers: buildAuthHeaders()
                                              });
                                              if (equipmentId) {
                                                fetchBookings(equipmentId);
                                              }
                                            }}
                                          >
                                            ✓ Complete
                                          </button>
                                          <button
                                            className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded"
                                            title="Delete this booking"
                                            onClick={async () => {
                                              if (!bookingApiId) return;
                                              await fetch(`${getBackendUrl()}/api/booking/${bookingApiId}`, {
                                                method: 'DELETE',
                                                credentials: 'include',
                                                headers: buildAuthHeaders()
                                              });
                                              if (equipmentId) {
                                                fetchBookings(equipmentId);
                                              }
                                            }}
                                          >
                                            🗑 Delete
                                          </button>
                                        </>
                                      )}
                                    </div>
                                    
                                    {/* Contact Info */}
                                    <div className="text-xs text-gray-600 mt-2">
                                      {bookingUser.email && (
                                        <div>Email: <a href={`mailto:${bookingUser.email}`} className="text-blue-600 underline">{bookingUser.email}</a></div>
                                      )}
                                      {bookingUser.phone && (
                                        <div>Phone: <a href={`tel:${bookingUser.phone}`} className="text-blue-600 underline">{bookingUser.phone}</a></div>
                                      )}
                                    </div>
                                  </div>
                                );})}
                              </div>
                            </div>
                          )}

                          {/* Historical Bookings - Collapsible */}
                          {history.length > 0 && (
                            <div className="bg-gray-50 rounded-lg border border-gray-200">
                              <button
                                onClick={() => toggleHistory(collapseKey)}
                                className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center">
                                  {collapsedHistory[collapseKey] ? (
                                    <ChevronRight className="w-4 h-4 mr-2 text-gray-500" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 mr-2 text-gray-500" />
                                  )}
                                  <span className="font-semibold text-sm text-gray-700">
                                    Booking History ({history.length})
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {collapsedHistory[collapseKey] ? 'Click to expand' : 'Click to collapse'}
                                </span>
                              </button>
                              
                              {!collapsedHistory[collapseKey] && (
                                <div className="p-3 border-t border-gray-200 space-y-2">
                                  {history.map((booking, historyIdx) => {
                                    const bookingId = getBookingId(booking, historyIdx);
                                    const bookingUser = extractBookingUserInfo(booking);
                                    return (
                                    <div key={bookingId} className="bg-white rounded p-2 border border-gray-200">
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                          <div className="font-medium text-sm">{booking.startDate} to {booking.endDate}</div>
                                          <div className="text-xs text-gray-500">Farmer: {bookingUser.name}</div>
                                        </div>
                                        <div className="flex-shrink-0">
                                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                            booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {booking.status}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {/* Status Icon */}
                                      <div className="flex items-center text-xs text-gray-600">
                                        {booking.status === 'completed' && (
                                          <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                                        )}
                                        {booking.status === 'rejected' && (
                                          <XCircle className="w-3 h-3 text-red-600 mr-1" />
                                        )}
                                        <span className="capitalize">{booking.status}</span>
                                      </div>
                                      
                                      {/* Contact Info */}
                                      <div className="text-xs text-gray-600 mt-2">
                                        {bookingUser.email && (
                                          <div>Email: <a href={`mailto:${bookingUser.email}`} className="text-blue-600 underline">{bookingUser.email}</a></div>
                                        )}
                                        {bookingUser.phone && (
                                          <div>Phone: <a href={`tel:${bookingUser.phone}`} className="text-blue-600 underline">{bookingUser.phone}</a></div>
                                        )}
                                      </div>
                                    </div>
                                    );})}
                                </div>
                              )}
                            </div>
                          )}

                          {/* No Bookings Message */}
                          {active.length === 0 && history.length === 0 && (
                            <div className="text-xs text-gray-500 text-center py-2">
                              No bookings yet.
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        );})}
      </div>
      {/* Pagination Controls (bottom) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 gap-2">
          <Button onClick={() => handlePageChange(page - 1)} disabled={page === 1} size="sm">Prev</Button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <Button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} size="sm">Next</Button>
        </div>
      )}
      
      {/* View Dialog */}
      {selectedEquipment && (
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Equipment Details</DialogTitle>
              <DialogDescription>Review the selected equipment information and booking status.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedEquipment.imageUrl && (
                <div className="aspect-video overflow-hidden rounded-lg">
                  <img
                    src={selectedEquipment.imageUrl}
                    alt={selectedEquipment.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Name:</Label>
                  <p className="text-gray-700">{selectedEquipment.name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Type:</Label>
                  <p className="text-gray-700">{selectedEquipment.type}</p>
                </div>
                <div>
                  <Label className="font-semibold">Price per Day:</Label>
                  <p className="text-green-600 font-semibold">₹{selectedEquipment.price}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status:</Label>
                  <p className="text-green-600">Available</p>
                </div>
              </div>
              {selectedEquipment.description && (
                <div>
                  <Label className="font-semibold">Description:</Label>
                  <p className="text-gray-700 mt-1">{selectedEquipment.description}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {selectedEquipment && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Equipment</DialogTitle>
              <DialogDescription>Update the details of your equipment listing.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Equipment Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Equipment Type</Label>
                <Input
                  id="edit-type"
                  name="type"
                  value={editForm.type}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price per Day (₹)</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  value={editForm.price}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      {selectedEquipment && (
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Equipment</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedEquipment.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default OwnerEquipmentList;
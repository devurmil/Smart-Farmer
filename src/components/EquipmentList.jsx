import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  AlertCircle,
  Calendar,
  Search,
  Filter,
  MapPin,
  Clock,
  IndianRupee,
  Star,
  CheckCircle2,
  Tractor,
  Eye
} from 'lucide-react';
import EquipmentBookingModal from './EquipmentBookingModal';
import { Input } from '@/components/ui/input';
import { getBackendUrl } from '@/lib/utils';
import { useUser } from '../contexts/UserContext';

const EquipmentList = () => {
  const { user, token } = useUser();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openBookingEquipment, setOpenBookingEquipment] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const buildAuthHeaders = () => {
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
      };
    }
    return {};
  };

  const normalizeEquipment = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map((item) => ({
      ...item,
      id: item.id || item._id,
    }));
  };

  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      setError('');
      try {
        let url = `${getBackendUrl()}/api/equipment`;
        if (dateRange.startDate && dateRange.endDate) {
          url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
        }
        const response = await fetch(url, {
          credentials: 'include',
          headers: buildAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch equipment');
        const data = await response.json();
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setEquipment(normalizeEquipment(list));
      } catch (err) {
        setError('Failed to fetch equipment');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchEquipment();
    }
  }, [refresh, dateRange, user]);

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const handleBookingClose = () => setOpenBookingEquipment(null);
  const handleBookingSuccess = () => {
    setOpenBookingEquipment(null);
    setRefresh((r) => !r);
  };

  const filteredEquipment = (equipment || []).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type.toLowerCase().includes(filterType.toLowerCase());
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="p-4 bg-blue-100 rounded-full mb-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Equipment</h3>
        <p className="text-gray-600">Finding the best equipment for you...</p>
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
        <p className="text-red-600">{error}</p>
        <Button
          className="mt-4"
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <Tractor className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Equipment Available</h3>
        <p className="text-gray-600">Check back later for new equipment listings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Filter Controls */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Filter className="w-6 h-6 text-blue-600" />
          Search & Filter Equipment
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search equipment by name or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg"
            />
          </div>
          
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-12 px-4 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg bg-white"
          >
            <option value="all">All Equipment Types</option>
            <option value="tractor">Tractors</option>
            <option value="harvester">Harvesters</option>
            <option value="planter">Planters</option>
            <option value="irrigation">Irrigation</option>
          </select>
        </div>

        {/* Date Range Selection */}
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              Start Date
            </label>
            <Input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              End Date
            </label>
            <Input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              min={dateRange.startDate || new Date().toISOString().split('T')[0]}
              className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setDateRange({ startDate: '', endDate: '' })}
              className="h-12 px-6 text-lg"
            >
              Clear Dates
            </Button>
          </div>
        </div>
        
        {/* Date Range Status */}
        {dateRange.startDate && dateRange.endDate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-700">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">
                Checking availability for {dateRange.startDate} to {dateRange.endDate}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between py-4">
        <div className="text-lg text-gray-700">
          Showing <span className="font-bold text-blue-600">{filteredEquipment.length}</span> equipment
          {searchTerm && <span> matching "<span className="font-semibold">{searchTerm}</span>"</span>}
        </div>
        <div className="text-sm text-gray-500">
          Updated {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEquipment.map((item) => (
          <Card key={item.id} className="group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-emerald-200 bg-emerald-50/80 backdrop-blur-sm">
            {/* Equipment Image */}
            <div className="relative">
              {item.imageUrl ? (
                <div className="aspect-video overflow-hidden bg-gradient-to-br from-emerald-100 to-green-100">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-green-100">
                          <div class="text-center">
                            <div class="w-16 h-16 mx-auto mb-2 bg-emerald-200 rounded-full flex items-center justify-center">
                              <svg class="w-8 h-8 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                              </svg>
                            </div>
                            <p class="text-emerald-700 font-medium">Equipment Image</p>
                          </div>
                        </div>
                      `;
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                  <div className="text-center">
                    <Tractor className="w-16 h-16 mx-auto mb-2 text-emerald-700" />
                    <p className="text-emerald-700 font-medium">Equipment Image</p>
                  </div>
                </div>
              )}
              
              {/* Availability Badge */}
              <div className="absolute top-4 right-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.available
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {item.available ? (
                    <><CheckCircle2 className="w-3 h-3 inline mr-1" />
                      {dateRange.startDate && dateRange.endDate ? 'Available' : 'Available'}
                    </>
                  ) : (
                    <>
                      {dateRange.startDate && dateRange.endDate ? 'Booked' : 'Unavailable'}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Equipment Details */}
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors">
                    {item.name}
                  </CardTitle>
                  <p className="text-sm text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded mt-1 inline-block">
                    {item.type}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-500 mb-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                  <p className="text-xs text-gray-500">42 reviews</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Price */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-green-700" />
                    <span className="text-2xl font-bold text-green-800">₹{item.price}</span>
                    <span className="text-sm text-green-700">/ day</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-sm line-clamp-2">{item.description}</p>

                {/* Location & Contact */}
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>Available Nearby</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Quick Delivery</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {expandedId === item.id ? 'Hide Details' : 'Details'}
                  </Button>
                  <Button
                    className={`flex-1 ${
                      item.available
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white'
                        : 'bg-gray-400 cursor-not-allowed text-gray-200'
                    }`}
                    onClick={() => item.available && setOpenBookingEquipment(item)}
                    disabled={!item.available}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {item.available 
                      ? (dateRange.startDate && dateRange.endDate ? 'Book Selected Dates' : 'Book Now')
                      : (dateRange.startDate && dateRange.endDate ? 'Dates Unavailable' : 'Unavailable')
                    }
                  </Button>
                </div>

                {expandedId === item.id && (
                  <div className="mt-4 border-t border-emerald-100 pt-4 space-y-2 text-sm text-emerald-900">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{item.location || 'Location shared after booking'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Added: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    {item.owner?.name && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>Owner: {item.owner.name}</span>
                      </div>
                    )}
                    {item.features && Array.isArray(item.features) && item.features.length > 0 && (
                      <div>
                        <p className="font-semibold">Key Features:</p>
                        <ul className="list-disc list-inside text-emerald-800">
                          {item.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>

          </Card>
        ))}
      </div>

      {/* Booking Modal - render once at root, not inside a card */}
      {openBookingEquipment && (
        <EquipmentBookingModal
          equipment={openBookingEquipment}
          onClose={handleBookingClose}
          onBookingSuccess={handleBookingSuccess}
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          available={openBookingEquipment?.available}
        />
      )}

      {/* Empty State for Filtered Results */}
      {filteredEquipment.length === 0 && equipment.length > 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="p-4 bg-amber-100 rounded-full mb-4">
            <Search className="w-12 h-12 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Equipment Found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search terms or filters</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
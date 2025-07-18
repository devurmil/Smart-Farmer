import React, { useState, useMemo } from 'react';
import MainLayout from '../components/MainLayout';
import cropData from '../lib/cropData.json';
import {
  Droplet,
  FlaskConical,
  Sprout,
  CalendarCheck,
  Search,
  Filter,
  TrendingUp,
  MapPin,
  Clock,
  IndianRupee,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

const units = [
  { label: 'Acre', value: 'acre', symbol: 'ac' },
  { label: 'Hectare', value: 'hectare', symbol: 'ha' },
  { label: 'Sq Meter', value: 'sq_meter', symbol: 'm²' },
  { label: 'Bigha', value: 'bigha', symbol: 'bigha' },
];

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getCropSlug(name) {
  return name.toLowerCase().replace(/\s*\([^)]*\)/g, '').replace(/[^a-z0-9]/g, '');
}

function getCropImages(cropName) {
  const slug = getCropSlug(cropName);
  
  // List of crops that have image folders
  const availableCrops = ['bajra', 'castor', 'cotton', 'cumin', 'groundnut', 'maize', 'onion', 'potato', 'rice', 'sugarcane', 'tomato', 'wheat'];
  
  // If crop doesn't have a dedicated folder, return null to use fallback
  if (!availableCrops.includes(slug)) {
    return null;
  }
  
  // Map of crops to their actual file extensions based on what's available
  const imageExtensions = {
    bajra: { icon: 'jpeg', bg: 'jpg', fertilizer: 'png', water: 'jpeg', soil: 'jpg' },
    castor: { icon: 'avif', bg: 'webp', fertilizer: 'webp', water: 'jpeg', soil: 'jpeg' },
    cotton: { icon: 'jpg', bg: 'jpg', fertilizer: 'jpg', water: 'webp', soil: 'jpg' },
    cumin: { icon: 'webp', bg: 'jpg', fertilizer: 'jpg', water: 'jpg', soil: 'jpg' },
    groundnut: { icon: 'jpg', bg: 'jpg', fertilizer: 'jpg', water: 'jpg', soil: 'jpg' },
    maize: { icon: 'jpg', bg: 'jpg', fertilizer: 'jpg', water: 'jpg', soil: 'jpg' },
    onion: { icon: 'jpg', bg: 'jpg', fertilizer: 'jpg', water: 'jpg', soil: 'jpg' },
    potato: { icon: 'jpg', bg: 'jpg', fertilizer: 'jpg', water: 'jpg', soil: 'jpg' },
    rice: { icon: 'jpg', bg: 'jpg', fertilizer: 'jpg', water: 'jpg', soil: 'webp' },
    sugarcane: { icon: 'jpg', bg: 'jpg', fertilizer: 'jpg', water: 'jpg', soil: 'webp' },
    tomato: { icon: 'jpg', bg: 'jpg', fertilizer: 'webp', water: 'jpg', soil: 'jpg' },
    wheat: { icon: 'webp', bg: 'jpg', fertilizer: 'webp', water: 'jpg', soil: 'webp' }
  };
  
  const extensions = imageExtensions[slug];
  
  return {
    icon: `/crops/${slug}/icon.${extensions.icon}`,
    background: `/crops/${slug}/bg.${extensions.bg}`,
    fertilizer: `/crops/${slug}/fertilizer.${extensions.fertilizer}`,
    water: `/crops/${slug}/water.${extensions.water}`,
    soil: `/crops/${slug}/soil.${extensions.soil}`
  };
}

const CostPlanning = () => {
  const [selectedUnit, setSelectedUnit] = useState('acre');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const selectedUnitData = units.find(u => u.value === selectedUnit);

  const filteredAndSortedCrops = useMemo(() => {
    let filtered = cropData.filter(crop =>
      crop.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'cost':
          return b.cost[selectedUnit] - a.cost[selectedUnit];
        case 'planting':
          return a.planting_months.localeCompare(b.planting_months);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [searchTerm, sortBy, selectedUnit]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Cost Planning for Major Crops
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Plan your agricultural investments with detailed cost analysis for Gujarat's major crops
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>Gujarat, India</span>
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search crops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-3">
                {/* Unit Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-green-700 font-medium transition-colors">
                    <IndianRupee className="h-4 w-4" />
                    <span>Cost per {selectedUnitData?.label}</span>
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {units.map(unit => (
                      <DropdownMenuItem
                        key={unit.value}
                        onClick={() => setSelectedUnit(unit.value)}
                        className={selectedUnit === unit.value ? 'bg-green-50' : ''}
                      >
                        {unit.label} ({unit.symbol})
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Sort Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                    <Filter className="h-4 w-4" />
                    <span>Sort by</span>
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSortBy('name')}>
                      Name (A-Z)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('cost')}>
                      Cost (High to Low)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('planting')}>
                      Planting Season
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-green-700">{filteredAndSortedCrops.length}</span> crops
              {searchTerm && (
                <span> matching "<span className="font-semibold">{searchTerm}</span>"</span>
              )}
            </p>
          </div>

          {/* Crops Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCrops.map((crop) => {
              const cropImages = getCropImages(crop.name);
              return (
                <Link key={crop.name} to={`/cost-planning/${getCropSlug(crop.name)}?unit=${selectedUnit}`} className="block group">
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-md overflow-hidden relative">
                    {/* Background Image - only show if cropImages exists */}
                    {cropImages && (
                      <div
                        className="absolute inset-0 opacity-5 bg-cover bg-center"
                        style={{ backgroundImage: `url(${cropImages.background})` }}
                      />
                    )}
                    <CardHeader className="pb-4 relative z-10 flex flex-col items-center">
                      <img
                        src={cropImages ? cropImages.icon : (crop.image || '/placeholder.svg')}
                        alt={crop.name}
                        className="w-16 h-16 object-cover rounded-xl border-2 border-green-100 shadow-sm mb-2"
                        onError={(e) => {
                          if (e.currentTarget.src !== window.location.origin + '/placeholder.svg') {
                            e.currentTarget.src = '/placeholder.svg';
                          }
                        }}
                      />
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors text-center">
                        {crop.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 relative z-10 flex flex-col items-center">
                      <p className="text-gray-700 text-center text-sm mb-4">
                        Click to view detailed information about this crop.
                      </p>
                      <div className="flex items-center justify-between w-full mt-4">
                        <span className="text-sm font-medium text-gray-500">Click to view details</span>
                        <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                          <span>Learn more</span>
                          <ChevronDown className="h-4 w-4 rotate-[-90deg] group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredAndSortedCrops.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No crops found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CostPlanning;
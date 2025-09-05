import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/MainLayout';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Import the background image
import costBackground from '/Backgrounds/Cost Background.jpg';

const units = [
  { label: 'Acre', value: 'acre', symbol: 'ac' },
  { label: 'Hectare', value: 'hectare', symbol: 'ha' },
  { label: 'Sq Meter', value: 'sq_meter', symbol: 'm²' },
  { label: 'Bigha', value: 'bigha', symbol: 'bigha' },
];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getCropSlug(name: string) {
  return name.toLowerCase().replace(/\s*\([^)]*\)/g, '').replace(/[^a-z0-9]/g, '');
}

function getCropImages(cropName: string) {
  const slug = getCropSlug(cropName);
  
  const availableCrops = ['bajra', 'castor', 'cotton', 'cumin', 'groundnut', 'maize', 'onion', 'potato', 'rice', 'sugarcane', 'tomato', 'wheat'];
  
  if (!availableCrops.includes(slug)) {
    return null;
  }
  
  const imageExtensions: Record<string, Record<string, string>> = {
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
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'planting'>('name');

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <MainLayout>
      <div className="min-h-screen relative">
        {/* Background Image */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${costBackground})` }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                Cost Planning for Major Crops
              </h1>
              <p className="text-lg text-white/90 mb-6">
                Plan your agricultural investments with detailed cost analysis for Gujarat's major crops
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                <MapPin className="h-4 w-4" />
                <span>Gujarat, India</span>
              </div>
            </div>

            {/* Controls Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/30 p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
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
                    <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/20 rounded-lg text-emerald-700 font-medium transition-colors">
                      <IndianRupee className="h-4 w-4" />
                      <span>Cost per {selectedUnitData?.label}</span>
                      <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {units.map(unit => (
                        <DropdownMenuItem
                          key={unit.value}
                          onClick={() => setSelectedUnit(unit.value)}
                          className={selectedUnit === unit.value ? 'bg-emerald-50 text-emerald-700' : ''}
                        >
                          {unit.label} ({unit.symbol})
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Sort Selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 border border-white/30 rounded-lg hover:bg-white/60 transition-colors text-gray-800 bg-white/40">
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
              <p className="text-white/90">
                Showing <span className="font-semibold text-white">{filteredAndSortedCrops.length}</span> crops
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
                    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border border-white/40 shadow-md overflow-hidden relative">
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
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors text-center">
                          {crop.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 relative z-10 flex flex-col items-center">
                        <p className="text-gray-700 text-center text-sm mb-4">
                          Click to view detailed information about this crop.
                        </p>
                        <div className="flex items-center justify-between w-full mt-4">
                          <span className="text-sm font-medium text-gray-600">Click to view details</span>
                          <div className="flex items-center gap-1 text-emerald-700 text-sm font-medium">
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

            {filteredAndSortedCrops.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 bg-white/40 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No crops found</h3>
                <p className="text-white/80">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CostPlanning;
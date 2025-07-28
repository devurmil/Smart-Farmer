import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Save, Download, Trash2, Edit2, Calculator, Brain, Sprout } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import replicateClient from "@/lib/replicate";
import { useUser } from "@/contexts/UserContext";
import { getBackendUrl } from '@/lib/utils';
import { MapContainer, TileLayer, Polygon, FeatureGroup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';

// Fix for default icon issue with Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const FarmCalculator = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const mapRef = useRef(null);
  const viewMapRef = useRef(null);
  const [coordinates, setCoordinates] = useState([]);
  const [area, setArea] = useState(0);
  const [unit, setUnit] = useState('acres');
  const [farmName, setFarmName] = useState('');
  const [farmDescription, setFarmDescription] = useState('');
  const [savedFarms, setSavedFarms] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // AI Features
  const [cropType, setCropType] = useState('');
  const [soilType, setSoilType] = useState('');
  const [climate, setClimate] = useState('');
  const [soilPH, setSoilPH] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const featureGroupRef = useRef();
  const viewFeatureGroupRef = useRef();

  const onCreated = e => {
    const { layer } = e;
    const latlngs = layer.getLatLngs()[0].map(latlng => ({ lat: latlng.lat, lng: latlng.lng }));
    setCoordinates(latlngs);
    const areaInSqMeters = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
    setArea(convertArea(areaInSqMeters, unit));
    setIsDrawing(false);
    toast({
      title: "Area calculated!",
      description: `Farm area: ${convertArea(areaInSqMeters, unit).toFixed(2)} ${unit}`,
    });
  };

  const onEdited = e => {
    const { layers } = e;
    layers.eachLayer(layer => {
      const latlngs = layer.getLatLngs()[0].map(latlng => ({ lat: latlng.lat, lng: latlng.lng }));
      setCoordinates(latlngs);
      const areaInSqMeters = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
      setArea(convertArea(areaInSqMeters, unit));
    });
  };

  const onDeleted = () => {
    setCoordinates([]);
    setArea(0);
  };

  // Calculate area using coordinates
  const calculatePolygonArea = (coords) => {
    if (coords.length < 3) return 0;
    const latlngs = coords.map(c => new L.LatLng(c.lat, c.lng));
    return L.GeometryUtil.geodesicArea(latlngs);
  };

  // Convert area units
  const convertArea = (areaInSqMeters, targetUnit) => {
    switch (targetUnit) {
      case 'acres':
        return areaInSqMeters / 4047;
      case 'hectares':
        return areaInSqMeters / 10000;
      case 'sqmeters':
        return areaInSqMeters;
      default:
        return areaInSqMeters;
    }
  };

  // AI Analysis Functions
  const analyzeWithAI = async () => {
    if (!area || area === 0) {
      toast({
        title: "Error",
        description: "Please calculate the farm area first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const farmData = {
        area: area.toFixed(2),
        unit,
        crop: cropType,
        soilType,
        climate,
        pH: soilPH
      };

      // Get soil analysis
      const soilAnalysis = await replicateClient.analyzeSoil({
        area: area.toFixed(2),
        unit,
        pH: soilPH,
        nutrients: soilType,
        moisture: climate
      });

      // Get yield prediction
      const yieldPrediction = await replicateClient.predictYield(farmData);

      if (soilAnalysis.success && yieldPrediction.success) {
        setAiAnalysis({
          soilAnalysis: soilAnalysis.data,
          yieldPrediction: yieldPrediction.data,
          farmData
        });
        
        toast({
          title: "AI Analysis Complete!",
          description: "Your farm has been analyzed successfully.",
        });
      } else {
        throw new Error('AI analysis failed');
      }
    } catch (error) {
      console.error('AI Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze farm data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to compute centroid
  const getCentroid = (coords) => {
    if (!coords.length) return null;
    let x = 0, y = 0;
    coords.forEach(coord => {
      x += coord.lat;
      y += coord.lng;
    });
    return { lat: x / coords.length, lng: y / coords.length };
  };

  // Start drawing mode
  const startDrawing = () => {
    setIsDrawing(true);
  };

  // Clear the current drawing
  const clearDrawing = () => {
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
    }
    setCoordinates([]);
    setArea(0);
    setIsDrawing(false);
    setAiAnalysis(null);
  };

  // Save farm profile
  const saveFarm = async () => {
    if (!farmName || coordinates.length < 3) {
      toast({
        title: "Error",
        description: "Please enter farm name and draw the area first.",
        variant: "destructive",
      });
      return;
    }
    // Calculate centroid for location
    const centroid = getCentroid(coordinates);
    // Compose location object (address can be a string or empty)
    const location = {
      lat: centroid.lat,
      lng: centroid.lng,
      address: farmDescription || "No address provided"
    };
    
    const areaInSqMeters = calculatePolygonArea(coordinates);
    const areaHectares = areaInSqMeters / 10000;
    const areaAcres = areaInSqMeters / 4047;
    const farmPayload = {
      name: farmName,
      location,
      coordinates,
      area_hectares: areaHectares,
      area_acres: areaAcres,
      soil_type: soilType || undefined,
      description: farmDescription
    };
    try {
      const response = await fetch(`${getBackendUrl()}/api/farms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(farmPayload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to save farm");
      setSavedFarms([...savedFarms, result.data.farm]);
      setFarmName('');
      setFarmDescription('');
      clearDrawing();
      toast({
        title: "Farm Saved!",
        description: `${farmName} (${Number(area).toFixed(2)} ${unit}) has been saved successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save farm to backend.",
        variant: "destructive",
      });
    }
  };

  const MapUpdater = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
      if (coords && coords.length > 0) {
        const bounds = L.latLngBounds(coords.map(c => [c.lat, c.lng]));
        if (bounds.isValid()) {
          map.fitBounds(bounds);
        }
      }
    }, [coords, map]);
    return null;
  };

  // Load a saved farm
  const loadFarm = (farm) => {
    clearDrawing();
    setFarmName(farm.name);
    setFarmDescription(farm.description || '');
    setCoordinates(farm.coordinates);
    const areaInSqMeters = calculatePolygonArea(farm.coordinates);
    setArea(convertArea(areaInSqMeters, unit));
    
    if (featureGroupRef.current) {
      const polygon = L.polygon(farm.coordinates.map(c => [c.lat, c.lng]));
      featureGroupRef.current.addLayer(polygon);
    }
  };

  // Load farm on the dedicated view map
  const loadFarmOnViewMap = (farm) => {
    if (viewFeatureGroupRef.current) {
      viewFeatureGroupRef.current.clearLayers();
      const polygon = L.polygon(farm.coordinates.map(c => [c.lat, c.lng]));
      viewFeatureGroupRef.current.addLayer(polygon);
    }
  };

  // Delete a saved farm
  const deleteFarm = async (farmId) => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/farms/${farmId}`, {
        method: "DELETE",
        credentials: 'include',
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to delete farm from backend.");
      }
      setSavedFarms(savedFarms.filter(farm => farm.id !== farmId));
      toast({
        title: "Farm deleted",
        description: "Farm profile has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete farm from backend.",
        variant: "destructive",
      });
    }
  };

  // Export farm data
  const exportData = () => {
    const data = {
      farmName,
      area: Number(area || 0).toFixed(2),
      unit,
      coordinates,
      cropType,
      soilType,
      climate,
      soilPH,
      aiAnalysis,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${farmName || 'farm-data'}.json`;
    a.click();
    
    toast({
      title: "Data exported!",
      description: "Farm data has been downloaded.",
    });
  };

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const response = await fetch(`${getBackendUrl()}/api/farms`, {
          credentials: 'include',
        });
        const result = await response.json();
        if (response.ok && result.data && result.data.farms) {
          // Filter out soft-deleted farms (is_active === false)
          const activeFarms = result.data.farms.filter(farm => farm.is_active !== false);
          setSavedFarms(activeFarms);
        }
      } catch (error) {
        console.error("Error fetching farms:", error);
        toast({
          title: "Connection Error",
          description: "Could not fetch saved farms. Is the backend server running?",
          variant: "destructive",
        });
      }
    };
    fetchFarms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeTab, setActiveTab] = useState("calculator");

  return (
    <div className="space-y-6">
      {/* Dropdown Menu for Navigation */}
      <div className="mb-4">
        <label htmlFor="farm-section" className="block font-semibold mb-1">Select Section:</label>
        <select
          id="farm-section"
          className="w-full p-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          value={activeTab}
          onChange={e => setActiveTab(e.target.value)}
        >
          <option value="calculator" className="bg-background text-foreground">Calculator</option>
          <option value="viewer" className="bg-background text-foreground">Farm Viewer</option>
          <option value="ai-analysis" className="bg-background text-foreground">AI Analysis</option>
          <option value="saved" className="bg-background text-foreground">Saved Farms ({savedFarms.length})</option>
        </select>
      </div>

      {/* Section Content */}
      {activeTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Interactive Map</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-96 rounded-lg border relative" style={{ minHeight: '400px', height: '400px' }}>
                <MapContainer center={[28.6139, 77.2090]} zoom={15} ref={mapRef} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <FeatureGroup ref={featureGroupRef}>
                    {isDrawing && (
                      <EditControl
                        position="topright"
                        onCreated={onCreated}
                        onEdited={onEdited}
                        onDeleted={onDeleted}
                        draw={{
                          rectangle: false,
                          circle: false,
                          circlemarker: false,
                          marker: false,
                          polyline: false,
                        }}
                      />
                    )}
                  </FeatureGroup>
                  <MapUpdater coords={coordinates} />
                </MapContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button onClick={startDrawing} disabled={isDrawing}>
                  {isDrawing ? 'Drawing...' : 'Start Drawing'}
                </Button>
                <Button variant="outline" onClick={clearDrawing}>
                  Clear
                </Button>
                <Button variant="outline" onClick={exportData} disabled={!area}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              {isDrawing && (
                <p className="text-sm text-gray-600 mt-2">
                  Click 'Start Drawing' to reveal the map controls.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Controls Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Calculation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="unit">Unit</Label>
                <select
                  id="unit"
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  value={unit}
                  onChange={(e) => {
                    setUnit(e.target.value);
                    if (coordinates.length > 0) {
                      const areaInSqMeters = calculatePolygonArea(coordinates);
                      setArea(convertArea(areaInSqMeters, e.target.value));
                    }
                  }}
                >
                  <option value="acres" className="bg-background text-foreground">Acres</option>
                  <option value="hectares" className="bg-background text-foreground">Hectares</option>
                  <option value="sqmeters" className="bg-background text-foreground">Square Meters</option>
                </select>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800">Calculated Area</h3>
                <p className="text-2xl font-bold text-green-600">
                  {Number(area || 0).toFixed(2)} {unit}
                </p>
                {coordinates.length > 0 && (
                  <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
                    {coordinates.length} points marked
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmName">Farm Name</Label>
                <Input
                  id="farmName"
                  placeholder="Enter farm name..."
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmDescription">Description (Optional)</Label>
                <Textarea
                  id="farmDescription"
                  placeholder="Add farm details..."
                  value={farmDescription}
                  onChange={(e) => setFarmDescription(e.target.value)}
                />
              </div>

              <Button 
                onClick={saveFarm} 
                className="w-full"
                disabled={!farmName || coordinates.length < 3}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Farm Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "viewer" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Farm Viewer - Dedicated Map for Viewing Your Farms</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-96 rounded-lg border relative" style={{ minHeight: '500px', height: '500px' }}>
              <MapContainer center={[28.6139, 77.2090]} zoom={15} ref={viewMapRef} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <FeatureGroup ref={viewFeatureGroupRef}>
                  {/* Loaded farm will be displayed here */}
                </FeatureGroup>
                <MapUpdater coords={coordinates} />
              </MapContainer>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Load Your Farms:</h4>
              </div>
              
              {savedFarms.length === 0 ? (
                <p className="text-gray-500">No saved farms available. Create farms in the Calculator tab first.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {savedFarms.map((farm) => (
                    <Button
                      key={farm.id}
                      onClick={() => loadFarmOnViewMap(farm)}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {farm.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "ai-analysis" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI Farm Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type</Label>
                <Input
                  id="cropType"
                  placeholder="e.g., Wheat, Rice, Corn..."
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="soilType">Soil Type</Label>
                <select
                  id="soilType"
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                >
                  <option value="" className="bg-background text-foreground">Select soil type...</option>
                  <option value="clay" className="bg-background text-foreground">Clay</option>
                  <option value="sandy" className="bg-background text-foreground">Sandy</option>
                  <option value="loamy" className="bg-background text-foreground">Loamy</option>
                  <option value="silty" className="bg-background text-foreground">Silty</option>
                  <option value="peaty" className="bg-background text-foreground">Peaty</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="climate">Climate</Label>
                <select
                  id="climate"
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  value={climate}
                  onChange={(e) => setClimate(e.target.value)}
                >
                  <option value="" className="bg-background text-foreground">Select climate...</option>
                  <option value="tropical" className="bg-background text-foreground">Tropical</option>
                  <option value="subtropical" className="bg-background text-foreground">Subtropical</option>
                  <option value="temperate" className="bg-background text-foreground">Temperate</option>
                  <option value="arid" className="bg-background text-foreground">Arid</option>
                  <option value="semi-arid" className="bg-background text-foreground">Semi-arid</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="soilPH">Soil pH (Optional)</Label>
                <Input
                  id="soilPH"
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  placeholder="e.g., 6.5"
                  value={soilPH}
                  onChange={(e) => setSoilPH(e.target.value)}
                />
              </div>

              <Button 
                onClick={analyzeWithAI} 
                className="w-full"
                disabled={!area || isAnalyzing}
              >
                <Sprout className="h-4 w-4 mr-2" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
              </Button>
            </CardContent>
          </Card>

          {/* AI Analysis Results */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Analyzing your farm data...</p>
                </div>
              )}
              
              {aiAnalysis && !isAnalyzing && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Soil Analysis</h4>
                    <p className="text-sm text-blue-700 whitespace-pre-wrap">
                      {aiAnalysis.soilAnalysis}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-semibold text-amber-800 mb-2">Yield Prediction</h4>
                    <p className="text-sm text-amber-700 whitespace-pre-wrap">
                      {aiAnalysis.yieldPrediction}
                    </p>
                  </div>
                </div>
              )}
              
              {!aiAnalysis && !isAnalyzing && (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Fill in the farm details and click "Analyze with AI" to get insights about your farm.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "saved" && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Farm Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Debug information */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
              <h4 className="font-semibold text-blue-800 mb-2">Debug Information:</h4>
              <p>• Token: {user ? "✅ Present" : "❌ Missing"}</p>
              <p>• Saved Farms Count: {savedFarms.length}</p>
              <p>• Backend URL: https://smart-farmer-cyyz.onrender.com/api/farms</p>
            </div>
            
            {savedFarms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  No saved farms yet. Create your first farm profile using the calculator.
                </p>
                {!user && (
                  <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                    ⚠️ You might need to log in first to see saved farms.
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedFarms.map((farm) => (
                  <Card key={farm.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{farm.name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFarm(farm.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{farm.description}</p>
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-green-600">
                          {farm.area_acres ? `${Number(farm.area_acres).toFixed(2)} acres` : farm.area_hectares ? `${Number(farm.area_hectares).toFixed(2)} hectares` : '0.00 acres'}
                        </p>
                        {farm.cropType && (
                          <p className="text-xs text-gray-500">Crop: {farm.cropType}</p>
                        )}
                        {farm.aiAnalysis && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            AI Analyzed
                          </Badge>
                        )}
                        <p className="text-xs text-gray-500">Created: {farm.createdAt}</p>
                      </div>
                      {/* Removed View on Map and Load for Editing buttons */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FarmCalculator;

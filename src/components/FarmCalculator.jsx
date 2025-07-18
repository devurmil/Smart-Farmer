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

const FarmCalculator = () => {
  const { toast } = useToast();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [polygon, setPolygon] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const coordinatesRef = useRef([]);
  const [area, setArea] = useState(0);
  const [unit, setUnit] = useState('acres');
  const [farmName, setFarmName] = useState('');
  const [farmNameMarker, setFarmNameMarker] = useState(null);
  const [farmDescription, setFarmDescription] = useState('');
  const [savedFarms, setSavedFarms] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingListener, setDrawingListener] = useState(null);
  
  // AI Features
  const [cropType, setCropType] = useState('');
  const [soilType, setSoilType] = useState('');
  const [climate, setClimate] = useState('');
  const [soilPH, setSoilPH] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialize Google Maps
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const initMap = () => {
      if (!window.google) {
        console.error('Google Maps not loaded');
        return;
      }
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 28.6139, lng: 77.2090 }, // Delhi, India
        zoom: 15,
        mapTypeId: 'satellite'
      });
      setMap(mapInstance);
    };
    if (window.google) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,drawing`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, []);

  // Calculate area using coordinates
  const calculatePolygonArea = (coords) => {
    if (coords.length < 3) return 0;
    
    // Simple polygon area calculation (Shoelace formula)
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i].lat * coords[j].lng;
      area -= coords[j].lat * coords[i].lng;
    }
    area = Math.abs(area) / 2;
    
    // Convert to square meters (approximate)
    const sqMeters = area * 111320 * 111320 * Math.cos(coords[0].lat * Math.PI / 180);
    return sqMeters;
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
    if (!map) return;
    setIsDrawing(true);
    setCoordinates([]);
    coordinatesRef.current = [];
    if (polygon) {
      polygon.setMap(null);
    }
    if (farmNameMarker) {
      farmNameMarker.setMap(null);
      setFarmNameMarker(null);
    }
    const newPolygon = new window.google.maps.Polygon({
      paths: [],
      strokeColor: '#22c55e',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#22c55e',
      fillOpacity: 0.35,
      editable: true,
      draggable: false
    });
    newPolygon.setMap(map);
    setPolygon(newPolygon);
    // Remove any previous listener
    if (drawingListener) {
      window.google.maps.event.removeListener(drawingListener);
      setDrawingListener(null);
    }
    // Add click listener to map
    const clickListener = map.addListener('click', (event) => {
      const newCoords = [...coordinatesRef.current, {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      }];
      setCoordinates(newCoords);
      coordinatesRef.current = newCoords;
      newPolygon.setPath(newCoords);
      const areaInSqMeters = calculatePolygonArea(newCoords);
      setArea(convertArea(areaInSqMeters, unit));
    });
    setDrawingListener(clickListener);
  };

  // When coordinates state changes, update the ref
  React.useEffect(() => {
    coordinatesRef.current = coordinates;
  }, [coordinates]);

  // Finish drawing mode
  const finishDrawing = () => {
    if (drawingListener) {
      window.google.maps.event.removeListener(drawingListener);
      setDrawingListener(null);
    }
    setIsDrawing(false);
    // Add marker for farm name at centroid
    if (map && coordinates.length > 0 && farmName) {
      const centroid = getCentroid(coordinates);
      if (centroid) {
        const marker = new window.google.maps.Marker({
          position: centroid,
          map: map,
          label: {
            text: farmName,
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#22c55e',
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 0.1,
            fillOpacity: 0,
            strokeOpacity: 0,
          },
        });
        setFarmNameMarker(marker);
      }
    }
    toast({
      title: "Area calculated!",
      description: `Farm area: ${area.toFixed(2)} ${unit}`,
    });
  };

  // Clear the current drawing
  const clearDrawing = () => {
    if (polygon) {
      polygon.setMap(null);
      setPolygon(null);
    }
    if (farmNameMarker) {
      farmNameMarker.setMap(null);
      setFarmNameMarker(null);
    }
    setCoordinates([]);
    setArea(0);
    setIsDrawing(false);
    setAiAnalysis(null);
    if (drawingListener) {
      window.google.maps.event.removeListener(drawingListener);
      setDrawingListener(null);
    }
  };

  // Save farm profile
  const saveFarm = () => {
    if (!farmName || coordinates.length < 3) {
      toast({
        title: "Error",
        description: "Please enter farm name and draw the area first.",
        variant: "destructive",
      });
      return;
    }

    const newFarm = {
      id: Date.now(),
      name: farmName,
      description: farmDescription,
      coordinates,
      area: area.toFixed(2),
      unit,
      cropType,
      soilType,
      climate,
      soilPH,
      aiAnalysis,
      createdAt: new Date().toLocaleDateString()
    };

    setSavedFarms([...savedFarms, newFarm]);
    setFarmName('');
    setFarmDescription('');
    
    toast({
      title: "Farm saved!",
      description: `${farmName} has been saved successfully.`,
    });
  };

  // Load a saved farm
  const loadFarm = (farm) => {
    clearDrawing();
    
    const newPolygon = new window.google.maps.Polygon({
      paths: farm.coordinates,
      strokeColor: '#22c55e',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#22c55e',
      fillOpacity: 0.35,
      editable: true
    });

    newPolygon.setMap(map);
    setPolygon(newPolygon);
    setCoordinates(farm.coordinates);
    setArea(farm.area);
    setUnit(farm.unit);
    setCropType(farm.cropType || '');
    setSoilType(farm.soilType || '');
    setClimate(farm.climate || '');
    setSoilPH(farm.soilPH || '');
    setAiAnalysis(farm.aiAnalysis || null);
    
    // Center map on the farm
    const bounds = new window.google.maps.LatLngBounds();
    farm.coordinates.forEach(coord => bounds.extend(coord));
    map.fitBounds(bounds);
  };

  // Delete a saved farm
  const deleteFarm = (farmId) => {
    setSavedFarms(savedFarms.filter(farm => farm.id !== farmId));
    toast({
      title: "Farm deleted",
      description: "Farm profile has been removed.",
    });
  };

  // Export farm data
  const exportData = () => {
    const data = {
      farmName,
      area: area.toFixed(2),
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Area Calculator</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="saved">Saved Farms ({savedFarms.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
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
                <div className="w-full h-96 rounded-lg border relative" style={{ minHeight: '400px' }}>
                  {/* Floating Area Name Overlay */}
                  {coordinates.length >= 3 && farmName && !isDrawing && (
                    <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }} className="bg-white bg-opacity-80 px-4 py-1 rounded shadow text-green-700 font-bold text-lg pointer-events-none">
                      {farmName}
                    </div>
                  )}
                  <div ref={mapRef} className="absolute inset-0 w-full h-full rounded-lg" />
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button onClick={startDrawing} disabled={isDrawing}>
                    {isDrawing ? 'Drawing...' : 'Start Drawing'}
                  </Button>
                  <Button variant="outline" onClick={clearDrawing}>
                    Clear
                  </Button>
                  {/* Finish Drawing Button */}
                  {isDrawing && coordinates.length >= 3 && (
                    <Button variant="success" onClick={finishDrawing}>
                      Finish Drawing
                    </Button>
                  )}
                  <Button variant="outline" onClick={exportData} disabled={!area}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                {isDrawing && (
                  <p className="text-sm text-gray-600 mt-2">
                    Click on the map to mark corners. Click 'Finish Drawing' when done.
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
                    className="w-full p-2 border rounded-md"
                    value={unit}
                    onChange={(e) => {
                      setUnit(e.target.value);
                      if (coordinates.length > 0) {
                        const areaInSqMeters = calculatePolygonArea(coordinates);
                        setArea(convertArea(areaInSqMeters, e.target.value));
                      }
                    }}
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                    <option value="sqmeters">Square Meters</option>
                  </select>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800">Calculated Area</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {area.toFixed(2)} {unit}
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
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-6">
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
                    className="w-full p-2 border rounded-md"
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                  >
                    <option value="">Select soil type...</option>
                    <option value="clay">Clay</option>
                    <option value="sandy">Sandy</option>
                    <option value="loamy">Loamy</option>
                    <option value="silty">Silty</option>
                    <option value="peaty">Peaty</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="climate">Climate</Label>
                  <select 
                    id="climate"
                    className="w-full p-2 border rounded-md"
                    value={climate}
                    onChange={(e) => setClimate(e.target.value)}
                  >
                    <option value="">Select climate...</option>
                    <option value="tropical">Tropical</option>
                    <option value="subtropical">Subtropical</option>
                    <option value="temperate">Temperate</option>
                    <option value="arid">Arid</option>
                    <option value="semi-arid">Semi-arid</option>
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
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Farm Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              {savedFarms.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No saved farms yet. Create your first farm profile using the calculator.
                </p>
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
                            {farm.area} {farm.unit}
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
                        <Button
                          onClick={() => loadFarm(farm)}
                          className="w-full mt-3"
                          variant="outline"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Load on Map
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FarmCalculator;

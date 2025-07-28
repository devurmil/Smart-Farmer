import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api from '@/services/api';

declare const google: any;

interface Coordinate {
  lat: number;
  lng: number;
}

interface FarmProfile {
  id: string;
  name: string;
  coordinates: Coordinate[];
  area: number;
  unit: string;
  createdAt: Date;
}

const FarmCalculator = () => {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [farmName, setFarmName] = useState('');
  const [unit, setUnit] = useState<'acres' | 'hectares' | 'sqm'>('acres');
  const [savedFarms, setSavedFarms] = useState<FarmProfile[]>([]);
  const [map, setMap] = useState<any>(null);
  const [drawingManager, setDrawingManager] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load saved farms from backend on component mount
  useEffect(() => {
    loadSavedFarms();
  }, []);

  const loadSavedFarms = async () => {
    try {
      const response = await api.get('/farms');
      if (response.data.success) {
        const farms = response.data.data.farms.map((farm: any) => ({
          id: farm.id,
          name: farm.name,
          coordinates: farm.coordinates || [],
          area: farm.area_hectares || farm.area_acres || 0,
          unit: farm.area_hectares ? 'hectares' : 'acres',
          createdAt: new Date(farm.created_at)
        }));
        setSavedFarms(farms);
      }
    } catch (error) {
      console.error('Error loading saved farms:', error);
      toast({
        title: "Error",
        description: "Failed to load saved farms",
        variant: "destructive",
      });
    }
  };

  const saveFarmToBackend = async (farmData: {
    name: string;
    coordinates: Coordinate[];
    area: number;
    unit: string;
  }) => {
    try {
      setIsSaving(true);
      
      // Convert area to hectares and acres for backend
      let area_hectares = 0;
      let area_acres = 0;
      
      if (farmData.unit === 'hectares') {
        area_hectares = farmData.area;
        area_acres = farmData.area * 2.47105;
      } else if (farmData.unit === 'acres') {
        area_acres = farmData.area;
        area_hectares = farmData.area / 2.47105;
      } else if (farmData.unit === 'sqm') {
        area_hectares = farmData.area / 10000;
        area_acres = farmData.area / 4046.86;
      }

      const farmPayload = {
        name: farmData.name,
        coordinates: farmData.coordinates,
        area_hectares: parseFloat(area_hectares.toFixed(2)),
        area_acres: parseFloat(area_acres.toFixed(2)),
        location: farmData.coordinates.length > 0 ? {
          lat: farmData.coordinates[0].lat,
          lng: farmData.coordinates[0].lng,
          address: `${farmData.name} Farm`
        } : null
      };

      const response = await api.post('/farms', farmPayload);
      
      if (response.data.success) {
        const savedFarm = {
          id: response.data.data.farm.id,
          name: farmData.name,
          coordinates: farmData.coordinates,
          area: farmData.area,
          unit: farmData.unit,
          createdAt: new Date()
        };
        
        setSavedFarms(prev => [...prev, savedFarm]);
        toast({
          title: "Success",
          description: "Farm saved successfully!",
        });
        return true;
      }
    } catch (error: any) {
      console.error('Error saving farm:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save farm';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteFarmFromBackend = async (farmId: string) => {
    try {
      await api.delete(`/farms/${farmId}`);
      setSavedFarms(prev => prev.filter(farm => farm.id !== farmId));
      toast({
        title: "Success",
        description: "Farm deleted successfully!",
      });
    } catch (error: any) {
      console.error('Error deleting farm:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete farm';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.drawing) {
        initializeMap();
        return;
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,drawing`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        setError('Failed to load Google Maps. Please check your API key.');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current) return;

      try {
        const newMap = new google.maps.Map(mapRef.current, {
          center: { lat: 20.5937, lng: 78.9629 },
          zoom: 5,
          mapTypeId: google.maps.MapTypeId.SATELLITE
        });

        const newDrawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: null,
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [google.maps.drawing.OverlayType.POLYGON],
          },
          polygonOptions: {
            editable: true,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            clickable: true,
            zIndex: 1
          }
        });

        newDrawingManager.setMap(newMap);

        // ✅ Corrected: Use 'overlaycomplete' instead of 'polygoncomplete'
        google.maps.event.addListener(newDrawingManager, 'overlaycomplete', (event: any) => {
          if (event.type === google.maps.drawing.OverlayType.POLYGON) {
            const polygon = event.overlay;
            const path = polygon.getPath();
            const newCoords = path.getArray().map((latLng: any) => ({
              lat: latLng.lat(),
              lng: latLng.lng(),
            }));

            setCoordinates(newCoords);

            const areaInMeters = google.maps.geometry.spherical.computeArea(path);
            let calculatedArea = areaInMeters;
            let areaUnit = unit;

            switch (unit) {
              case 'acres':
                calculatedArea = areaInMeters * 0.000247105;
                break;
              case 'hectares':
                calculatedArea = areaInMeters * 0.0001;
                break;
              case 'sqm':
              default:
                calculatedArea = areaInMeters;
                break;
            }

            // Don't auto-save, let user click save button
            setCoordinates(newCoords);

            newDrawingManager.setDrawingMode(null);

            // Optional: allow editing after drawing
            google.maps.event.addListener(path, 'set_at', () => updateCoordinatesFromPath(path));
            google.maps.event.addListener(path, 'insert_at', () => updateCoordinatesFromPath(path));
          }
        });

        setMap(newMap);
        setDrawingManager(newDrawingManager);
        setIsLoading(false);
      } catch (err) {
        setError('Error initializing map: ' + err);
        setIsLoading(false);
      }
    };

    const updateCoordinatesFromPath = (path: any) => {
      const newCoords = path.getArray().map((latLng: any) => ({
        lat: latLng.lat(),
        lng: latLng.lng(),
      }));
      setCoordinates(newCoords);
    };

    loadGoogleMaps();

    return () => {
      if (drawingManager) {
        google.maps.event.clearInstanceListeners(drawingManager);
      }
    };
  }, [unit]);

  const handleStartDrawing = () => {
    if (drawingManager) {
      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    }
  };

  const handleClearMap = () => {
    if (map && drawingManager) {
      drawingManager.setMap(null);
      drawingManager.setMap(map);
      setCoordinates([]);
    }
  };

  const deleteFarm = (farmId: string) => {
    deleteFarmFromBackend(farmId);
  };

  if (isLoading) {
    return (
      <Card><CardContent className="p-6"><div className="text-center">Loading Google Maps...</div></CardContent></Card>
    );
  }

  if (error) {
    return (
      <Card><CardContent className="p-6"><div className="text-center text-red-500">{error}</div></CardContent></Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-card-foreground">Farm Area Calculator</CardTitle>
        <CardDescription className="text-muted-foreground">Draw your farm on the map to calculate area.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground">Farm Name</Label>
              <Input
                placeholder="Enter farm name"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <Label className="text-foreground">Unit</Label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as 'acres' | 'hectares' | 'sqm')}
                className="w-full p-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                <option value="acres" className="bg-background text-foreground">Acres</option>
                <option value="hectares" className="bg-background text-foreground">Hectares</option>
                <option value="sqm" className="bg-background text-foreground">Square Meters</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleStartDrawing}>
              Start Drawing Polygon
            </Button>
            <Button variant="outline" onClick={handleClearMap}>
              Clear Map
            </Button>
            <Button 
              onClick={() => {
                if (farmName.trim() && coordinates.length > 0 && typeof google !== 'undefined' && google.maps && google.maps.geometry) {
                  const areaInMeters = google.maps.geometry.spherical.computeArea(
                    coordinates.map((coord: any) => new google.maps.LatLng(coord.lat, coord.lng))
                  );
                  let calculatedArea = areaInMeters;
                  if (unit === 'acres') {
                    calculatedArea = areaInMeters * 0.000247105;
                  } else if (unit === 'hectares') {
                    calculatedArea = areaInMeters * 0.0001;
                  }
                  saveFarmToBackend({ 
                    name: farmName, 
                    coordinates: coordinates, 
                    area: calculatedArea, 
                    unit: unit 
                  });
                  setFarmName('');
                  setCoordinates([]);
                } else {
                  toast({
                    title: "Error",
                    description: "Please enter a farm name and draw a polygon first",
                    variant: "destructive",
                  });
                }
              }}
              disabled={isSaving || !farmName.trim() || coordinates.length === 0}
            >
              {isSaving ? 'Saving...' : 'Save Farm'}
            </Button>
          </div>

          <div 
            id="map" 
            ref={mapRef}
            style={{ height: "500px", width: "100%", marginTop: "20px" }}
            className="border rounded"
          ></div>

          {coordinates.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800">Current Polygon</h4>
              <div className="text-sm text-green-700 mb-2">
                Points: {coordinates.length} • Click and drag to adjust
              </div>
              <div className="text-lg font-bold text-green-600">
                {(() => {
                  if (typeof google !== 'undefined' && google.maps && google.maps.geometry) {
                    const areaInMeters = google.maps.geometry.spherical.computeArea(
                      coordinates.map((coord: any) => new google.maps.LatLng(coord.lat, coord.lng))
                    );
                    let calculatedArea = areaInMeters;
                    if (unit === 'acres') {
                      calculatedArea = areaInMeters * 0.000247105;
                    } else if (unit === 'hectares') {
                      calculatedArea = areaInMeters * 0.0001;
                    }
                    return `${calculatedArea.toFixed(2)} ${unit}`;
                  }
                  return 'Calculating...';
                })()}
              </div>
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-semibold text-foreground">Saved Farms:</h3>
            {savedFarms.length === 0 ? (
              <p className="text-muted-foreground">No farms saved yet. Draw a polygon and save it to see it here.</p>
            ) : (
              <div className="space-y-2">
                {savedFarms.map(farm => (
                  <div key={farm.id} className="flex items-center justify-between p-3 border border-border rounded bg-card">
                    <div>
                      <Badge variant="outline">{farm.name}</Badge>
                      <span className="ml-2 text-foreground">{farm.area.toFixed(2)} {farm.unit}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({farm.coordinates.length} points)
                      </span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        • {new Date(farm.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteFarm(farm.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FarmCalculator;
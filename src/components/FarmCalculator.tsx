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

// ... (imports remain unchanged)

const FarmCalculator = () => {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [farmName, setFarmName] = useState('');
  const [unit, setUnit] = useState<'acres' | 'hectares' | 'sqm'>('acres');
  const [savedFarms, setSavedFarms] = useState<FarmProfile[]>([]);
  const [map, setMap] = useState<any>(null);
  const [drawingManager, setDrawingManager] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const mapRef = useRef<HTMLDivElement>(null);

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

            if (farmName.trim()) {
              setSavedFarms(prev => [...prev, {
                id: Date.now().toString(),
                name: farmName,
                coordinates: newCoords,
                area: calculatedArea,
                unit: areaUnit,
                createdAt: new Date()
              }]);
              setFarmName('');
            }

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
    setSavedFarms(prev => prev.filter(farm => farm.id !== farmId));
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
            <button onClick={handleStartDrawing} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
              Start Drawing Polygon
            </button>
            <button onClick={handleClearMap} className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors">
              Clear Map
            </button>
          </div>

          <div 
            id="map" 
            ref={mapRef}
            style={{ height: "500px", width: "100%", marginTop: "20px" }}
            className="border rounded"
          ></div>

          {coordinates.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-foreground">Current Polygon Points: {coordinates.length}</h4>
              <div className="text-sm text-muted-foreground">
                Click and drag the polygon points to adjust the area.
              </div>
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-semibold text-foreground">Saved Farms:</h3>
            {savedFarms.length === 0 ? (
              <p className="text-muted-foreground">No farms saved yet</p>
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
                    </div>
                    <button
                      onClick={() => deleteFarm(farm.id)}
                      className="px-2 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
                    >
                      Delete
                    </button>
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
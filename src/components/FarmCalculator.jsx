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

const FarmCalculator = () => {
  const { toast } = useToast();
  const { token } = useUser();
  const mapRef = useRef(null);
  const viewMapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [viewMap, setViewMap] = useState(null);
  const [polygon, setPolygon] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const coordinatesRef = useRef([]);
  const [area, setArea] = useState(0);
  const [unit, setUnit] = useState('acres');
  const [farmName, setFarmName] = useState('');
  const [farmNameMarker, setFarmNameMarker] = useState(null);
  const [viewPolygon, setViewPolygon] = useState(null);
  const [viewFarmMarker, setViewFarmMarker] = useState(null);
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
    let scriptLoaded = false;

    const initMap = () => {
      if (!window.google || !mapRef.current) {
        return;
      }
      if (map) return; // Prevent re-initialization
      
      try {
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: 28.6139, lng: 77.2090 },
          zoom: 15,
          mapTypeId: 'satellite'
        });
        
        // Add map loaded event listener
        window.google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
          console.log('Map fully loaded and ready');
          // Trigger a resize to ensure proper rendering
          window.google.maps.event.trigger(mapInstance, 'resize');
        });
        
        setMap(mapInstance);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    if (window.google && window.google.maps && mapRef.current) {
      initMap();
    } else if (!scriptLoaded) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,drawing`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        scriptLoaded = true;
        initMap();
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
        toast({
          title: "Map Loading Error",
          description: "Failed to load Google Maps. Please check your internet connection and try again.",
          variant: "destructive",
        });
      };
      document.head.appendChild(script);
    }

    // Clean up
    return () => {
      scriptLoaded = false;
    };
  }, [mapRef, map]);

  // Initialize View Map (separate from calculator map)
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const initViewMap = () => {
      if (!window.google || !window.google.maps || !viewMapRef.current) {
        console.log('Google Maps not ready for view map, retrying...');
        // Retry after a short delay
        setTimeout(() => {
          initViewMap();
        }, 500);
        return;
      }
      if (viewMap) return; // Prevent re-initialization
      
      try {
        console.log('Initializing view map...');
        const viewMapInstance = new window.google.maps.Map(viewMapRef.current, {
          center: { lat: 28.6139, lng: 77.2090 },
          zoom: 15,
          mapTypeId: 'satellite'
        });
        
        // Add map loaded event listener
        window.google.maps.event.addListenerOnce(viewMapInstance, 'idle', () => {
          console.log('View map fully loaded and ready');
        });
        
        setViewMap(viewMapInstance);
        console.log('View map initialized successfully');
      } catch (error) {
        console.error('Error initializing view map:', error);
        // Retry after error
        setTimeout(() => {
          initViewMap();
        }, 1000);
      }
    };

    // Delay initialization to ensure main map loads first
    const timer = setTimeout(() => {
      if (window.google && window.google.maps && viewMapRef.current) {
        initViewMap();
      } else {
        // If Google Maps isn't ready, wait for the main map useEffect to load it
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps && viewMapRef.current) {
            initViewMap();
            clearInterval(checkInterval);
          }
        }, 1000);
        
        // Clear interval after 10 seconds to prevent infinite checking
        setTimeout(() => {
          clearInterval(checkInterval);
        }, 10000);
      }
    }, 1000); // Wait 1 second for main map to initialize

    return () => {
      clearTimeout(timer);
    };
  }, [viewMapRef, viewMap]);

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
      description: `Farm area: ${Number(area || 0).toFixed(2)} ${unit}`,
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
    // Calculate area in both hectares and acres
    // First, get area in square meters
    const areaInSqMeters = (() => {
      if (coordinates.length < 3) return 0;
      let area = 0;
      for (let i = 0; i < coordinates.length; i++) {
        const j = (i + 1) % coordinates.length;
        area += coordinates[i].lat * coordinates[j].lng;
        area -= coordinates[j].lat * coordinates[i].lng;
      }
      area = Math.abs(area) / 2;
      // Convert to square meters (approximate)
      return area * 111320 * 111320 * Math.cos(coordinates[0].lat * Math.PI / 180);
    })();
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
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(farmPayload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to save farm");
      setSavedFarms([...savedFarms, result.data.farm]);
      setFarmName('');
      setFarmDescription('');
      toast({
        title: "Farm saved!",
        description: `${farmName} has been saved successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save farm to backend.",
        variant: "destructive",
      });
    }
  };

  // Load a saved farm
  const loadFarm = (farm) => {
    console.log("Loading farm:", farm);
    
    // Clear any existing drawing first
    clearDrawing();

    // Validate inputs
    if (!map) {
      toast({
        title: "Error",
        description: "Map is not ready yet. Please wait and try again.",
        variant: "destructive",
      });
      return;
    }

    if (!farm.coordinates || farm.coordinates.length < 3) {
      toast({
        title: "Error",
        description: "Farm has no valid coordinates to display.",
        variant: "destructive",
      });
      return;
    }

    console.log("Loading farm coordinates:", farm.coordinates);

    // Wait for map to be ready
    setTimeout(() => {
      try {
        console.log("Creating polygon with coordinates:", farm.coordinates);
        
        // Create the polygon with farm coordinates - make it highly visible
        const newPolygon = new window.google.maps.Polygon({
          paths: farm.coordinates,
          strokeColor: '#FF0000', // Bright red for visibility
          strokeOpacity: 1.0,
          strokeWeight: 4,
          fillColor: '#FF0000',
          fillOpacity: 0.5,
          editable: true,
          draggable: false
        });

        console.log("Setting polygon on map:", newPolygon);
        
        // Set polygon on map
        newPolygon.setMap(map);
        setPolygon(newPolygon);

        // Create bounds and center the map
        const bounds = new window.google.maps.LatLngBounds();
        farm.coordinates.forEach(coord => {
          console.log("Adding coordinate to bounds:", coord);
          bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
        });

        console.log("Bounds created:", bounds.toString());

        // Multiple attempts to refresh the map
        window.google.maps.event.trigger(map, 'resize');
        
        // Try different approaches to fit bounds
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds);
          
          // Force a second fit bounds with delay
          setTimeout(() => {
            map.fitBounds(bounds, 20);
            console.log("Map zoom after fitBounds:", map.getZoom());
            console.log("Map center after fitBounds:", map.getCenter().toString());
          }, 200);
          
          // As a fallback, try manual centering
          setTimeout(() => {
            const center = bounds.getCenter();
            map.setCenter(center);
            map.setZoom(Math.max(15, map.getZoom())); // Ensure minimum zoom
            console.log("Manual center set to:", center.toString());
          }, 400);
        }

        // Add farm name marker at centroid if farm has a name
        if (farm.name) {
          const centroid = getCentroid(farm.coordinates);
          if (centroid) {
            const marker = new window.google.maps.Marker({
              position: centroid,
              map: map,
              label: {
                text: farm.name,
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

        // Update state with farm data
        setCoordinates(farm.coordinates);
        setFarmName(farm.name || '');
        setFarmDescription(farm.description || '');
        
        // Set area based on available data
        const areaValue = farm.area_acres || farm.area_hectares || farm.area || 0;
        const areaUnit = farm.area_acres ? 'acres' : farm.area_hectares ? 'hectares' : (farm.unit || 'acres');
        setArea(areaValue);
        setUnit(areaUnit);
        
        // Set other farm properties
        setCropType(farm.cropType || farm.soil_type || '');
        setSoilType(farm.soilType || farm.soil_type || '');
        setClimate(farm.climate || '');
        setSoilPH(farm.soilPH || '');
        setAiAnalysis(farm.aiAnalysis || null);

        console.log("Farm loaded successfully on map");
        
        toast({
          title: "Farm Loaded!",
          description: `${farm.name || 'Farm'} has been loaded on the map.`,
        });

      } catch (error) {
        console.error("Error loading farm on map:", error);
        toast({
          title: "Error",
          description: "Failed to load farm on map. Please try again.",
          variant: "destructive",
        });
      }
    }, 300); // Small delay to ensure map is ready
  };

  // Force refresh map function
  const forceRefreshMap = () => {
    if (!map || !polygon) {
      toast({
        title: "No Data",
        description: "No farm is currently loaded to refresh.",
        variant: "destructive",
      });
      return;
    }

    setTimeout(() => {
      try {
        console.log("Force refreshing map...");
        window.google.maps.event.trigger(map, 'resize');
        
        if (coordinates.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          coordinates.forEach(coord => {
            bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
          });
          
          if (!bounds.isEmpty()) {
            map.fitBounds(bounds, 50);
            
            setTimeout(() => {
              map.fitBounds(bounds, 20);
            }, 100);
          }
        }
        
        toast({
          title: "Map Refreshed",
          description: "The map display has been refreshed.",
        });
      } catch (error) {
        console.error("Error refreshing map:", error);
        toast({
          title: "Refresh Failed",
          description: "Failed to refresh map display.",
          variant: "destructive",
        });
      }
    }, 100);
  };

  // Load farm on the dedicated view map
  const loadFarmOnViewMap = (farm) => {
    console.log("Loading farm on view map:", farm);
    
    // Clear any existing view polygon
    if (viewPolygon) {
      viewPolygon.setMap(null);
      setViewPolygon(null);
    }
    if (viewFarmMarker) {
      viewFarmMarker.setMap(null);
      setViewFarmMarker(null);
    }

    // Validate inputs with retry mechanism
    if (!viewMap) {
      // Wait a bit and try again
      toast({
        title: "Initializing Map...",
        description: "Please wait while the map loads, then try again.",
      });
      
      // Try to initialize the map if it's not ready
      setTimeout(() => {
        if (window.google && window.google.maps && viewMapRef.current && !viewMap) {
          console.log('Attempting to initialize view map...');
          try {
            const viewMapInstance = new window.google.maps.Map(viewMapRef.current, {
              center: { lat: 28.6139, lng: 77.2090 },
              zoom: 15,
              mapTypeId: 'satellite'
            });
            setViewMap(viewMapInstance);
            
            // Try loading the farm again after map is ready
            setTimeout(() => {
              loadFarmOnViewMap(farm);
            }, 500);
          } catch (error) {
            console.error('Failed to initialize view map:', error);
          }
        }
      }, 1000);
      return;
    }

    if (!farm.coordinates || farm.coordinates.length < 3) {
      toast({
        title: "Error",
        description: "Farm has no valid coordinates to display.",
        variant: "destructive",
      });
      return;
    }

    console.log("Loading farm coordinates on view map:", farm.coordinates);

    setTimeout(() => {
      try {
        // Create the polygon with farm coordinates
        const newPolygon = new window.google.maps.Polygon({
          paths: farm.coordinates,
          strokeColor: '#22c55e',
          strokeOpacity: 0.8,
          strokeWeight: 3,
          fillColor: '#22c55e',
          fillOpacity: 0.4,
          editable: false,
          draggable: false
        });

        // Set polygon on view map
        newPolygon.setMap(viewMap);
        setViewPolygon(newPolygon);

        // Add farm name marker at centroid
        if (farm.name) {
          const centroid = getCentroid(farm.coordinates);
          if (centroid) {
            const marker = new window.google.maps.Marker({
              position: centroid,
              map: viewMap,
              title: farm.name,
              label: {
                text: farm.name,
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#22c55e',
              },
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillOpacity: 0.8,
                fillColor: '#22c55e',
                strokeColor: '#ffffff',
                strokeWeight: 2,
              },
            });
            setViewFarmMarker(marker);
          }
        }

        // Create bounds and center the map
        const bounds = new window.google.maps.LatLngBounds();
        farm.coordinates.forEach(coord => {
          bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
        });

        // Fit bounds on view map
        viewMap.fitBounds(bounds, 50);
        
        console.log("Farm loaded successfully on view map");
        
        toast({
          title: "Farm Loaded!",
          description: `${farm.name || 'Farm'} is now displayed on the view map.`,
        });

      } catch (error) {
        console.error("Error loading farm on view map:", error);
        toast({
          title: "Error",
          description: "Failed to load farm on view map. Please try again.",
          variant: "destructive",
        });
      }
    }, 200);
  };

  // Delete a saved farm
  const deleteFarm = async (farmId) => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/farms/${farmId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
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
      console.log("Fetching farms, token:", token ? "present" : "missing");
      if (!token) {
        console.log("No token available, skipping farm fetch");
        return;
      }
      try {
        const response = await fetch(`${getBackendUrl()}/api/farms`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const result = await response.json();
        console.log("Farm fetch response:", result);
        if (response.ok && result.data && result.data.farms) {
          console.log("Farms loaded:", result.data.farms.length);
          // Filter out soft-deleted farms (is_active === false)
          const activeFarms = result.data.farms.filter(farm => farm.is_active !== false);
          setSavedFarms(activeFarms);
        } else {
          console.log("No farms found or error:", result);
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
  }, [token]);

  const [activeTab, setActiveTab] = useState("calculator");

  useEffect(() => {
    // When switching to calculator, trigger map resize
    if (activeTab === "calculator" && map) {
      setTimeout(() => {
        window.google.maps.event.trigger(map, "resize");
        // Optionally, re-center or fit bounds if you have coordinates
        if (coordinates.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          coordinates.forEach(coord => {
            bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
          });
          map.fitBounds(bounds);
        }
      }, 200);
    }
    // When switching to viewer, trigger viewMap resize
    if (activeTab === "viewer" && viewMap) {
      setTimeout(() => {
        window.google.maps.event.trigger(viewMap, "resize");
        // Optionally, fit bounds for viewPolygon
        if (viewPolygon && viewPolygon.getPath && viewPolygon.getPath().getLength() > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          viewPolygon.getPath().forEach(coord => {
            bounds.extend(coord);
          });
          viewMap.fitBounds(bounds);
        }
      }, 200);
    }
  }, [activeTab, map, viewMap, coordinates, viewPolygon]);

  useEffect(() => {
    if (activeTab === "viewer" && !viewMap && viewMapRef.current) {
      // Re-initialize the view map if not present
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (window.google && window.google.maps && viewMapRef.current) {
        try {
          const viewMapInstance = new window.google.maps.Map(viewMapRef.current, {
            center: { lat: 28.6139, lng: 77.2090 },
            zoom: 15,
            mapTypeId: 'satellite'
          });
          setViewMap(viewMapInstance);
        } catch (error) {
          console.error('Error re-initializing view map:', error);
        }
      }
    }
  }, [activeTab, viewMap, viewMapRef]);

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
                  {/* Floating Area Name Overlay */}
                  {coordinates.length >= 3 && farmName && !isDrawing && (
                    <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }} className="bg-white bg-opacity-80 px-4 py-1 rounded shadow text-green-700 font-bold text-lg pointer-events-none">
                      {farmName}
                    </div>
                  )}
                  <div ref={mapRef} className="absolute inset-0 rounded-lg" style={{ width: '100%', height: '400px', minHeight: '400px' }} />
                  {/* Debug info */}
                  {polygon && (
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs p-1 rounded">
                      Polygon loaded: {coordinates.length} points
                    </div>
                  )}
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
                  {/* Refresh Map Button */}
                  {polygon && (
                    <Button variant="outline" onClick={forceRefreshMap} className="bg-yellow-50 border-yellow-300">
                      🔄 Refresh Map
                    </Button>
                  )}
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
                {/* Farm info overlay */}
                {viewPolygon && (
                  <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-md z-10">
                    <h3 className="font-semibold text-green-800">Farm Loaded</h3>
                    <p className="text-sm text-gray-600">Use the controls below to load different farms</p>
                  </div>
                )}
                
                <div ref={viewMapRef} className="absolute inset-0 rounded-lg" style={{ width: '100%', height: '500px' }} />
                
                {!viewMap && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading view map...</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Load Your Farms:</h4>
                  <div className="text-sm">
                    Map Status: {viewMap ? (
                      <span className="text-green-600">✅ Ready</span>
                    ) : (
                      <span className="text-yellow-600">⏳ Loading...</span>
                    )}
                  </div>
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
                        disabled={!viewMap}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        {farm.name}
                      </Button>
                    ))}
                  </div>
                )}
                
                {!viewMap && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                    ⏳ Waiting for map to load... This usually takes a few seconds.
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
              <p>• Token: {token ? "✅ Present" : "❌ Missing"}</p>
              <p>• Saved Farms Count: {savedFarms.length}</p>
              <p>• Backend URL: https://smart-farmer-cyyz.onrender.com/api/farms</p>
            </div>
            
            {savedFarms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  No saved farms yet. Create your first farm profile using the calculator.
                </p>
                {!token && (
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

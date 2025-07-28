import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Save, Download, Trash2, Edit2, Calculator, Brain, Sprout, Search, Maximize2, Minimize2, Globe2, LocateFixed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import replicateClient from "@/lib/replicate";
import { useUser } from "@/contexts/UserContext";
import { getBackendUrl } from '@/lib/utils';
import { MapContainer, TileLayer, Polygon, FeatureGroup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import 'leaflet-control-geocoder';

// Import CSS styles inline to avoid Vite import issues
const geocoderStyles = `
.leaflet-control-geocoder{border-radius:4px;background:#fff;min-width:26px;min-height:26px}.leaflet-touch .leaflet-control-geocoder{min-width:30px;min-height:30px}.leaflet-control-geocoder a,.leaflet-control-geocoder .leaflet-control-geocoder-icon{border-bottom:none;display:inline-block}.leaflet-control-geocoder .leaflet-control-geocoder-alternatives a{width:inherit;height:inherit;line-height:inherit}.leaflet-control-geocoder a:hover,.leaflet-control-geocoder .leaflet-control-geocoder-icon:hover{border-bottom:none;display:inline-block}.leaflet-control-geocoder-form{display:none;vertical-align:middle}.leaflet-control-geocoder-expanded .leaflet-control-geocoder-form{display:inline-block}.leaflet-control-geocoder-form input{font-size:120%;border:0;background-color:transparent;width:246px}.leaflet-control-geocoder-icon{border-radius:4px;width:26px;height:26px;border:none;background-color:#fff;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12.2 13l3.4 6.6c.6 1.1 2.5-.4 2-1.2l-4-6.2z'/%3E%3Ccircle cx='10.8' cy='8.9' r='3.9' fill='none' stroke='%23000' stroke-width='1.5'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:center;cursor:pointer}.leaflet-touch .leaflet-control-geocoder-icon{width:30px;height:30px}.leaflet-control-geocoder-throbber .leaflet-control-geocoder-icon{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' stroke='%23000' stroke-linecap='round' stroke-width='1.6' viewBox='0 0 24 24'%3E%3Cdefs/%3E%3Cg%3E%3Cpath stroke-opacity='.1' d='M14 8.4l3-5'/%3E%3Cpath stroke-opacity='.2' d='M15.6 10l5-3'/%3E%3Cpath stroke-opacity='.3' d='M16.2 12H22'/%3E%3Cpath stroke-opacity='.4' d='M15.6 14l5 3m-6.5-1.4l2.9 5'/%3E%3Cpath stroke-opacity='.5' d='M12 16.2V22m-2-6.4l-3 5'/%3E%3Cpath stroke-opacity='.6' d='M8.4 14l-5 3'/%3E%3Cpath stroke-opacity='.7' d='M7.8 12H2'/%3E%3Cpath stroke-opacity='.8' d='M8.4 10l-5-3'/%3E%3Cpath stroke-opacity='.9' d='M10 8.4l-3-5'/%3E%3Cpath d='M12 7.8V2'/%3E%3CanimateTransform attributeName='transform' calcMode='discrete' dur='1s' repeatCount='indefinite' type='rotate' values='0 12 12;30 12 12;60 12 12;90 12 12;120 12 12;150 12 12;180 12 12;210 12 12;240 12 12;270 12 12;300 12 12;330 12 12'/%3E%3C/g%3E%3C/svg%3E")}.leaflet-control-geocoder-form-no-error{display:none}.leaflet-control-geocoder-form input:focus{outline:none}.leaflet-control-geocoder-form button{display:none}.leaflet-control-geocoder-error{margin-top:8px;margin-left:8px;display:block;color:#444}.leaflet-control-geocoder-alternatives{display:block;width:272px;list-style:none;padding:0;margin:0}.leaflet-control-geocoder-alternatives-minimized{display:none;height:0}.leaflet-control-geocoder-alternatives li{white-space:nowrap;display:block;overflow:hidden;padding:5px 8px;text-overflow:ellipsis;border-bottom:1px solid #ccc;cursor:pointer}.leaflet-control-geocoder-alternatives li a,.leaflet-control-geocoder-alternatives li a:hover{width:inherit;height:inherit;line-height:inherit;background:inherit;border-radius:inherit;text-align:left}.leaflet-control-geocoder-alternatives li:last-child{border-bottom:none}.leaflet-control-geocoder-alternatives li:hover,.leaflet-control-geocoder-selected{background-color:#f5f5f5}.leaflet-control-geocoder-address-context{color:#666}
`;

// Inject styles into the document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = geocoderStyles;
  document.head.appendChild(styleElement);
}

// Add styles for full screen map
const fullscreenMapStyles = `
.fullscreen-map {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 9999 !important;
  background: #fff !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
.fullscreen-map .leaflet-container {
  height: 100vh !important;
  min-height: 100vh !important;
}
.fullscreen-toggle-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1100;
}
`;
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = fullscreenMapStyles;
  document.head.appendChild(styleElement);
}

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
  // Remove isDrawing state
  
  // AI Features
  const [cropType, setCropType] = useState('');
  const [soilType, setSoilType] = useState('');
  const [climate, setClimate] = useState('');
  const [soilPH, setSoilPH] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadedFarmInViewer, setLoadedFarmInViewer] = useState(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("calculator");
  const mapContainerRef = useRef(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  // Add state for map base layer
  const [mapBaseLayer, setMapBaseLayer] = useState('esri'); // 'esri' or 'osm'
  // Add state for my location marker
  const [myLocation, setMyLocation] = useState(null);
  // Add state to track map readiness
  const [isMapReady, setIsMapReady] = useState(false);

  // Native Fullscreen API handlers
  useEffect(() => {
    function handleFullscreenChange() {
      const isFull = document.fullscreenElement === mapContainerRef.current;
      setIsMapFullscreen(isFull);
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    const el = mapContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const featureGroupRef = useRef();
  const viewFeatureGroupRef = useRef();

  const onCreated = e => {
    const { layer } = e;
    const latlngs = layer.getLatLngs()[0].map(latlng => ({ lat: latlng.lat, lng: latlng.lng }));
    setCoordinates(latlngs);
    const areaInSqMeters = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
    setArea(convertArea(areaInSqMeters, unit));
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

  // Clear the current drawing
  const clearDrawing = () => {
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
    }
    setCoordinates([]);
    setArea(0);
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

    // Validate coordinates
    const validCoordinates = coordinates.every(coord => 
      typeof coord.lat === 'number' && typeof coord.lng === 'number' &&
      !isNaN(coord.lat) && !isNaN(coord.lng)
    );

    if (!validCoordinates) {
      toast({
        title: "Error",
        description: "Invalid coordinates detected. Please redraw the farm area.",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate centroid for location
    const centroid = getCentroid(coordinates);
    
    // Compose location object (address is required by validation)
    const location = {
      lat: parseFloat(centroid.lat),
      lng: parseFloat(centroid.lng),
      address: farmDescription || `${farmName} Farm Location`
    };
    
    // Validate location
    if (isNaN(location.lat) || isNaN(location.lng) || !location.address) {
      toast({
        title: "Error",
        description: "Invalid location data. Please redraw the farm area.",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate area in square meters and convert to hectares/acres
    const areaInSqMeters = calculatePolygonArea(coordinates);
    const areaHectares = parseFloat((areaInSqMeters / 10000).toFixed(2));
    const areaAcres = parseFloat((areaInSqMeters / 4047).toFixed(2));
    
    // Validate area values
    if (areaInSqMeters <= 0 || areaHectares <= 0 || areaAcres <= 0) {
      toast({
        title: "Error",
        description: "Invalid area calculated. Please redraw the farm area.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Saving farm with data:', {
      name: farmName,
      areaInSqMeters,
      areaHectares,
      areaAcres,
      coordinates: coordinates.length,
      location: {
        lat: centroid.lat,
        lng: centroid.lng,
        address: farmDescription || `${farmName} Farm Location`
      }
    });
    
    // Ensure coordinates are properly formatted
    const formattedCoordinates = coordinates.map(coord => ({
      lat: parseFloat(coord.lat),
      lng: parseFloat(coord.lng)
    }));

    // Remove undefined values to prevent validation issues
    const farmPayload = {
      name: farmName,
      location,
      coordinates: formattedCoordinates,
      area_hectares: areaHectares,
      area_acres: areaAcres,
      ...(soilType && { soil_type: soilType }),
      ...(farmDescription && { description: farmDescription })
    };

    // Log the exact payload being sent
    console.log('Farm payload to be sent:', JSON.stringify(farmPayload, null, 2));
    
    try {
      setIsSaving(true);
      const response = await fetch(`${getBackendUrl()}/api/farms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(farmPayload),
      });
      
      const result = await response.json();
      console.log('Backend response:', result);
      
      if (!response.ok) {
        // Show more detailed error information
        const errorMessage = result.message || result.error || "Failed to save farm";
        console.error('Validation error details:', result);
        
        // Log specific validation errors if available
        if (result.errors && Array.isArray(result.errors)) {
          console.error('Specific validation errors:');
          result.errors.forEach((error, index) => {
            console.error(`Error ${index + 1}:`, error);
          });
        }
        
        throw new Error(errorMessage);
      }
      
      // Add the new farm to the saved farms list
      const newFarm = {
        ...result.data.farm,
        area: unit === 'hectares' ? areaHectares : areaAcres,
        unit: unit
      };
      
      setSavedFarms(prev => [...prev, newFarm]);
      setFarmName('');
      setFarmDescription('');
      clearDrawing();
      
      toast({
        title: "Farm Saved!",
        description: `${farmName} (${Number(area).toFixed(2)} ${unit}) has been saved successfully.`,
      });
    } catch (error) {
      console.error('Error saving farm:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save farm to backend.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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

  // Geocoder Control Component
  const GeocoderControl = ({ position = 'topleft' }) => {
    const map = useMap();
    
    useEffect(() => {
      if (!map) return;
      
      // Create geocoder control
      const geocoder = L.Control.geocoder({
        defaultMarkGeocode: false,
        placeholder: 'Search for a location...',
        geocoder: L.Control.Geocoder.nominatim({
          geocodingQueryParams: {
            countrycodes: 'in', // Focus on India
            limit: 5
          }
        })
      }).addTo(map);
      
      // Handle geocoding results
      geocoder.on('markgeocode', (e) => {
        const { center, bbox } = e.geocode;
        
        // Fly to the location
        map.flyTo(center, 16);
        
        // Show a temporary marker
        const marker = L.marker(center).addTo(map);
        
        // Remove marker after 3 seconds
        setTimeout(() => {
          map.removeLayer(marker);
        }, 3000);
        
        // Show toast notification
        toast({
          title: "Location Found!",
          description: `Navigated to ${e.geocode.name || 'the selected location'}`,
        });
      });
      
      // Cleanup function
      return () => {
        if (map && geocoder) {
          map.removeControl(geocoder);
        }
      };
    }, [map]);
    
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
    console.log('Loading farm on view map:', farm);
    
    if (viewFeatureGroupRef.current && farm.coordinates && farm.coordinates.length > 0) {
      viewFeatureGroupRef.current.clearLayers();
      
      // Ensure coordinates are in the correct format
      const validCoordinates = farm.coordinates.filter(coord => 
        coord && typeof coord.lat === 'number' && typeof coord.lng === 'number' &&
        !isNaN(coord.lat) && !isNaN(coord.lng)
      );
      
      if (validCoordinates.length >= 3) {
        const polygon = L.polygon(validCoordinates.map(c => [c.lat, c.lng]), {
          color: 'green',
          weight: 2,
          fillColor: '#22c55e',
          fillOpacity: 0.3
        });
        
        viewFeatureGroupRef.current.addLayer(polygon);
        
        // Fit map to the polygon bounds
        const bounds = L.latLngBounds(validCoordinates.map(c => [c.lat, c.lng]));
        if (viewMapRef.current) {
          viewMapRef.current.fitBounds(bounds, { padding: [20, 20] });
        }
        
        // Set the loaded farm state
        setLoadedFarmInViewer(farm);
        
        toast({
          title: "Farm Loaded!",
          description: `${farm.name} has been loaded on the map.`,
        });
      } else {
        console.error('Invalid coordinates for farm:', farm);
        toast({
          title: "Error",
          description: "Invalid farm coordinates. Cannot display on map.",
          variant: "destructive",
        });
      }
    } else {
      console.error('Cannot load farm - missing coordinates or feature group ref');
      toast({
        title: "Error",
        description: "Cannot load farm. Missing coordinates or map reference.",
        variant: "destructive",
      });
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

  // Add no-scroll CSS
  useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('no-scroll-style')) {
      const style = document.createElement('style');
      style.id = 'no-scroll-style';
      style.innerHTML = `.no-scroll { overflow: hidden !important; }`;
      document.head.appendChild(style);
    }
  }, []);

  // Manual search function
  const searchForLocation = async () => {
    if (!searchLocation.trim()) {
      toast({
        title: "Error",
        description: "Please enter a location to search for.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocation)}&countrycodes=in&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const location = data[0];
        const lat = parseFloat(location.lat);
        const lon = parseFloat(location.lon);
        
        // Fly to the location on both maps
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lon], 16);
        }
        if (viewMapRef.current) {
          viewMapRef.current.flyTo([lat, lon], 16);
        }
        
        // Show temporary marker
        const marker = L.marker([lat, lon]).addTo(mapRef.current || viewMapRef.current);
        setTimeout(() => {
          if (mapRef.current) mapRef.current.removeLayer(marker);
          if (viewMapRef.current) viewMapRef.current.removeLayer(marker);
        }, 5000);
        
        toast({
          title: "Location Found!",
          description: `Navigated to ${location.display_name}`,
        });
        
        setSearchLocation('');
      } else {
        toast({
          title: "Location Not Found",
          description: "Could not find the specified location. Please try a different search term.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Clear loaded farm when switching away from viewer tab
  const handleTabChange = (newTab) => {
    if (activeTab === "viewer" && newTab !== "viewer") {
      setLoadedFarmInViewer(null);
    }
    setActiveTab(newTab);
  };

  // Add a helper for getting the correct tile layer config
  const getTileLayer = () => {
    if (mapBaseLayer === 'esri') {
      return {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: 'Tiles © Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      };
    } else {
      return {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: '&copy; OpenStreetMap contributors'
      };
    }
  };

  // Helper to handle geolocation for a given map ref
  const handleFindMyLocation = (mapRefToUse) => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
      return;
    }
    if (!mapRefToUse.current || typeof mapRefToUse.current.setView !== 'function') {
      toast({
        title: "Map Not Ready",
        description: "The map is not ready yet. Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setMyLocation({ lat: latitude, lng: longitude });
        const map = mapRefToUse.current;
        // Fly to user location
        map.setView([latitude, longitude], 15);
        // Add marker with popup
        const marker = L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup("You are here!")
          .openPopup();
        // Optional: Add accuracy circle
        const circle = L.circle([latitude, longitude], {
          radius: accuracy,
          color: "blue",
          fillOpacity: 0.1,
        }).addTo(map);
        // Remove marker and circle after 5 seconds
        setTimeout(() => {
          map.removeLayer(marker);
          map.removeLayer(circle);
        }, 5000);
        toast({
          title: "Location Found!",
          description: `Centered map to your current location.`,
        });
      },
      (error) => {
        console.error(error);
        toast({
          title: "Location Error",
          description: error.message || "Unable to retrieve your location.",
          variant: "destructive",
        });
      }
    );
  };

  // Auto-center map to user's location on mount (calculator map)
  useEffect(() => {
    if (mapRef.current) {
      handleFindMyLocation(mapRef);
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Dropdown Menu for Navigation */}
      <div className="mb-4">
        <label htmlFor="farm-section" className="block font-semibold mb-1">Select Section:</label>
        <select
          id="farm-section"
          className="w-full p-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          value={activeTab}
          onChange={e => handleTabChange(e.target.value)}
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
            <CardContent style={{ position: 'relative' }}>
              <div ref={mapContainerRef} className="w-full h-96 rounded-lg border relative" style={{ minHeight: '400px', height: '400px' }}>
                {/* Fullscreen button - bottom right corner */}
                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1200, background: '#fff', border: '1px solid #ccc', borderRadius: 6, padding: 8, display: 'flex', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  title={isMapFullscreen ? 'Exit Full Screen' : 'Full Screen'}
                >
                  {isMapFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
                <MapContainer
                  center={[28.6139, 77.2090]}
                  zoom={15}
                  ref={mapRef}
                  whenCreated={mapInstance => { mapRef.current = mapInstance; setIsMapReady(true); }}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url={getTileLayer().url}
                    attribution={getTileLayer().attribution}
                  />
                  <FeatureGroup ref={featureGroupRef}>
                    <EditControl
                      position="topright"
                      onCreated={onCreated}
                      onEdited={onEdited}
                      onDeleted={onDeleted}
                      draw={{
                        polygon: true,
                        rectangle: false,
                        circle: false,
                        circlemarker: false,
                        marker: false,
                        polyline: false,
                      }}
                    />
                  </FeatureGroup>
                  <GeocoderControl position="topleft" />
                  <MapUpdater coords={coordinates} />
                </MapContainer>
              </div>
              {/* Search Location Section - compact */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg mt-2">
                <h4 className="font-semibold text-blue-800 mb-2 text-sm">Search Location</h4>
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Enter location (e.g., Mumbai, Maharashtra)"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchForLocation()}
                    className="flex-1 h-8 text-sm px-2"
                    style={{ minHeight: 0, fontSize: '0.95rem' }}
                  />
                  <Button
                    onClick={searchForLocation}
                    disabled={isSearching || !searchLocation.trim()}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    style={{ minWidth: 0 }}
                  >
                    <Search className="h-4 w-4 mr-1" />
                    {isSearching ? '...' : 'Search'}
                  </Button>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Search for cities, villages, or landmarks to navigate to that location
                </p>
                {/* My Location and Map View buttons below search bar */}
                <div className="flex gap-2 mt-3">
                  <Button
                    type="button"
                    onClick={() => handleFindMyLocation(mapRef)}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 flex items-center"
                    style={{ minWidth: 0 }}
                    title="Find My Location"
                    disabled={!isMapReady}
                  >
                    <LocateFixed size={16} className="mr-1" />
                    My Location
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setMapBaseLayer(mapBaseLayer === 'esri' ? 'osm' : 'esri')}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 flex items-center"
                    style={{ minWidth: 0 }}
                    title={mapBaseLayer === 'esri' ? 'Switch to Map View' : 'Switch to Satellite View'}
                  >
                    <Globe2 size={16} className="mr-1" />
                    {mapBaseLayer === 'esri' ? 'Map' : 'Satellite'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <Button variant="outline" onClick={clearDrawing}>
                  Clear
                </Button>
                <Button variant="outline" onClick={exportData} disabled={!area}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
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
                  <div className="mt-2 space-y-1">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {coordinates.length} points marked
                    </Badge>
                    <div className="text-xs text-green-700">
                      {(() => {
                        const areaInSqMeters = calculatePolygonArea(coordinates);
                        const hectares = (areaInSqMeters / 10000).toFixed(2);
                        const acres = (areaInSqMeters / 4047).toFixed(2);
                        return `${hectares} hectares • ${acres} acres`;
                      })()}
                    </div>
                  </div>
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
                disabled={!farmName || coordinates.length < 3 || isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Farm Profile'}
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
          <CardContent style={{ position: 'relative' }}>
            <div className="w-full h-96 rounded-lg border relative" style={{ minHeight: '500px', height: '500px' }}>
              {/* My Location button - top right, left of layer switch button (viewer map) */}
              <button
                type="button"
                onClick={() => handleFindMyLocation(viewMapRef)}
                style={{ position: 'absolute', top: 12, right: 160, zIndex: 1200, background: '#fff', border: '1px solid #ccc', borderRadius: 6, padding: 4, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                title="Find My Location"
              >
                <LocateFixed size={18} />
              </button>
              {/* Layer switch button - top right, left of fullscreen button (viewer map) */}
              <button
                type="button"
                onClick={() => setMapBaseLayer(mapBaseLayer === 'esri' ? 'osm' : 'esri')}
                style={{ position: 'absolute', top: 12, right: 108, zIndex: 1200, background: '#fff', border: '1px solid #ccc', borderRadius: 6, padding: 4, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                title={mapBaseLayer === 'esri' ? 'Switch to Map View' : 'Switch to Satellite View'}
              >
                <Globe2 size={18} />
                <span style={{ marginLeft: 4, fontSize: 12 }}>{mapBaseLayer === 'esri' ? 'Map' : 'Satellite'}</span>
              </button>
              {/* Fullscreen button - top right, left of draw controls (viewer map) */}
              <button
                type="button"
                onClick={handleToggleFullscreen}
                style={{ position: 'absolute', top: 12, right: 56, zIndex: 1200, background: '#fff', border: '1px solid #ccc', borderRadius: 6, padding: 4, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                title={isMapFullscreen ? 'Exit Full Screen' : 'Full Screen'}
              >
                {isMapFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <MapContainer
                center={[28.6139, 77.2090]}
                zoom={15}
                ref={viewMapRef}
                whenCreated={mapInstance => { viewMapRef.current = mapInstance; }}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url={getTileLayer().url}
                  attribution={getTileLayer().attribution}
                />
                <FeatureGroup ref={viewFeatureGroupRef}>
                  {/* Loaded farm will be displayed here */}
                </FeatureGroup>
                <GeocoderControl position="topleft" />
                <MapUpdater coords={coordinates} />
              </MapContainer>
            </div>
            {/* Search Location Section for Viewer - compact */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg mt-2">
              <h4 className="font-semibold text-blue-800 mb-2 text-sm">Search Location</h4>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Enter location (e.g., Mumbai, Maharashtra)"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchForLocation()}
                  className="flex-1 h-8 text-sm px-2"
                  style={{ minHeight: 0, fontSize: '0.95rem' }}
                />
                <Button
                  onClick={searchForLocation}
                  disabled={isSearching || !searchLocation.trim()}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  style={{ minWidth: 0 }}
                >
                  <Search className="h-4 w-4 mr-1" />
                  {isSearching ? '...' : 'Search'}
                </Button>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Search for cities, villages, or landmarks to navigate to that location
              </p>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Load Your Farms:</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Refresh saved farms
                      const fetchFarms = async () => {
                        try {
                          const response = await fetch(`${getBackendUrl()}/api/farms`, {
                            credentials: 'include',
                          });
                          const result = await response.json();
                          if (response.ok && result.data && result.data.farms) {
                            const activeFarms = result.data.farms.filter(farm => farm.is_active !== false);
                            setSavedFarms(activeFarms);
                            toast({
                              title: "Farms Refreshed",
                              description: `Loaded ${activeFarms.length} farms.`,
                            });
                          }
                        } catch (error) {
                          console.error("Error fetching farms:", error);
                          toast({
                            title: "Error",
                            description: "Failed to refresh farms.",
                            variant: "destructive",
                          });
                        }
                      };
                      fetchFarms();
                    }}
                  >
                    Refresh
                  </Button>
                  {loadedFarmInViewer && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (viewFeatureGroupRef.current) {
                          viewFeatureGroupRef.current.clearLayers();
                        }
                        setLoadedFarmInViewer(null);
                        toast({
                          title: "Map Cleared",
                          description: "Farm has been removed from the map.",
                        });
                      }}
                    >
                      Clear Map
                    </Button>
                  )}
                </div>
              </div>
              
              {loadedFarmInViewer && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <h5 className="font-semibold text-green-800">Currently Loaded:</h5>
                  <p className="text-sm text-green-700">
                    {loadedFarmInViewer.name} - {loadedFarmInViewer.coordinates?.length || 0} points
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      console.log('Loaded farm details:', loadedFarmInViewer);
                      console.log('Coordinates:', loadedFarmInViewer.coordinates);
                    }}
                  >
                    Debug Farm Data
                  </Button>
                </div>
              )}
              
              {savedFarms.length === 0 ? (
                <p className="text-gray-500">No saved farms available. Create farms in the Calculator tab first.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {savedFarms.map((farm) => (
                    <Button
                      key={farm.id}
                      onClick={() => loadFarmOnViewMap(farm)}
                      variant={loadedFarmInViewer?.id === farm.id ? "default" : "outline"}
                      size="sm"
                      className="text-left justify-start"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {farm.name}
                      {loadedFarmInViewer?.id === farm.id && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Loaded
                        </Badge>
                      )}
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
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-bold text-green-600">
                            {farm.area_acres ? `${Number(farm.area_acres).toFixed(2)} acres` : farm.area_hectares ? `${Number(farm.area_hectares).toFixed(2)} hectares` : '0.00 acres'}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {farm.coordinates ? `${farm.coordinates.length} points` : '0 points'}
                          </Badge>
                        </div>
                        {farm.area_acres && farm.area_hectares && (
                          <p className="text-xs text-gray-500">
                            {Number(farm.area_hectares).toFixed(2)} hectares
                          </p>
                        )}
                        {farm.description && (
                          <p className="text-xs text-gray-500 truncate">{farm.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Created: {new Date(farm.created_at).toLocaleDateString()}
                        </p>
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

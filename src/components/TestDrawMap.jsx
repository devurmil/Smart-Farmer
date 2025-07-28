import React from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

const TestDrawMap = () => (
  <div style={{ height: 500 }}>
    <MapContainer center={[28.6139, 77.2090]} zoom={15} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles © Esri"
      />
      <FeatureGroup>
        <EditControl
          position="topright"
          onCreated={e => console.log('created', e)}
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
    </MapContainer>
  </div>
);

export default TestDrawMap; 
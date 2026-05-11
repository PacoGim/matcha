import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  allowEdit?: boolean;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
  allowEdit = true
}) => {
  const [position, setPosition] = useState<[number, number]>([latitude, longitude]);

  useEffect(() => {
    setPosition([latitude, longitude]);
  }, [latitude, longitude]);

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (allowEdit) {
          const { lat, lng } = e.latlng;
          setPosition([lat, lng]);
          onLocationChange(lat, lng);
        }
      },
    });
    return null;
  };

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '4px', overflow: 'hidden' }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            {allowEdit ? 'Click on the map to set your location' : 'Your current location'}
          </Popup>
        </Marker>
        {allowEdit && <MapClickHandler />}
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
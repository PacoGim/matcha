import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
// @ts-ignore
import 'leaflet/dist/leaflet.css';
import type { LocationPickerType } from '../../../interfaces/LocationPicker.type';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//   iconUrl: require('leaflet/dist/images/marker-icon.png'),
//   shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
// });

const LocationPicker: React.FC<LocationPickerType> = ({
  latitude,
  longitude,
  onLocationChange,
  allowEdit = true
}) => {
  const [position, setPosition] = useState<[number, number]>([
    Number.isFinite(latitude) ? latitude : 0,
    Number.isFinite(longitude) ? longitude : 0,
  ]);

  useEffect(() => {
    setPosition([
      Number.isFinite(latitude) ? latitude : 0,
      Number.isFinite(longitude) ? longitude : 0,
    ]);
  }, [latitude, longitude]);

  const validPosition = Number.isFinite(position[0]) && Number.isFinite(position[1]);
  const safePosition: [number, number] = validPosition ? position : [0, 0];

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (allowEdit && e.latlng) {
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
        center={safePosition}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={safePosition}>
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
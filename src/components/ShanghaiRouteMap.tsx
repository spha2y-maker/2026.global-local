import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leafet marker issue by using custom div icons
const createCustomIcon = (emoji: string, num: number) => {
  return L.divIcon({
    html: `<div style="background: white; border: 2px solid #059669; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.15); position: relative; z-index: 10;">
      <div style="position: absolute; top: -6px; right: -6px; background: #059669; color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 11px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-sizing: border-box;">${num}</div>
      ${emoji}
    </div>`,
    className: '', // Removes default leaflet icon styles
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

interface ShanghaiRouteMapProps {
  onNavigateToPlace?: (id: string) => void;
}

const PLACES = [
  { id: 'nanjing_road', title: '남경로 (난징둥루)', lat: 31.2355, lng: 121.4798, emoji: '🏙️', day: 1, order: 1 },
  { id: 'waitan', title: '와이탄 (야경)', lat: 31.2397, lng: 121.4898, emoji: '✨', day: 1, order: 2 },
  { id: 'luxun_park', title: '루쉰공원 (매헌기념관)', lat: 31.2721, lng: 121.4795, emoji: '🇰🇷', day: 2, order: 3 },
  { id: 'prov_gov', title: '대한민국 임시정부청사', lat: 31.2185, lng: 121.4729, emoji: '🏛️', day: 2, order: 4 },
  { id: 'oriental_pearl', title: '동방명주 & 도시계획전시관', lat: 31.2397, lng: 121.4998, emoji: '🗼', day: 2, order: 5 },
  { id: 'yu_garden', title: '예원 & 예원 옛거리', lat: 31.2272, lng: 121.4921, emoji: '🏮', day: 2, order: 6 },
  { id: 'science_tech_museum', title: '상하이 과학기술관', lat: 31.2198, lng: 121.5401, emoji: '🤖', day: 3, order: 7 },
  { id: 'disneyland', title: '상하이 디즈니랜드', lat: 31.1440, lng: 121.6570, emoji: '🏰', day: 3, order: 8 },
];

export const ShanghaiRouteMap: React.FC<ShanghaiRouteMapProps> = ({ onNavigateToPlace }) => {
  // Map center between all points (roughly center of Shanghai)
  const center: [number, number] = [31.2185, 121.5201];
  const zoom = 11;

  // Extract lat/lngs for drawing the connecting route path
  const routePositions: [number, number][] = PLACES.map(p => [p.lat, p.lng]);

  return (
    <div className="w-full h-[400px] sm:h-[500px] rounded-3xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Draw a dashed line connecting the path */}
        <Polyline 
          positions={routePositions} 
          pathOptions={{ color: '#10b981', weight: 3, dashArray: '8, 8' }} 
        />

        {/* Add Markers for each place */}
        {PLACES.map((place) => (
          <Marker 
            key={place.id} 
            position={[place.lat, place.lng]}
            icon={createCustomIcon(place.emoji, place.order)}
            eventHandlers={{
              click: () => {
                if (onNavigateToPlace) {
                  onNavigateToPlace(place.id);
                }
              }
            }}
          >
            <Popup className="rounded-xl">
              <div className="text-center font-sans">
                <div className="text-[10px] font-bold text-emerald-600 mb-1">DAY {place.day} • COURSE {place.order}</div>
                <div className="text-sm font-bold text-slate-900 mb-2">{place.title}</div>
                <button 
                  onClick={() => onNavigateToPlace?.(place.id)}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition w-full"
                >
                  워크북 페이지로 이동 ➔
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

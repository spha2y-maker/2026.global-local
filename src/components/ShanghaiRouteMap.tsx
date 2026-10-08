import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Layers, 
  Navigation, 
  Maximize2, 
  ArrowRight, 
  Calendar, 
  Sparkles,
  Route,
  Info,
  CheckCircle2
} from 'lucide-react';

interface ShanghaiRouteMapProps {
  onNavigateToPlace?: (id: string) => void;
}

interface PlacePoint {
  id: string;
  title: string;
  chinese: string;
  lat: number;
  lng: number;
  emoji: string;
  day: number;
  order: number;
  highlight: string;
  description: string;
  dayColor: string;
}

const PLACES: PlacePoint[] = [
  { 
    id: 'nanjing_road', 
    title: '남경로 (난징둥루)', 
    chinese: '南京东路',
    lat: 31.2355, 
    lng: 121.4798, 
    emoji: '🏙️', 
    day: 1, 
    order: 1, 
    highlight: '상하이 최대의 번화가 & 보행자 천국',
    description: '100년 전 독립운동가들의 비밀 거점과 근대 상업 중심지',
    dayColor: '#2563eb'
  },
  { 
    id: 'waitan', 
    title: '와이탄 (외탄 야경)', 
    chinese: '外滩',
    lat: 31.2397, 
    lng: 121.4898, 
    emoji: '✨', 
    day: 1, 
    order: 2, 
    highlight: '황푸강변 근대 석조 건축군 & 황홀한 야경',
    description: '세계 건축 박물관과 황푸강 건너 푸둥 스카이라인 조망',
    dayColor: '#2563eb'
  },
  { 
    id: 'luxun_park', 
    title: '루쉰공원 (매헌기념관)', 
    chinese: '鲁迅公园',
    lat: 31.2721, 
    lng: 121.4795, 
    emoji: '🇰🇷', 
    day: 2, 
    order: 3, 
    highlight: '윤봉길 의사 홍커우공원 의거 성지',
    description: '매헌 윤봉길 의사의 숭고한 애국정신과 매헌기념관 탐방',
    dayColor: '#059669'
  },
  { 
    id: 'prov_gov', 
    title: '대한민국 임시정부청사', 
    chinese: '大韩民国临时政府旧址',
    lat: 31.2185, 
    lng: 121.4729, 
    emoji: '🏛️', 
    day: 2, 
    order: 4, 
    highlight: '1926~1932년 대한민국 임시정부의 심장',
    description: '마랑로 306호에 보존된 김구 주석 집무실과 국무위원 집무실',
    dayColor: '#059669'
  },
  { 
    id: 'oriental_pearl', 
    title: '동방명주 & 도시계획전시관', 
    chinese: '东方明珠广播电视塔',
    lat: 31.2397, 
    lng: 121.4998, 
    emoji: '🗼', 
    day: 2, 
    order: 5, 
    highlight: '높이 468m 상하이의 대표 랜드마크',
    description: '유리 바닥 전망대에서 굽어보는 황푸강과 미래 도시 파노라마',
    dayColor: '#059669'
  },
  { 
    id: 'yu_garden', 
    title: '예원 & 예원 옛거리', 
    chinese: '豫园',
    lat: 31.2272, 
    lng: 121.4921, 
    emoji: '🏮', 
    day: 2, 
    order: 6, 
    highlight: '명·청 시대 강남 정원의 최고봉',
    description: '부모님을 위해 지은 효심의 정원, 구곡교와 용벽 조각 감상',
    dayColor: '#059669'
  },
  { 
    id: 'science_tech_museum', 
    title: '상하이 과학기술관', 
    chinese: '上海科技馆',
    lat: 31.2198, 
    lng: 121.5401, 
    emoji: '🤖', 
    day: 3, 
    order: 7, 
    highlight: '중국 최대의 첨단 미래 과학기술 체험관',
    description: '로봇 세계, 인공지능(AI), 지혜의 빛 등 체험형 과학 탐구',
    dayColor: '#7c3aed'
  },
  { 
    id: 'disneyland', 
    title: '상하이 디즈니랜드', 
    chinese: '上海迪士尼乐园',
    lat: 31.1440, 
    lng: 121.6570, 
    emoji: '🏰', 
    day: 3, 
    order: 8, 
    highlight: '세계 최대 인챈티드 캐슬과 글로벌 테마파크',
    description: '세계적인 문화 콘텐츠 산업과 첨단 미디어 어트랙션 체험',
    dayColor: '#7c3aed'
  },
];

// Reference locations for better geographic context
const REFERENCE_POINTS = [
  { title: '상하이 푸둥 국제공항 (도착)', lat: 31.1443, lng: 121.8083, emoji: '✈️' },
  { title: '르네상스 호텔 (숙소)', lat: 31.2505, lng: 121.4110, emoji: '🏨' },
];

export const ShanghaiRouteMap: React.FC<ShanghaiRouteMapProps> = ({ onNavigateToPlace }) => {
  const [selectedDay, setSelectedDay] = useState<number>(0); // 0 = all
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'diagram'>('map');
  const [mapTileSource, setMapTileSource] = useState<'carto' | 'osm'>('carto');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Filtered places
  const displayedPlaces = selectedDay === 0 
    ? PLACES 
    : PLACES.filter(p => p.day === selectedDay);

  // Initialize Leaflet Map
  useEffect(() => {
    if (viewMode !== 'map' || !mapContainerRef.current) return;

    // Destroy existing instance to guarantee clean lifecycle
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [31.225, 121.52],
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      // Add zoom control at bottom right for better mobile UI
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add Tile Layer
      const tileUrl = mapTileSource === 'carto'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      });
      tileLayerRef.current = tileLayer;
      tileLayer.addTo(map);

      // Create a layer group for easy clearing
      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;

      // Ensure proper sizing after DOM layout settles
      const invalidate = () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      };

      const t1 = setTimeout(invalidate, 100);
      const t2 = setTimeout(invalidate, 400);

      const resizeObserver = new ResizeObserver(() => {
        invalidate();
      });
      if (mapContainerRef.current) {
        resizeObserver.observe(mapContainerRef.current);
      }

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        resizeObserver.disconnect();
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    } catch (err) {
      console.warn('Leaflet map init warning:', err);
    }
  }, [viewMode, mapTileSource]);

  // Update Markers and Polylines when selectedDay changes
  useEffect(() => {
    if (viewMode !== 'map' || !mapInstanceRef.current || !layerGroupRef.current) return;

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    // Clear previous markers and lines
    layerGroup.clearLayers();

    const bounds = L.latLngBounds([]);

    // Draw Route Polylines
    if (selectedDay === 0) {
      // Draw routes for all 3 days in distinct colors
      [1, 2, 3].forEach(d => {
        const dayPlaces = PLACES.filter(p => p.day === d);
        if (dayPlaces.length >= 2) {
          const latLngs = dayPlaces.map(p => [p.lat, p.lng] as [number, number]);
          const color = d === 1 ? '#2563eb' : d === 2 ? '#059669' : '#7c3aed';
          
          L.polyline(latLngs, {
            color,
            weight: 4,
            dashArray: '6, 8',
            opacity: 0.85
          }).addTo(layerGroup);
        }
      });
    } else {
      // Draw route for the selected day
      const dayPlaces = PLACES.filter(p => p.day === selectedDay);
      if (dayPlaces.length >= 2) {
        const latLngs = dayPlaces.map(p => [p.lat, p.lng] as [number, number]);
        const color = selectedDay === 1 ? '#2563eb' : selectedDay === 2 ? '#059669' : '#7c3aed';
        
        L.polyline(latLngs, {
          color,
          weight: 5,
          dashArray: '8, 8',
          opacity: 0.95
        }).addTo(layerGroup);
      }
    }

    // Add Markers for Displayed Places
    displayedPlaces.forEach((place) => {
      bounds.extend([place.lat, place.lng]);

      const isCurrentSelected = selectedPlaceId === place.id;
      const markerColor = place.dayColor;

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        html: `
          <div style="
            background: #ffffff;
            border: 3px solid ${markerColor};
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.22);
            position: relative;
            cursor: pointer;
            transition: transform 0.2s;
            ${isCurrentSelected ? 'transform: scale(1.25); z-index: 1000; border-width: 4px;' : ''}
          ">
            <span style="line-height: 1;">${place.emoji}</span>
            <div style="
              position: absolute;
              top: -8px;
              right: -8px;
              background: ${markerColor};
              color: white;
              border-radius: 50%;
              width: 22px;
              height: 22px;
              font-size: 11px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              border: 2px solid #ffffff;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">${place.order}</div>
          </div>
        `,
        className: 'custom-shanghai-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -22],
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon });

      // Clean Popup
      const popupContent = `
        <div style="padding: 4px; min-width: 190px; font-family: inherit;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="
              background: ${markerColor}15;
              color: ${markerColor};
              font-size: 10px;
              font-weight: 700;
              padding: 2px 8px;
              border-radius: 999px;
            ">DAY ${place.day} • 코스 #${place.order}</span>
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">
            ${place.emoji} ${place.title}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            ${place.chinese}
          </div>
          <p style="font-size: 11px; color: #334155; line-height: 1.4; margin-bottom: 10px; background: #f8fafc; padding: 6px 8px; border-radius: 8px;">
            ${place.highlight}
          </p>
          <button 
            id="popup-btn-${place.id}"
            style="
              width: 100%;
              background: #059669;
              color: white;
              border: none;
              border-radius: 8px;
              padding: 7px 10px;
              font-size: 11px;
              font-weight: 700;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
            "
          >
            해당 워크북으로 이동 ➔
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'custom-leaflet-popup',
      });

      marker.on('click', () => {
        setSelectedPlaceId(place.id);
        setTimeout(() => {
          const btn = document.getElementById(`popup-btn-${place.id}`);
          if (btn && onNavigateToPlace) {
            btn.onclick = () => onNavigateToPlace(place.id);
          }
        }, 50);
      });

      marker.addTo(layerGroup);
    });

    // Add subtle reference points
    if (selectedDay === 0) {
      REFERENCE_POINTS.forEach(ref => {
        bounds.extend([ref.lat, ref.lng]);
        const refIcon = L.divIcon({
          html: `
            <div style="
              background: #f1f5f9;
              border: 2px dashed #64748b;
              border-radius: 50%;
              width: 28px;
              height: 28px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              opacity: 0.85;
            ">
              ${ref.emoji}
            </div>
          `,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const refMarker = L.marker([ref.lat, ref.lng], { icon: refIcon });
        refMarker.bindTooltip(ref.title, { direction: 'top', offset: [0, -10] });
        refMarker.addTo(layerGroup);
      });
    }

    // Smoothly fit bounds
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: 13,
        animate: true,
        duration: 0.6,
      });
    }
  }, [displayedPlaces, selectedDay, selectedPlaceId, viewMode, onNavigateToPlace]);

  // Center on place when selected from card list
  const handleSelectPlace = (place: PlacePoint) => {
    setSelectedPlaceId(place.id);
    if (mapInstanceRef.current && viewMode === 'map') {
      mapInstanceRef.current.setView([place.lat, place.lng], 14, {
        animate: true,
        duration: 0.5,
      });
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Map Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-2 sm:p-2.5 rounded-2xl border border-slate-200">
        {/* Day Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedDay(0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              selectedDay === 0
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>전체 경로 (8곳)</span>
          </button>
          <button
            onClick={() => setSelectedDay(1)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              selectedDay === 1
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>1일차 (2곳)</span>
          </button>
          <button
            onClick={() => setSelectedDay(2)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              selectedDay === 2
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>2일차 (4곳)</span>
          </button>
          <button
            onClick={() => setSelectedDay(3)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              selectedDay === 3
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>3일차 (2곳)</span>
          </button>
        </div>

        {/* View Mode & Map Layer Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {viewMode === 'map' && (
            <button
              onClick={() => setMapTileSource(mapTileSource === 'carto' ? 'osm' : 'carto')}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1 transition"
              title="지도 스타일 전환"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>{mapTileSource === 'carto' ? '심플 지도' : '일반 지도'}</span>
            </button>
          )}

          {/* Toggle Map / Diagram */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'map'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>실시간 지도</span>
            </button>
            <button
              onClick={() => setViewMode('diagram')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'diagram'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              <span>노선 다이어그램</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Container */}
      {viewMode === 'map' ? (
        /* Interactive Leaflet Map Container */
        <div className="relative w-full h-[420px] sm:h-[520px] rounded-3xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
          <div 
            ref={mapContainerRef} 
            className="w-full h-full"
            style={{ minHeight: '400px' }}
          />

          {/* Legend Overlay at Top Left */}
          <div className="absolute top-3 left-3 z-[450] bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200 shadow-md text-xs pointer-events-auto">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>상하이 탐방 코스</span>
            </div>
            <div className="flex flex-col gap-1 text-[11px] text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                <span>1일차: 도심 & 야경 (2곳)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
                <span>2일차: 역사 & 문화 (4곳)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0"></span>
                <span>3일차: 과학 & 테마 (2곳)</span>
              </div>
            </div>
          </div>

          {/* Map reset / fit all button */}
          <button
            onClick={() => {
              setSelectedDay(0);
              setSelectedPlaceId(null);
              if (mapInstanceRef.current) {
                const b = L.latLngBounds(PLACES.map(p => [p.lat, p.lng]));
                mapInstanceRef.current.fitBounds(b, { padding: [50, 50], animate: true });
              }
            }}
            className="absolute top-3 right-3 z-[450] bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">전체 보기</span>
          </button>
        </div>
      ) : (
        /* Schematic Route Diagram View (100% Guaranteed to render in any environment) */
        <div className="w-full rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 p-5 sm:p-7 shadow-inner">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                SHANGHAI 8-SPOT TRANSIT FLOW
              </span>
              <h4 className="text-lg font-bold text-slate-900">상하이 8대 탐방지 순차 이동 노선도</h4>
              <p className="text-xs text-slate-500">인천공항부터 푸둥공항, 상하이 주요 8개 역사·문화·첨단 명소의 이동 동선입니다.</p>
            </div>

            {/* Stages Grid */}
            <div className="space-y-6">
              {[1, 2, 3].filter(d => selectedDay === 0 || selectedDay === d).map(dayNum => {
                const dayPlaces = PLACES.filter(p => p.day === dayNum);
                const dayTheme = dayNum === 1 
                  ? '제1일차 : 도심 입성 & 화려한 야경'
                  : dayNum === 2 
                  ? '제2일차 : 불멸의 독립운동 성지 & 강남 정원'
                  : '제3일차 : 첨단 미래 과학 & 글로벌 문화';
                const badgeColor = dayNum === 1 
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : dayNum === 2 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-purple-100 text-purple-800 border-purple-200';

                return (
                  <div key={dayNum} className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${badgeColor}`}>
                          DAY {dayNum}
                        </span>
                        <span className="text-sm font-bold text-slate-800">{dayTheme}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{dayPlaces.length}개 코스</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {dayPlaces.map((place, idx) => (
                        <div 
                          key={place.id}
                          className="relative p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/50 hover:border-emerald-300 transition group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                                {place.order}
                              </span>
                              <span className="text-xl">{place.emoji}</span>
                            </div>
                            <h5 className="font-bold text-slate-900 text-sm">{place.title}</h5>
                            <p className="text-[11px] text-slate-500 font-mono mb-2">{place.chinese}</p>
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                              {place.highlight}
                            </p>
                          </div>

                          <button
                            onClick={() => onNavigateToPlace?.(place.id)}
                            className="w-full mt-2 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition shadow-2xs"
                          >
                            <span>탐구 워크북</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Place Cards for Instant Exploration & Pin Highlighting */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">탐방지 바로가기 & 지도 위치 확인</span>
          </div>
          <span className="text-[11px] text-slate-400">카드를 누르면 지도가 해당 위치로 이동합니다</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {PLACES.map((p) => {
            const isSelected = selectedPlaceId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPlace(p)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected 
                    ? 'border-emerald-600 bg-emerald-50 shadow-xs ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">{p.emoji}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    #{p.order}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">{p.title.split(' ')[0]}</div>
                <div className="text-[10px] text-slate-500 truncate">{p.chinese}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

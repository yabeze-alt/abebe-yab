import React, { useState, useEffect, useRef } from 'react';
import { 
  Map as MapIcon, 
  Layers, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw,
  Navigation,
  Info
} from 'lucide-react';
import { StorageService } from '../../utils/storage';

type TargetCity = 'addis_ababa' | 'adama' | 'bahir_dar' | 'dubai';

interface CityConfig {
  name: string;
  amharicName: string;
  country: string;
  lat: number;
  lng: number;
  zoom: number;
  isBenchmark?: boolean;
  corridors: Array<{ name: string; speed: string; status: 'normal' | 'moderate' | 'heavy' }>;
}

const CITY_DATA: Record<TargetCity, CityConfig> = {
  addis_ababa: {
    name: 'Addis Ababa',
    amharicName: 'አዲስ አበባ',
    country: 'Ethiopia (Pilot Deployment)',
    lat: 9.0107,
    lng: 38.7615,
    zoom: 13,
    corridors: [
      { name: 'Meskel Square Interchange', speed: '18 km/h', status: 'heavy' },
      { name: 'Mexico Square - Sengatera', speed: '12 km/h', status: 'heavy' },
      { name: 'Bole Road (Africa Ave)', speed: '34 km/h', status: 'moderate' },
      { name: 'Megenagna Roundabout', speed: '16 km/h', status: 'heavy' },
      { name: 'Churchill Ave / Piazza', speed: '28 km/h', status: 'normal' },
    ]
  },
  adama: {
    name: 'Adama (Nazret)',
    amharicName: 'አዳማ',
    country: 'Ethiopia',
    lat: 8.5400,
    lng: 39.2700,
    zoom: 13,
    corridors: [
      { name: 'Addis-Adama Tollway Exit', speed: '42 km/h', status: 'normal' },
      { name: 'Adama Post Office Main St', speed: '24 km/h', status: 'moderate' },
      { name: 'Wonji Road Junction', speed: '30 km/h', status: 'normal' }
    ]
  },
  bahir_dar: {
    name: 'Bahir Dar',
    amharicName: 'ባሕር ዳር',
    country: 'Ethiopia',
    lat: 11.5900,
    lng: 37.3900,
    zoom: 13,
    corridors: [
      { name: 'Lake Tana Shoreline Blvd', speed: '35 km/h', status: 'normal' },
      { name: 'Papyrus Roundabout', speed: '22 km/h', status: 'moderate' },
      { name: 'Abay Bridge Approach', speed: '19 km/h', status: 'heavy' }
    ]
  },
  dubai: {
    name: 'Dubai (UAE Benchmark)',
    amharicName: 'دبي - الإمارات',
    country: 'United Arab Emirates (RTA Architecture Benchmark)',
    lat: 25.2048,
    lng: 55.2708,
    zoom: 12,
    isBenchmark: true,
    corridors: [
      { name: 'Sheikh Zayed Road (E11 - Al Safa Salik)', speed: '72 km/h', status: 'moderate' },
      { name: 'Al Khail Road (E44 - Business Bay)', speed: '65 km/h', status: 'moderate' },
      { name: 'Sheikh Mohammed Bin Zayed Rd (E311)', speed: '55 km/h', status: 'heavy' },
      { name: 'Al Garhoud Bridge / Airport Tunnel', speed: '48 km/h', status: 'heavy' },
      { name: 'Emirates Road (E611 Bypass)', speed: '98 km/h', status: 'normal' },
    ]
  }
};

export const TrafficMapView: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<TargetCity>('addis_ababa');
  const [apiKey, setApiKey] = useState<string>(() => StorageService.getMapsApiKey());
  const [inputKey, setInputKey] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const googleMapInstanceRef = useRef<any>(null);

  const city = CITY_DATA[selectedCity];

  // Try to load Google Maps JS API with TrafficLayer if apiKey exists
  useEffect(() => {
    if (!apiKey) {
      setMapLoaded(false);
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initializeMap = () => {
      if (!(window as any).google || !(window as any).google.maps) {
        setLoadError('Google Maps API failed to initialize.');
        return;
      }

      try {
        if (!mapContainerRef.current) return;

        const map = new (window as any).google.maps.Map(mapContainerRef.current, {
          center: { lat: city.lat, lng: city.lng },
          zoom: city.zoom,
          mapTypeId: 'roadmap',
          disableDefaultUI: false,
          zoomControl: true,
        });

        // Add TrafficLayer
        const trafficLayer = new (window as any).google.maps.TrafficLayer();
        trafficLayer.setMap(map);

        googleMapInstanceRef.current = map;
        setMapLoaded(true);
        setLoadError(null);
      } catch (err: any) {
        setLoadError(err.message || 'Error creating Google Maps instance');
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
      script.async = true;
      script.onload = initializeMap;
      script.onerror = () => {
        setLoadError('Failed to load Google Maps script. Check API key and internet connectivity.');
      };
      document.head.appendChild(script);
    } else if ((window as any).google && (window as any).google.maps) {
      initializeMap();
    }
  }, [apiKey, selectedCity]);

  // Update map center when city changes
  useEffect(() => {
    if (googleMapInstanceRef.current && (window as any).google) {
      googleMapInstanceRef.current.setCenter({ lat: city.lat, lng: city.lng });
      googleMapInstanceRef.current.setZoom(city.zoom);
    }
  }, [selectedCity, city]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = inputKey.trim();
    if (cleanKey) {
      StorageService.saveMapsApiKey(cleanKey);
      setApiKey(cleanKey);
      setInputKey('');
    }
  };

  const handleDisconnectKey = () => {
    StorageService.saveMapsApiKey('');
    setApiKey('');
    setMapLoaded(false);
  };

  return (
    <div className="space-y-6">
      {/* City Selector & Connection Bar */}
      <div className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* City Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs font-medium flex-wrap">
          {(['addis_ababa', 'adama', 'bahir_dar', 'dubai'] as TargetCity[]).map((cKey) => (
            <button
              key={cKey}
              onClick={() => setSelectedCity(cKey)}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                selectedCity === cKey ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span>{CITY_DATA[cKey].name}</span>
              {CITY_DATA[cKey].isBenchmark && (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-mono px-1 rounded">RTA Benchmark</span>
              )}
            </button>
          ))}
        </div>

        {/* API Key Status */}
        <div className="flex items-center gap-2 text-xs">
          {apiKey && mapLoaded ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-medium border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Google Maps TrafficLayer Connected</span>
              </span>
              <button
                onClick={handleDisconnectKey}
                className="text-neutral-500 hover:text-neutral-800 underline text-[11px]"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <span className="flex items-center gap-1.5 text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md font-medium border border-neutral-200">
              <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
              <span>Live Traffic: Not Connected (Schematic Fallback Active)</span>
            </span>
          )}
        </div>
      </div>

      {/* Limitations Disclaimer Banner (Section 8) */}
      <div className="p-3.5 bg-neutral-100 border border-neutral-200 rounded-xl text-xs space-y-1 text-neutral-700">
        <div className="flex items-center gap-2 font-semibold text-neutral-900">
          <Info className="w-4 h-4 text-neutral-600 shrink-0" />
          <span>Section 8 Operational Scope & Limitations:</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Google Maps TrafficLayer provides a visual congestion estimation layer only. It does <strong>not</strong> supply individual vehicle speeds, counts, or incident timestamps, and missing traffic color does not guarantee free-flow. TrafficLayer data cannot be used to establish traffic penalties.
        </p>
      </div>

      {/* Main Map Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Google Map or Schematic Fallback */}
        <div className="lg:col-span-8 bg-white border border-neutral-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 text-xs">
            <span className="font-semibold text-neutral-900">
              {city.name} Arterial Congestion View
            </span>
            <span className="font-mono text-neutral-500">
              GPS: {city.lat.toFixed(4)}° N, {city.lng.toFixed(4)}° E
            </span>
          </div>

          <div className="mt-3 relative h-[450px] w-full rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            {apiKey ? (
              <div ref={mapContainerRef} className="w-full h-full" />
            ) : (
              /* Rich Schematic Fallback Visualizer */
              <div className="p-6 text-center text-white max-w-md space-y-4">
                <MapIcon className="w-12 h-12 text-emerald-500 mx-auto opacity-70" />
                <div>
                  <h3 className="text-sm font-bold text-neutral-100">
                    Live Google Maps Key Not Connected
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Enter a domain-restricted Google Maps API key in the configuration panel on the right to load the live Google Maps TrafficLayer.
                  </p>
                </div>
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-left text-xs font-mono space-y-1">
                  <div className="text-emerald-400 font-bold">Simulated Corridor Flow Index:</div>
                  {city.corridors.map((c, i) => (
                    <div key={i} className="flex justify-between text-neutral-300">
                      <span>{c.name}</span>
                      <span className={c.status === 'heavy' ? 'text-rose-400' : c.status === 'moderate' ? 'text-amber-400' : 'text-emerald-400'}>
                        {c.speed}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Key Configuration & Corridor Speeds */}
        <div className="lg:col-span-4 space-y-5">
          {/* API Key Session Setup */}
          <div className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 text-xs font-bold text-neutral-900 uppercase tracking-wider">
              <Key className="w-4 h-4 text-emerald-700" />
              <span>Connect Google Maps API Key</span>
            </div>

            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Accepts a browser key with Maps JavaScript API enabled. The key is stored for this page session in your browser.
            </p>

            <form onSubmit={handleSaveKey} className="mt-3 space-y-2 text-xs">
              <input
                type="text"
                placeholder="AIzaSy..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-emerald-600"
              />
              <button
                type="submit"
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium transition-colors"
              >
                Apply Key for Session
              </button>
            </form>
          </div>

          {/* Active City Corridor Metrics */}
          <div className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-2xs">
            <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider block pb-2 border-b border-neutral-100">
              {city.name} Corridors
            </span>

            <div className="mt-3 space-y-2.5 text-xs">
              {city.corridors.map((c, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-neutral-900 block">{c.name}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">Sensors: Active</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-neutral-900 block">{c.speed}</span>
                    <span className={`text-[10px] font-semibold uppercase ${
                      c.status === 'heavy' ? 'text-rose-600' :
                      c.status === 'moderate' ? 'text-amber-600' :
                      'text-emerald-600'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

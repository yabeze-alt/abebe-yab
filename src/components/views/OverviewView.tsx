import React, { useState } from 'react';
import { 
  Camera as CameraIcon, 
  AlertTriangle, 
  Car, 
  TrendingUp, 
  Sparkles, 
  Plus, 
  ChevronRight, 
  Radio, 
  Eye, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { Camera, CorridorInfo, Incident } from '../../types/traffic';
import { NavSection } from '../Navigation';

interface OverviewViewProps {
  corridors: CorridorInfo[];
  cameras: Camera[];
  incidents: Incident[];
  onNavigate: (section: NavSection) => void;
  onSelectIncident: (incidentId: string) => void;
  onSimulateIncident: () => void;
  onAddPlannedCamera: (cam: Partial<Camera>) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  corridors,
  cameras,
  incidents,
  onNavigate,
  onSelectIncident,
  onSimulateIncident,
  onAddPlannedCamera
}) => {
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('meskel_sq');
  const [showAddCameraModal, setShowAddCameraModal] = useState<boolean>(false);
  const [newCamName, setNewCamName] = useState<string>('');
  const [newCamCorridor, setNewCamCorridor] = useState<string>(corridors[0]?.name || 'Meskel Square Interchange');
  const [newCamType, setNewCamType] = useState<Camera['type']>('ANPR + Overview');

  const pendingIncidents = incidents.filter(i => i.status === 'pending');
  const activeCamerasCount = cameras.filter(c => c.status === 'active').length;
  const maintenanceCount = cameras.filter(c => c.status === 'maintenance').length;
  const plannedCount = cameras.filter(c => c.status === 'planned').length;

  const selectedCorridor = corridors.find(c => c.id === selectedCorridorId) || corridors[0];

  const handleCreateCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCamName.trim()) return;

    onAddPlannedCamera({
      name: newCamName.trim(),
      corridor: newCamCorridor,
      type: newCamType,
      status: 'planned',
      rfidReaderInstalled: true,
      rfidReaderStatus: 'online',
      resolution: '4K Ultra HD',
      installationDate: '2026-Q4 (Planned)',
      lastHeartbeat: 'Awaiting deployment',
      coordinates: { lat: 9.0100, lng: 38.7500 }
    });

    setNewCamName('');
    setShowAddCameraModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Pilot Demonstration Notice Banner */}
      <div className="p-3.5 bg-emerald-950/5 border border-emerald-900/10 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-emerald-900">
          <Info className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Simulated Pilot Platform:</strong> Statistics, camera scenes, and corridors represent an offline Addis Ababa demonstration. No real fines or surveillance feeds are connected.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSimulateIncident}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg shadow-2xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Simulate Incident</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Active Cameras */}
        <div className="p-4 bg-white border border-neutral-200/80 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Camera Availability</span>
            <CameraIcon className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900">{activeCamerasCount}</span>
            <span className="text-xs text-neutral-500">/ {cameras.length} units online</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500 flex items-center gap-2">
            <span>{maintenanceCount} maintenance</span>
            <span aria-hidden="true">·</span>
            <span>{plannedCount} planned</span>
          </div>
        </div>

        {/* Card 2: Incidents Pending Review */}
        <div 
          onClick={() => onNavigate('incident_review')}
          className="p-4 bg-white border border-neutral-200/80 rounded-xl shadow-2xs cursor-pointer hover:border-emerald-500/50 transition-colors"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Incidents Awaiting Review</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-600">{pendingIncidents.length}</span>
            <span className="text-xs text-neutral-500">unreviewed cases</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <span>Officer clearance required</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 3: Sample Vehicle Observations */}
        <div className="p-4 bg-white border border-neutral-200/80 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Sample Observations (1h)</span>
            <Car className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900">4,812</span>
            <span className="text-xs text-neutral-500">vehicles</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            <span>82% RFID tag matched</span>
          </div>
        </div>

        {/* Card 4: Most Congested Corridor */}
        <div className="p-4 bg-white border border-neutral-200/80 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Corridor Watch</span>
            <TrendingUp className="w-4 h-4 text-rose-600" />
          </div>
          <div className="truncate">
            <span className="text-base font-bold text-neutral-900 truncate block">Mexico Square</span>
            <span className="text-xs text-rose-600 font-medium">Gridlock · 12 km/h</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            <span>Signal adjustment recommended</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Schematic Arterial Map & Selected Corridor Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schematic Addis Ababa Arterial Map */}
        <div className="lg:col-span-2 bg-white border border-neutral-200/80 rounded-xl p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">
                Schematic Addis Ababa Arterial Network
              </h2>
              <p className="text-xs text-neutral-500">
                Click a node to inspect corridor status and cameras (Schematic representation · Not a geographic map)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Normal
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Moderate
              </span>
              <span className="flex items-center gap-1 text-rose-700">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Heavy/Gridlock
              </span>
            </div>
          </div>

          {/* SVG Schematic Canvas */}
          <div className="relative w-full h-80 bg-neutral-900 rounded-lg p-4 flex items-center justify-center overflow-hidden border border-neutral-800">
            <svg 
              viewBox="0 0 800 450" 
              className="w-full h-full select-none"
              style={{ maxHeight: '320px' }}
            >
              {/* Arterial Connecting Lines */}
              {/* Piazza to Arat Kilo */}
              <line x1="280" y1="120" x2="420" y2="100" stroke="#334155" strokeWidth="4" />
              {/* Piazza to Mexico */}
              <line x1="280" y1="120" x2="240" y2="240" stroke="#334155" strokeWidth="4" />
              {/* Arat Kilo to Meskel Square */}
              <line x1="420" y1="100" x2="430" y2="230" stroke="#334155" strokeWidth="4" />
              {/* Mexico to Meskel Square */}
              <line x1="240" y1="240" x2="430" y2="230" stroke="#ef4444" strokeWidth="5" strokeDasharray="6,4" />
              {/* Meskel Square to Bole Road */}
              <line x1="430" y1="230" x2="570" y2="290" stroke="#f59e0b" strokeWidth="4" />
              {/* Meskel Square to Megenagna */}
              <line x1="430" y1="230" x2="620" y2="160" stroke="#ef4444" strokeWidth="5" />
              {/* Megenagna to CMC / Ayat */}
              <line x1="620" y1="160" x2="740" y2="140" stroke="#10b981" strokeWidth="4" />
              {/* Meskel Square / Gotera to Kaliti */}
              <line x1="430" y1="230" x2="480" y2="390" stroke="#ef4444" strokeWidth="4" />

              {/* Labels on Roads */}
              <text x="310" y="220" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono">Mexico - Meskel Link</text>
              <text x="490" y="245" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono">Bole Rd (Africa Ave)</text>
              <text x="510" y="180" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono">Haile G/Silassie Ave</text>

              {/* Junction Nodes */}
              {/* 1. Piazza */}
              <g 
                className="cursor-pointer group" 
                onClick={() => setSelectedCorridorId('piazza')}
              >
                <circle cx="280" cy="120" r={selectedCorridorId === 'piazza' ? 18 : 14} fill={selectedCorridorId === 'piazza' ? '#10b981' : '#1e293b'} stroke="#10b981" strokeWidth="3" />
                <text x="280" y="100" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="600">Piazza</text>
                <text x="280" y="124" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono">28 km/h</text>
              </g>

              {/* 2. Arat Kilo */}
              <g 
                className="cursor-pointer group" 
                onClick={() => setSelectedCorridorId('arat_kilo')}
              >
                <circle cx="420" cy="100" r={selectedCorridorId === 'arat_kilo' ? 18 : 14} fill={selectedCorridorId === 'arat_kilo' ? '#10b981' : '#1e293b'} stroke="#10b981" strokeWidth="3" />
                <text x="420" y="80" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="600">Arat Kilo</text>
                <text x="420" y="104" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono">31 km/h</text>
              </g>

              {/* 3. Mexico Square (Gridlock) */}
              <g 
                className="cursor-pointer group" 
                onClick={() => setSelectedCorridorId('mexico_sq')}
              >
                <circle cx="240" cy="240" r={selectedCorridorId === 'mexico_sq' ? 22 : 17} fill={selectedCorridorId === 'mexico_sq' ? '#ef4444' : '#1e293b'} stroke="#ef4444" strokeWidth="4" />
                <text x="240" y="275" textAnchor="middle" fill="#fca5a5" fontSize="12" fontWeight="700">Mexico Sq</text>
                <text x="240" y="244" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="JetBrains Mono">12 km/h</text>
              </g>

              {/* 4. Meskel Square (Heavy Hub) */}
              <g 
                className="cursor-pointer group" 
                onClick={() => setSelectedCorridorId('meskel_sq')}
              >
                <circle cx="430" cy="230" r={selectedCorridorId === 'meskel_sq' ? 24 : 19} fill={selectedCorridorId === 'meskel_sq' ? '#f59e0b' : '#1e293b'} stroke="#f59e0b" strokeWidth="4" />
                <text x="430" y="210" textAnchor="middle" fill="#fde68a" fontSize="12" fontWeight="700">Meskel Square</text>
                <text x="430" y="234" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="JetBrains Mono">18 km/h</text>
              </g>

              {/* 5. Megenagna */}
              <g 
                className="cursor-pointer group" 
                onClick={() => setSelectedCorridorId('megenagna')}
              >
                <circle cx="620" cy="160" r={selectedCorridorId === 'megenagna' ? 20 : 16} fill={selectedCorridorId === 'megenagna' ? '#ef4444' : '#1e293b'} stroke="#ef4444" strokeWidth="3" />
                <text x="620" y="140" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="600">Megenagna</text>
                <text x="620" y="164" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="JetBrains Mono">16 km/h</text>
              </g>

              {/* 6. Bole Road */}
              <g 
                className="cursor-pointer group" 
                onClick={() => setSelectedCorridorId('bole_road')}
              >
                <circle cx="570" cy="290" r={selectedCorridorId === 'bole_road' ? 20 : 16} fill={selectedCorridorId === 'bole_road' ? '#10b981' : '#1e293b'} stroke="#10b981" strokeWidth="3" />
                <text x="570" y="325" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="600">Bole Airport Cor.</text>
                <text x="570" y="294" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono">34 km/h</text>
              </g>

              {/* 7. CMC / Ayat */}
              <g 
                className="cursor-pointer group" 
                onClick={() => setSelectedCorridorId('cmc_ayat')}
              >
                <circle cx="740" cy="140" r={selectedCorridorId === 'cmc_ayat' ? 18 : 14} fill={selectedCorridorId === 'cmc_ayat' ? '#10b981' : '#1e293b'} stroke="#10b981" strokeWidth="3" />
                <text x="740" y="120" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="600">CMC - Ayat</text>
                <text x="740" y="144" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono">38 km/h</text>
              </g>

              {/* 8. Kaliti */}
              <g 
                className="cursor-pointer group" 
                onClick={() => setSelectedCorridorId('kaliti')}
              >
                <circle cx="480" cy="390" r={selectedCorridorId === 'kaliti' ? 20 : 15} fill={selectedCorridorId === 'kaliti' ? '#ef4444' : '#1e293b'} stroke="#ef4444" strokeWidth="3" />
                <text x="480" y="420" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="600">Kaliti Expressway</text>
                <text x="480" y="394" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="JetBrains Mono">22 km/h</text>
              </g>
            </svg>
          </div>

          {/* Quick Nav Footer below map */}
          <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
            <span>Selected Corridor: <strong className="text-neutral-900">{selectedCorridor.name}</strong> ({selectedCorridor.amharicName})</span>
            <button
              onClick={() => onNavigate('traffic_map')}
              className="text-emerald-700 font-medium hover:underline flex items-center gap-1"
            >
              <span>View live traffic layer</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Selected Corridor Profile & Camera Scenes */}
        <div className="bg-white border border-neutral-200/80 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">{selectedCorridor.name}</h3>
                <p className="text-xs text-neutral-400 font-mono">{selectedCorridor.amharicName}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                selectedCorridor.currentCongestionLevel === 'gridlock' ? 'bg-rose-100 text-rose-800' :
                selectedCorridor.currentCongestionLevel === 'heavy' ? 'bg-amber-100 text-amber-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                {selectedCorridor.currentCongestionLevel}
              </span>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-neutral-50">
                <span className="text-neutral-500">Key Intersection</span>
                <span className="font-medium text-neutral-800 text-right">{selectedCorridor.keyJunction}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-50">
                <span className="text-neutral-500">Average Measured Speed</span>
                <span className="font-mono font-semibold text-neutral-900 tabular-nums">{selectedCorridor.averageSpeedKmh} km/h</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-50">
                <span className="text-neutral-500">Active Cameras</span>
                <span className="font-mono font-semibold text-neutral-900 tabular-nums">
                  {selectedCorridor.activeCameras} / {selectedCorridor.totalCameras} online
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-50">
                <span className="text-neutral-500">RFID Gantry Coverage</span>
                <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                  {selectedCorridor.rfidCoveragePct}%
                </span>
              </div>
            </div>

            {/* Illustrated Camera Scene Preview */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs font-medium text-neutral-700 mb-2">
                <span>Illustrated Camera Scene</span>
                <span className="text-[10px] text-neutral-400 font-mono">SIMULATED FEED</span>
              </div>
              <div className="w-full h-36 bg-gradient-to-b from-neutral-800 to-neutral-950 rounded-lg p-3 relative overflow-hidden border border-neutral-800 flex flex-col justify-between text-white">
                <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span>CAM-DEMO · 4K 30FPS</span>
                  </div>
                  <span className="text-neutral-400">UTC+3 ADD</span>
                </div>

                {/* SVG Illustration of Road Junction */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                  <svg viewBox="0 0 200 120" className="w-full h-full">
                    <line x1="0" y1="60" x2="200" y2="60" stroke="#fff" strokeWidth="2" strokeDasharray="4,4" />
                    <rect x="70" y="45" width="25" height="15" rx="3" fill="#10b981" />
                    <rect x="120" y="65" width="30" height="16" rx="3" fill="#3b82f6" />
                    <rect x="40" y="62" width="20" height="12" rx="2" fill="#f59e0b" />
                  </svg>
                </div>

                <div className="text-[11px] text-neutral-300 z-10 bg-black/60 backdrop-blur-xs p-1.5 rounded flex justify-between items-center">
                  <span>Simulated ANPR: <code className="text-emerald-300 font-mono">ET-AA A24819</code></span>
                  <span className="text-emerald-400 text-[10px]">RFID MATCH</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-2">
            <button
              onClick={() => setShowAddCameraModal(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-lg text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Planned Camera</span>
            </button>
            <button
              onClick={() => onNavigate('camera_network')}
              className="py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium transition-colors"
            >
              All Cameras
            </button>
          </div>
        </div>
      </div>

      {/* Incidents Awaiting Officer Review Section */}
      <div className="bg-white border border-neutral-200/80 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">
              Unreviewed Incidents Queue ({pendingIncidents.length})
            </h2>
            <p className="text-xs text-neutral-500">
              Automated detections awaiting mandatory human officer validation before drafting notices
            </p>
          </div>
          <button
            onClick={() => onNavigate('incident_review')}
            className="text-xs font-medium text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>Open Incident Review Console</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingIncidents.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-neutral-200 rounded-lg text-neutral-500 text-xs">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="font-medium text-neutral-800">All pending incidents have been reviewed.</p>
            <p className="mt-1">Use the "Simulate Incident" button to generate a new demo detection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 font-medium">
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Time (EAT)</th>
                  <th className="py-2.5 px-3">Corridor & Location</th>
                  <th className="py-2.5 px-3">Plate & RFID</th>
                  <th className="py-2.5 px-3">Alleged Violation</th>
                  <th className="py-2.5 px-3 text-right">Proposed ETB</th>
                  <th className="py-2.5 px-3">System Recommendation</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {pendingIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-neutral-900">
                      {inc.id}
                    </td>
                    <td className="py-3 px-3 text-neutral-600 font-mono">
                      {new Date(inc.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 font-medium text-neutral-800">
                      {inc.location}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono font-semibold text-neutral-900">{inc.plateRegion} {inc.plateNumber}</div>
                      <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                        <span>RFID:</span>
                        <span className={`font-semibold ${
                          inc.rfidMatchStatus === 'verified_match' ? 'text-emerald-700' :
                          inc.rfidMatchStatus === 'mismatch' ? 'text-rose-700 font-bold' :
                          'text-neutral-500'
                        }`}>
                          {inc.rfidMatchStatus === 'verified_match' ? 'Match' :
                           inc.rfidMatchStatus === 'mismatch' ? 'Mismatch!' :
                           inc.rfidMatchStatus === 'unreadable_tag' ? 'Unreadable' : 'No Reader'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-neutral-800 capitalize">
                      {inc.violationCategory.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-neutral-900">
                      {inc.proposedAmountEtb} ETB
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        inc.calculatedRecommendation.recommendedStatus === 'approved_draft' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        inc.calculatedRecommendation.recommendedStatus === 'warning_recorded' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        inc.calculatedRecommendation.recommendedStatus === 'dismissed' ? 'bg-neutral-100 text-neutral-700' :
                        'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {inc.calculatedRecommendation.recommendedStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          onSelectIncident(inc.id);
                          onNavigate('incident_review');
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Planned Camera Modal */}
      {showAddCameraModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900 mb-1">Add Planned Camera (Local Demo)</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Register a proposed camera location into your browser's pilot storage.
            </p>

            <form onSubmit={handleCreateCamera} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Camera Name / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Piazza De Gaulle Gantry East"
                  value={newCamName}
                  onChange={(e) => setNewCamName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Corridor</label>
                <select
                  value={newCamCorridor}
                  onChange={(e) => setNewCamCorridor(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 bg-white"
                >
                  {corridors.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Sensor Configuration</label>
                <select
                  value={newCamType}
                  onChange={(e) => setNewCamType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 bg-white"
                >
                  <option value="ANPR + Overview">ANPR + Overview</option>
                  <option value="Speed Radar + ANPR">Speed Radar + ANPR</option>
                  <option value="Overview Only">Overview Only</option>
                </select>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg text-[11px] text-neutral-600">
                <p>New cameras are automatically marked with <strong>Planned</strong> status and scheduled for RFID antenna integration.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCameraModal(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium transition-colors"
                >
                  Save Camera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

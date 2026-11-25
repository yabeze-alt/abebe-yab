import React, { useState } from 'react';
import { 
  Camera as CameraIcon, 
  Radio, 
  Plus, 
  Filter, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Eye
} from 'lucide-react';
import { Camera } from '../../types/traffic';

interface CameraNetworkViewProps {
  cameras: Camera[];
  onAddPlannedCamera: (cam: Partial<Camera>) => void;
}

export const CameraNetworkView: React.FC<CameraNetworkViewProps> = ({
  cameras,
  onAddPlannedCamera
}) => {
  const [filterCorridor, setFilterCorridor] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCameraId, setSelectedCameraId] = useState<string>(cameras[0]?.id || '');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [corridor, setCorridor] = useState<string>('Meskel Square Interchange');
  const [type, setType] = useState<Camera['type']>('ANPR + Overview');

  const filteredCameras = cameras.filter(cam => {
    if (filterCorridor !== 'all' && !cam.corridor.toLowerCase().includes(filterCorridor.toLowerCase())) return false;
    if (filterStatus !== 'all' && cam.status !== filterStatus) return false;
    return true;
  });

  const selectedCam = cameras.find(c => c.id === selectedCameraId) || cameras[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddPlannedCamera({
      name: name.trim(),
      corridor,
      type,
      status: 'planned',
      rfidReaderInstalled: true,
      rfidReaderStatus: 'online',
      resolution: '4K Ultra HD',
      installationDate: '2026-Q4 (Planned)',
      lastHeartbeat: 'Awaiting deployment',
      coordinates: { lat: 9.0100, lng: 38.7500 }
    });

    setName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-neutral-200/80 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <CameraIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              Corridor Camera & RFID Reader Registry ({cameras.length})
            </h2>
            <p className="text-xs text-neutral-500">
              ANPR gantry points, speed radar sensors, and roadside transponder readers
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Planned Camera</span>
        </button>
      </div>

      {/* Main Grid: Camera Table & Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (8 cols): Camera Registry Table */}
        <div className="lg:col-span-8 bg-white border border-neutral-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-neutral-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1 border border-neutral-200 rounded-md bg-white text-neutral-700"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="maintenance">Maintenance</option>
                <option value="planned">Planned Deployment</option>
              </select>
            </div>
            <span className="text-neutral-500 font-mono">
              Showing {filteredCameras.length} units
            </span>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 font-medium">
                  <th className="py-2.5 px-3">Gantry ID</th>
                  <th className="py-2.5 px-3">Location / Name</th>
                  <th className="py-2.5 px-3">Corridor</th>
                  <th className="py-2.5 px-3">Sensor Type</th>
                  <th className="py-2.5 px-3">RFID Reader</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredCameras.map((cam) => {
                  const isSelected = cam.id === selectedCam?.id;
                  return (
                    <tr
                      key={cam.id}
                      onClick={() => setSelectedCameraId(cam.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50/80 font-medium' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-neutral-900">{cam.id}</td>
                      <td className="py-3 px-3 text-neutral-800">{cam.name}</td>
                      <td className="py-3 px-3 text-neutral-600">{cam.corridor}</td>
                      <td className="py-3 px-3 text-neutral-700">{cam.type}</td>
                      <td className="py-3 px-3">
                        {cam.rfidReaderInstalled ? (
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                            <Radio className="w-3 h-3" /> Online
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">None</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          cam.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                          cam.status === 'maintenance' ? 'bg-amber-100 text-amber-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {cam.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (4 cols): Selected Camera Scene & Diagnostics */}
        <div className="lg:col-span-4 bg-white border border-neutral-200/80 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-neutral-100">
            <span className="text-xs font-mono font-bold text-emerald-800 block">{selectedCam.id}</span>
            <h3 className="text-sm font-bold text-neutral-900 mt-0.5">{selectedCam.name}</h3>
            <p className="text-xs text-neutral-500">{selectedCam.corridor}</p>
          </div>

          {/* Illustrated Camera Scene Preview */}
          <div className="w-full h-40 bg-neutral-950 rounded-lg border border-neutral-800 p-3 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ILLUSTRATED VIEW
              </span>
              <span>{selectedCam.resolution}</span>
            </div>

            <div className="flex items-center justify-center text-xs text-neutral-500 italic">
              [ Illustrated camera scene · Not live public feed ]
            </div>

            <div className="text-[10px] text-neutral-400 flex justify-between font-mono bg-black/60 p-1.5 rounded">
              <span>LAT: {selectedCam.coordinates.lat}° N</span>
              <span>LNG: {selectedCam.coordinates.lng}° E</span>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-2">
            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="text-neutral-500">Sensor Architecture:</span>
              <span className="font-medium text-neutral-800">{selectedCam.type}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="text-neutral-500">RFID Antenna Status:</span>
              <span className="font-semibold text-emerald-700">
                {selectedCam.rfidReaderInstalled ? 'Operational (915 MHz UHF)' : 'Not Integrated'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="text-neutral-500">Last Telemetry Heartbeat:</span>
              <span className="font-mono text-neutral-700">{selectedCam.lastHeartbeat}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="text-neutral-500">Deployment Date:</span>
              <span className="font-mono text-neutral-700">{selectedCam.installationDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Planned Camera Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900 mb-1">Add Planned Camera</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Add a future camera location to the Addis Ababa traffic management blueprint.
            </p>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Gantry Location Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tor Hailoch East Overpass"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Corridor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tor Hailoch / Old Airport"
                  value={corridor}
                  onChange={(e) => setCorridor(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Sensor Configuration</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 bg-white"
                >
                  <option value="ANPR + Overview">ANPR + Overview</option>
                  <option value="Speed Radar + ANPR">Speed Radar + ANPR</option>
                  <option value="Overview Only">Overview Only</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium transition-colors"
                >
                  Add Camera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

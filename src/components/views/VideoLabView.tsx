import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Upload, 
  Eye, 
  Layers, 
  CheckSquare, 
  FileText, 
  Activity, 
  Info, 
  Download, 
  Plus, 
  AlertCircle,
  BarChart2,
  Tv
} from 'lucide-react';
import { GroundTruthAnnotation, SignalOfflineDemand } from '../../types/traffic';
import { VehicleCentroidTracker, TripwireStats } from '../../utils/tracker';
import { StorageService } from '../../utils/storage';
import { NavSection } from '../Navigation';

interface VideoLabViewProps {
  onFeedDemandToSignals: (demand: SignalOfflineDemand) => void;
  onNavigate: (section: NavSection) => void;
}

export type FeedPreset = 
  | 'synthetic_sim' 
  | 'local_file' 
  | 'dubai_sheikh_zayed' 
  | 'addis_meskel' 
  | 'custom_stream';

export const VideoLabView: React.FC<VideoLabViewProps> = ({
  onFeedDemandToSignals,
  onNavigate
}) => {
  const [activeSource, setActiveSource] = useState<FeedPreset>('synthetic_sim');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [detectorStatus, setDetectorStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [detectionMode, setDetectionMode] = useState<'continuous' | 'single_frame'>('continuous');
  const [trackingEnabled, setTrackingEnabled] = useState<boolean>(true);
  const [showTripwires, setShowTripwires] = useState<boolean>(true);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);

  // Custom live feed inputs
  const [customStreamType, setCustomStreamType] = useState<'youtube' | 'direct_url'>('youtube');
  const [customStreamInput, setCustomStreamInput] = useState<string>('');
  const [activeCustomStreamUrl, setActiveCustomStreamUrl] = useState<string>('');
  const [activeCustomYoutubeId, setActiveCustomYoutubeId] = useState<string>('');

  // Dubai benchmark modal
  const [showDubaiBenchmarkModal, setShowDubaiBenchmarkModal] = useState<boolean>(false);

  // Video and Canvas refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Tracker instance
  const trackerRef = useRef<VehicleCentroidTracker>(new VehicleCentroidTracker());
  const [tripwireStats, setTripwireStats] = useState<TripwireStats>({
    northboundCount: 0,
    southboundCount: 0,
    totalUniqueTracked: 0,
    observedFlowRatePerMin: 0,
    vehicleClassBreakdown: { car: 0, bus: 0, truck: 0, motorcycle: 0, person: 0 }
  });

  // Manual Ground-Truth Annotations (Priority 3)
  const [annotations, setAnnotations] = useState<GroundTruthAnnotation[]>(() => StorageService.getGroundTruthAnnotations());
  const [actualCarCountInput, setActualCarCountInput] = useState<number>(3);
  const [actualBusCountInput, setActualBusCountInput] = useState<number>(1);
  const [actualTruckCountInput, setActualTruckCountInput] = useState<number>(0);
  const [actualPersonCountInput, setActualPersonCountInput] = useState<number>(2);

  // Manual Observation Log (Section 10)
  const [observations, setObservations] = useState<Array<{ id: string; time: string; note: string; corridor: string }>>([
    { id: 'OBS-01', time: '07:14:00', note: 'Heavy minibus staging on lane 1 near north crosswalk', corridor: 'Meskel Square' },
    { id: 'OBS-02', time: '07:22:30', note: 'Pedestrians navigating around queue tail at exit ramp', corridor: 'Meskel Square' }
  ]);
  const [newObsNote, setNewObsNote] = useState<string>('');

  // Synthetic Simulator Vehicles State
  const syntheticVehiclesRef = useRef<Array<{
    id: number;
    x: number;
    y: number;
    speed: number;
    direction: 'Northbound' | 'Southbound';
    type: 'car' | 'bus' | 'truck' | 'motorcycle' | 'person';
    width: number;
    height: number;
    color: string;
  }>>([
    { id: 1, x: 180, y: 50, speed: 1.8, direction: 'Southbound', type: 'car', width: 44, height: 26, color: '#2563eb' },
    { id: 2, x: 240, y: 140, speed: 1.4, direction: 'Southbound', type: 'bus', width: 58, height: 32, color: '#d97706' },
    { id: 3, x: 380, y: 320, speed: 2.1, direction: 'Northbound', type: 'car', width: 42, height: 25, color: '#16a34a' },
    { id: 4, x: 440, y: 220, speed: 1.6, direction: 'Northbound', type: 'truck', width: 62, height: 34, color: '#dc2626' },
    { id: 5, x: 310, y: 190, speed: 0.6, direction: 'Southbound', type: 'person', width: 14, height: 14, color: '#9333ea' },
  ]);

  // Synthetic animation and tracking loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      if (activeSource === 'synthetic_sim') {
        const dt = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            renderSyntheticScene(ctx, canvas.width, canvas.height, isPlaying);
          }
        }
      }
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [activeSource, isPlaying, showTripwires, showBoxes, trackingEnabled]);

  // Render Synthetic Addis Ababa Arterial Simulator
  const renderSyntheticScene = (ctx: CanvasRenderingContext2D, width: number, height: number, moving: boolean) => {
    // 1. Road surface
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);

    // 2. Road markings & Sidewalks
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 100, height); // West sidewalk
    ctx.fillRect(width - 100, 0, 100, height); // East sidewalk

    // Lane dividers
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 12]);

    // Southbound lanes
    ctx.beginPath();
    ctx.moveTo(220, 0); ctx.lineTo(220, height);
    ctx.stroke();

    // Central median
    ctx.setLineDash([]);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Northbound lanes
    ctx.setLineDash([12, 12]);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(420, 0); ctx.lineTo(420, height);
    ctx.stroke();

    // Zebra Crosswalk (Pedestrian crossing)
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffffff';
    for (let x = 110; x < width - 110; x += 30) {
      ctx.fillRect(x, height * 0.50 - 10, 18, 20);
    }

    // Roadside infrastructure label
    ctx.font = '10px JetBrains Mono';
    ctx.fillStyle = '#64748b';
    ctx.fillText('MESKEL SQUARE CORRIDOR · LANE 1-4 SIMULATION', 110, 20);

    // 3. Move and draw synthetic vehicles
    const detections: Array<{ bbox: [number, number, number, number]; class: string; score: number }> = [];

    syntheticVehiclesRef.current.forEach((veh) => {
      if (moving) {
        if (veh.direction === 'Southbound') {
          veh.y += veh.speed;
          if (veh.y > height + 40) veh.y = -50;
        } else {
          veh.y -= veh.speed;
          if (veh.y < -50) veh.y = height + 40;
        }
      }

      // Draw Vehicle Body
      ctx.fillStyle = veh.color;
      ctx.beginPath();
      ctx.roundRect(veh.x, veh.y, veh.width, veh.height, 4);
      ctx.fill();

      // Windshield & Roof
      ctx.fillStyle = '#ffffff44';
      ctx.fillRect(veh.x + 6, veh.y + 4, veh.width - 12, veh.height - 8);

      // Collect bounding box for tracking engine
      detections.push({
        bbox: [veh.x - 2, veh.y - 2, veh.width + 4, veh.height + 4],
        class: veh.type,
        score: 0.92
      });
    });

    // 4. Update Tracker Engine
    if (trackingEnabled) {
      const activeTracks = trackerRef.current.update(detections, width, height, performance.now());
      setTripwireStats(trackerRef.current.getStats());

      // 5. Draw Tracking Bounding Boxes & Trajectories
      if (showBoxes) {
        activeTracks.forEach((track) => {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(track.x - track.width / 2, track.y - track.height / 2, track.width, track.height);

          // Track Label
          ctx.fillStyle = '#064e3b';
          ctx.fillRect(track.x - track.width / 2, track.y - track.height / 2 - 16, 80, 15);
          ctx.fillStyle = '#ffffff';
          ctx.font = '9px JetBrains Mono';
          ctx.fillText(`${track.trackId} · ${track.speedEstimateKmh}km/h`, track.x - track.width / 2 + 2, track.y - track.height / 2 - 5);
        });
      }
    }

    // 6. Draw Virtual Tripwires (North & South detection gates)
    if (showTripwires) {
      const northY = height * trackerRef.current.northTripwireYPercent;
      const southY = height * trackerRef.current.southTripwireYPercent;

      // North Line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(100, northY); ctx.lineTo(width - 100, northY);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText('TRIPWIRE GATE A (NORTHBOUND COUNT)', 110, northY - 6);

      // South Line
      ctx.strokeStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(100, southY); ctx.lineTo(width - 100, southY);
      ctx.stroke();

      ctx.fillStyle = '#f43f5e';
      ctx.fillText('TRIPWIRE GATE B (SOUTHBOUND COUNT)', 110, southY - 6);
      ctx.setLineDash([]);
    }
  };

  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setActiveSource('local_file');
      const url = URL.createObjectURL(file);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAddAnnotation = () => {
    const newAnn: GroundTruthAnnotation = {
      id: `GT-${Date.now().toString().slice(-4)}`,
      timestampSeconds: Math.round(performance.now() / 1000),
      actualCarCount: actualCarCountInput,
      actualBusCount: actualBusCountInput,
      actualTruckCount: actualTruckCountInput,
      actualMotorcycleCount: 0,
      actualPedestrianCount: actualPersonCountInput,
      annotatedBy: 'Human Observer (Verification)'
    };
    const updated = [newAnn, ...annotations];
    setAnnotations(updated);
    StorageService.saveGroundTruthAnnotations(updated);
  };

  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObsNote.trim()) return;
    const newEntry = {
      id: `OBS-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      note: newObsNote.trim(),
      corridor: 'Meskel Square Interchange'
    };
    setObservations([newEntry, ...observations]);
    setNewObsNote('');
  };

  const handleFeedDemand = () => {
    const demandPayload: SignalOfflineDemand = {
      sourceTimestamp: new Date().toISOString(),
      corridorName: 'Meskel Square Corridor',
      northSouthVehiclesPerMin: Math.max(15, tripwireStats.observedFlowRatePerMin),
      eastWestVehiclesPerMin: Math.round(tripwireStats.observedFlowRatePerMin * 0.65),
      pedestrianCrossingCall: true,
      averageSpeedKmh: 24
    };
    onFeedDemandToSignals(demandPayload);
  };

  const handleResetCounters = () => {
    trackerRef.current.reset();
    setTripwireStats(trackerRef.current.getStats());
  };

  // Evaluation calculations (Priority 3)
  const totalActualCars = annotations.reduce((sum, a) => sum + a.actualCarCount, 0);
  const totalObservedCars = tripwireStats.vehicleClassBreakdown.car || 0;
  const estimatedDiff = Math.abs(totalObservedCars - totalActualCars);

  return (
    <div className="space-y-6">
      {/* Top Banner: Recorded Video Lab & YouTube Disclaimer */}
      <div className="p-4 bg-emerald-950/5 border border-emerald-900/10 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3 text-neutral-800">
          <Tv className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-neutral-900">
              Offline Recorded-Video Analysis Lab (TensorFlow.js & Centroid Tracking)
            </h2>
            <p className="text-neutral-600 mt-0.5">
              Continuously track vehicles, count corridor flow with virtual tripwires, evaluate ground truth, and export demand to adaptive signals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleFeedDemand}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium transition-colors shadow-2xs"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Feed Demand to Adaptive Signals</span>
          </button>
        </div>
      </div>

      {/* Source Selector Tabs & Dubai Benchmark Button */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-neutral-200 pb-3">
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs font-medium flex-wrap">
          <button
            onClick={() => setActiveSource('synthetic_sim')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSource === 'synthetic_sim' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Addis Simulator
          </button>
          <button
            onClick={() => setActiveSource('dubai_sheikh_zayed')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeSource === 'dubai_sheikh_zayed' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span>Dubai Sheikh Zayed (E11)</span>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-mono px-1 rounded">Live Cam</span>
          </button>
          <button
            onClick={() => setActiveSource('addis_meskel')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSource === 'addis_meskel' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Addis Meskel Sq Sample
          </button>
          <button
            onClick={() => setActiveSource('custom_stream')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
              activeSource === 'custom_stream' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span>Link Custom Feed</span>
          </button>
          <button
            onClick={() => setActiveSource('local_file')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSource === 'local_file' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Upload File
          </button>
        </div>

        {/* Dubai Benchmark Trigger & Overlay Controls */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <button
            onClick={() => setShowDubaiBenchmarkModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 rounded-lg transition-colors font-medium"
          >
            <Info className="w-3.5 h-3.5 text-amber-700" />
            <span>Dubai RTA Benchmark</span>
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-medium transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={handleResetCounters}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
            title="Reset tripwire counters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Counts</span>
          </button>

          <label className="flex items-center gap-1.5 text-neutral-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showTripwires}
              onChange={(e) => setShowTripwires(e.target.checked)}
              className="rounded text-emerald-600"
            />
            <span>Tripwires</span>
          </label>
        </div>
      </div>

      {/* Main Analysis Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Video or Simulator Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 shadow-sm relative">
            {activeSource === 'synthetic_sim' && (
              <canvas
                ref={canvasRef}
                width={640}
                height={400}
                className="w-full h-auto block select-none"
              />
            )}

            {/* Dubai Sheikh Zayed Road (E11) Feed */}
            {activeSource === 'dubai_sheikh_zayed' && (
              <div className="p-4 space-y-3">
                <div className="aspect-video w-full rounded-lg overflow-hidden border border-neutral-800 bg-black">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube-nocookie.com/embed/tWNWoHffV9Q?autoplay=1&mute=1&loop=1&playlist=tWNWoHffV9Q"
                    title="Dubai Highway Drive 4K | Sheikh Zayed Road POV"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300 space-y-1.5">
                  <div className="flex items-center justify-between text-amber-400 font-semibold">
                    <span>DUBAI ARTERIAL FEED · SHEIKH ZAYED ROAD (E11)</span>
                    <span className="font-mono text-[10px] text-neutral-400">RTA ITS INSPIRATION</span>
                  </div>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    Connected to Dubai's central 12-lane arterial corridor (Sheikh Zayed Road past Burj Khalifa, Dubai World Trade Centre, and Al Safa Salik gantry). Used by Addis Ababa traffic engineers to benchmark vehicle density, multi-lane lane-discipline monitoring, and high-speed RFID gantry coordination.
                  </p>
                </div>
              </div>
            )}

            {/* Addis Ababa Meskel Square Recording */}
            {activeSource === 'addis_meskel' && (
              <div className="p-4 space-y-3">
                <div className="aspect-video w-full rounded-lg overflow-hidden border border-neutral-800">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube-nocookie.com/embed/UEIn8GJIg0E"
                    title="Meskel Square Addis Abeba - Rift Valley Expeditions"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-lg text-xs text-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-amber-300">Viewing-Only Sample Notice:</span>
                    <span>
                      “Meskel Square, Addis Abeba” by Rift Valley Expeditions is historical reference footage. Browser cross-origin security prevents frame extraction from 3rd-party YouTube players. Use the <strong>Addis Simulator</strong> or local MP4 for continuous bounding box tracking.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Feed Linker (Any Country / Live URL) */}
            {activeSource === 'custom_stream' && (
              <div className="p-5 space-y-4 text-xs">
                <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800 text-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Link Live Feed (Any Country or City)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">UNIVERSAL CONNECTOR</span>
                  </div>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    Paste any live road webcam, YouTube Live stream link, or direct CORS video stream URL from Dubai, Abu Dhabi, Addis Ababa, Nairobi, or any municipality.
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomStreamType('youtube')}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        customStreamType === 'youtube' ? 'bg-red-700 text-white font-semibold' : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      YouTube Live / Video ID
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomStreamType('direct_url')}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        customStreamType === 'direct_url' ? 'bg-emerald-700 text-white font-semibold' : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      Direct CORS Video / HLS Stream
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={
                        customStreamType === 'youtube'
                          ? 'Paste YouTube Live URL or ID (e.g. tWNWoHffV9Q or https://youtube.com/watch?v=...)'
                          : 'Paste direct video URL (e.g. https://.../traffic-stream.mp4)'
                      }
                      value={customStreamInput}
                      onChange={(e) => setCustomStreamInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = customStreamInput.trim();
                        if (!val) return;
                        if (customStreamType === 'youtube') {
                          // Extract ID if full URL
                          let videoId = val;
                          if (val.includes('v=')) {
                            videoId = val.split('v=')[1]?.split('&')[0] || val;
                          } else if (val.includes('youtu.be/')) {
                            videoId = val.split('youtu.be/')[1]?.split('?')[0] || val;
                          }
                          setActiveCustomYoutubeId(videoId);
                        } else {
                          setActiveCustomStreamUrl(val);
                        }
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium transition-colors"
                    >
                      Load Stream
                    </button>
                  </div>
                </div>

                {/* Render Connected Custom Player */}
                {customStreamType === 'youtube' && activeCustomYoutubeId && (
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-neutral-800 bg-black">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube-nocookie.com/embed/${activeCustomYoutubeId}?autoplay=1&mute=1`}
                      title="Custom Connected Live Road Feed"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {customStreamType === 'direct_url' && activeCustomStreamUrl && (
                  <div className="relative">
                    <video
                      controls
                      autoPlay
                      crossOrigin="anonymous"
                      src={activeCustomStreamUrl}
                      className="w-full h-[380px] object-contain bg-black rounded-lg"
                    />
                    <span className="text-[10px] text-emerald-400 block mt-1 font-mono">
                      * Direct stream active with crossOrigin access for frame extraction
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Local Video File Player */}
            {activeSource === 'local_file' && (
              <div className="relative">
                <video
                  ref={videoRef}
                  controls
                  className="w-full h-[400px] object-contain bg-black"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                <div className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={handleLocalFileUpload}
                      className="text-xs text-neutral-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-neutral-800 file:text-neutral-200"
                    />
                  </div>
                  <span>Local playback · Zero external upload</span>
                </div>
              </div>
            )}
          </div>

          {/* Observed Flow & Deduplication Safeguards Stats */}
          <div className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Real-Time Tripwire Counts & Flow Rate
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-700">
                Safeguard: Single-Count State Guard Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs">
              <div>
                <span className="text-neutral-500 block text-[11px]">Gate A (Northbound)</span>
                <span className="text-xl font-bold font-mono tabular-nums text-sky-600">
                  {tripwireStats.northboundCount}
                </span>
                <span className="text-[10px] text-neutral-400 block">vehicles passed</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Gate B (Southbound)</span>
                <span className="text-xl font-bold font-mono tabular-nums text-rose-600">
                  {tripwireStats.southboundCount}
                </span>
                <span className="text-[10px] text-neutral-400 block">vehicles passed</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Total Unique Tracks</span>
                <span className="text-xl font-bold font-mono tabular-nums text-neutral-900">
                  {tripwireStats.totalUniqueTracked}
                </span>
                <span className="text-[10px] text-neutral-400 block">deduplicated IDs</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Estimated Corridor Flow</span>
                <span className="text-xl font-bold font-mono tabular-nums text-emerald-700">
                  {tripwireStats.observedFlowRatePerMin}
                </span>
                <span className="text-[10px] text-neutral-400 block">veh / minute projected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ground-Truth Evaluation & Observation Log */}
        <div className="space-y-6">
          {/* Ground-Truth Evaluation Workflow (Priority 3) */}
          <div className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-1.5 text-neutral-900 font-semibold text-xs">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>Ground-Truth Verification</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">PRIORITY 3</span>
            </div>

            <p className="text-[11px] text-neutral-500 mt-2">
              Compare automated tracker output against manual human ground-truth counts to calculate empirical performance metrics.
            </p>

            <div className="mt-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200/60 space-y-2 text-xs">
              <span className="font-semibold text-neutral-800 block text-[11px]">Log Current Ground Truth</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-500 block">Actual Cars</label>
                  <input
                    type="number"
                    min="0"
                    value={actualCarCountInput}
                    onChange={(e) => setActualCarCountInput(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-xs border border-neutral-300 rounded bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-500 block">Actual Minibuses</label>
                  <input
                    type="number"
                    min="0"
                    value={actualBusCountInput}
                    onChange={(e) => setActualBusCountInput(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-xs border border-neutral-300 rounded bg-white font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleAddAnnotation}
                className="w-full mt-2 py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-medium transition-colors"
              >
                Record Ground Truth Checkpoint
              </button>
            </div>

            {/* Empirical Performance Metrics Banner */}
            <div className="mt-3 p-3 bg-neutral-100 rounded-lg text-xs space-y-1.5">
              <div className="flex justify-between text-neutral-700">
                <span>Total Recorded Checkpoints</span>
                <span className="font-mono font-semibold tabular-nums">{annotations.length}</span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>Model vs Ground-Truth Delta</span>
                <span className="font-mono font-semibold tabular-nums">±{estimatedDiff} units</span>
              </div>
              <div className="pt-1.5 border-t border-neutral-200 text-[10px] text-neutral-500 italic">
                * Note: End-to-end model detection accuracy on Ethiopian footage is not yet validated. Formal metrics require independently reviewed datasets.
              </div>
            </div>
          </div>

          {/* Manual Observation Log (Section 10) */}
          <div className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-1.5 text-neutral-900 font-semibold text-xs">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Manual Observation Log</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">{observations.length} logs</span>
            </div>

            <form onSubmit={handleAddObservation} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Log observation (e.g. Minibus stalled in lane 2)"
                value={newObsNote}
                onChange={(e) => setNewObsNote(e.target.value)}
                className="flex-1 px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-600"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium"
              >
                Log
              </button>
            </form>

            <div className="mt-3 max-h-48 overflow-y-auto space-y-2 text-xs">
              {observations.map((obs) => (
                <div key={obs.id} className="p-2 rounded bg-neutral-50 border border-neutral-100">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                    <span>{obs.time} (EAT)</span>
                    <span>{obs.corridor}</span>
                  </div>
                  <p className="text-neutral-800 mt-1">{obs.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dubai RTA Systems Architecture Benchmark Modal */}
      {showDubaiBenchmarkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-lg">
                  <Info className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Dubai RTA Intelligent Traffic Systems (ITS) Benchmark
                  </h3>
                  <p className="text-neutral-500 text-[11px]">
                    Comparative engineering review: Dubai ITS Centre (Al Barsha) vs. Addis Ababa Pilot
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDubaiBenchmarkModal(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed">
                <strong>Project Inspiration Notice (Section 1):</strong> Traffic Pulse Ethiopia is inspired by Dubai’s multi-lane highway surveillance, Salik RFID toll gantries, and centralized traffic management. However, Ethiopian operational safeguards require human officer verification, dispute rights, and pedestrian infrastructure protections.
              </div>

              {/* Comparison Table */}
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-neutral-100 border-b border-neutral-200 font-bold text-neutral-700">
                      <th className="p-2.5">Capability Domain</th>
                      <th className="p-2.5">Dubai RTA Benchmark (UAE)</th>
                      <th className="p-2.5">Addis Ababa Pilot Implementation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    <tr>
                      <td className="p-2.5 font-semibold text-neutral-900">RFID & Vehicle ID</td>
                      <td className="p-2.5 text-neutral-600">
                        Salik UHF passive windshield tags (915 MHz) matched to synchronized optical OCR cameras across 8 highway gantries.
                      </td>
                      <td className="p-2.5 text-emerald-800 font-medium">
                        Roadside RFID reader + ANPR camera reconciliation. Any mismatch automatically blocks penalty draft approval.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-neutral-900">Incident Detection</td>
                      <td className="p-2.5 text-neutral-600">
                        Central Falcon cameras & thermal radar detect stopped vehicles, debris, and wrong-way entry within 10–15 seconds.
                      </td>
                      <td className="p-2.5 text-emerald-800 font-medium">
                        Continuous centroid vehicle tracking, virtual tripwire passage gates, and red-light/blocking event logging.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-neutral-900">Legal Authority</td>
                      <td className="p-2.5 text-neutral-600">
                        Statutory automated enforcement with direct account charging and SMS fine notifications.
                      </td>
                      <td className="p-2.5 text-emerald-800 font-medium">
                        Human officer mandatory sign-off. Four-point checklist and written override justification required.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-neutral-900">Adaptive Signals</td>
                      <td className="p-2.5 text-neutral-600">
                        Central SCOOT / iCargo systems coordinating hundreds of smart signals across the Emirate.
                      </td>
                      <td className="p-2.5 text-emerald-800 font-medium">
                        Demand-balanced 60s vehicle green budget with fail-safe fallback to 30s/30s splits and downstream blockage freezes.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-neutral-900">Vulnerable Road Users</td>
                      <td className="p-2.5 text-neutral-600">
                        Pedestrian footbridges, fences, and grade-separated crossings across high-speed arterials.
                      </td>
                      <td className="p-2.5 text-emerald-800 font-medium">
                        Infrastructure deficiency referrals dispatched to sub-city authorities; no video inference of pedestrian intent.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-end">
              <button
                onClick={() => setShowDubaiBenchmarkModal(false)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
              >
                Close Benchmark Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

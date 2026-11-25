import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertOctagon, 
  ShieldAlert, 
  Clock, 
  RotateCcw, 
  Play, 
  Pause, 
  Sliders, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';
import { SignalOfflineDemand } from '../../types/traffic';
import { StorageService } from '../../utils/storage';

interface AdaptiveSignalsViewProps {
  initialDemand: SignalOfflineDemand | null;
}

export const AdaptiveSignalsView: React.FC<AdaptiveSignalsViewProps> = ({
  initialDemand
}) => {
  const [selectedJunction, setSelectedJunction] = useState<string>('Meskel Square Interchange');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Simulation Inputs (Section 9)
  const [nsDemand, setNsDemand] = useState<number>(() => initialDemand?.northSouthVehiclesPerMin || 32);
  const [ewDemand, setEwDemand] = useState<number>(() => initialDemand?.eastWestVehiclesPerMin || 18);
  const [pedestrianDemand, setPedestrianDemand] = useState<boolean>(() => initialDemand?.pedestrianCrossingCall || false);
  const [detectorHealth, setDetectorHealth] = useState<'healthy' | 'unhealthy'>('healthy');
  const [downstreamBlocked, setDownstreamBlocked] = useState<boolean>(false);

  // Current Phase State:
  // Phase 1: NS_GREEN
  // Phase 2: NS_YELLOW (fixed 3s)
  // Phase 3: ALL_RED_1 (fixed 2s)
  // Phase 4: EW_GREEN
  // Phase 5: EW_YELLOW (fixed 3s)
  // Phase 6: ALL_RED_2 (fixed 2s)
  // Phase 7: PED_EXCLUSIVE (25s if pedestrianDemand, else skipped)
  const [currentPhase, setCurrentPhase] = useState<'NS_GREEN' | 'NS_YELLOW' | 'ALL_RED_1' | 'EW_GREEN' | 'EW_YELLOW' | 'ALL_RED_2' | 'PED_EXCLUSIVE'>('NS_GREEN');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);

  // Compute timing plan based on demand
  const calculateTimings = () => {
    if (detectorHealth === 'unhealthy') {
      return { nsGreen: 30, ewGreen: 30, isFailSafe: true };
    }
    const total = nsDemand + ewDemand;
    if (total === 0) return { nsGreen: 30, ewGreen: 30, isFailSafe: false };

    // Total budget: 60s vehicle green time. Min 15s, Max 45s per group.
    const rawNs = Math.round((nsDemand / total) * 60);
    const nsGreen = Math.min(45, Math.max(15, rawNs));
    const ewGreen = 60 - nsGreen;

    return { nsGreen, ewGreen, isFailSafe: false };
  };

  const timingPlan = calculateTimings();

  // Phase Countdown Engine
  useEffect(() => {
    if (!isPlaying || downstreamBlocked) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev > 1) return prev - 1;

        // Transition to next phase
        switch (currentPhase) {
          case 'NS_GREEN':
            setCurrentPhase('NS_YELLOW');
            return 3; // Fixed 3s yellow
          case 'NS_YELLOW':
            setCurrentPhase('ALL_RED_1');
            return 2; // Fixed 2s clearance
          case 'ALL_RED_1':
            setCurrentPhase('EW_GREEN');
            return timingPlan.ewGreen;
          case 'EW_GREEN':
            setCurrentPhase('EW_YELLOW');
            return 3;
          case 'EW_YELLOW':
            setCurrentPhase('ALL_RED_2');
            return 2;
          case 'ALL_RED_2':
            if (pedestrianDemand) {
              setCurrentPhase('PED_EXCLUSIVE');
              return 25; // Exclusive pedestrian 25s
            }
            setCurrentPhase('NS_GREEN');
            return timingPlan.nsGreen;
          case 'PED_EXCLUSIVE':
            setPedestrianDemand(false); // Reset pedestrian call after serving
            setCurrentPhase('NS_GREEN');
            return timingPlan.nsGreen;
          default:
            setCurrentPhase('NS_GREEN');
            return 30;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, downstreamBlocked, currentPhase, timingPlan, pedestrianDemand]);

  const handleApplyOfflineDemand = () => {
    const saved = StorageService.getOfflineDemand();
    if (saved) {
      setNsDemand(saved.northSouthVehiclesPerMin);
      setEwDemand(saved.eastWestVehiclesPerMin);
      setPedestrianDemand(saved.pedestrianCrossingCall);
      setDetectorHealth('healthy');
      setDownstreamBlocked(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="p-4 bg-emerald-950/5 border border-emerald-900/10 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-neutral-800">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-neutral-900">Adaptive Signal Simulation Only:</strong>
            <span>
              This illustrates how computer vision demand can optimize junction timing. Real-world intersection control requires engineer-approved timing, conflict monitoring, and certified NTCIP hardware controllers.
            </span>
          </div>
        </div>

        {initialDemand && (
          <button
            onClick={handleApplyOfflineDemand}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium shrink-0 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Load Video Lab Demand</span>
          </button>
        )}
      </div>

      {/* Main Grid: Signal Head Visualization & Demand Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Junction Intersection & Signal Heads */}
        <div className="lg:col-span-7 bg-white border border-neutral-200/80 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">{selectedJunction}</h2>
              <p className="text-xs text-neutral-500 font-mono">
                Active Phase: <strong className="text-emerald-700">{currentPhase.replace('_', ' ')}</strong> · {secondsRemaining}s remaining
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium flex items-center gap-1"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause Cycle' : 'Resume'}</span>
              </button>
            </div>
          </div>

          {/* Downstream Blocked Alert */}
          {downstreamBlocked && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-center gap-2 font-medium">
              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                DOWNSTREAM EXIT BLOCKED: Plan held for officer review. Green phase advancement is frozen to prevent intersection gridlock.
              </span>
            </div>
          )}

          {/* Detector Health Fallback Notice */}
          {detectorHealth === 'unhealthy' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2 font-medium">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                DETECTOR FAULT FALLBACK: Sensor data unverified. Controller defaulted to fixed 30s/30s demonstration split.
              </span>
            </div>
          )}

          {/* Visual Signal Heads Box */}
          <div className="p-6 bg-neutral-900 rounded-xl border border-neutral-800 text-white select-none">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {/* North-South Signal Head */}
              <div className="p-4 bg-neutral-950 rounded-lg border border-neutral-800 flex flex-col items-center">
                <span className="text-xs font-mono font-bold text-neutral-300 mb-3 block">
                  NORTH-SOUTH CORRIDOR
                </span>
                <div className="flex flex-col gap-2 p-2 bg-neutral-900 rounded-lg border border-neutral-800">
                  {/* Red Light */}
                  <div className={`w-8 h-8 rounded-full border border-neutral-800 ${
                    currentPhase.startsWith('EW') || currentPhase === 'ALL_RED_1' || currentPhase === 'ALL_RED_2' || currentPhase === 'PED_EXCLUSIVE'
                      ? 'bg-rose-600 shadow-md shadow-rose-600/50'
                      : 'bg-rose-950/40'
                  }`} />
                  {/* Yellow Light */}
                  <div className={`w-8 h-8 rounded-full border border-neutral-800 ${
                    currentPhase === 'NS_YELLOW' ? 'bg-amber-500 shadow-md shadow-amber-500/50' : 'bg-amber-950/40'
                  }`} />
                  {/* Green Light */}
                  <div className={`w-8 h-8 rounded-full border border-neutral-800 ${
                    currentPhase === 'NS_GREEN' ? 'bg-emerald-500 shadow-md shadow-emerald-500/50' : 'bg-emerald-950/40'
                  }`} />
                </div>
                <span className="text-xs font-mono text-neutral-400 mt-3">
                  Allocated: {timingPlan.nsGreen}s Green
                </span>
              </div>

              {/* East-West Signal Head */}
              <div className="p-4 bg-neutral-950 rounded-lg border border-neutral-800 flex flex-col items-center">
                <span className="text-xs font-mono font-bold text-neutral-300 mb-3 block">
                  EAST-WEST CORRIDOR
                </span>
                <div className="flex flex-col gap-2 p-2 bg-neutral-900 rounded-lg border border-neutral-800">
                  {/* Red Light */}
                  <div className={`w-8 h-8 rounded-full border border-neutral-800 ${
                    currentPhase.startsWith('NS') || currentPhase === 'ALL_RED_1' || currentPhase === 'ALL_RED_2' || currentPhase === 'PED_EXCLUSIVE'
                      ? 'bg-rose-600 shadow-md shadow-rose-600/50'
                      : 'bg-rose-950/40'
                  }`} />
                  {/* Yellow Light */}
                  <div className={`w-8 h-8 rounded-full border border-neutral-800 ${
                    currentPhase === 'EW_YELLOW' ? 'bg-amber-500 shadow-md shadow-amber-500/50' : 'bg-amber-950/40'
                  }`} />
                  {/* Green Light */}
                  <div className={`w-8 h-8 rounded-full border border-neutral-800 ${
                    currentPhase === 'EW_GREEN' ? 'bg-emerald-500 shadow-md shadow-emerald-500/50' : 'bg-emerald-950/40'
                  }`} />
                </div>
                <span className="text-xs font-mono text-neutral-400 mt-3">
                  Allocated: {timingPlan.ewGreen}s Green
                </span>
              </div>

              {/* Pedestrian Signal Head */}
              <div className="p-4 bg-neutral-950 rounded-lg border border-neutral-800 flex flex-col items-center">
                <span className="text-xs font-mono font-bold text-neutral-300 mb-3 block">
                  PEDESTRIAN CROSSING
                </span>
                <div className="flex flex-col gap-2 p-2 bg-neutral-900 rounded-lg border border-neutral-800">
                  {/* Hand (Don't Walk) */}
                  <div className={`w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center font-bold text-xs ${
                    currentPhase !== 'PED_EXCLUSIVE' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/50' : 'bg-rose-950/40 text-neutral-600'
                  }`}>
                    ✋
                  </div>
                  {/* Walking Person */}
                  <div className={`w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center font-bold text-xs ${
                    currentPhase === 'PED_EXCLUSIVE' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/50' : 'bg-emerald-950/40 text-neutral-600'
                  }`}>
                    🚶
                  </div>
                </div>
                <span className="text-xs font-mono text-neutral-400 mt-3">
                  {currentPhase === 'PED_EXCLUSIVE' ? 'WALK (25s Exclusive)' : pedestrianDemand ? 'Call Pending' : 'No Call'}
                </span>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400">Total Vehicle Green Budget: 60s</span>
              <span className="text-emerald-400 text-sm font-bold tabular-nums">
                {secondsRemaining}s remaining in phase
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Simulation Controls & Fail-Safe Triggers */}
        <div className="lg:col-span-5 bg-white border border-neutral-200/80 rounded-xl p-5 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-700" />
              Demand Inputs & Fail-Safe Controls
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Junction Selector */}
            <div>
              <label className="block text-neutral-700 font-medium mb-1">Target Junction</label>
              <select
                value={selectedJunction}
                onChange={(e) => setSelectedJunction(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-neutral-900 bg-white"
              >
                <option value="Meskel Square Interchange">Meskel Square Interchange</option>
                <option value="Mexico Square Roundabout">Mexico Square Roundabout</option>
                <option value="Megenagna Multi-Level Junction">Megenagna Multi-Level Junction</option>
              </select>
            </div>

            {/* North-South Queue Demand Slider */}
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-neutral-700">North–South Arrival Rate:</span>
                <span className="font-mono text-neutral-900 font-bold">{nsDemand} veh / min</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={nsDemand}
                onChange={(e) => setNsDemand(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <span className="text-[10px] text-neutral-400">Allocated Green: {timingPlan.nsGreen}s</span>
            </div>

            {/* East-West Queue Demand Slider */}
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-neutral-700">East–West Arrival Rate:</span>
                <span className="font-mono text-neutral-900 font-bold">{ewDemand} veh / min</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={ewDemand}
                onChange={(e) => setEwDemand(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <span className="text-[10px] text-neutral-400">Allocated Green: {timingPlan.ewGreen}s</span>
            </div>

            {/* Pedestrian Call Button */}
            <div className="pt-2 border-t border-neutral-100">
              <label className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 cursor-pointer hover:bg-neutral-50">
                <div>
                  <span className="font-medium text-neutral-800 block">Pedestrian Push-Button Demand</span>
                  <span className="text-[10px] text-neutral-500">Triggers 25s exclusive pedestrian scramble phase</span>
                </div>
                <input
                  type="checkbox"
                  checked={pedestrianDemand}
                  onChange={(e) => setPedestrianDemand(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>
            </div>

            {/* Detector Health Trigger */}
            <div>
              <label className="block text-neutral-700 font-medium mb-1">Detector Health State</label>
              <select
                value={detectorHealth}
                onChange={(e) => setDetectorHealth(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-neutral-900 bg-white font-medium"
              >
                <option value="healthy">Healthy (Demand Adaptive)</option>
                <option value="unhealthy">Unhealthy (Triggers 30s/30s Fallback)</option>
              </select>
            </div>

            {/* Downstream Blockage Trigger */}
            <div>
              <label className="flex items-center justify-between p-2.5 rounded-lg border border-rose-200 bg-rose-50/50 cursor-pointer">
                <div>
                  <span className="font-medium text-rose-900 block">Downstream Exit Blockage</span>
                  <span className="text-[10px] text-rose-700">Freeze cycle to prevent gridlocking center intersection</span>
                </div>
                <input
                  type="checkbox"
                  checked={downstreamBlocked}
                  onChange={(e) => setDownstreamBlocked(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

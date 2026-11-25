import React, { useState, useEffect } from 'react';
import { Navigation, NavSection } from './components/Navigation';
import { TopBar } from './components/TopBar';
import { OverviewView } from './components/views/OverviewView';
import { VideoLabView } from './components/views/VideoLabView';
import { TrafficMapView } from './components/views/TrafficMapView';
import { AdaptiveSignalsView } from './components/views/AdaptiveSignalsView';
import { CameraNetworkView } from './components/views/CameraNetworkView';
import { IncidentReviewView } from './components/views/IncidentReviewView';
import { PedestrianSafetyView } from './components/views/PedestrianSafetyView';
import { PenaltyRulesView } from './components/views/PenaltyRulesView';

import { Camera, CorridorInfo, Incident, InfrastructureReferral, PedestrianEvent, PenaltyRule, SignalOfflineDemand } from './types/traffic';
import { StorageService } from './utils/storage';
import { calculateIncidentRecommendation } from './utils/recommendationEngine';

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [currentOfficer, setCurrentOfficer] = useState<string>('Traffic Officer Dawit (Badge #AA-409)');

  // Persistent Domain States
  const [incidents, setIncidents] = useState<Incident[]>(() => StorageService.getIncidents());
  const [cameras, setCameras] = useState<Camera[]>(() => StorageService.getCameras());
  const [corridors] = useState<CorridorInfo[]>(() => StorageService.getCorridors());
  const [pedestrianEvents, setPedestrianEvents] = useState<PedestrianEvent[]>(() => StorageService.getPedestrianEvents());
  const [infrastructureReferrals, setInfrastructureReferrals] = useState<InfrastructureReferral[]>(() => StorageService.getInfrastructureReferrals());
  const [penaltyRules, setPenaltyRules] = useState<PenaltyRule[]>(() => StorageService.getPenaltyRules());
  const [offlineDemand, setOfflineDemand] = useState<SignalOfflineDemand | null>(() => StorageService.getOfflineDemand());

  // Incident Selected for Deep Review
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');

  // Sync state changes with localStorage
  const handleUpdateIncident = (updated: Incident) => {
    const next = incidents.map(i => i.id === updated.id ? updated : i);
    setIncidents(next);
    StorageService.saveIncidents(next);
  };

  const handleAddPlannedCamera = (newCam: Partial<Camera>) => {
    const fullCam: Camera = {
      id: `CAM-PLN-${String(cameras.length + 1).padStart(2, '0')}`,
      name: newCam.name || 'Planned Addis Gantry',
      corridor: newCam.corridor || 'Meskel Square Interchange',
      status: 'planned',
      type: newCam.type || 'ANPR + Overview',
      rfidReaderInstalled: true,
      rfidReaderStatus: 'online',
      coordinates: newCam.coordinates || { lat: 9.0100, lng: 38.7500 },
      resolution: '4K Ultra HD',
      installationDate: '2026-Q4',
      lastHeartbeat: 'Awaiting deployment',
    };
    const next = [fullCam, ...cameras];
    setCameras(next);
    StorageService.saveCameras(next);
  };

  const handleAddInfrastructureReferral = (ref: InfrastructureReferral) => {
    const next = [ref, ...infrastructureReferrals];
    setInfrastructureReferrals(next);
    StorageService.saveInfrastructureReferrals(next);
  };

  const handleUpdatePedestrianEvent = (event: PedestrianEvent) => {
    const next = pedestrianEvents.map(e => e.id === event.id ? event : e);
    setPedestrianEvents(next);
    StorageService.savePedestrianEvents(next);
  };

  const handleUpdatePenaltyRules = (rules: PenaltyRule[]) => {
    setPenaltyRules(rules);
    StorageService.savePenaltyRules(rules);
  };

  const handleFeedDemandToSignals = (demand: SignalOfflineDemand) => {
    setOfflineDemand(demand);
    StorageService.saveOfflineDemand(demand);
    setActiveSection('adaptive_signals');
  };

  const handleResetData = () => {
    if (confirm('Reset all demonstration records, rules, and logs back to default seed state?')) {
      StorageService.resetAllToDefaults();
      setIncidents(StorageService.getIncidents());
      setCameras(StorageService.getCameras());
      setPedestrianEvents(StorageService.getPedestrianEvents());
      setInfrastructureReferrals(StorageService.getInfrastructureReferrals());
      setPenaltyRules(StorageService.getPenaltyRules());
      setOfflineDemand(null);
    }
  };

  // Simulate Incident Generator
  const handleSimulateIncident = () => {
    const simulatedViolations: Array<{ cat: Incident['violationCategory']; loc: string; cor: string; amount: number }> = [
      { cat: 'red_light', loc: 'Meskel Square South Gantry - Lane 1', cor: 'meskel_sq', amount: 1000 },
      { cat: 'intersection_blocking', loc: 'Mexico Square Central Ring Box', cor: 'mexico_sq', amount: 800 },
      { cat: 'illegal_parking', loc: 'Bole Road - Edna Mall Bus Stop', cor: 'bole_road', amount: 500 },
      { cat: 'wrong_way', loc: 'Piazza Churchill Avenue - Downhill Lane', cor: 'piazza', amount: 1500 },
    ];

    const pick = simulatedViolations[Math.floor(Math.random() * simulatedViolations.length)];
    const randomPlateNum = `${Math.floor(10000 + Math.random() * 90000)}`;
    const randomRfidMatch = Math.random() > 0.3 ? 'verified_match' : 'mismatch';

    const newRaw: Omit<Incident, 'calculatedRecommendation'> = {
      id: `INC-2026-AA-${Math.floor(2000 + Math.random() * 8000)}`,
      timestamp: new Date().toISOString(),
      location: pick.loc,
      corridorId: pick.cor,
      plateNumber: randomPlateNum,
      plateRegion: 'ET-AA',
      rfidTagNumber: `RFID-ETH-${Math.floor(10000 + Math.random() * 90000)}`,
      rfidMatchStatus: randomRfidMatch,
      rfidAntennaId: 'ANT-GANTRY-LIVE',
      violationCategory: pick.cat,
      proposedAmountEtb: pick.amount,
      status: 'pending',
      evidenceQuality: 'clear',
      evidenceSupportsAllegation: 'supports',
      hasMitigatingCircumstance: false,
      isEmergencyVehicleOrEscort: false,
      checklist: {
        vehicleTypeVerified: false,
        plateCharactersVerified: false,
        correctLaneVerified: false,
        eventTimeVerified: false,
      },
      vehicleOwnerName: 'Simulated Citizen Account',
      registeredOwnerDispute: 'none',
      decisionHistory: [],
      illustratedSceneType: pick.cat === 'red_light' ? 'red_light' : pick.cat === 'illegal_parking' ? 'parking' : 'intersection'
    };

    const newIncident: Incident = {
      ...newRaw,
      calculatedRecommendation: calculateIncidentRecommendation(newRaw)
    };

    const next = [newIncident, ...incidents];
    setIncidents(next);
    StorageService.saveIncidents(next);
    setSelectedIncidentId(newIncident.id);
    setActiveSection('incident_review');
  };

  const pendingIncidentsCount = incidents.filter(i => i.status === 'pending').length;

  return (
    <div className="flex h-screen w-full bg-[#f8faf9] text-neutral-900 overflow-hidden font-sans">
      {/* Dark Green Left Navigation */}
      <Navigation
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        pendingIncidentsCount={pendingIncidentsCount}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        onSimulateIncident={handleSimulateIncident}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Bar with Live Addis Time & Officer Selector */}
        <TopBar
          activeSection={activeSection}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          currentOfficer={currentOfficer}
          onChangeOfficer={setCurrentOfficer}
          onResetData={handleResetData}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeSection === 'overview' && (
              <OverviewView
                corridors={corridors}
                cameras={cameras}
                incidents={incidents}
                onNavigate={setActiveSection}
                onSelectIncident={(id) => {
                  setSelectedIncidentId(id);
                  setActiveSection('incident_review');
                }}
                onSimulateIncident={handleSimulateIncident}
                onAddPlannedCamera={handleAddPlannedCamera}
              />
            )}

            {activeSection === 'video_lab' && (
              <VideoLabView
                onFeedDemandToSignals={handleFeedDemandToSignals}
                onNavigate={setActiveSection}
              />
            )}

            {activeSection === 'traffic_map' && (
              <TrafficMapView />
            )}

            {activeSection === 'adaptive_signals' && (
              <AdaptiveSignalsView
                initialDemand={offlineDemand}
              />
            )}

            {activeSection === 'camera_network' && (
              <CameraNetworkView
                cameras={cameras}
                onAddPlannedCamera={handleAddPlannedCamera}
              />
            )}

            {activeSection === 'incident_review' && (
              <IncidentReviewView
                incidents={incidents}
                selectedIncidentId={selectedIncidentId}
                onUpdateIncident={handleUpdateIncident}
                currentOfficer={currentOfficer}
              />
            )}

            {activeSection === 'pedestrian_safety' && (
              <PedestrianSafetyView
                events={pedestrianEvents}
                referrals={infrastructureReferrals}
                onAddReferral={handleAddInfrastructureReferral}
                onUpdateEvent={handleUpdatePedestrianEvent}
              />
            )}

            {activeSection === 'penalty_rules' && (
              <PenaltyRulesView
                rules={penaltyRules}
                onUpdateRules={handleUpdatePenaltyRules}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

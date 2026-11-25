export type ViolationCategory = 
  | 'red_light'
  | 'intersection_blocking'
  | 'illegal_parking'
  | 'wrong_way';

export type IncidentStatus = 
  | 'pending'
  | 'approved_draft'
  | 'warning_recorded'
  | 'dismissed'
  | 'further_review';

export type EvidenceQuality = 'unknown' | 'clear' | 'poor';

export type EvidenceAllegationSupport = 'unknown' | 'supports' | 'refutes' | 'inconclusive';

export type RfidMatchStatus = 
  | 'verified_match'
  | 'mismatch'
  | 'no_reader_present'
  | 'unreadable_tag';

export type VehicleCaseDisputeStatus = 
  | 'none'
  | 'owner_lookup_pending'
  | 'simulated_notice_drafted'
  | 'vehicle_sold_transferred'
  | 'vehicle_reported_stolen'
  | 'driver_nominated_for_review';

export interface DecisionHistoryEntry {
  id: string;
  timestamp: string; // ISO string
  officerName: string;
  officerRole: 'Traffic Officer' | 'Senior Supervisor' | 'Traffic Engineer';
  decision: IncidentStatus;
  recommendationOutcome: IncidentStatus;
  overrideApplied: boolean;
  overrideReason?: string;
  notes: string;
}

export interface VerificationChecklist {
  vehicleTypeVerified: boolean;
  plateCharactersVerified: boolean;
  correctLaneVerified: boolean;
  eventTimeVerified: boolean;
}

export interface Incident {
  id: string;
  timestamp: string; // ISO
  location: string;
  corridorId: string;
  plateNumber: string;
  plateRegion: string; // e.g. "ET-AA" (Addis Ababa), "ET-OR" (Oromia)
  rfidTagNumber?: string;
  rfidMatchStatus: RfidMatchStatus;
  rfidAntennaId?: string;
  violationCategory: ViolationCategory;
  proposedAmountEtb: number;
  status: IncidentStatus;
  
  // Decision support inputs
  evidenceQuality: EvidenceQuality;
  evidenceSupportsAllegation: EvidenceAllegationSupport;
  hasMitigatingCircumstance: boolean;
  mitigationDescription?: string;
  isEmergencyVehicleOrEscort: boolean;
  checklist: VerificationChecklist;
  
  // Vehicle & Owner case
  vehicleOwnerName?: string;
  registeredOwnerDispute: VehicleCaseDisputeStatus;
  disputeNotes?: string;
  
  // Recommendation
  calculatedRecommendation: {
    recommendedStatus: IncidentStatus;
    reason: string;
    blockApproval: boolean;
    missingPrerequisites: string[];
  };

  decisionHistory: DecisionHistoryEntry[];
  evidenceImageUrl?: string;
  illustratedSceneType?: 'intersection' | 'red_light' | 'parking' | 'wrong_way';
}

export interface Camera {
  id: string;
  name: string;
  corridor: string;
  status: 'active' | 'maintenance' | 'planned';
  type: 'ANPR + Overview' | 'Overview Only' | 'Speed Radar + ANPR';
  rfidReaderInstalled: boolean;
  rfidReaderStatus: 'online' | 'degraded' | 'none';
  coordinates: {
    lat: number;
    lng: number;
  };
  resolution: string;
  installationDate: string;
  lastHeartbeat: string;
}

export interface CorridorInfo {
  id: string;
  name: string;
  amharicName?: string;
  activeCameras: number;
  totalCameras: number;
  currentCongestionLevel: 'normal' | 'moderate' | 'heavy' | 'gridlock';
  averageSpeedKmh: number;
  rfidCoveragePct: number;
  keyJunction: string;
}

export interface PedestrianEvent {
  id: string;
  timestamp: string;
  location: string;
  corridor: string;
  category: 
    | 'crossing_against_signal'
    | 'crossing_outside_designated'
    | 'walking_in_carriageway'
    | 'driver_failure_to_yield'
    | 'vehicle_blocking_footpath';
  assessment: {
    accessibleCrossingExists: boolean;
    signalsWorkingProperly: boolean;
    footpathBlockedOrMissing: boolean;
    directConversationHeld: boolean;
    hasVerifiedPriorWarning: boolean;
    immediateAssistanceNeeded: boolean;
  };
  outcome: 'pending' | 'assistance_rendered' | 'education_provided' | 'documented_warning' | 'infrastructure_referred' | 'driver_enforcement_review';
  officerNotes?: string;
  infrastructureNotes?: string;
}

export interface InfrastructureReferral {
  id: string;
  createdAt: string;
  corridor: string;
  junction: string;
  issueType: 'missing_zebra_crossing' | 'signal_head_malfunction' | 'pedestrian_button_broken' | 'sidewalk_encroachment' | 'poor_lighting';
  subCity: 'Bole' | 'Kirkos' | 'Arada' | 'Lideta' | 'Yeka' | 'Nifas Silk-Lafto' | 'Gullele' | 'Addis Ketema';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'dispatched' | 'repaired';
  notes: string;
}

export interface GroundTruthAnnotation {
  id: string;
  timestampSeconds: number;
  actualCarCount: number;
  actualBusCount: number;
  actualTruckCount: number;
  actualMotorcycleCount: number;
  actualPedestrianCount: number;
  annotatedBy: string;
}

export interface TrackedVehicle {
  trackId: string;
  classType: string;
  confidence: number;
  firstSeenMs: number;
  lastSeenMs: number;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: 'Northbound' | 'Southbound' | 'Eastbound' | 'Westbound' | 'Stationary';
  crossedNorthLine: boolean;
  crossedSouthLine: boolean;
  speedEstimateKmh: number;
}

export interface SignalOfflineDemand {
  sourceTimestamp: string;
  corridorName: string;
  northSouthVehiclesPerMin: number;
  eastWestVehiclesPerMin: number;
  pedestrianCrossingCall: boolean;
  averageSpeedKmh: number;
}

export interface PenaltyRule {
  category: ViolationCategory;
  title: string;
  description: string;
  amountEtb: number;
  legalGazetteReference: string;
  pointsDeducted: number; // Proposed policy only
}

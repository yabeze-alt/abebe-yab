import { Camera, CorridorInfo, Incident, InfrastructureReferral, PedestrianEvent, PenaltyRule } from '../types/traffic';
import { calculateIncidentRecommendation } from '../utils/recommendationEngine';

export const INITIAL_CORRIDORS: CorridorInfo[] = [
  {
    id: 'meskel_sq',
    name: 'Meskel Square Interchange',
    amharicName: 'መስቀል አደባባይ',
    activeCameras: 6,
    totalCameras: 6,
    currentCongestionLevel: 'heavy',
    averageSpeedKmh: 18,
    rfidCoveragePct: 85,
    keyJunction: 'Bole Rd / Churchill Ave Convergence'
  },
  {
    id: 'mexico_sq',
    name: 'Mexico Square Roundabout',
    amharicName: 'ሜክሲኮ አደባባይ',
    activeCameras: 4,
    totalCameras: 5,
    currentCongestionLevel: 'gridlock',
    averageSpeedKmh: 12,
    rfidCoveragePct: 70,
    keyJunction: 'Chad St / Sengatera Ring'
  },
  {
    id: 'bole_road',
    name: 'Bole Road (Africa Avenue)',
    amharicName: 'ቦሌ መንገድ (አፍሪካ ጎዳና)',
    activeCameras: 8,
    totalCameras: 8,
    currentCongestionLevel: 'moderate',
    averageSpeedKmh: 34,
    rfidCoveragePct: 90,
    keyJunction: 'Bole Brass / Edna Mall Intersection'
  },
  {
    id: 'megenagna',
    name: 'Megenagna Multi-Level Junction',
    amharicName: 'መገናኛ መገናኛ',
    activeCameras: 5,
    totalCameras: 6,
    currentCongestionLevel: 'heavy',
    averageSpeedKmh: 16,
    rfidCoveragePct: 65,
    keyJunction: 'Ring Road / Asmara Road Exit'
  },
  {
    id: 'piazza',
    name: 'Piazza / Churchill Avenue',
    amharicName: 'ፒያሳ / ቸርችል ጎዳና',
    activeCameras: 4,
    totalCameras: 4,
    currentCongestionLevel: 'normal',
    averageSpeedKmh: 28,
    rfidCoveragePct: 60,
    keyJunction: 'De Gaulle Square / Post Office'
  },
  {
    id: 'arat_kilo',
    name: 'Arat Kilo (King George VI St)',
    amharicName: 'አራት ኪሎ',
    activeCameras: 4,
    totalCameras: 4,
    currentCongestionLevel: 'normal',
    averageSpeedKmh: 31,
    rfidCoveragePct: 75,
    keyJunction: 'Parliament / University Junction'
  },
  {
    id: 'cmc_ayat',
    name: 'CMC - Ayat Light Rail Corridor',
    amharicName: 'ሲኤምሲ - አያት ኮሪደር',
    activeCameras: 4,
    totalCameras: 5,
    currentCongestionLevel: 'moderate',
    averageSpeedKmh: 38,
    rfidCoveragePct: 80,
    keyJunction: 'CMC Roundabout / Light Rail Station'
  },
  {
    id: 'kaliti',
    name: 'Kaliti Tollgate Interchange',
    amharicName: 'ቃሊቲ የክፍያ መንገድ መግቢያ',
    activeCameras: 5,
    totalCameras: 5,
    currentCongestionLevel: 'heavy',
    averageSpeedKmh: 22,
    rfidCoveragePct: 95,
    keyJunction: 'Addis-Adama Expressway Entry'
  }
];

export const INITIAL_CAMERAS: Camera[] = [
  {
    id: 'CAM-MSQ-01',
    name: 'Meskel Square North Gantry (Overlook)',
    corridor: 'Meskel Square Interchange',
    status: 'active',
    type: 'ANPR + Overview',
    rfidReaderInstalled: true,
    rfidReaderStatus: 'online',
    coordinates: { lat: 9.0107, lng: 38.7615 },
    resolution: '4K Ultra HD (3840x2160)',
    installationDate: '2025-08-14',
    lastHeartbeat: '2 minutes ago'
  },
  {
    id: 'CAM-MSQ-02',
    name: 'Meskel Square East Approach (Bole-Bound)',
    corridor: 'Meskel Square Interchange',
    status: 'active',
    type: 'ANPR + Overview',
    rfidReaderInstalled: true,
    rfidReaderStatus: 'online',
    coordinates: { lat: 9.0102, lng: 38.7630 },
    resolution: '4K Ultra HD (3840x2160)',
    installationDate: '2025-08-14',
    lastHeartbeat: '1 minute ago'
  },
  {
    id: 'CAM-MEX-01',
    name: 'Mexico Square Sengatera Radial Gantry',
    corridor: 'Mexico Square Roundabout',
    status: 'active',
    type: 'ANPR + Overview',
    rfidReaderInstalled: true,
    rfidReaderStatus: 'online',
    coordinates: { lat: 9.0104, lng: 38.7448 },
    resolution: '1080p Full HD (1920x1080)',
    installationDate: '2025-09-02',
    lastHeartbeat: 'Just now'
  },
  {
    id: 'CAM-MEX-02',
    name: 'Mexico Square West (Lideta Approach)',
    corridor: 'Mexico Square Roundabout',
    status: 'maintenance',
    type: 'Overview Only',
    rfidReaderInstalled: false,
    rfidReaderStatus: 'none',
    coordinates: { lat: 9.0100, lng: 38.7425 },
    resolution: '1080p Full HD',
    installationDate: '2025-09-02',
    lastHeartbeat: '45 minutes ago (Sensor clean requested)'
  },
  {
    id: 'CAM-BOL-01',
    name: 'Bole Road - Edna Mall Intersection (Northbound)',
    corridor: 'Bole Road (Africa Avenue)',
    status: 'active',
    type: 'Speed Radar + ANPR',
    rfidReaderInstalled: true,
    rfidReaderStatus: 'online',
    coordinates: { lat: 8.9984, lng: 38.7845 },
    resolution: '4K Ultra HD',
    installationDate: '2025-07-20',
    lastHeartbeat: 'Just now'
  },
  {
    id: 'CAM-MEG-01',
    name: 'Megenagna Roundabout Flyover Cam 1',
    corridor: 'Megenagna Multi-Level Junction',
    status: 'active',
    type: 'ANPR + Overview',
    rfidReaderInstalled: true,
    rfidReaderStatus: 'online',
    coordinates: { lat: 9.0205, lng: 38.8021 },
    resolution: '4K Ultra HD',
    installationDate: '2025-10-10',
    lastHeartbeat: '3 minutes ago'
  },
  {
    id: 'CAM-PIZ-01',
    name: 'Churchill Ave / Piazza Post Office Cam',
    corridor: 'Piazza / Churchill Avenue',
    status: 'active',
    type: 'ANPR + Overview',
    rfidReaderInstalled: false,
    rfidReaderStatus: 'none',
    coordinates: { lat: 9.0345, lng: 38.7523 },
    resolution: '1080p Full HD',
    installationDate: '2025-11-01',
    lastHeartbeat: '5 minutes ago'
  },
  {
    id: 'CAM-KAL-01',
    name: 'Kaliti Expressway Gantry South',
    corridor: 'Kaliti Tollgate Interchange',
    status: 'active',
    type: 'Speed Radar + ANPR',
    rfidReaderInstalled: true,
    rfidReaderStatus: 'online',
    coordinates: { lat: 8.8950, lng: 38.7620 },
    resolution: '4K Ultra HD',
    installationDate: '2025-06-12',
    lastHeartbeat: 'Just now'
  }
];

export const INITIAL_PENALTY_RULES: PenaltyRule[] = [
  {
    category: 'red_light',
    title: 'Red-Light Crossing',
    description: 'Vehicle crossed intersection stop-bar after traffic signal display transitioned to solid red.',
    amountEtb: 1000,
    legalGazetteReference: 'Demonstration schedule (provisional FTA Guideline 2025/08)',
    pointsDeducted: 3
  },
  {
    category: 'intersection_blocking',
    title: 'Intersection Blocking (Yellow Box Gridlock)',
    description: 'Entering and stopping inside marked junction grid without an unobstructed exit lane, obstructing cross-traffic.',
    amountEtb: 800,
    legalGazetteReference: 'Demonstration schedule (provisional FTA Guideline 2025/08)',
    pointsDeducted: 2
  },
  {
    category: 'illegal_parking',
    title: 'Illegal Parking / Sidewalk Obstruction',
    description: 'Parking on pedestrian walkway, marked red curb, or designated bus rapid transit lane.',
    amountEtb: 500,
    legalGazetteReference: 'Demonstration schedule (provisional FTA Guideline 2025/08)',
    pointsDeducted: 1
  },
  {
    category: 'wrong_way',
    title: 'Wrong-Way Driving',
    description: 'Operating vehicle against established one-way corridor flow or divided arterial carriageway.',
    amountEtb: 1500,
    legalGazetteReference: 'Demonstration schedule (provisional FTA Guideline 2025/08)',
    pointsDeducted: 4
  }
];

// Seed incidents demonstrating all distinct workflow paths from Section 4 & 6
const RAW_INCIDENTS: Omit<Incident, 'calculatedRecommendation'>[] = [
  {
    id: 'INC-2026-AA-1042',
    timestamp: '2026-10-30T07:14:22+03:00',
    location: 'Meskel Square North Approach - Lane 2',
    corridorId: 'meskel_sq',
    plateNumber: 'DEMO-PLATE-001',
    plateRegion: 'ET-AA',
    rfidTagNumber: 'DEMO-TAG-001',
    rfidMatchStatus: 'verified_match',
    rfidAntennaId: 'ANT-MSQ-01',
    violationCategory: 'red_light',
    proposedAmountEtb: 1000,
    status: 'pending',
    evidenceQuality: 'clear',
    evidenceSupportsAllegation: 'supports',
    hasMitigatingCircumstance: false,
    isEmergencyVehicleOrEscort: false,
    checklist: {
      vehicleTypeVerified: true,
      plateCharactersVerified: true,
      correctLaneVerified: true,
      eventTimeVerified: true
    },
    vehicleOwnerName: 'Demo Owner 001',
    registeredOwnerDispute: 'none',
    decisionHistory: [],
    illustratedSceneType: 'red_light'
  },
  {
    id: 'INC-2026-AA-1043',
    timestamp: '2026-10-30T07:28:45+03:00',
    location: 'Mexico Square Roundabout - Sengatera Exit',
    corridorId: 'mexico_sq',
    plateNumber: 'DEMO-PLATE-002',
    plateRegion: 'ET-AA',
    rfidTagNumber: 'DEMO-TAG-002',
    rfidMatchStatus: 'mismatch', // MISMATCH CASE
    rfidAntennaId: 'ANT-MEX-01',
    violationCategory: 'intersection_blocking',
    proposedAmountEtb: 800,
    status: 'pending',
    evidenceQuality: 'clear',
    evidenceSupportsAllegation: 'supports',
    hasMitigatingCircumstance: false,
    isEmergencyVehicleOrEscort: false,
    checklist: {
      vehicleTypeVerified: true,
      plateCharactersVerified: true,
      correctLaneVerified: true,
      eventTimeVerified: true
    },
    vehicleOwnerName: 'Demo Owner 002',
    registeredOwnerDispute: 'owner_lookup_pending',
    disputeNotes: 'Camera OCR detected DEMO-PLATE-002, but roadside RFID antenna recorded tag assigned to chassis DEMO-CHASSIS-001 (Toyota Hiace van). Mismatch holds draft.',
    decisionHistory: [],
    illustratedSceneType: 'intersection'
  },
  {
    id: 'INC-2026-AA-1044',
    timestamp: '2026-10-30T07:45:10+03:00',
    location: 'Bole Road near Edna Mall - Northbound',
    corridorId: 'bole_road',
    plateNumber: 'DEMO-PLATE-003',
    plateRegion: 'ET-AA',
    rfidTagNumber: 'DEMO-TAG-003',
    rfidMatchStatus: 'verified_match',
    rfidAntennaId: 'ANT-BOL-01',
    violationCategory: 'wrong_way',
    proposedAmountEtb: 1500,
    status: 'pending',
    evidenceQuality: 'clear',
    evidenceSupportsAllegation: 'refutes', // REFUTES CASE (OFFICER DIRECTED DIVERSION)
    hasMitigatingCircumstance: true,
    mitigationDescription: 'Traffic police officer visibly on-site waving vehicles into temporary reverse lane around burst water main.',
    isEmergencyVehicleOrEscort: false,
    checklist: {
      vehicleTypeVerified: true,
      plateCharactersVerified: true,
      correctLaneVerified: true,
      eventTimeVerified: true
    },
    vehicleOwnerName: 'Demo Owner 003',
    registeredOwnerDispute: 'none',
    decisionHistory: [],
    illustratedSceneType: 'wrong_way'
  },
  {
    id: 'INC-2026-AA-1045',
    timestamp: '2026-10-30T08:02:18+03:00',
    location: 'Piazza Churchill Avenue - Curbside Footpath',
    corridorId: 'piazza',
    plateNumber: 'DEMO-PLATE-004',
    plateRegion: 'ET-AA',
    rfidTagNumber: undefined,
    rfidMatchStatus: 'no_reader_present',
    violationCategory: 'illegal_parking',
    proposedAmountEtb: 500,
    status: 'pending',
    evidenceQuality: 'clear',
    evidenceSupportsAllegation: 'supports',
    hasMitigatingCircumstance: true, // MITIGATION CASE -> WARNING
    mitigationDescription: 'Hazard lights flashing; driver transporting elderly patient to adjacent clinic with mobility impairment.',
    isEmergencyVehicleOrEscort: false,
    checklist: {
      vehicleTypeVerified: true,
      plateCharactersVerified: true,
      correctLaneVerified: true,
      eventTimeVerified: true
    },
    vehicleOwnerName: 'Demo Owner 004',
    registeredOwnerDispute: 'none',
    decisionHistory: [],
    illustratedSceneType: 'parking'
  },
  {
    id: 'INC-2026-AA-1046',
    timestamp: '2026-10-30T08:15:30+03:00',
    location: 'Megenagna Roundabout - Ring Road Exit',
    corridorId: 'megenagna',
    plateNumber: 'DEMO-PLATE-005',
    plateRegion: 'ET-OR',
    rfidTagNumber: 'DEMO-TAG-004',
    rfidMatchStatus: 'unreadable_tag',
    violationCategory: 'red_light',
    proposedAmountEtb: 1000,
    status: 'pending',
    evidenceQuality: 'poor', // POOR QUALITY CASE
    evidenceSupportsAllegation: 'inconclusive',
    hasMitigatingCircumstance: false,
    isEmergencyVehicleOrEscort: false,
    checklist: {
      vehicleTypeVerified: false,
      plateCharactersVerified: false,
      correctLaneVerified: true,
      eventTimeVerified: true
    },
    vehicleOwnerName: 'Unknown (Oromia Registry - Manual Check Needed)',
    registeredOwnerDispute: 'owner_lookup_pending',
    decisionHistory: [],
    illustratedSceneType: 'red_light'
  }
];

export const INITIAL_INCIDENTS: Incident[] = RAW_INCIDENTS.map(inc => ({
  ...inc,
  calculatedRecommendation: calculateIncidentRecommendation(inc)
}));

export const INITIAL_PEDESTRIAN_EVENTS: PedestrianEvent[] = [
  {
    id: 'PED-2026-081',
    timestamp: '2026-10-30T07:20:11+03:00',
    location: 'Megenagna Underpass West Entrance',
    corridor: 'Megenagna Multi-Level Junction',
    category: 'walking_in_carriageway',
    assessment: {
      accessibleCrossingExists: false,
      signalsWorkingProperly: false,
      footpathBlockedOrMissing: true,
      directConversationHeld: true,
      hasVerifiedPriorWarning: false,
      immediateAssistanceNeeded: false
    },
    outcome: 'infrastructure_referred',
    officerNotes: 'Pedestrian forced onto active road because construction debris has completely blocked the sidewalk.',
    infrastructureNotes: 'Referred to Yeka Sub-City Roads Authority for sidewalk clearance.'
  },
  {
    id: 'PED-2026-082',
    timestamp: '2026-10-30T07:50:44+03:00',
    location: 'Meskel Square Pedestrian Crossing - Stadium Side',
    corridor: 'Meskel Square Interchange',
    category: 'crossing_against_signal',
    assessment: {
      accessibleCrossingExists: true,
      signalsWorkingProperly: true,
      footpathBlockedOrMissing: false,
      directConversationHeld: true,
      hasVerifiedPriorWarning: false,
      immediateAssistanceNeeded: false
    },
    outcome: 'education_provided',
    officerNotes: 'Pedestrian stepped off curb during yellow amber transition; unaware of countdown timer meaning. Officer provided on-site safety explanation.'
  },
  {
    id: 'PED-2026-083',
    timestamp: '2026-10-30T08:10:05+03:00',
    location: 'Bole Road near Brass Hospital',
    corridor: 'Bole Road (Africa Avenue)',
    category: 'driver_failure_to_yield',
    assessment: {
      accessibleCrossingExists: true,
      signalsWorkingProperly: true,
      footpathBlockedOrMissing: false,
      directConversationHeld: false,
      hasVerifiedPriorWarning: false,
      immediateAssistanceNeeded: true
    },
    outcome: 'driver_enforcement_review',
    officerNotes: 'Minibus accelerated while pedestrian with cane was midway on marked zebra crossing. Critical safety review for driver.'
  }
];

export const INITIAL_INFRASTRUCTURE_REFERRALS: InfrastructureReferral[] = [
  {
    id: 'INF-2026-014',
    createdAt: '2026-10-30T07:22:00+03:00',
    corridor: 'Megenagna Multi-Level Junction',
    junction: 'Underpass West Pedestrian Path',
    issueType: 'sidewalk_encroachment',
    subCity: 'Yeka',
    severity: 'high',
    status: 'dispatched',
    notes: 'Sidewalk blocked by building aggregate piles forcing commuters into high-speed bus carriageway.'
  },
  {
    id: 'INF-2026-015',
    createdAt: '2026-10-29T16:40:00+03:00',
    corridor: 'Arat Kilo (King George VI St)',
    junction: 'Science Faculty Gate Crossing',
    issueType: 'pedestrian_button_broken',
    subCity: 'Arada',
    severity: 'medium',
    status: 'open',
    notes: 'Push-button audio buzzer non-responsive for visually impaired students crossing.'
  },
  {
    id: 'INF-2026-016',
    createdAt: '2026-10-28T11:15:00+03:00',
    corridor: 'Meskel Square Interchange',
    junction: 'Exhibition Center South Zebra Line',
    issueType: 'missing_zebra_crossing',
    subCity: 'Kirkos',
    severity: 'medium',
    status: 'open',
    notes: 'Thermal paint worn down after recent asphalt resurfacing; paint re-application required.'
  }
];

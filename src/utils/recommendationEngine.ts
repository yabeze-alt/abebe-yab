import { Incident, IncidentStatus } from '../types/traffic';

export interface RecommendationResult {
  recommendedStatus: IncidentStatus;
  reason: string;
  blockApproval: boolean;
  missingPrerequisites: string[];
}

/**
 * Deterministic recommendation engine for traffic incidents.
 * Strictly implements rules from Section 4 and 6 of project specification.
 */
export function calculateIncidentRecommendation(incident: Partial<Incident>): RecommendationResult {
  const missingPrerequisites: string[] = [];

  // Check 1: RFID & Plate Agreement
  if (incident.rfidMatchStatus === 'mismatch') {
    return {
      recommendedStatus: 'further_review',
      reason: 'RFID tag and camera plate reading mismatch detected. Penalty approval is blocked until manual verification can resolve the mismatch.',
      blockApproval: true,
      missingPrerequisites: ['RFID tag association verification']
    };
  }

  // Check 2: Evidence Quality
  if (!incident.evidenceQuality || incident.evidenceQuality === 'unknown') {
    missingPrerequisites.push('Evidence quality assessment');
  } else if (incident.evidenceQuality === 'poor') {
    return {
      recommendedStatus: 'further_review',
      reason: 'Evidence footage or still capture quality is poor or obstructed. Requires secondary camera review or supervisor clearance.',
      blockApproval: true,
      missingPrerequisites: ['Sufficient resolution or unobstructed capture']
    };
  }

  // Check 3: Evidence Allegation Alignment
  if (incident.evidenceSupportsAllegation === 'refutes') {
    return {
      recommendedStatus: 'dismissed',
      reason: 'Reviewed evidence clearly refutes the alleged violation. Driver actions did not breach traffic rules.',
      blockApproval: true,
      missingPrerequisites: []
    };
  }

  if (incident.evidenceSupportsAllegation === 'inconclusive' || incident.evidenceSupportsAllegation === 'unknown') {
    missingPrerequisites.push('Definitive determination of violation from footage');
  }

  // Check 4: Officer Verification Checklist
  const cl = incident.checklist || {
    vehicleTypeVerified: false,
    plateCharactersVerified: false,
    correctLaneVerified: false,
    eventTimeVerified: false,
  };

  if (!cl.vehicleTypeVerified) missingPrerequisites.push('Officer confirmation of vehicle make/type');
  if (!cl.plateCharactersVerified) missingPrerequisites.push('Officer character-by-character plate verification');
  if (!cl.correctLaneVerified) missingPrerequisites.push('Officer lane geometry confirmation');
  if (!cl.eventTimeVerified) missingPrerequisites.push('Officer event timestamp synchronization check');

  // Check 5: Emergency Vehicle or Escort
  if (incident.isEmergencyVehicleOrEscort) {
    return {
      recommendedStatus: 'further_review',
      reason: 'Vehicle identified as emergency responder, ambulance, police escort, or authorized emergency convoy.',
      blockApproval: true,
      missingPrerequisites: ['Emergency dispatch registry confirmation']
    };
  }

  // Check 6: Mitigating Circumstances
  if (incident.hasMitigatingCircumstance) {
    return {
      recommendedStatus: 'warning_recorded',
      reason: `Mitigating circumstance documented (${incident.mitigationDescription || 'Officer discretion / humanitarian or breakdown factor'}). Warning recommended instead of monetary penalty.`,
      blockApproval: false,
      missingPrerequisites: []
    };
  }

  // Check 7: Vehicle Case Disputes
  if (incident.registeredOwnerDispute === 'vehicle_reported_stolen') {
    return {
      recommendedStatus: 'further_review',
      reason: 'Vehicle has active stolen report flag with police authority. Penalty draft blocked for criminal investigation referral.',
      blockApproval: true,
      missingPrerequisites: ['Police stolen vehicle registry resolution']
    };
  }

  if (incident.registeredOwnerDispute === 'vehicle_sold_transferred' || incident.registeredOwnerDispute === 'driver_nominated_for_review') {
    return {
      recommendedStatus: 'further_review',
      reason: 'Ownership transfer or actual driver nomination has been flagged. Notice draft requires registry verification.',
      blockApproval: true,
      missingPrerequisites: ['Registration transfer document review']
    };
  }

  // If prerequisites are missing, route to further review
  if (missingPrerequisites.length > 0) {
    return {
      recommendedStatus: 'further_review',
      reason: `Case has ${missingPrerequisites.length} unverified requirement(s): ${missingPrerequisites.join(', ')}.`,
      blockApproval: true,
      missingPrerequisites
    };
  }

  // All checks satisfied: Clear evidence, verified association, completed checks, no exceptions
  return {
    recommendedStatus: 'approved_draft',
    reason: 'Clear supporting evidence verified. Plate matches vehicle, lane alignment confirmed, and no mitigating circumstances found. Ready for penalty draft approval.',
    blockApproval: false,
    missingPrerequisites: []
  };
}

import { Camera, CorridorInfo, GroundTruthAnnotation, Incident, InfrastructureReferral, PedestrianEvent, PenaltyRule, SignalOfflineDemand } from '../types/traffic';
import { INITIAL_CAMERAS, INITIAL_CORRIDORS, INITIAL_INCIDENTS, INITIAL_INFRASTRUCTURE_REFERRALS, INITIAL_PEDESTRIAN_EVENTS, INITIAL_PENALTY_RULES } from '../data/initialData';

const STORAGE_KEYS = {
  INCIDENTS: 'tpe_incidents_v2',
  CAMERAS: 'tpe_cameras_v2',
  CORRIDORS: 'tpe_corridors_v2',
  PEDESTRIAN_EVENTS: 'tpe_pedestrian_events_v2',
  INFRASTRUCTURE_REFERRALS: 'tpe_infra_referrals_v2',
  PENALTY_RULES: 'tpe_penalty_rules_v2',
  OFFLINE_SIGNAL_DEMAND: 'tpe_offline_signal_demand_v2',
  GROUND_TRUTH: 'tpe_ground_truth_v2',
  MAPS_API_KEY: 'tpe_maps_api_key_v1',
};

export const StorageService = {
  getIncidents(): Incident[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load incidents from localStorage', e);
    }
    return INITIAL_INCIDENTS;
  },

  saveIncidents(incidents: Incident[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
    } catch (e) {
      console.error('Failed to save incidents', e);
    }
  },

  getCameras(): Camera[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CAMERAS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load cameras', e);
    }
    return INITIAL_CAMERAS;
  },

  saveCameras(cameras: Camera[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CAMERAS, JSON.stringify(cameras));
    } catch (e) {
      console.error('Failed to save cameras', e);
    }
  },

  getCorridors(): CorridorInfo[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CORRIDORS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load corridors', e);
    }
    return INITIAL_CORRIDORS;
  },

  getPedestrianEvents(): PedestrianEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PEDESTRIAN_EVENTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load pedestrian events', e);
    }
    return INITIAL_PEDESTRIAN_EVENTS;
  },

  savePedestrianEvents(events: PedestrianEvent[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PEDESTRIAN_EVENTS, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save pedestrian events', e);
    }
  },

  getInfrastructureReferrals(): InfrastructureReferral[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INFRASTRUCTURE_REFERRALS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load referrals', e);
    }
    return INITIAL_INFRASTRUCTURE_REFERRALS;
  },

  saveInfrastructureReferrals(referrals: InfrastructureReferral[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INFRASTRUCTURE_REFERRALS, JSON.stringify(referrals));
    } catch (e) {
      console.error('Failed to save referrals', e);
    }
  },

  getPenaltyRules(): PenaltyRule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PENALTY_RULES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load penalty rules', e);
    }
    return INITIAL_PENALTY_RULES;
  },

  savePenaltyRules(rules: PenaltyRule[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PENALTY_RULES, JSON.stringify(rules));
    } catch (e) {
      console.error('Failed to save penalty rules', e);
    }
  },

  getOfflineDemand(): SignalOfflineDemand | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_SIGNAL_DEMAND);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load offline demand', e);
    }
    return null;
  },

  saveOfflineDemand(demand: SignalOfflineDemand): void {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_SIGNAL_DEMAND, JSON.stringify(demand));
    } catch (e) {
      console.error('Failed to save offline demand', e);
    }
  },

  getGroundTruthAnnotations(): GroundTruthAnnotation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GROUND_TRUTH);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load annotations', e);
    }
    return [];
  },

  saveGroundTruthAnnotations(annotations: GroundTruthAnnotation[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GROUND_TRUTH, JSON.stringify(annotations));
    } catch (e) {
      console.error('Failed to save annotations', e);
    }
  },

  getMapsApiKey(): string {
    return sessionStorage.getItem(STORAGE_KEYS.MAPS_API_KEY) || (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  },

  saveMapsApiKey(key: string): void {
    sessionStorage.setItem(STORAGE_KEYS.MAPS_API_KEY, key);
  },

  resetAllToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.INCIDENTS);
    localStorage.removeItem(STORAGE_KEYS.CAMERAS);
    localStorage.removeItem(STORAGE_KEYS.CORRIDORS);
    localStorage.removeItem(STORAGE_KEYS.PEDESTRIAN_EVENTS);
    localStorage.removeItem(STORAGE_KEYS.INFRASTRUCTURE_REFERRALS);
    localStorage.removeItem(STORAGE_KEYS.PENALTY_RULES);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_SIGNAL_DEMAND);
    localStorage.removeItem(STORAGE_KEYS.GROUND_TRUTH);
  },

  exportAllDataAsJson(): string {
    const fullBackup = {
      exportTimestamp: new Date().toISOString(),
      platform: 'Traffic Pulse Ethiopia',
      version: '2.0.0-pilot',
      incidents: this.getIncidents(),
      cameras: this.getCameras(),
      corridors: this.getCorridors(),
      pedestrianEvents: this.getPedestrianEvents(),
      infrastructureReferrals: this.getInfrastructureReferrals(),
      penaltyRules: this.getPenaltyRules(),
      offlineSignalDemand: this.getOfflineDemand(),
      groundTruthAnnotations: this.getGroundTruthAnnotations(),
    };
    return JSON.stringify(fullBackup, null, 2);
  }
};

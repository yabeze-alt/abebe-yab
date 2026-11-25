import { TrackedVehicle } from '../types/traffic';

export interface BoundingBox {
  bbox: [number, number, number, number]; // [x, y, width, height]
  class: string;
  score: number;
}

export interface TripwireStats {
  northboundCount: number;
  southboundCount: number;
  totalUniqueTracked: number;
  observedFlowRatePerMin: number;
  vehicleClassBreakdown: Record<string, number>;
}

export class VehicleCentroidTracker {
  private activeTracks: Map<string, TrackedVehicle> = new Map();
  private nextTrackNumber: number = 1;
  private maxDisappearedMs: number = 1500; // Track expires if not seen for 1.5s
  private distanceThreshold: number = 75; // Max pixel shift between frames for match

  // Tripwires (percentage of canvas height, e.g. 0.40 and 0.65)
  public northTripwireYPercent: number = 0.40;
  public southTripwireYPercent: number = 0.65;

  private northboundTotal: number = 0;
  private southboundTotal: number = 0;
  private trackedHistoryCount: number = 0;
  private classCountMap: Record<string, number> = {
    car: 0,
    bus: 0,
    truck: 0,
    motorcycle: 0,
    person: 0,
  };

  public update(detections: BoundingBox[], canvasWidth: number, canvasHeight: number, nowMs: number): TrackedVehicle[] {
    const northLineY = canvasHeight * this.northTripwireYPercent;
    const southLineY = canvasHeight * this.southTripwireYPercent;

    // Filter relevant road objects
    const relevant = detections.filter(d => 
      ['car', 'bus', 'truck', 'motorcycle', 'bicycle', 'person'].includes(d.class.toLowerCase())
    );

    const updatedTrackIds = new Set<string>();

    for (const det of relevant) {
      const [bx, by, bw, bh] = det.bbox;
      const cx = bx + bw / 2;
      const cy = by + bh / 2;

      // Find closest existing track
      let closestTrackId: string | null = null;
      let minDistance = Infinity;

      for (const [id, track] of this.activeTracks.entries()) {
        if (updatedTrackIds.has(id)) continue;

        const dist = Math.hypot(cx - track.x, cy - track.y);
        if (dist < minDistance && dist < this.distanceThreshold) {
          minDistance = dist;
          closestTrackId = id;
        }
      }

      if (closestTrackId) {
        // Update existing track
        const track = this.activeTracks.get(closestTrackId)!;
        const prevY = track.y;
        const dy = cy - prevY;
        const dtSeconds = Math.max(0.05, (nowMs - track.lastSeenMs) / 1000);

        // Direction classification
        let dir: TrackedVehicle['direction'] = track.direction;
        if (Math.abs(dy) > 3) {
          dir = dy > 0 ? 'Southbound' : 'Northbound';
        }

        // Virtual Tripwire Crossing with Deduplication Guard
        // Southbound vehicle crossing south line
        if (dir === 'Southbound' && prevY < southLineY && cy >= southLineY && !track.crossedSouthLine) {
          track.crossedSouthLine = true;
          this.southboundTotal++;
        }

        // Northbound vehicle crossing north line
        if (dir === 'Northbound' && prevY > northLineY && cy <= northLineY && !track.crossedNorthLine) {
          track.crossedNorthLine = true;
          this.northboundTotal++;
        }

        // Speed estimate based on normalized pixel drift
        const pixelSpeed = Math.hypot(cx - track.x, cy - track.y) / dtSeconds;
        const approxKmh = Math.min(80, Math.max(10, Math.round(pixelSpeed * 0.18)));

        track.x = cx;
        track.y = cy;
        track.width = bw;
        track.height = bh;
        track.lastSeenMs = nowMs;
        track.direction = dir;
        track.speedEstimateKmh = approxKmh;
        track.confidence = det.score;

        updatedTrackIds.add(closestTrackId);
      } else {
        // Create new track with unique ID
        const newId = `VEH-${String(this.nextTrackNumber++).padStart(2, '0')}`;
        const newTrack: TrackedVehicle = {
          trackId: newId,
          classType: det.class,
          confidence: det.score,
          firstSeenMs: nowMs,
          lastSeenMs: nowMs,
          x: cx,
          y: cy,
          width: bw,
          height: bh,
          direction: 'Stationary',
          crossedNorthLine: cy <= northLineY,
          crossedSouthLine: cy >= southLineY,
          speedEstimateKmh: 35,
        };

        this.activeTracks.set(newId, newTrack);
        this.trackedHistoryCount++;

        const key = det.class.toLowerCase();
        this.classCountMap[key] = (this.classCountMap[key] || 0) + 1;

        updatedTrackIds.add(newId);
      }
    }

    // Prune expired tracks
    for (const [id, track] of this.activeTracks.entries()) {
      if (nowMs - track.lastSeenMs > this.maxDisappearedMs) {
        this.activeTracks.delete(id);
      }
    }

    return Array.from(this.activeTracks.values());
  }

  public getStats(): TripwireStats {
    const totalCount = this.northboundTotal + this.southboundTotal;
    return {
      northboundCount: this.northboundTotal,
      southboundCount: this.southboundTotal,
      totalUniqueTracked: this.trackedHistoryCount,
      observedFlowRatePerMin: Math.max(12, totalCount * 4), // Scaled to illustrative minute projection
      vehicleClassBreakdown: { ...this.classCountMap }
    };
  }

  public reset(): void {
    this.activeTracks.clear();
    this.nextTrackNumber = 1;
    this.northboundTotal = 0;
    this.southboundTotal = 0;
    this.trackedHistoryCount = 0;
    this.classCountMap = { car: 0, bus: 0, truck: 0, motorcycle: 0, person: 0 };
  }
}

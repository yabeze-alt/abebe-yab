import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  Radio, 
  FileText, 
  ShieldAlert, 
  ChevronRight, 
  Car, 
  AlertOctagon,
  Scale,
  UserCheck,
  Check,
  RotateCcw
} from 'lucide-react';
import { DecisionHistoryEntry, Incident, IncidentStatus, VerificationChecklist } from '../../types/traffic';
import { calculateIncidentRecommendation } from '../../utils/recommendationEngine';

interface IncidentReviewViewProps {
  incidents: Incident[];
  selectedIncidentId?: string;
  onUpdateIncident: (incident: Incident) => void;
  currentOfficer: string;
}

export const IncidentReviewView: React.FC<IncidentReviewViewProps> = ({
  incidents,
  selectedIncidentId,
  onUpdateIncident,
  currentOfficer
}) => {
  const [activeId, setActiveId] = useState<string>(selectedIncidentId || incidents[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | 'all'>('all');

  // Decision Form State
  const [selectedDecision, setSelectedDecision] = useState<IncidentStatus>('approved_draft');
  const [officerNotes, setOfficerNotes] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const activeIncident = incidents.find(i => i.id === activeId) || incidents[0];

  const filteredIncidents = incidents.filter(i => {
    if (filterStatus === 'all') return true;
    return i.status === filterStatus;
  });

  if (!activeIncident) {
    return (
      <div className="p-8 text-center text-neutral-500 bg-white border border-neutral-200 rounded-xl">
        No incidents available to review.
      </div>
    );
  }

  // Handle live toggle of checklist or inputs
  const handleToggleChecklist = (field: keyof VerificationChecklist) => {
    const updatedChecklist = {
      ...activeIncident.checklist,
      [field]: !activeIncident.checklist[field]
    };

    const updatedIncident: Incident = {
      ...activeIncident,
      checklist: updatedChecklist,
    };
    updatedIncident.calculatedRecommendation = calculateIncidentRecommendation(updatedIncident);
    onUpdateIncident(updatedIncident);
  };

  const handleUpdateField = <K extends keyof Incident>(field: K, value: Incident[K]) => {
    const updatedIncident: Incident = {
      ...activeIncident,
      [field]: value,
    };
    updatedIncident.calculatedRecommendation = calculateIncidentRecommendation(updatedIncident);
    onUpdateIncident(updatedIncident);
  };

  const handleApplyDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerNotes.trim()) {
      setFeedbackMessage('Officer review notes are mandatory before recording a decision.');
      return;
    }

    const recommendation = activeIncident.calculatedRecommendation;
    const isOverride = selectedDecision !== recommendation.recommendedStatus;

    // Strict Enforcement Rule from Section 4:
    // Missing essential evidence cannot be bypassed merely by entering an override!
    if (selectedDecision === 'approved_draft' && recommendation.blockApproval) {
      setFeedbackMessage(
        `Penalty Draft Approval Blocked: ${recommendation.reason} Essential evidence requirements cannot be bypassed.`
      );
      return;
    }

    if (isOverride && !overrideReason.trim()) {
      setFeedbackMessage('Overriding the system recommendation requires an explicit written reason.');
      return;
    }

    const historyEntry: DecisionHistoryEntry = {
      id: `DEC-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      officerName: currentOfficer,
      officerRole: 'Traffic Officer',
      decision: selectedDecision,
      recommendationOutcome: recommendation.recommendedStatus,
      overrideApplied: isOverride,
      overrideReason: isOverride ? overrideReason.trim() : undefined,
      notes: officerNotes.trim()
    };

    const updated: Incident = {
      ...activeIncident,
      status: selectedDecision,
      decisionHistory: [historyEntry, ...activeIncident.decisionHistory]
    };

    onUpdateIncident(updated);
    setOfficerNotes('');
    setOverrideReason('');
    setFeedbackMessage(`Decision recorded: ${selectedDecision.replace('_', ' ').toUpperCase()}`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const recommendation = activeIncident.calculatedRecommendation;

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="p-3.5 bg-emerald-950/5 border border-emerald-900/10 rounded-xl flex items-center justify-between text-xs text-neutral-800">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Human Officer Decision Authority:</strong> Automated cameras provide deterministic decision support only. Penalties are never issued automatically. Every case requires officer signature.
          </span>
        </div>
      </div>

      {/* Main Layout: Incident Queue List + Detailed Review Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filterable Case Queue */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white border border-neutral-200/80 rounded-xl p-3 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Case Queue ({filteredIncidents.length})
              </span>
            </div>

            {/* Status Filter Buttons */}
            <div className="flex flex-wrap gap-1 pt-2">
              {(['all', 'pending', 'approved_draft', 'warning_recorded', 'further_review', 'dismissed'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    filterStatus === st ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {st === 'all' ? 'All Cases' : st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredIncidents.map(inc => {
              const isSelected = inc.id === activeIncident.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => setActiveId(inc.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-600 shadow-2xs ring-1 ring-emerald-600'
                      : 'bg-white border-neutral-200/80 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-neutral-900">{inc.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      inc.status === 'pending' ? 'bg-amber-100 text-amber-900' :
                      inc.status === 'approved_draft' ? 'bg-emerald-100 text-emerald-900' :
                      inc.status === 'warning_recorded' ? 'bg-blue-100 text-blue-900' :
                      inc.status === 'dismissed' ? 'bg-neutral-100 text-neutral-700' :
                      'bg-purple-100 text-purple-900'
                    }`}>
                      {inc.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="font-medium text-neutral-800 truncate">{inc.location}</p>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-100">
                    <span className="font-mono">{inc.plateRegion} {inc.plateNumber}</span>
                    <span className="capitalize font-medium text-neutral-700">{inc.violationCategory.replace('_', ' ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Incident Dossier */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-neutral-200/80 rounded-xl p-5 shadow-2xs">
            {/* Header: Incident Summary */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-neutral-200">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold font-mono text-neutral-900">{activeIncident.id}</h2>
                  <span className="text-xs text-neutral-400 font-mono">·</span>
                  <span className="text-xs text-neutral-600 font-mono">
                    {new Date(activeIncident.timestamp).toLocaleString('en-GB', { timeZone: 'Africa/Addis_Ababa' })} (EAT)
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-0.5">{activeIncident.location}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-neutral-500 block">Proposed Penalty Amount</span>
                <span className="text-lg font-bold font-mono tabular-nums text-neutral-900">
                  {activeIncident.proposedAmountEtb} ETB
                </span>
              </div>
            </div>

            {/* Simulated Camera & Illustrated Evidence Scene */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-950 rounded-lg p-3 text-white flex flex-col justify-between min-h-[180px] border border-neutral-800">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>CAMERA OCR CAPTURE</span>
                  <span className="text-emerald-400 font-bold">PLATE CONFIRMED</span>
                </div>

                <div className="py-4 text-center">
                  <div className="inline-block px-4 py-2 border-2 border-neutral-100 rounded bg-neutral-900 text-white font-mono text-xl tracking-wider font-bold shadow-sm">
                    {activeIncident.plateRegion} · {activeIncident.plateNumber}
                  </div>
                  <span className="block text-[11px] text-neutral-400 mt-2">
                    Vehicle: Sedan / Toyota Corolla (Private)
                  </span>
                </div>

                <div className="text-[10px] text-neutral-400 flex justify-between font-mono">
                  <span>Corridor: {activeIncident.corridorId}</span>
                  <span>Frame: #41920</span>
                </div>
              </div>

              {/* RFID Reader Reconciliation Box (Section 6) */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60">
                    <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-emerald-600" />
                      RFID Reader Reconciliation
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      activeIncident.rfidMatchStatus === 'verified_match' ? 'bg-emerald-100 text-emerald-900' :
                      activeIncident.rfidMatchStatus === 'mismatch' ? 'bg-rose-100 text-rose-900 animate-pulse' :
                      'bg-neutral-200 text-neutral-800'
                    }`}>
                      {activeIncident.rfidMatchStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Roadside RFID Tag:</span>
                      <span className="font-mono font-semibold text-neutral-900">
                        {activeIncident.rfidTagNumber || 'No RFID Signal Detected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Antenna Gantry:</span>
                      <span className="font-mono text-neutral-700">{activeIncident.rfidAntennaId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Registered Owner:</span>
                      <span className="text-neutral-800 font-medium">{activeIncident.vehicleOwnerName || 'Registry Lookup Pending'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-200/60 text-[10px] text-neutral-500">
                  {activeIncident.rfidMatchStatus === 'mismatch' ? (
                    <span className="text-rose-700 font-semibold block">
                      ⚠ CRITICAL: Tag reading does not match camera plate OCR. Under project rules, penalty draft is automatically blocked.
                    </span>
                  ) : (
                    <span>RFID tag confirms physical presence of authorized transponder in target lane.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Officer 4-Point Mandatory Verification Checklist (Section 4) */}
            <div className="mt-5 p-4 bg-neutral-50 border border-neutral-200/70 rounded-xl">
              <span className="text-xs font-bold text-neutral-900 block mb-2 uppercase tracking-wider">
                Officer 4-Point Verification Checklist
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 bg-white rounded border border-neutral-200 cursor-pointer hover:bg-neutral-50">
                  <input
                    type="checkbox"
                    checked={activeIncident.checklist.vehicleTypeVerified}
                    onChange={() => handleToggleChecklist('vehicleTypeVerified')}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-neutral-800 font-medium">1. Vehicle make/type matches scene</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white rounded border border-neutral-200 cursor-pointer hover:bg-neutral-50">
                  <input
                    type="checkbox"
                    checked={activeIncident.checklist.plateCharactersVerified}
                    onChange={() => handleToggleChecklist('plateCharactersVerified')}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-neutral-800 font-medium">2. Plate characters manually confirmed</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white rounded border border-neutral-200 cursor-pointer hover:bg-neutral-50">
                  <input
                    type="checkbox"
                    checked={activeIncident.checklist.correctLaneVerified}
                    onChange={() => handleToggleChecklist('correctLaneVerified')}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-neutral-800 font-medium">3. Vehicle in alleged lane geometry</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white rounded border border-neutral-200 cursor-pointer hover:bg-neutral-50">
                  <input
                    type="checkbox"
                    checked={activeIncident.checklist.eventTimeVerified}
                    onChange={() => handleToggleChecklist('eventTimeVerified')}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-neutral-800 font-medium">4. Incident timestamp synchronized</span>
                </label>
              </div>
            </div>

            {/* Decision Support Inputs (Evidence Quality, Support, Exceptions, Disputes) */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-neutral-600 font-medium mb-1">Evidence Quality</label>
                <select
                  value={activeIncident.evidenceQuality}
                  onChange={(e) => handleUpdateField('evidenceQuality', e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="clear">Clear (Unobstructed)</option>
                  <option value="poor">Poor (Obscured/Low Res)</option>
                  <option value="unknown">Unknown / Unassessed</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Allegation Evidence Alignment</label>
                <select
                  value={activeIncident.evidenceSupportsAllegation}
                  onChange={(e) => handleUpdateField('evidenceSupportsAllegation', e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="supports">Supports Allegation</option>
                  <option value="refutes">Refutes Allegation</option>
                  <option value="inconclusive">Inconclusive</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Vehicle Case / Dispute Status</label>
                <select
                  value={activeIncident.registeredOwnerDispute}
                  onChange={(e) => handleUpdateField('registeredOwnerDispute', e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="none">No Dispute Flagged</option>
                  <option value="owner_lookup_pending">Owner Lookup Pending</option>
                  <option value="vehicle_sold_transferred">Vehicle Sold / Transferred</option>
                  <option value="vehicle_reported_stolen">Reported Stolen to Police</option>
                  <option value="driver_nominated_for_review">Nominated Actual Driver</option>
                </select>
              </div>
            </div>

            {/* Mitigations / Emergency Checkboxes */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={activeIncident.isEmergencyVehicleOrEscort}
                  onChange={(e) => handleUpdateField('isEmergencyVehicleOrEscort', e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="text-neutral-800">Emergency responder / official escort vehicle</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={activeIncident.hasMitigatingCircumstance}
                  onChange={(e) => handleUpdateField('hasMitigatingCircumstance', e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="text-neutral-800">Documented mitigating circumstance (e.g. breakdown, medical escort)</span>
              </label>
            </div>

            {/* Deterministic System Recommendation Box */}
            <div className={`mt-5 p-4 rounded-xl border text-xs ${
              recommendation.recommendedStatus === 'approved_draft' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' :
              recommendation.recommendedStatus === 'warning_recorded' ? 'bg-amber-50 border-amber-200 text-amber-950' :
              recommendation.recommendedStatus === 'dismissed' ? 'bg-neutral-100 border-neutral-300 text-neutral-900' :
              'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-black/10">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span className="font-bold uppercase tracking-wider">
                    Deterministic Recommendation: {recommendation.recommendedStatus.replace('_', ' ')}
                  </span>
                </div>
                {recommendation.blockApproval && (
                  <span className="px-2 py-0.5 bg-rose-600 text-white font-bold rounded text-[10px]">
                    PENALTY APPROVAL BLOCKED
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs leading-relaxed">{recommendation.reason}</p>
            </div>

            {/* Officer Final Decision Panel */}
            <form onSubmit={handleApplyDecision} className="mt-6 pt-5 border-t border-neutral-200 space-y-4 text-xs">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider block">
                Officer Final Adjudication
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['approved_draft', 'warning_recorded', 'further_review', 'dismissed'] as IncidentStatus[]).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedDecision(st)}
                    className={`py-2 px-3 rounded-lg border font-medium capitalize text-center transition-colors ${
                      selectedDecision === st
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs font-semibold'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {selectedDecision !== recommendation.recommendedStatus && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                  <span className="font-semibold text-amber-900 block">
                    Recommendation Override Detected
                  </span>
                  <p className="text-[11px] text-amber-800">
                    You have selected a decision that differs from the system recommendation. You must provide a formal justification.
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="Enter mandatory justification for overriding recommendation"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 border border-amber-300 rounded bg-white text-neutral-900"
                  />
                </div>
              )}

              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Officer Review Notes (Mandatory)
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Record verification notes, observations, or case disposition rationale..."
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {feedbackMessage && (
                <div className="p-3 bg-neutral-900 text-white rounded-lg text-xs font-medium">
                  {feedbackMessage}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-neutral-500 font-mono">
                  Signing Officer: {currentOfficer}
                </span>

                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Record Adjudication</span>
                </button>
              </div>
            </form>

            {/* Decision History & Audit Log */}
            {activeIncident.decisionHistory.length > 0 && (
              <div className="mt-6 pt-4 border-t border-neutral-200 text-xs">
                <span className="font-bold text-neutral-900 uppercase tracking-wider block mb-2">
                  Audit History ({activeIncident.decisionHistory.length})
                </span>
                <div className="space-y-2">
                  {activeIncident.decisionHistory.map(entry => (
                    <div key={entry.id} className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
                      <div className="flex items-center justify-between font-mono text-[11px] text-neutral-500">
                        <span>{new Date(entry.timestamp).toLocaleString('en-GB')} (EAT)</span>
                        <span className="font-semibold text-neutral-900 capitalize">{entry.decision.replace('_', ' ')}</span>
                      </div>
                      <p className="text-neutral-800 mt-1">{entry.notes}</p>
                      {entry.overrideApplied && (
                        <p className="text-amber-800 text-[11px] mt-0.5">Override Reason: {entry.overrideReason}</p>
                      )}
                      <span className="text-[10px] text-neutral-400 block mt-1">Recorded by: {entry.officerName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

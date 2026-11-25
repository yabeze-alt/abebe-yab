import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Building, 
  Plus, 
  FileText, 
  Send,
  Info,
  HeartHandshake,
  BookOpen
} from 'lucide-react';
import { InfrastructureReferral, PedestrianEvent } from '../../types/traffic';

interface PedestrianSafetyViewProps {
  events: PedestrianEvent[];
  referrals: InfrastructureReferral[];
  onAddReferral: (referral: InfrastructureReferral) => void;
  onUpdateEvent: (event: PedestrianEvent) => void;
}

export const PedestrianSafetyView: React.FC<PedestrianSafetyViewProps> = ({
  events,
  referrals,
  onAddReferral,
  onUpdateEvent
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'referrals'>('events');
  const [showReferralModal, setShowReferralModal] = useState<boolean>(false);

  // New referral form state
  const [corridor, setCorridor] = useState<string>('Meskel Square Interchange');
  const [junction, setJunction] = useState<string>('North Underpass Approach');
  const [issueType, setIssueType] = useState<InfrastructureReferral['issueType']>('missing_zebra_crossing');
  const [subCity, setSubCity] = useState<InfrastructureReferral['subCity']>('Kirkos');
  const [severity, setSeverity] = useState<InfrastructureReferral['severity']>('high');
  const [notes, setNotes] = useState<string>('');

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    const newRef: InfrastructureReferral = {
      id: `INF-2026-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      corridor,
      junction,
      issueType,
      subCity,
      severity,
      status: 'open',
      notes: notes.trim()
    };

    onAddReferral(newRef);
    setNotes('');
    setShowReferralModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Principle & Ethics Banner */}
      <div className="p-4 bg-emerald-950/5 border border-emerald-900/10 rounded-xl text-xs space-y-1.5 text-neutral-800">
        <div className="flex items-center gap-2 font-semibold text-emerald-900">
          <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Pedestrian Safety Principle: Education & Safe Infrastructure First</span>
        </div>
        <p className="text-neutral-600 leading-relaxed">
          The system protects vulnerable road users. Pedestrian knowledge or intent is <strong>never inferred from video footage or appearance</strong>, and <strong>no facial recognition is used</strong>. Where sidewalks are blocked, crossings missing, or signals broken, cases route to city infrastructure referrals. Driver responsibility is always evaluated independently.
        </p>
      </div>

      {/* Tabs and Quick Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-neutral-200 pb-3">
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'events' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Safety Incidents & Outreach ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'referrals' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Sub-City Infrastructure Referrals ({referrals.length})
          </button>
        </div>

        <button
          onClick={() => setShowReferralModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Generate Infrastructure Referral</span>
        </button>
      </div>

      {/* View 1: Pedestrian Safety Incidents */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map((evt) => (
              <div key={evt.id} className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 text-xs">
                    <span className="font-mono font-bold text-neutral-900">{evt.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      evt.outcome === 'education_provided' ? 'bg-emerald-100 text-emerald-900' :
                      evt.outcome === 'infrastructure_referred' ? 'bg-amber-100 text-amber-900' :
                      evt.outcome === 'driver_enforcement_review' ? 'bg-rose-100 text-rose-900' :
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      {evt.outcome.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="py-3 text-xs space-y-1.5">
                    <div className="font-semibold text-neutral-900 capitalize">
                      {evt.category.replace(/_/g, ' ')}
                    </div>
                    <p className="text-neutral-600">{evt.location}</p>

                    <div className="mt-3 p-2.5 bg-neutral-50 rounded-lg border border-neutral-200/60 space-y-1 text-[11px]">
                      <span className="font-bold text-neutral-800 block text-[10px] uppercase tracking-wider">
                        Infrastructure Checklist:
                      </span>
                      <div className="flex items-center justify-between text-neutral-600">
                        <span>Accessible crossing exists:</span>
                        <span className={evt.assessment.accessibleCrossingExists ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                          {evt.assessment.accessibleCrossingExists ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-600">
                        <span>Footpath blocked/missing:</span>
                        <span className={evt.assessment.footpathBlockedOrMissing ? 'text-rose-700 font-semibold' : 'text-emerald-700 font-semibold'}>
                          {evt.assessment.footpathBlockedOrMissing ? 'Yes (Hazard)' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-600">
                        <span>Direct conversation held:</span>
                        <span className="font-semibold text-neutral-800">
                          {evt.assessment.directConversationHeld ? 'Yes (In Person)' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    {evt.officerNotes && (
                      <p className="mt-2 text-[11px] text-neutral-700 italic border-l-2 border-emerald-600 pl-2">
                        "{evt.officerNotes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-mono">
                  <span>{new Date(evt.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} (EAT)</span>
                  <span>{evt.corridor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 2: Sub-City Infrastructure Referrals */}
      {activeTab === 'referrals' && (
        <div className="bg-white border border-neutral-200/80 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">
                Dispatched Sub-City Engineering Referrals ({referrals.length})
              </h2>
              <p className="text-xs text-neutral-500">
                Automated and officer-flagged infrastructure deficiencies forwarded to Addis Ababa Roads Authority
              </p>
            </div>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 font-medium">
                  <th className="py-2.5 px-3">Ticket ID</th>
                  <th className="py-2.5 px-3">Sub-City</th>
                  <th className="py-2.5 px-3">Corridor & Junction</th>
                  <th className="py-2.5 px-3">Deficiency Type</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Engineering Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-neutral-50">
                    <td className="py-3 px-3 font-mono font-bold text-neutral-900">{ref.id}</td>
                    <td className="py-3 px-3 font-semibold text-neutral-800">{ref.subCity}</td>
                    <td className="py-3 px-3 text-neutral-700">
                      <div>{ref.corridor}</div>
                      <div className="text-[11px] text-neutral-400">{ref.junction}</div>
                    </td>
                    <td className="py-3 px-3 capitalize text-neutral-800">
                      {ref.issueType.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ref.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                        ref.severity === 'high' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {ref.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        ref.status === 'dispatched' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        'bg-neutral-100 text-neutral-700'
                      }`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-neutral-600 max-w-xs">{ref.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900 mb-1">
              Refer Deficiency to Sub-City Roads Authority
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Submit an infrastructure correction ticket to resolve hazards discovered during pedestrian safety assessments.
            </p>

            <form onSubmit={handleCreateReferral} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Addis Sub-City</label>
                  <select
                    value={subCity}
                    onChange={(e) => setSubCity(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 bg-white"
                  >
                    <option value="Kirkos">Kirkos</option>
                    <option value="Bole">Bole</option>
                    <option value="Arada">Arada</option>
                    <option value="Yeka">Yeka</option>
                    <option value="Lideta">Lideta</option>
                    <option value="Nifas Silk-Lafto">Nifas Silk-Lafto</option>
                    <option value="Gullele">Gullele</option>
                    <option value="Addis Ketema">Addis Ketema</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 bg-white"
                  >
                    <option value="high">High</option>
                    <option value="critical">Critical (Immediate Risk)</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Deficiency Type</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 bg-white"
                >
                  <option value="missing_zebra_crossing">Missing or Faded Zebra Crossing</option>
                  <option value="sidewalk_encroachment">Sidewalk Encroachment / Construction Blockage</option>
                  <option value="signal_head_malfunction">Pedestrian Signal Head Outage</option>
                  <option value="pedestrian_button_broken">Push-Button Buzzer Broken</option>
                  <option value="poor_lighting">Inadequate Night Lighting</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Corridor & Specific Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Megenagna Underpass West Ramp"
                  value={junction}
                  onChange={(e) => setJunction(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Engineering Description & Action Needed</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why pedestrians are forced into traffic and required remediation..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReferralModal(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium transition-colors"
                >
                  Dispatch Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

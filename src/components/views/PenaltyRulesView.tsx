import React, { useState } from 'react';
import { Scale, RotateCcw, Save, Info, CheckCircle2 } from 'lucide-react';
import { PenaltyRule } from '../../types/traffic';
import { INITIAL_PENALTY_RULES } from '../../data/initialData';

interface PenaltyRulesViewProps {
  rules: PenaltyRule[];
  onUpdateRules: (rules: PenaltyRule[]) => void;
}

export const PenaltyRulesView: React.FC<PenaltyRulesViewProps> = ({
  rules,
  onUpdateRules
}) => {
  const [editableRules, setEditableRules] = useState<PenaltyRule[]>(rules);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleAmountChange = (index: number, newAmount: number) => {
    const updated = [...editableRules];
    updated[index] = { ...updated[index], amountEtb: newAmount };
    setEditableRules(updated);
  };

  const handleSave = () => {
    onUpdateRules(editableRules);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    setEditableRules(INITIAL_PENALTY_RULES);
    onUpdateRules(INITIAL_PENALTY_RULES);
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner (Section 11) */}
      <div className="p-4 bg-amber-950/5 border border-amber-900/10 rounded-xl text-xs space-y-1.5 text-neutral-800">
        <div className="flex items-center gap-2 font-semibold text-amber-900">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Demonstration Penalty Schedule (Section 11 Notice):</span>
        </div>
        <p className="text-neutral-600 leading-relaxed">
          These fine amounts and licence point deductions are demonstration values for algorithm testing and prototype workflow evaluation. They do <strong>not</strong> represent official, verified Ethiopian traffic fines. Official enforcement schedules can only be established through gazetted regulations issued by the Federal Transport Authority or the Addis Ababa City Administration.
        </p>
      </div>

      {/* Rules Table */}
      <div className="bg-white border border-neutral-200/80 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              Configurable Violation Penalty Schedule
            </h2>
            <p className="text-xs text-neutral-500">
              Edit proposed ETB fine amounts stored in your local browser profile
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-lg text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Schedule</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Demonstration penalty schedule saved to local storage.</span>
          </div>
        )}

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 font-medium">
                <th className="py-2.5 px-3">Violation Category</th>
                <th className="py-2.5 px-3">Standard Description</th>
                <th className="py-2.5 px-3">Proposed Policy Points</th>
                <th className="py-2.5 px-3">Proposed Fine (ETB)</th>
                <th className="py-2.5 px-3">Gazette Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {editableRules.map((rule, idx) => (
                <tr key={rule.category} className="hover:bg-neutral-50">
                  <td className="py-3 px-3 font-semibold text-neutral-900">
                    {rule.title}
                  </td>
                  <td className="py-3 px-3 text-neutral-600 max-w-sm">
                    {rule.description}
                  </td>
                  <td className="py-3 px-3 font-mono text-neutral-700">
                    {rule.pointsDeducted} pts (Proposed)
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="100"
                        step="50"
                        value={rule.amountEtb}
                        onChange={(e) => handleAmountChange(idx, parseInt(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-neutral-300 rounded font-mono font-bold text-neutral-900 bg-white"
                      />
                      <span className="font-mono text-neutral-500 font-medium">ETB</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-neutral-400 font-mono text-[11px]">
                    {rule.legalGazetteReference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

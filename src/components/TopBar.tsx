import React, { useState, useEffect } from 'react';
import { Menu, Clock, Shield, UserCheck, RefreshCw, Download } from 'lucide-react';
import { NavSection } from './Navigation';
import { StorageService } from '../utils/storage';

interface TopBarProps {
  activeSection: NavSection;
  onOpenMobileMenu: () => void;
  currentOfficer: string;
  onChangeOfficer: (officer: string) => void;
  onResetData: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeSection,
  onOpenMobileMenu,
  currentOfficer,
  onChangeOfficer,
  onResetData
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format in Africa/Addis_Ababa timezone (EAT, UTC+3)
      const formatted = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Addis_Ababa',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(now);
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const sectionTitles: Record<NavSection, { title: string; subtitle: string }> = {
    overview: { title: 'System Overview & Control', subtitle: 'Addis Ababa arterial network metrics' },
    video_lab: { title: 'Recorded Video Test Lab', subtitle: 'Continuous vehicle tracking, tripwires & ground truth' },
    traffic_map: { title: 'Corridor Traffic Map', subtitle: 'Addis Ababa, Adama & Bahir Dar arterial flows' },
    adaptive_signals: { title: 'Adaptive Traffic Signals', subtitle: 'Junction demand balancing & fail-safe simulation' },
    camera_network: { title: 'Camera & RFID Registry', subtitle: 'Deployed ANPR sensors, radar & roadside readers' },
    incident_review: { title: 'Incident Review & Decision Support', subtitle: 'Officer review, RFID reconciliation & draft penalties' },
    pedestrian_safety: { title: 'Pedestrian Safety & Education', subtitle: 'Infrastructure referrals, walkways & direct outreach' },
    penalty_rules: { title: 'Demonstration Penalty Schedule', subtitle: 'Provisional ETB amounts and policy parameters' },
  };

  const current = sectionTitles[activeSection];

  const handleExportJson = () => {
    const jsonStr = StorageService.exportAllDataAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic-pulse-ethiopia-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200/80 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Zone 1: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
          className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <span>Traffic Pulse Ethiopia</span>
            <span aria-hidden="true">/</span>
            <span className="text-emerald-800 font-semibold truncate">{current.title}</span>
          </div>
          <p className="text-xs text-neutral-400 truncate hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Zone 2: Addis Ababa Time & Operational Badge */}
      <div className="hidden lg:flex items-center gap-4 text-xs font-mono tabular-nums text-neutral-600 shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-100 border border-neutral-200/60">
          <Clock className="w-3.5 h-3.5 text-neutral-500" />
          <span>{currentTime || 'Loading Addis Time...'} (EAT)</span>
        </div>

        <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200/60 font-sans font-medium text-[11px]">
          <Shield className="w-3 h-3 text-emerald-600" />
          <span>Local Storage Pilot</span>
        </div>
      </div>

      {/* Zone 3: Officer selector & Export/Reset actions */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative flex items-center">
          <UserCheck className="w-4 h-4 text-neutral-400 absolute left-2.5 pointer-events-none" />
          <select
            value={currentOfficer}
            onChange={(e) => onChangeOfficer(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs font-medium text-neutral-800 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600 transition-colors cursor-pointer"
            aria-label="Active reviewing officer"
          >
            <option value="Traffic Officer Dawit (Badge #AA-409)">Officer Dawit (Badge #AA-409)</option>
            <option value="Senior Supervisor Almaz (Badge #AA-102)">Supervisor Almaz (Badge #AA-102)</option>
            <option value="Traffic Engineer Ermias (TMS-08)">Engineer Ermias (TMS-08)</option>
          </select>
        </div>

        <button
          onClick={handleExportJson}
          title="Export demonstration data as JSON"
          aria-label="Export JSON"
          className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg border border-neutral-200/70 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={onResetData}
          title="Reset demonstration data to default"
          aria-label="Reset Data"
          className="p-1.5 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-neutral-200/70 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

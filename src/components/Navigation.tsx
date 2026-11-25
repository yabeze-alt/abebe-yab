import React from 'react';
import { 
  LayoutDashboard, 
  Video, 
  Map as MapIcon, 
  Activity, 
  Camera, 
  AlertTriangle, 
  ShieldAlert, 
  Scale,
  Sparkles,
  Layers,
  X
} from 'lucide-react';

export type NavSection = 
  | 'overview' 
  | 'video_lab' 
  | 'traffic_map' 
  | 'adaptive_signals' 
  | 'camera_network' 
  | 'incident_review' 
  | 'pedestrian_safety' 
  | 'penalty_rules';

interface NavigationProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  pendingIncidentsCount: number;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  onSimulateIncident: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  onSelectSection,
  pendingIncidentsCount,
  mobileMenuOpen,
  onCloseMobileMenu,
  onSimulateIncident
}) => {
  const navItems: { id: NavSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
    { id: 'video_lab', label: 'Video Test Lab', icon: <Video className="w-4 h-4 shrink-0" /> },
    { id: 'traffic_map', label: 'Traffic Map', icon: <MapIcon className="w-4 h-4 shrink-0" /> },
    { id: 'adaptive_signals', label: 'Adaptive Signals', icon: <Activity className="w-4 h-4 shrink-0" /> },
    { id: 'camera_network', label: 'Camera Network', icon: <Camera className="w-4 h-4 shrink-0" /> },
    { 
      id: 'incident_review', 
      label: 'Incident Review', 
      icon: <AlertTriangle className="w-4 h-4 shrink-0" />,
      badge: pendingIncidentsCount > 0 ? pendingIncidentsCount : undefined
    },
    { id: 'pedestrian_safety', label: 'Pedestrian Safety', icon: <ShieldAlert className="w-4 h-4 shrink-0" /> },
    { id: 'penalty_rules', label: 'Penalty Rules', icon: <Scale className="w-4 h-4 shrink-0" /> },
  ];

  const content = (
    <div className="flex flex-col h-full bg-[#05291d] text-emerald-50 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-emerald-900/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/90 flex items-center justify-center font-bold text-white text-base tracking-wider shadow-sm border border-emerald-400/20">
            TP
          </div>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight leading-none whitespace-nowrap">
              Traffic Pulse
            </h1>
            <p className="text-[11px] text-emerald-400/80 font-mono tracking-wider mt-0.5 whitespace-nowrap">
              ETHIOPIA · ADDIS ABABA
            </p>
          </div>
        </div>
        {mobileMenuOpen && (
          <button 
            onClick={onCloseMobileMenu}
            aria-label="Close navigation"
            className="p-1 rounded-md text-emerald-300 hover:text-white hover:bg-emerald-800/40 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Primary Navigation List */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono tracking-wider text-emerald-400/60 uppercase">
          Control Navigation
        </div>
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectSection(item.id);
                onCloseMobileMenu();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                {item.icon}
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`px-2 py-0.5 text-xs rounded font-mono font-bold tabular-nums ${
                  isActive ? 'bg-emerald-800 text-white' : 'bg-amber-500/90 text-neutral-900'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Action & Prototype Status */}
      <div className="p-3 border-t border-emerald-900/40 space-y-2">
        <button
          onClick={onSimulateIncident}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-emerald-50 text-xs font-medium transition-colors border border-emerald-500/30 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Simulate Incident</span>
        </button>

        <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-900/50 text-[11px] leading-relaxed text-emerald-300/80">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-200 mb-1">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pilot Demonstration</span>
          </div>
          <p className="text-[10px] text-emerald-400/70">
            Records stored in browser storage. No real fines issued. Officer approval required.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-emerald-950/20 min-h-screen">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onCloseMobileMenu}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out md:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {content}
      </div>
    </>
  );
};

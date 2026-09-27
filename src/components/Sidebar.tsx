import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  BarChart3,
  CheckSquare,
  Terminal,
  ArrowRightLeft,
  MapPin,
  Users,
  AlertTriangle,
  Sliders,
  Bot,
  FileCheck2,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'upload'
  | 'profiling'
  | 'rules'
  | 'sql_checks'
  | 'reconciliation'
  | 'mapping'
  | 'duplicates'
  | 'exceptions'
  | 'simulator'
  | 'copilot'
  | 'test_cases'
  | 'reports'
  | 'gate_settings';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  criticalCount: number;
  unmatchedCount: number;
  duplicateCount: number;
  openExceptionsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  criticalCount,
  unmatchedCount,
  duplicateCount,
  openExceptionsCount,
}) => {
  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
    category?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      category: 'Core Analysis',
    },
    {
      id: 'upload',
      label: 'Data Ingestion & Mapping',
      icon: UploadCloud,
    },
    {
      id: 'profiling',
      label: 'Data Profiling',
      icon: BarChart3,
    },
    {
      id: 'rules',
      label: 'Validation Rules & Builder',
      icon: CheckSquare,
      category: 'Validation & Checks',
    },
    {
      id: 'sql_checks',
      label: 'SQL-Style Checks',
      icon: Terminal,
    },
    {
      id: 'reconciliation',
      label: 'Source → Target Recon',
      icon: ArrowRightLeft,
      badge: unmatchedCount,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'mapping',
      label: 'AI Mapping Assistant',
      icon: MapPin,
    },
    {
      id: 'duplicates',
      label: 'Duplicate Intelligence',
      icon: Users,
      badge: duplicateCount,
      badgeColor: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'exceptions',
      label: 'Exception Workbench',
      icon: AlertTriangle,
      badge: openExceptionsCount,
      badgeColor: criticalCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700',
      category: 'Remediation & Copilot',
    },
    {
      id: 'simulator',
      label: 'Quality Simulator',
      icon: Sliders,
    },
    {
      id: 'copilot',
      label: 'Migration Copilot AI',
      icon: Bot,
    },
    {
      id: 'test_cases',
      label: 'Test Cases & UAT',
      icon: FileCheck2,
      category: 'Governance & Output',
    },
    {
      id: 'reports',
      label: 'Executive Quality Report',
      icon: FileText,
    },
    {
      id: 'gate_settings',
      label: 'Readiness Gate Config',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-69px)] border-r border-slate-800">
      <div className="p-4 flex-1 py-4 space-y-6 overflow-y-auto">
        {/* Navigation Groups */}
        <div className="space-y-1">
          {navItems.map((item, idx) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <React.Fragment key={item.id}>
                {item.category && (
                  <div className={`text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 ${idx === 0 ? 'mb-2' : 'mt-5 mb-2'}`}>
                    {item.category}
                  </div>
                )}
                <button
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Migration Project Summary Card in Sidebar Footer */}
      <div className="p-4 border-t border-slate-800 text-xs bg-slate-950/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Target Scope</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
            Wave 1 Cutover
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          PeopleSoft HCM 9.2 → Workday 2026R2 Core HR & Compensation.
        </p>
      </div>
    </aside>
  );
};

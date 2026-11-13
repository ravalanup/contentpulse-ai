import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavView } from '../../types';
import {
  LayoutDashboard,
  Users,
  Film,
  Sliders,
  Sparkles,
  FlaskConical,
  Database,
  ShieldCheck,
  Activity,
  Bot,
  ChevronRight,
  Shield,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, qualityIncidents, experiments } = useApp();

  const openIncidentsCount = qualityIncidents.filter((i) => i.status !== 'Remediated').length;
  const criticalIncidentCount = qualityIncidents.filter(
    (i) => i.severity === 'Critical' && i.status !== 'Remediated'
  ).length;

  const pendingExpDecisions = experiments.filter((e) => e.status === 'Running' && e.decision === 'ship').length;

  const navItems: { id: NavView; label: string; icon: React.FC<{ className?: string }>; badge?: React.ReactNode }[] = [
    { id: 'executive', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'audience', label: 'Audience Intelligence', icon: Users },
    { id: 'content', label: 'Content Intelligence', icon: Film },
    { id: 'personalization', label: 'Personalization', icon: Sliders },
    { id: 'ai_insights', label: 'AI Insights', icon: Sparkles },
    {
      id: 'experimentation',
      label: 'Experimentation',
      icon: FlaskConical,
      badge: (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
          A/B Live
        </span>
      ),
    },
    { id: 'data_products', label: 'Data Products', icon: Database },
    {
      id: 'data_quality',
      label: 'Data Quality',
      icon: ShieldCheck,
      badge:
        criticalIncidentCount > 0 ? (
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            1 Crit
          </span>
        ) : openIncidentsCount > 0 ? (
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {openIncidentsCount} Open
          </span>
        ) : (
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
            Clean
          </span>
        ),
    },
    {
      id: 'model_health',
      label: 'AI / Model Health',
      icon: Activity,
      badge: (
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400">
          5 Ensembles
        </span>
      ),
    },
    {
      id: 'agent_workspace',
      label: 'Agent Workspace',
      icon: Bot,
      badge: (
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
          Governed
        </span>
      ),
    },
  ];

  return (
    <aside className="w-64 bg-[#0a0e17] border-r border-slate-800/90 flex flex-col justify-between shrink-0 select-none">
      {/* Navigation list */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
          Platform Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              id={`nav-item-${item.id}`}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge}
            </button>
          );
        })}
      </div>

      {/* Bottom Platform Architecture Card */}
      <div className="p-4 m-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            Governance Engine
          </span>
          <span className="text-[10px] font-mono text-emerald-400">Strict SLA</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          Data Product contracts enforce schemas and lineage across 8 downstream ML consumer tiers.
        </p>
        <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800/60">
          <span>SLA Target: 99.9%</span>
          <span className="text-cyan-400">P99: 34ms</span>
        </div>
      </div>
    </aside>
  );
};

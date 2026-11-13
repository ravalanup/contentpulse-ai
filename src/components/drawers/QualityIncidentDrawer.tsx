import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SlideOverDrawer } from '../common/SlideOverDrawer';
import { AlertTriangle, GitFork, CheckCircle, ArrowRight, ShieldAlert, Wrench, RefreshCw } from 'lucide-react';

export const QualityIncidentDrawer: React.FC = () => {
  const { selectedQualityIncident, closeQualityIncidentDrawer, remediateQualityIncident } = useApp();
  const [isExecuting, setIsExecuting] = useState(false);

  if (!selectedQualityIncident) return null;

  const isCritical = selectedQualityIncident.severity === 'Critical';
  const isRemediated = selectedQualityIncident.status === 'Remediated';

  const handleRemediate = () => {
    setIsExecuting(true);
    setTimeout(() => {
      remediateQualityIncident(selectedQualityIncident.id);
      setIsExecuting(false);
    }, 600);
  };

  return (
    <SlideOverDrawer
      isOpen={!!selectedQualityIncident}
      onClose={closeQualityIncidentDrawer}
      title={`Data Incident: ${selectedQualityIncident.dimension}`}
      subtitle={`Incident ID: ${selectedQualityIncident.id} • Detected ${selectedQualityIncident.detectedAt}`}
      widthClass="max-w-2xl"
      badge={
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
            isRemediated
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : isCritical
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
        >
          {isRemediated ? 'Remediated' : selectedQualityIncident.severity}
        </span>
      }
      headerActions={
        !isRemediated && (
          <button
            type="button"
            id="btn-execute-remediation"
            onClick={handleRemediate}
            disabled={isExecuting}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Remediating...
              </>
            ) : (
              <>
                <Wrench className="w-3.5 h-3.5" />
                {selectedQualityIncident.autoRemediationAction || 'Remediate Pipeline'}
              </>
            )}
          </button>
        )
      }
    >
      {/* Incident Status Banner */}
      <div
        className={`p-4 rounded-xl border ${
          isRemediated
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            : isCritical
            ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
            : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
        }`}
      >
        <div className="flex items-center gap-2 font-semibold text-sm mb-1">
          {isRemediated ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-4 h-4" />
          )}
          <span>Affected Entity: {selectedQualityIncident.dataProductName}</span>
        </div>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedQualityIncident.impactSummary}</p>
      </div>

      {/* Downstream Consumer Impact */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          Impacted Downstream Consumers & Models
        </h4>
        <div className="space-y-2">
          {selectedQualityIncident.impactedDownstreamConsumers.map((consumer, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
            >
              <span className="font-mono text-slate-200">{consumer}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  isRemediated ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                }`}
              >
                {isRemediated ? 'Pipeline Healthy' : 'Degraded / Blocked'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Lineage DAG Path */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <GitFork className="w-3.5 h-3.5 text-cyan-400" />
          Upstream to Downstream Lineage Trace
        </h4>

        <div className="space-y-2">
          {selectedQualityIncident.lineagePath.map((node, idx) => {
            const isTargetNode = idx === selectedQualityIncident.lineagePath.length - 2;
            const isFailureNode = node.includes('[FAIL');
            return (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div className="w-6 text-center font-mono text-[10px] text-slate-400">{idx + 1}</div>
                <div
                  className={`flex-1 p-2.5 rounded-lg font-mono border text-[11px] ${
                    isFailureNode
                      ? isRemediated
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/50 text-rose-200 font-semibold'
                      : isTargetNode
                      ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  {isFailureNode && isRemediated ? node.replace('[FAIL', '[RESOLVED') : node}
                </div>
                {idx < selectedQualityIncident.lineagePath.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Remediation */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-cyan-400" />
          Recommended Principal PM Remediation Action
        </h4>
        <p className="text-xs text-slate-200 leading-relaxed font-sans">
          {selectedQualityIncident.recommendedRemediation}
        </p>

        {isRemediated ? (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Remediation executed successfully. Schema quarantined, backfill completed, and downstream ML models re-calibrated.</span>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Clicking remediate will trigger data contract quarantine & unblock downstream models.
            </span>
            <button
              type="button"
              id="btn-trigger-remediation-inline"
              onClick={handleRemediate}
              disabled={isExecuting}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors disabled:opacity-50"
            >
              {isExecuting ? 'Remediating...' : selectedQualityIncident.autoRemediationAction || 'Remediate Now'}
            </button>
          </div>
        )}
      </div>
    </SlideOverDrawer>
  );
};

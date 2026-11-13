import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AgentExecutionPlan } from '../../types';
import {
  Bot,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Terminal,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const AgentWorkspace: React.FC = () => {
  const { runAgentTask, hasApiKey, setActiveView, updateExperimentDecision } = useApp();

  const [selectedAgentKey, setSelectedAgentKey] = useState<string>('retention');
  const [isRunning, setIsRunning] = useState(false);
  const [activePlan, setActivePlan] = useState<AgentExecutionPlan | null>(null);
  const [proposalStatus, setProposalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const agents = [
    {
      key: 'retention',
      name: 'Episodic Retention Investigator',
      role: 'Audience & Drop-off Diagnostics',
      description: 'Identifies serialized drama stalls between episodes 3 and 5, evaluating smart resume and recap hooks.',
      samplePrompt: 'Diagnose the 28% completion cliff in serialized sci-fi and formulate an automated retention rail proposal.',
    },
    {
      key: 'catalog',
      name: 'Catalog Gap Detector',
      role: 'Portfolio & Licensing Intelligence',
      description: 'Finds audience demand voids in search and completion where existing titles fail to satisfy intent.',
      samplePrompt: 'Scan catalog search queries with zero playback conversion among young adult cohorts to recommend licensing acquisitions.',
    },
    {
      key: 'recovery',
      name: 'Audience Recovery Agent',
      role: 'Lifecycle & Churn Mitigation',
      description: 'Constructs targeted high-affinity dynamic hero carousels for the 10.4M declining engagement subscribers.',
      samplePrompt: 'Assemble a weekend re-engagement campaign for subscribers with >60% churn probability.',
    },
    {
      key: 'experiment',
      name: 'Experiment Decision Support Agent',
      role: 'Statistical & Rollout Governance',
      description: 'Audits candidate ranking experiments against p-value thresholds, latency guardrails, and catalog diversity.',
      samplePrompt: 'Audit Personalized Home Ranking v2 and prepare a 100% full-fleet deployment plan.',
    },
  ];

  const currentAgent = agents.find((a) => a.key === selectedAgentKey) || agents[0];

  const handleExecuteAgent = async () => {
    setIsRunning(true);
    setProposalStatus('pending');
    try {
      const plan = await runAgentTask(currentAgent.name, currentAgent.samplePrompt);
      setActivePlan(plan);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleApproveProposal = () => {
    setProposalStatus('approved');
    // If the agent proposal is for experiment rollout, ship it!
    if (selectedAgentKey === 'experiment') {
      updateExperimentDecision('exp-01', 'ship');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <Bot className="w-5 h-5 text-cyan-400" />
          Autonomous Agent Workspace (Governed Human-in-the-Loop)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Specialized Principal Product Manager AI agents equipped with data product tool-use, causal verification, and strict human approval gates.
        </p>
      </div>

      {/* 4 Agent Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => {
          const isSelected = selectedAgentKey === agent.key;

          return (
            <div
              key={agent.key}
              onClick={() => {
                setSelectedAgentKey(agent.key);
                setActivePlan(null);
                setProposalStatus('pending');
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900/90 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-2">
                  <span>{agent.role}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>}
                </div>
                <h4 className="font-bold text-sm text-slate-100 mb-1">{agent.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{agent.description}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-cyan-400 font-medium">
                <span>Select Agent</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Agent Prompt & Tool Invocation Workspace */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Active Agent: {currentAgent.name}
              </span>
              <span className="text-xs font-mono text-slate-400">Human Approval Mandatory</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">Configured Agent Task Objective</h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-3xl">{currentAgent.samplePrompt}</p>
          </div>

          <button
            type="button"
            id="btn-run-agent-task"
            onClick={handleExecuteAgent}
            disabled={isRunning}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 shrink-0 self-start md:self-center"
          >
            {isRunning ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" /> Reasoning & Calling Tools...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Dispatch Autonomous Agent
              </>
            )}
          </button>
        </div>

        {/* Execution Plan & Tool Calling Trace */}
        {activePlan && (
          <div className="space-y-6 pt-2">
            {/* Step-by-step Tool Invocations */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Step-by-Step Tool Execution Trace ({activePlan.steps.length} Operations Completed)
              </h4>

              <div className="space-y-2.5 font-mono text-xs">
                {activePlan.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-cyan-400 font-bold">STEP {step.stepNumber}</span>
                        <span className="text-slate-100 font-semibold">{step.action}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans">
                        <strong className="text-slate-300">Tool: </strong>
                        <span className="text-cyan-300 font-mono">{step.toolUsed}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-300 font-sans bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                        {step.resultSummary}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {step.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Synthesized Proposal & Human-in-the-Loop Review Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/30 via-slate-900 to-blue-950/30 border border-cyan-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white">Agent Proposal (Pending Principal PM Sign-Off)</h4>
                </div>
                <span className="text-xs font-mono text-cyan-300">Execution Plan Confidence: 97.4%</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-2">
                <p className="font-medium text-cyan-300">{activePlan.proposedSolution.title}</p>
                <p className="text-slate-300">{activePlan.proposedSolution.description}</p>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex flex-wrap gap-4">
                  <span>
                    <strong className="text-slate-200">Impacted Products: </strong>
                    {activePlan.proposedSolution.impactedDataProducts.join(', ')}
                  </span>
                  <span>
                    <strong className="text-slate-200">Required Reviewer: </strong>
                    {activePlan.proposedSolution.humanApprovalRequired ? 'Principal PM (You)' : 'None'}
                  </span>
                </div>
              </div>

              {/* Action Approval Controls */}
              {proposalStatus === 'approved' ? (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>
                      Proposal approved and executed into production pipelines. Configuration state updated!
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-400">Status: Enacted</span>
                </div>
              ) : proposalStatus === 'rejected' ? (
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-300 text-xs flex items-center justify-between">
                  <span>Proposal returned to agent for refinement. Zero changes committed.</span>
                  <button
                    type="button"
                    onClick={() => setProposalStatus('pending')}
                    className="text-cyan-400 underline text-xs"
                  >
                    Reset
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-slate-400">
                    Review the findings and approve to commit automated feature flags and pipeline triggers.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-reject-proposal"
                      onClick={() => setProposalStatus('rejected')}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      Reject / Modify
                    </button>
                    <button
                      type="button"
                      id="btn-approve-proposal"
                      onClick={handleApproveProposal}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center gap-1.5 shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve & Enact Proposal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

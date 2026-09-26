import React from 'react';
import { EvaluatedEdge, GridNode } from '../types/grid';

interface CurrentDecisionCardProps {
  currentStepIndex: number;
  totalSteps: number;
  evaluatingEdge: EvaluatedEdge | null;
  decision: 'selected' | 'rejected' | 'pending';
  reason?: string;
  nodes: GridNode[];
}

export const CurrentDecisionCard: React.FC<CurrentDecisionCardProps> = ({
  currentStepIndex,
  totalSteps,
  evaluatingEdge,
  decision,
  reason,
  nodes,
}) => {
  const getNodeName = (id: string) => nodes.find((n) => n.id === id)?.name || id;

  if (!evaluatingEdge || currentStepIndex === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-5 shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 text-xl font-bold mb-2">
          ⚡
        </div>
        <h3 className="text-base font-bold text-slate-800">Current Decision</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Ready to simulate. Click <strong className="text-blue-600">"Next Step"</strong> or{' '}
          <strong className="text-emerald-600">"Run Auto"</strong> to evaluate the cheapest transmission lines.
        </p>
      </div>
    );
  }

  const sourceName = getNodeName(evaluatingEdge.source);
  const targetName = getNodeName(evaluatingEdge.target);

  const isSelected = decision === 'selected';
  const isRejected = decision === 'rejected';

  return (
    <div
      className={`rounded-2xl border-2 p-5 shadow-md transition-all duration-300 ${
        isSelected
          ? 'bg-emerald-50/60 border-emerald-400 shadow-emerald-500/10'
          : isRejected
          ? 'bg-red-50/60 border-red-400 shadow-red-500/10'
          : 'bg-amber-50/60 border-amber-400 shadow-amber-500/10'
      }`}
    >
      {/* Top Banner: Step & Big Decision Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
            Step {currentStepIndex}/{totalSteps}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Current Decision
          </span>
        </div>

        {/* Big Decision Badge */}
        <span
          className={`px-3 py-1 text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1.5 ${
            isSelected
              ? 'bg-emerald-600 text-white animate-pulse'
              : isRejected
              ? 'bg-red-600 text-white animate-bounce'
              : 'bg-amber-500 text-white'
          }`}
        >
          {isSelected ? (
            <>
              <span>✓</span>
              <span>SELECTED FOR GRID</span>
            </>
          ) : isRejected ? (
            <>
              <span>✕</span>
              <span>REJECTED (CYCLE)</span>
            </>
          ) : (
            <>
              <span>⏳</span>
              <span>EVALUATING</span>
            </>
          )}
        </span>
      </div>

      {/* Edge Details Grid */}
      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        {/* Route */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Route Evaluated</span>
          <span className="text-sm font-black text-slate-900 block truncate mt-0.5">
            {sourceName} ↔ {targetName}
          </span>
        </div>

        {/* Cost */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Base Cost</span>
          <span className="text-sm font-black text-emerald-700 block mt-0.5">
            ₹{evaluatingEdge.cost} Lakhs
          </span>
        </div>

        {/* Cable Type */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Cable Architecture</span>
          <span className="text-sm font-bold text-slate-800 block capitalize mt-0.5">
            {evaluatingEdge.cableType === 'underground' ? '⚡ Underground' : '🗼 Overhead'}
          </span>
        </div>
      </div>

      {/* One-Line Reason Box */}
      <div
        className={`mt-3 p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
          isSelected
            ? 'bg-white border-emerald-300 text-emerald-950'
            : isRejected
            ? 'bg-white border-red-300 text-red-950'
            : 'bg-white border-amber-300 text-amber-950'
        }`}
      >
        <span className="text-base flex-shrink-0">
          {isSelected ? '🟢' : isRejected ? '🔴' : '🟡'}
        </span>
        <div className="leading-snug">
          <span className="font-extrabold uppercase mr-1.5 text-[11px] tracking-wide">
            {isSelected ? 'Rationale:' : isRejected ? 'Cycle Detected:' : 'Analysis:'}
          </span>
          {reason || (isSelected ? 'Connects separate grid components without a cycle.' : 'Redundant connection creates a closed loop.')}
        </div>
      </div>
    </div>
  );
};

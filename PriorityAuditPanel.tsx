import React from 'react';
import { PriorityAuditResult, GridNode } from '../types/grid';

interface PriorityAuditPanelProps {
  auditResults: PriorityAuditResult[];
  nodes: GridNode[];
  highlightedPathNodeIds: string[] | undefined;
  onHighlightPath: (pathNodeIds: string[]) => void;
  onClearHighlight: () => void;
}

export const PriorityAuditPanel: React.FC<PriorityAuditPanelProps> = ({
  auditResults,
  nodes,
  highlightedPathNodeIds,
  onHighlightPath,
  onClearHighlight,
}) => {
  const getNodeName = (id: string) => nodes.find((n) => n.id === id)?.name || id;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-red-50 text-red-600 font-bold text-base">
            🏥
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Priority Infrastructure Audit
            </h3>
            <p className="text-xs text-slate-500">
              Comparing clinic & school hop-distance against direct feeds
            </p>
          </div>
        </div>

        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          Threshold: &gt; 1 Hop
        </span>
      </div>

      {/* Audit Cards */}
      <div className="mt-3 space-y-2.5">
        {auditResults.map((audit) => {
          const isInspectingPath =
            highlightedPathNodeIds &&
            highlightedPathNodeIds[highlightedPathNodeIds.length - 1] === audit.nodeId;

          return (
            <div
              key={audit.nodeId}
              className={`p-3.5 rounded-xl border transition-all ${
                audit.isFlagged
                  ? 'bg-red-50/50 border-red-300 shadow-xs'
                  : 'bg-emerald-50/40 border-emerald-300'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {audit.priorityInfo.type === 'clinic' ? '🏥' : '🏫'}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                      {audit.nodeName} ({audit.priorityInfo.title})
                    </h4>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${
                    audit.isFlagged
                      ? 'bg-red-600 text-white border-red-700 animate-pulse'
                      : 'bg-emerald-600 text-white border-emerald-700'
                  }`}
                >
                  {audit.isFlagged ? '⚠️ FLAGGED: HIGH RISK' : '✓ ACCEPTABLE'}
                </span>
              </div>

              {/* Hop Stats Row */}
              <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    MST Hops
                  </span>
                  <span className="text-sm font-black text-slate-900 block mt-0.5">
                    {audit.mstHops} {audit.mstHops === 1 ? 'hop' : 'hops'}
                  </span>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Direct Line
                  </span>
                  <span className="text-sm font-black text-blue-700 block mt-0.5">
                    {audit.directHops} hop
                  </span>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Hop Gap
                  </span>
                  <span
                    className={`text-sm font-black block mt-0.5 ${
                      audit.isFlagged ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    +{audit.hopDifference} {audit.hopDifference === 1 ? 'hop' : 'hops'}
                  </span>
                </div>
              </div>

              {/* Concise Skipped Line Report */}
              {audit.skippedDirectLine ? (
                <div className="mt-2.5 bg-white p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-semibold">Skipped Direct Line:</span>
                    <span className="font-extrabold text-red-700">
                      {audit.skippedDirectLine.route} (Cost: ₹{audit.skippedDirectLine.cost}L)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-semibold">MST Path Received:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {audit.mstPath.map((id) => getNodeName(id)).join(' → ')}
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Highlight Route Button */}
              {audit.mstPath.length > 0 && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => {
                      if (isInspectingPath) {
                        onClearHighlight();
                      } else {
                        onHighlightPath(audit.mstPath);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      isInspectingPath
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>⚡</span>
                    <span>{isInspectingPath ? 'Hide Path' : 'Show Route on Map'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

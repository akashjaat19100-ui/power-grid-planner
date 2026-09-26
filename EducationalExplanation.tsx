import React, { useState } from 'react';
import { GridNode } from '../types/grid';

interface EducationalExplanationProps {
  disjointSets?: string[][];
  nodes: GridNode[];
}

export const EducationalExplanation: React.FC<EducationalExplanationProps> = ({
  disjointSets = [],
  nodes,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const getNodeLabel = (id: string) => nodes.find((n) => n.id === id)?.shortLabel || id;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
      {/* Header Button to Toggle Collapsible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 font-bold text-base">
            📚
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              How Kruskal’s Algorithm Works
            </h3>
            <p className="text-xs text-slate-500">
              Greedy minimum spanning tree construction with Union-Find Disjoint Sets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Complexity: O(E log E)
          </span>
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100 text-xs text-slate-600 space-y-4">
          {/* 5 Clear Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] inline-flex items-center justify-center mb-1.5">
                  1
                </span>
                <div className="font-bold text-slate-900 text-xs">Sort All Edges</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  All candidate transmission lines are sorted in ascending order of cost / effective weight.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] inline-flex items-center justify-center mb-1.5">
                  2
                </span>
                <div className="font-bold text-slate-900 text-xs">Pick Cheapest Line</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Examine the next cheapest candidate transmission line in the queue.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] inline-flex items-center justify-center mb-1.5">
                  3
                </span>
                <div className="font-bold text-slate-900 text-xs">Check for Cycles</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Use Union-Find to verify if endpoints already share an energized power path.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] inline-flex items-center justify-center mb-1.5">
                  4
                </span>
                <div className="font-bold text-slate-900 text-xs">Accept or Reject</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  If endpoints are separate, accept and union them. If redundant cycle, reject it.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] inline-flex items-center justify-center mb-1.5">
                  5
                </span>
                <div className="font-bold text-slate-900 text-xs">Connect All Nodes</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Stop as soon as (V - 1) lines are selected and every village is electrified.
                </p>
              </div>
            </div>
          </div>

          {/* Complexity Explanation */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800">Time Complexity: </span>
              <span className="font-mono text-blue-700 font-semibold">O(E log E)</span>
              <span className="text-slate-500 ml-1.5">
                due to initial edge sorting. Union-find operations with path compression run in near-linear O(α(V)) time.
              </span>
            </div>
          </div>

          {/* Live Union-Find Disjoint Set Clusters */}
          {disjointSets.length > 0 && (
            <div className="p-3 bg-slate-900 text-white rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Live Disjoint Sets (Connected Grid Clusters)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {disjointSets.length} {disjointSets.length === 1 ? 'Unified Grid' : 'Components'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {disjointSets.map((set, idx) => {
                  const hasSubstation = set.includes('substation');
                  return (
                    <div
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 ${
                        hasSubstation
                          ? 'bg-blue-950/80 border-blue-500/60 text-blue-200'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      <span>{hasSubstation ? '⚡ Main Grid:' : `Cluster #${idx + 1}:`}</span>
                      <span className="font-mono font-bold text-white">
                        {`{ ${set.map((id) => getNodeLabel(id)).join(', ')} }`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

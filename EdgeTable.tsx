import React from 'react';
import { EvaluatedEdge, GridNode, GridEdge } from '../types/grid';

interface EdgeTableProps {
  sortedEdges: EvaluatedEdge[];
  nodes: GridNode[];
  selectedEdgeIds: Set<string>;
  rejectedEdgeIds: Set<string>;
  currentEvaluatingEdgeId: string | null;
  onSelectEdge: (edge: GridEdge) => void;
}

export const EdgeTable: React.FC<EdgeTableProps> = ({
  sortedEdges,
  nodes,
  selectedEdgeIds,
  rejectedEdgeIds,
  currentEvaluatingEdgeId,
  onSelectEdge,
}) => {
  const getNodeLabel = (id: string) => nodes.find((n) => n.id === id)?.shortLabel || id;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-base">
            📊
          </span>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Candidate Transmission Lines (Kruskal Queue)
          </h3>
        </div>

        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          {sortedEdges.length} Lines
        </span>
      </div>

      {/* Table Container */}
      <div className="mt-3 overflow-x-auto max-h-[260px] overflow-y-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100/90 text-slate-700 font-bold sticky top-0 uppercase tracking-wider text-[10px] border-b border-slate-200 z-10 backdrop-blur-sm">
            <tr>
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">Route</th>
              <th className="py-2 px-3">Cost</th>
              <th className="py-2 px-3">Cable</th>
              <th className="py-2 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {sortedEdges.map((edge) => {
              const isSelected = selectedEdgeIds.has(edge.id);
              const isRejected = rejectedEdgeIds.has(edge.id);
              const isCurrent = currentEvaluatingEdgeId === edge.id;

              let rowBg = 'hover:bg-slate-50';
              let statusBadge = (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Pending
                </span>
              );

              if (isCurrent) {
                rowBg = 'bg-amber-100/90 ring-2 ring-inset ring-amber-500 font-bold';
                statusBadge = (
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-white shadow-xs animate-pulse">
                    Evaluating
                  </span>
                );
              } else if (isSelected) {
                rowBg = 'bg-emerald-50/50 text-emerald-950';
                statusBadge = (
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-600 text-white shadow-2xs">
                    ✓ Selected
                  </span>
                );
              } else if (isRejected) {
                rowBg = 'bg-red-50/40 text-red-950';
                statusBadge = (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700 border border-red-200">
                    ✕ Rejected
                  </span>
                );
              }

              return (
                <tr
                  key={edge.id}
                  onClick={() => onSelectEdge(edge)}
                  className={`cursor-pointer transition-colors duration-150 ${rowBg}`}
                >
                  <td className="py-2 px-3 font-mono font-bold text-slate-400">
                    #{edge.rank}
                  </td>
                  <td className="py-2 px-3 font-extrabold text-slate-800">
                    {getNodeLabel(edge.source)} – {getNodeLabel(edge.target)}
                  </td>
                  <td className="py-2 px-3 font-bold text-slate-900">
                    ₹{edge.cost}L
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        edge.cableType === 'underground'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {edge.cableType === 'underground' ? '⚡ Undergr' : '🗼 Overhead'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">{statusBadge}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

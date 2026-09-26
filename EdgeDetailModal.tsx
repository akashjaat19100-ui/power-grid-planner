import React from 'react';
import { GridEdge, EvaluatedEdge, GridNode } from '../types/grid';

interface EdgeDetailModalProps {
  edge: GridEdge | null;
  evalEdge?: EvaluatedEdge | null;
  nodes: GridNode[];
  selectedEdgeIds: Set<string>;
  rejectedEdgeIds: Set<string>;
  onClose: () => void;
}

export const EdgeDetailModal: React.FC<EdgeDetailModalProps> = ({
  edge,
  evalEdge,
  nodes,
  selectedEdgeIds,
  rejectedEdgeIds,
  onClose,
}) => {
  if (!edge) return null;

  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);

  const isSelected = selectedEdgeIds.has(edge.id);
  const isRejected = rejectedEdgeIds.has(edge.id);

  let statusBadge = (
    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-300">
      Pending Evaluation
    </span>
  );

  if (isSelected) {
    statusBadge = (
      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
        ✓ Selected in MST
      </span>
    );
  } else if (isRejected) {
    statusBadge = (
      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-300">
        ✕ Rejected (Cycle Detected)
      </span>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
            🔌
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {sourceNode?.name} ↔ {targetNode?.name}
            </h3>
            <span className="text-xs text-slate-500">Candidate Transmission Feeder</span>
          </div>
        </div>

        {/* Status */}
        <div className="mt-4 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-600">Algorithm Status:</span>
          {statusBadge}
        </div>

        {/* Technical Parameters */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-bold uppercase text-[10px] block">
              Base Installation Cost
            </span>
            <span className="text-lg font-extrabold text-slate-900">
              ₹{edge.cost} <span className="text-xs font-semibold text-slate-500">Lakhs</span>
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-bold uppercase text-[10px] block">
              Cable Architecture
            </span>
            <span className="text-sm font-extrabold capitalize text-slate-900 flex items-center gap-1 mt-1">
              {edge.cableType === 'underground' ? '⚡ Underground' : '🗼 Overhead'}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-bold uppercase text-[10px] block">
              Storm Risk Penalty
            </span>
            <span className="text-base font-extrabold text-amber-600">
              +{edge.riskPenalty}
            </span>
            <span className="text-[10px] text-slate-400 block">Environmental factor</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-bold uppercase text-[10px] block">
              Effective Weight
            </span>
            <span className="text-base font-extrabold text-blue-700">
              ₹{evalEdge?.effectiveWeight ?? edge.cost}
            </span>
            <span className="text-[10px] text-slate-400 block">Kruskal sort priority</span>
          </div>
        </div>

        {/* Rejection / Selection Reason if available */}
        {evalEdge?.rejectionReason && (
          <div className="mt-4 p-3 bg-red-50 text-red-900 rounded-xl border border-red-200 text-xs">
            <span className="font-bold block mb-1">Rejection Rationale:</span>
            {evalEdge.rejectionReason}
          </div>
        )}

        {/* Priority Village relevance */}
        {(sourceNode?.priority || targetNode?.priority) && (
          <div className="mt-3 p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-xs flex items-center gap-2">
            <span>⭐</span>
            <span>
              Connects priority facility:{' '}
              <strong>
                {sourceNode?.priority?.title || targetNode?.priority?.title}
              </strong>
            </span>
          </div>
        )}

        {/* Dismiss Button */}
        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

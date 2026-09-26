import React, { useState } from 'react';
import { GridNode, GridEdge, EvaluatedEdge } from '../types/grid';

interface NetworkVisualizationProps {
  nodes: GridNode[];
  edges: GridEdge[];
  sortedEdges: EvaluatedEdge[];
  selectedEdgeIds: Set<string>;
  rejectedEdgeIds: Set<string>;
  currentEvaluatingEdgeId: string | null;
  recentlyRejectedEdgeId: string | null;
  recentlySelectedEdgeId?: string | null;
  connectedNodeIds: Set<string>;
  highlightedPathNodeIds?: string[];
  onSelectEdge: (edge: GridEdge) => void;
  onSelectNode?: (node: GridNode) => void;
}

export const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  nodes,
  edges,
  sortedEdges,
  selectedEdgeIds,
  rejectedEdgeIds,
  currentEvaluatingEdgeId,
  recentlyRejectedEdgeId,
  recentlySelectedEdgeId,
  connectedNodeIds,
  highlightedPathNodeIds,
  onSelectEdge,
  onSelectNode,
}) => {
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const getNode = (id: string) => nodes.find((n) => n.id === id);

  const isEdgeInHighlightedPath = (edge: GridEdge): boolean => {
    if (!highlightedPathNodeIds || highlightedPathNodeIds.length < 2) return false;
    for (let i = 0; i < highlightedPathNodeIds.length - 1; i++) {
      const u = highlightedPathNodeIds[i];
      const v = highlightedPathNodeIds[i + 1];
      if (
        (edge.source === u && edge.target === v) ||
        (edge.source === v && edge.target === u)
      ) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 flex flex-col h-full relative overflow-hidden">
      {/* Card Header & 5-Second Judge Guide Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-blue-600 text-white font-bold text-lg shadow-sm">
            🗺️
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Village Network Map
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Live Topology
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Connecting rural villages to the power substation using Kruskal's algorithm
            </p>
          </div>
        </div>

        {/* 5-Second Quick Understanding Pill */}
        <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs">
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Green = Selected
          </span>
          <span className="text-slate-500">|</span>
          <span className="inline-flex items-center gap-1 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            Red = Cycle (Rejected)
          </span>
        </div>
      </div>

      {/* Large SVG Network Canvas Area */}
      <div className="relative flex-1 w-full min-h-[520px] lg:min-h-[570px] bg-gradient-to-b from-slate-50/90 to-slate-100/60 rounded-xl mt-3 border border-slate-200 overflow-hidden flex items-center justify-center">
        {/* Crisp grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none">
          <defs>
            <pattern id="network-grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#cbd5e1" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#network-grid)" />
        </svg>

        {/* Path Highlight Notice if active */}
        {highlightedPathNodeIds && highlightedPathNodeIds.length > 0 && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-amber-500 text-white font-bold px-3.5 py-1.5 rounded-full shadow-lg text-xs animate-pulse">
            <span>⚡ Highlighted Path:</span>
            <span className="font-mono">{highlightedPathNodeIds.join(' → ')}</span>
          </div>
        )}

        <svg
          viewBox="0 0 920 560"
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="glow-amber-eval" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#F59E0B" floodOpacity="0.9" />
            </filter>
            <filter id="glow-green-mst" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#16A34A" floodOpacity="0.8" />
            </filter>
            <filter id="glow-red-cycle" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#DC2626" floodOpacity="0.9" />
            </filter>
            <filter id="glow-path-active" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#D97706" floodOpacity="1" />
            </filter>
          </defs>

          {/* Edges Layer */}
          <g className="edges-layer">
            {edges.map((edge) => {
              const u = getNode(edge.source);
              const v = getNode(edge.target);
              if (!u || !v) return null;

              // Scale coordinates for expansive 920x560 canvas
              const scaleX = (val: number) => (val / 840) * 900 + 10;
              const scaleY = (val: number) => (val / 520) * 530 + 15;

              const uX = scaleX(u.x);
              const uY = scaleY(u.y);
              const vX = scaleX(v.x);
              const vY = scaleY(v.y);

              const isSelected = selectedEdgeIds.has(edge.id);
              const isRejected = rejectedEdgeIds.has(edge.id);
              const isEvaluating = currentEvaluatingEdgeId === edge.id;
              const isRecentRejected = recentlyRejectedEdgeId === edge.id;
              const isRecentSelected = recentlySelectedEdgeId === edge.id;
              const isHovered = hoveredEdgeId === edge.id;
              const inHighlightedPath = isEdgeInHighlightedPath(edge);

              const midX = (uX + vX) / 2;
              const midY = (uY + vY) / 2;

              let strokeColor = '#94A3B8';
              let strokeWidth = 3;
              let strokeDasharray = 'none';
              let filter = 'none';
              let opacity = 0.55;

              if (inHighlightedPath) {
                strokeColor = '#D97706';
                strokeWidth = 7;
                filter = 'url(#glow-path-active)';
                opacity = 1;
              } else if (isRecentRejected) {
                strokeColor = '#EF4444';
                strokeWidth = 6.5;
                filter = 'url(#glow-red-cycle)';
                strokeDasharray = '8,5';
                opacity = 1;
              } else if (isEvaluating) {
                strokeColor = '#F59E0B';
                strokeWidth = 6.5;
                filter = 'url(#glow-amber-eval)';
                opacity = 1;
              } else if (isSelected) {
                strokeColor = '#16A34A';
                strokeWidth = isRecentSelected ? 7 : 5.5;
                filter = 'url(#glow-green-mst)';
                opacity = 1;
              } else if (isRejected) {
                strokeColor = '#DC2626';
                strokeWidth = 3;
                strokeDasharray = '7,5';
                opacity = 0.5;
              } else {
                if (edge.cableType === 'underground') {
                  strokeColor = '#3B82F6';
                  strokeWidth = 3.5;
                  opacity = 0.6;
                } else {
                  strokeColor = '#475569';
                  strokeWidth = 3;
                  opacity = 0.5;
                }
              }

              if (isHovered && !isEvaluating && !inHighlightedPath) {
                strokeWidth += 2;
                opacity = 1;
              }

              return (
                <g
                  key={edge.id}
                  className="cursor-pointer group"
                  onClick={() => onSelectEdge(edge)}
                  onMouseEnter={() => setHoveredEdgeId(edge.id)}
                  onMouseLeave={() => setHoveredEdgeId(null)}
                >
                  {/* Broad transparent hitbox */}
                  <line x1={uX} y1={uY} x2={vX} y2={vY} stroke="transparent" strokeWidth={26} />

                  {/* Primary line */}
                  <line
                    x1={uX}
                    y1={uY}
                    x2={vX}
                    y2={vY}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    filter={filter}
                    opacity={opacity}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />

                  {/* Power Flow Animation for Selected MST Lines */}
                  {isSelected && (
                    <line
                      x1={uX}
                      y1={uY}
                      x2={vX}
                      y2={vY}
                      stroke="#86EFAC"
                      strokeWidth={2.5}
                      strokeDasharray="5,10"
                      strokeLinecap="round"
                      className="animate-pulse"
                      opacity={0.9}
                    />
                  )}

                  {/* Edge Midpoint Pill */}
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x={-36}
                      y={-15}
                      width={72}
                      height={30}
                      rx={7}
                      fill={
                        isSelected
                          ? '#F0FDF4'
                          : isRecentRejected
                          ? '#FEF2F2'
                          : isEvaluating
                          ? '#FFFBEB'
                          : '#FFFFFF'
                      }
                      stroke={
                        isSelected
                          ? '#86EFAC'
                          : isRecentRejected
                          ? '#EF4444'
                          : isEvaluating
                          ? '#FCD34D'
                          : '#CBD5E1'
                      }
                      strokeWidth={isEvaluating || isRecentRejected ? 2.5 : 1.2}
                      className="shadow-sm"
                    />

                    <text
                      x={0}
                      y={-2}
                      textAnchor="middle"
                      className={`text-[12px] font-black ${
                        isSelected
                          ? 'fill-emerald-800'
                          : isRejected
                          ? 'fill-red-700'
                          : 'fill-slate-900'
                      }`}
                    >
                      ₹{edge.cost}L
                    </text>

                    <text
                      x={0}
                      y={10}
                      textAnchor="middle"
                      className={`text-[9px] font-bold tracking-wider ${
                        edge.cableType === 'underground'
                          ? 'fill-blue-700'
                          : 'fill-slate-600'
                      }`}
                    >
                      {edge.cableType === 'underground' ? '⚡ UNDERGR' : '🗼 OVERHEAD'}
                    </text>

                    {/* Cycle Detected Floating Badge with Flash */}
                    {(isRecentRejected || (isRejected && isHovered)) && (
                      <g transform="translate(0, -28)" className="animate-bounce">
                        <rect
                          x={-56}
                          y={-12}
                          width={112}
                          height={24}
                          rx={12}
                          fill="#DC2626"
                          stroke="#FFFFFF"
                          strokeWidth={2}
                          filter="url(#glow-red-cycle)"
                        />
                        <text
                          x={0}
                          y={4}
                          textAnchor="middle"
                          fill="#FFFFFF"
                          className="text-[11px] font-black tracking-wide"
                        >
                          🚨 Cycle detected!
                        </text>
                      </g>
                    )}
                  </g>
                </g>
              );
            })}
          </g>

          {/* Nodes Layer */}
          <g className="nodes-layer">
            {nodes.map((node) => {
              const scaleX = (val: number) => (val / 840) * 900 + 10;
              const scaleY = (val: number) => (val / 520) * 530 + 15;

              const nX = scaleX(node.x);
              const nY = scaleY(node.y);

              const isConnected = connectedNodeIds.has(node.id) || node.isSubstation;
              const inHighlighted =
                highlightedPathNodeIds?.includes(node.id) || hoveredNodeId === node.id;

              return (
                <g
                  key={node.id}
                  className="cursor-pointer"
                  onClick={() => onSelectNode?.(node)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  {/* Rotating energized aura */}
                  {isConnected && (
                    <circle
                      cx={nX}
                      cy={nY}
                      r={node.isSubstation ? 42 : 32}
                      fill="none"
                      stroke={node.isSubstation ? '#2563EB' : '#16A34A'}
                      strokeWidth={2}
                      strokeDasharray="5,4"
                      className="animate-spin-slow opacity-70"
                    />
                  )}

                  {/* Main Circle */}
                  <circle
                    cx={nX}
                    cy={nY}
                    r={node.isSubstation ? 32 : 25}
                    fill={
                      node.isSubstation
                        ? '#0F172A'
                        : isConnected
                        ? '#16A34A'
                        : '#64748B'
                    }
                    stroke={
                      inHighlighted
                        ? '#F59E0B'
                        : node.isSubstation
                        ? '#3B82F6'
                        : '#FFFFFF'
                    }
                    strokeWidth={inHighlighted ? 5 : 3.5}
                    className="shadow-xl transition-all duration-300"
                  />

                  {/* Icon or Label inside Node */}
                  {node.isSubstation ? (
                    <g transform={`translate(${nX - 14}, ${nY - 14})`}>
                      <path
                        d="M15 2L3 16h11l-2 10 13-14h-11l2-10z"
                        fill="#F59E0B"
                        stroke="#F59E0B"
                        strokeWidth="0.8"
                      />
                    </g>
                  ) : (
                    <text
                      x={nX}
                      y={nY + 6}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      className="text-base font-black select-none"
                    >
                      {node.shortLabel}
                    </text>
                  )}

                  {/* Node Name Banner Below */}
                  <g transform={`translate(${nX}, ${nY + (node.isSubstation ? 44 : 36)})`}>
                    <rect
                      x={node.isSubstation ? -85 : -60}
                      y={-11}
                      width={node.isSubstation ? 170 : 120}
                      height={22}
                      rx={6}
                      fill="#FFFFFF"
                      stroke={node.isSubstation ? '#2563EB' : '#CBD5E1'}
                      strokeWidth={node.isSubstation ? 1.5 : 1}
                      className="shadow-sm"
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      className={`text-[11px] font-extrabold ${
                        node.isSubstation ? 'fill-blue-900' : 'fill-slate-800'
                      }`}
                    >
                      {node.isSubstation ? '⚡ MAIN SUBSTATION' : node.name}
                    </text>
                  </g>

                  {/* Priority Badge */}
                  {node.priority && (
                    <g transform={`translate(${nX + 16}, ${nY - 22})`}>
                      <circle
                        cx={0}
                        cy={0}
                        r={13}
                        fill={node.priority.type === 'clinic' ? '#DC2626' : '#2563EB'}
                        stroke="#FFFFFF"
                        strokeWidth={2.5}
                        className="animate-pulse shadow-md"
                      />
                      <text x={0} y={4.5} textAnchor="middle" className="text-[12px]">
                        {node.priority.type === 'clinic' ? '🏥' : '🏫'}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover Tooltip */}
        {hoveredEdgeId && (
          <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-md text-white text-xs px-3.5 py-2.5 rounded-xl shadow-2xl border border-slate-700 pointer-events-none z-30">
            {(() => {
              const edge = edges.find((e) => e.id === hoveredEdgeId);
              if (!edge) return null;
              const u = getNode(edge.source)?.name;
              const v = getNode(edge.target)?.name;
              const evalEdge = sortedEdges.find((e) => e.id === edge.id);
              return (
                <div>
                  <div className="font-bold text-amber-400 text-sm">
                    {u} ↔ {v}
                  </div>
                  <div className="text-slate-300 mt-1">
                    Type: <strong className="text-white capitalize">{edge.cableType}</strong>
                  </div>
                  <div className="text-slate-300">
                    Base Cost: <strong className="text-emerald-400">₹{edge.cost} Lakhs</strong>
                  </div>
                  <div className="text-slate-300">
                    Storm Risk Penalty: <strong className="text-amber-300">+{edge.riskPenalty}</strong>
                  </div>
                  {evalEdge && (
                    <div className="text-slate-300">
                      Effective Weight: <strong className="text-white">₹{evalEdge.effectiveWeight}</strong>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-y-2 text-xs text-slate-700 font-semibold">
        <span className="text-slate-900 font-bold flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          Visual Guide:
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-2 bg-emerald-600 rounded-full"></span>
            <span>Selected (MST)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-0 border-t-2 border-dashed border-red-600"></span>
            <span>Rejected Cycle</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-1.5 bg-blue-600 rounded-full"></span>
            <span>Underground Cable</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-1.5 bg-slate-800 rounded-full"></span>
            <span>Overhead Cable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

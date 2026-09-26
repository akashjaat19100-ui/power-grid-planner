import React from 'react';
import { SimulationMetrics } from '../types/grid';

interface MetricsCardsProps {
  metrics: SimulationMetrics;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Total Network Cost */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Total Network Cost
          </span>
          <span className="text-emerald-700 bg-emerald-100 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-emerald-300">
            Live ₹
          </span>
        </div>
        <div className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          ₹{metrics.totalCost}
          <span className="text-sm sm:text-base font-bold text-slate-400 ml-1">Lakhs</span>
        </div>
        <div className="mt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
          <span>↓ Saved ₹{metrics.costSaved}L vs all candidate lines</span>
        </div>
        <div className="absolute -bottom-3 -right-2 text-slate-100 font-black text-6xl pointer-events-none select-none">
          ₹
        </div>
      </div>

      {/* 2. Villages Connected */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Villages Connected
          </span>
          <span className="text-blue-700 bg-blue-100 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-blue-300">
            {Math.round((metrics.villagesConnected / metrics.totalVillages) * 100)}% Electrified
          </span>
        </div>
        <div className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {metrics.villagesConnected}{' '}
          <span className="text-lg font-bold text-slate-400">/ {metrics.totalVillages}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 mt-2.5 overflow-hidden border border-slate-200">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 shadow-sm"
            style={{
              width: `${(metrics.villagesConnected / metrics.totalVillages) * 100}%`,
            }}
          />
        </div>
        <div className="absolute -bottom-3 -right-2 text-slate-100 font-black text-6xl pointer-events-none select-none">
          🏠
        </div>
      </div>

      {/* 3. Selected Edges */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Selected Edges
          </span>
          <span className="text-indigo-700 bg-indigo-100 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-indigo-300">
            MST Target: {metrics.totalVillages}
          </span>
        </div>
        <div className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {metrics.selectedEdgesCount}{' '}
          <span className="text-lg font-bold text-slate-400">/ {metrics.totalVillages}</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 font-semibold flex items-center justify-between">
          <span>{metrics.rejectedCount} cycles avoided</span>
          <span className="text-slate-400">
            {metrics.overheadCount}🗼 / {metrics.undergroundCount}⚡
          </span>
        </div>
        <div className="absolute -bottom-3 -right-2 text-slate-100 font-black text-6xl pointer-events-none select-none">
          ⚡
        </div>
      </div>

      {/* 4. Reliability Score */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Reliability Score
          </span>
          <span
            className={`font-extrabold text-[10px] px-2 py-0.5 rounded-full border ${
              metrics.reliabilityScore >= 80
                ? 'text-emerald-800 bg-emerald-100 border-emerald-300'
                : 'text-amber-800 bg-amber-100 border-amber-300'
            }`}
          >
            {metrics.reliabilityScore >= 80 ? 'High Resilience' : 'Standard'}
          </span>
        </div>
        <div className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {metrics.reliabilityScore}%
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 mt-2.5 overflow-hidden border border-slate-200">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 shadow-sm ${
              metrics.reliabilityScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${metrics.reliabilityScore}%` }}
          />
        </div>
        <div className="absolute -bottom-3 -right-2 text-slate-100 font-black text-6xl pointer-events-none select-none">
          🛡️
        </div>
      </div>
    </div>
  );
};

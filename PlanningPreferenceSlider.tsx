import React from 'react';

interface PlanningPreferenceSliderProps {
  reliabilityFactor: number;
  onChangeFactor: (factor: number) => void;
}

export const PlanningPreferenceSlider: React.FC<PlanningPreferenceSliderProps> = ({
  reliabilityFactor,
  onChangeFactor,
}) => {
  return (
    <div className="bg-white rounded-2xl border-2 border-indigo-100 shadow-sm p-4 sm:p-5 flex flex-col">
      {/* Title & Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-base">
            ⚖️
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Planning Balance Slider
            </h3>
            <p className="text-xs text-slate-500">
              Control the trade-off between upfront installation cost vs storm reliability
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
          Reliability Weight: {(reliabilityFactor * 100).toFixed(0)}%
        </span>
      </div>

      {/* Slider Controls */}
      <div className="mt-3.5">
        <div className="flex items-center justify-between text-xs font-extrabold mb-1.5">
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            💰 Cost Focus (Overhead Preferred)
          </span>
          <span className="text-slate-400 font-normal text-[11px]">← Move Slider →</span>
          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            🛡️ Reliability Focus (Underground Preferred)
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={reliabilityFactor}
          onChange={(e) => onChangeFactor(parseFloat(e.target.value))}
          className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 shadow-inner"
        />

        {/* 5-Second Formula Bar */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <span className="font-bold text-slate-900">Formula:</span>
            <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-indigo-700 font-mono text-[11px]">
              effectiveWeight = cost + ({reliabilityFactor.toFixed(2)} × riskPenalty)
            </code>
          </div>
          <span className="text-slate-500 text-[11px] italic">
            Overhead cables receive higher storm penalties as reliability increases.
          </span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
  onReset: () => void;
  onRunFull: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  totalSteps,
  isComplete,
  onReset,
  onRunFull,
}) => {
  let badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
  let badgeText = 'Simulation Ready';

  if (isComplete) {
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    badgeText = 'MST Optimal Complete';
  } else if (currentStep > 0) {
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
    badgeText = `Evaluating: Step ${currentStep} of ${totalSteps}`;
  }

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-bold text-xl">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                RuralGrid Planner
              </h1>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${badgeColor} transition-all`}
              >
                {badgeText}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Cost-optimized village electrification using Kruskal’s Algorithm
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={onReset}
            className="flex-1 md:flex-initial inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition shadow-sm active:scale-95"
            title="Reset simulation back to start"
          >
            <svg
              className="w-4 h-4 mr-1.5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset Simulation
          </button>

          <button
            onClick={onRunFull}
            className="flex-1 md:flex-initial inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30 transition active:scale-95 border border-blue-500"
            title="Solve the complete Minimum Spanning Tree immediately"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Run Full Simulation
          </button>
        </div>
      </div>
    </header>
  );
};

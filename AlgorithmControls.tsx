import React from 'react';

interface AlgorithmControlsProps {
  currentStepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeedMs: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onChangeSpeed: (speedMs: number) => void;
}

export const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({
  currentStepIndex,
  totalSteps,
  isPlaying,
  playbackSpeedMs,
  onNextStep,
  onPrevStep,
  onTogglePlay,
  onReset,
  onChangeSpeed,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col">
      {/* Simulation Controls Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-base">
            ⚙️
          </span>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Simulation Controls
          </h3>
        </div>

        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          Step {currentStepIndex} of {totalSteps}
        </span>
      </div>

      {/* Control Action Buttons */}
      <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Previous Step */}
        <button
          onClick={onPrevStep}
          disabled={currentStepIndex <= 0}
          className="px-3 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 rounded-xl border border-slate-300 transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        {/* Next Step */}
        <button
          onClick={onNextStep}
          disabled={currentStepIndex >= totalSteps}
          className="px-3 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
        >
          Next Step
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Play/Pause */}
        <button
          onClick={onTogglePlay}
          className={`px-3 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
            isPlaying
              ? 'bg-amber-600 hover:bg-amber-500'
              : 'bg-emerald-600 hover:bg-emerald-500'
          }`}
        >
          {isPlaying ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Auto Play
            </>
          )}
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="px-3 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
        >
          Reset
        </button>
      </div>

      {/* Speed Slider */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <label htmlFor="speed-slider" className="font-semibold text-slate-700 flex items-center gap-1.5">
          <span>⏱️ Speed:</span>
          <span className="font-mono text-blue-600 font-bold">
            {(1000 / playbackSpeedMs).toFixed(1)}x
          </span>
        </label>
        <div className="flex items-center gap-2 w-44">
          <span className="text-[10px] text-slate-400">Slow</span>
          <input
            id="speed-slider"
            type="range"
            min="250"
            max="1800"
            step="50"
            value={2050 - playbackSpeedMs}
            onChange={(e) => onChangeSpeed(2050 - Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <span className="text-[10px] text-slate-400">Fast</span>
        </div>
      </div>
    </div>
  );
};

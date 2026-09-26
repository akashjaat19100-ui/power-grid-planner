import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { NetworkVisualization } from './components/NetworkVisualization';
import { CurrentDecisionCard } from './components/CurrentDecisionCard';
import { AlgorithmControls } from './components/AlgorithmControls';
import { EdgeTable } from './components/EdgeTable';
import { MetricsCards } from './components/MetricsCards';
import { PlanningPreferenceSlider } from './components/PlanningPreferenceSlider';
import { PriorityAuditPanel } from './components/PriorityAuditPanel';
import { EducationalExplanation } from './components/EducationalExplanation';
import { EdgeDetailModal } from './components/EdgeDetailModal';

import { INITIAL_NODES, INITIAL_EDGES } from './data/sampleNetwork';
import { computeSimulationSteps, computeMetrics } from './utils/kruskal';
import { auditPriorityVillages } from './utils/graph';
import { GridEdge, GridNode } from './types/grid';

export const App: React.FC = () => {
  // State
  const [nodes] = useState<GridNode[]>(INITIAL_NODES);
  const [edges] = useState<GridEdge[]>(INITIAL_EDGES);
  const [reliabilityFactor, setReliabilityFactor] = useState<number>(0.0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeedMs, setPlaybackSpeedMs] = useState<number>(900);
  const [inspectedEdge, setInspectedEdge] = useState<GridEdge | null>(null);
  const [highlightedPathNodeIds, setHighlightedPathNodeIds] = useState<string[] | undefined>(
    undefined
  );
  const [recentlyRejectedEdgeId, setRecentlyRejectedEdgeId] = useState<string | null>(null);
  const [recentlySelectedEdgeId, setRecentlySelectedEdgeId] = useState<string | null>(null);

  // Compute all simulation steps based on the current planning preference
  const { sortedEdges, steps, totalCandidateCost } = useMemo(() => {
    return computeSimulationSteps(nodes, edges, reliabilityFactor);
  }, [nodes, edges, reliabilityFactor]);

  // Current step state data
  const currentStepData = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;

  // Selected & Rejected edge IDs up to current step
  const selectedEdgeIds = useMemo(() => {
    return currentStepData ? currentStepData.selectedEdgeIds : new Set<string>();
  }, [currentStepData]);

  const rejectedEdgeIds = useMemo(() => {
    return currentStepData ? currentStepData.rejectedEdgeIds : new Set<string>();
  }, [currentStepData]);

  const connectedNodeIds = useMemo(() => {
    return currentStepData ? currentStepData.connectedNodeIds : new Set<string>();
  }, [currentStepData]);

  // Current evaluating edge
  const evaluatingEdge =
    currentStepIndex > 0 && currentStepIndex <= sortedEdges.length
      ? sortedEdges[currentStepIndex - 1]
      : null;

  const currentEvaluatingEdgeId = evaluatingEdge ? evaluatingEdge.id : null;

  // Metrics
  const metrics = useMemo(() => {
    return computeMetrics(
      nodes,
      edges,
      selectedEdgeIds,
      rejectedEdgeIds,
      connectedNodeIds,
      totalCandidateCost
    );
  }, [nodes, edges, selectedEdgeIds, rejectedEdgeIds, connectedNodeIds, totalCandidateCost]);

  // Priority Village Audit Results
  const priorityAuditResults = useMemo(() => {
    return auditPriorityVillages(nodes, edges, selectedEdgeIds, rejectedEdgeIds);
  }, [nodes, edges, selectedEdgeIds, rejectedEdgeIds]);

  // Auto-play timer
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      if (currentStepIndex >= sortedEdges.length) {
        setIsPlaying(false);
        return;
      }

      playTimerRef.current = setTimeout(() => {
        setCurrentStepIndex((prev) => {
          const next = prev + 1;
          if (next <= sortedEdges.length) {
            const step = steps[next - 1];
            if (step) {
              if (step.decision === 'rejected') {
                setRecentlyRejectedEdgeId(step.currentEdge.id);
                setTimeout(() => setRecentlyRejectedEdgeId(null), 1800);
              } else if (step.decision === 'selected') {
                setRecentlySelectedEdgeId(step.currentEdge.id);
                setTimeout(() => setRecentlySelectedEdgeId(null), 1400);
              }
            }
          }
          if (next >= sortedEdges.length) {
            setIsPlaying(false);
          }
          return next;
        });
      }, playbackSpeedMs);
    } else {
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }
    }

    return () => {
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, sortedEdges.length, playbackSpeedMs, steps]);

  // Step handlers
  const handleNextStep = () => {
    if (currentStepIndex < sortedEdges.length) {
      const next = currentStepIndex + 1;
      const step = steps[next - 1];
      if (step) {
        if (step.decision === 'rejected') {
          setRecentlyRejectedEdgeId(step.currentEdge.id);
          setTimeout(() => setRecentlyRejectedEdgeId(null), 1800);
        } else if (step.decision === 'selected') {
          setRecentlySelectedEdgeId(step.currentEdge.id);
          setTimeout(() => setRecentlySelectedEdgeId(null), 1400);
        }
      }
      setCurrentStepIndex(next);
    }
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleTogglePlay = () => {
    if (currentStepIndex >= sortedEdges.length) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setHighlightedPathNodeIds(undefined);
    setRecentlyRejectedEdgeId(null);
    setRecentlySelectedEdgeId(null);
  };

  const handleRunFull = () => {
    setIsPlaying(false);
    setCurrentStepIndex(sortedEdges.length);
  };

  const handlePlanningFactorChange = (factor: number) => {
    setIsPlaying(false);
    setReliabilityFactor(factor);
    setCurrentStepIndex(0);
    setHighlightedPathNodeIds(undefined);
    setRecentlyRejectedEdgeId(null);
    setRecentlySelectedEdgeId(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100">
      {/* 1. Header Area */}
      <Header
        currentStep={currentStepIndex}
        totalSteps={sortedEdges.length}
        isComplete={currentStepIndex === sortedEdges.length}
        onReset={handleReset}
        onRunFull={handleRunFull}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Dynamic 4 Prominent Metrics Cards */}
        <MetricsCards metrics={metrics} />

        {/* 2 & 3: Main Network Visualization (Left) and Algorithm Controls & Decisions (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT PANEL: Large Network Visualization (7 columns) */}
          <div className="lg:col-span-7 space-y-5">
            <NetworkVisualization
              nodes={nodes}
              edges={edges}
              sortedEdges={sortedEdges}
              selectedEdgeIds={selectedEdgeIds}
              rejectedEdgeIds={rejectedEdgeIds}
              currentEvaluatingEdgeId={currentEvaluatingEdgeId}
              recentlyRejectedEdgeId={recentlyRejectedEdgeId}
              recentlySelectedEdgeId={recentlySelectedEdgeId}
              connectedNodeIds={connectedNodeIds}
              highlightedPathNodeIds={highlightedPathNodeIds}
              onSelectEdge={(edge) => setInspectedEdge(edge)}
            />

            {/* Planning Preference Slider */}
            <PlanningPreferenceSlider
              reliabilityFactor={reliabilityFactor}
              onChangeFactor={handlePlanningFactorChange}
            />

            {/* Educational Explanation Collapsible */}
            <EducationalExplanation
              disjointSets={currentStepData?.disjointSets}
              nodes={nodes}
            />
          </div>

          {/* RIGHT PANEL: Controls, Current Decision & Priority Audit (5 columns) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Prominent Current Decision Card */}
            <CurrentDecisionCard
              currentStepIndex={currentStepIndex}
              totalSteps={sortedEdges.length}
              evaluatingEdge={evaluatingEdge}
              decision={currentStepData ? currentStepData.decision : 'pending'}
              reason={currentStepData?.reason}
              nodes={nodes}
            />

            {/* Streamlined Algorithm Controls */}
            <AlgorithmControls
              currentStepIndex={currentStepIndex}
              totalSteps={sortedEdges.length}
              isPlaying={isPlaying}
              playbackSpeedMs={playbackSpeedMs}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              onTogglePlay={handleTogglePlay}
              onReset={handleReset}
              onChangeSpeed={(spd) => setPlaybackSpeedMs(spd)}
            />

            {/* Priority Village Reliability Audit */}
            <PriorityAuditPanel
              auditResults={priorityAuditResults}
              nodes={nodes}
              highlightedPathNodeIds={highlightedPathNodeIds}
              onHighlightPath={(path) => setHighlightedPathNodeIds(path)}
              onClearHighlight={() => setHighlightedPathNodeIds(undefined)}
            />

            {/* Sorted Candidate Lines (Queue Table) */}
            <EdgeTable
              sortedEdges={sortedEdges}
              nodes={nodes}
              selectedEdgeIds={selectedEdgeIds}
              rejectedEdgeIds={rejectedEdgeIds}
              currentEvaluatingEdgeId={currentEvaluatingEdgeId}
              onSelectEdge={(edge) => setInspectedEdge(edge)}
            />
          </div>
        </div>
      </main>

      {/* Edge Details Modal */}
      <EdgeDetailModal
        edge={inspectedEdge}
        evalEdge={
          inspectedEdge
            ? sortedEdges.find((e) => e.id === inspectedEdge.id) || null
            : null
        }
        nodes={nodes}
        selectedEdgeIds={selectedEdgeIds}
        rejectedEdgeIds={rejectedEdgeIds}
        onClose={() => setInspectedEdge(null)}
      />

      {/* Footer */}
      <footer className="mt-auto py-3.5 border-t border-slate-200 bg-white text-center text-xs text-slate-500 font-medium">
        Educational simulation — results depend on selected planning preference.
      </footer>
    </div>
  );
};

export default App;

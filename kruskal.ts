import { GridNode, GridEdge, EvaluatedEdge, SimulationStep, SimulationMetrics } from '../types/grid';
import { DisjointSet } from './graph';

export function prepareSortedEdges(edges: GridEdge[], reliabilityFactor: number): EvaluatedEdge[] {
  return edges
    .map((e) => {
      const effectiveWeight = Math.round((e.cost + reliabilityFactor * e.riskPenalty) * 10) / 10;
      return {
        ...e,
        effectiveWeight,
        rank: 0,
        status: 'pending' as const,
      };
    })
    .sort((a, b) => {
      if (a.effectiveWeight !== b.effectiveWeight) {
        return a.effectiveWeight - b.effectiveWeight;
      }
      if (a.cost !== b.cost) {
        return a.cost - b.cost;
      }
      return a.id.localeCompare(b.id);
    })
    .map((e, idx) => ({
      ...e,
      rank: idx + 1,
    }));
}

export function computeSimulationSteps(
  nodes: GridNode[],
  edges: GridEdge[],
  reliabilityFactor: number
): {
  sortedEdges: EvaluatedEdge[];
  steps: SimulationStep[];
  totalCandidateCost: number;
} {
  const sortedEdges = prepareSortedEdges(edges, reliabilityFactor);
  const totalCandidateCost = edges.reduce((sum, e) => sum + e.cost, 0);

  const ds = new DisjointSet(nodes.map((n) => n.id));
  const selectedEdgeIds = new Set<string>();
  const rejectedEdgeIds = new Set<string>();
  const steps: SimulationStep[] = [];

  let runningCost = 0;
  let runningEffectiveCost = 0;
  const connectedNodeIds = new Set<string>();

  const substationId = nodes.find((n) => n.isSubstation)?.id || 'substation';

  sortedEdges.forEach((edge, index) => {
    const rootU = ds.find(edge.source);
    const rootV = ds.find(edge.target);

    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    const sourceLabel = sourceNode?.shortLabel || edge.source;
    const targetLabel = targetNode?.shortLabel || edge.target;

    let decision: 'selected' | 'rejected';
    let reason: string;

    if (rootU !== rootV) {
      // Valid edge, does not create cycle
      ds.union(edge.source, edge.target);
      selectedEdgeIds.add(edge.id);
      runningCost += edge.cost;
      runningEffectiveCost += edge.effectiveWeight;
      decision = 'selected';
      reason = `Accept: Connects disjoint power grids (${sourceLabel} & ${targetLabel}) without forming a cycle.`;
    } else {
      // Would create a cycle
      rejectedEdgeIds.add(edge.id);
      decision = 'rejected';
      reason = `Reject: Adding this edge creates an electrical cycle between ${sourceLabel} and ${targetLabel}.`;
    }

    // Determine nodes connected to substation
    const substationRoot = ds.find(substationId);
    connectedNodeIds.clear();
    nodes.forEach((n) => {
      if (ds.find(n.id) === substationRoot) {
        connectedNodeIds.add(n.id);
      }
    });

    const isMstComplete = selectedEdgeIds.size === nodes.length - 1;

    const evaluatedCurrent: EvaluatedEdge = {
      ...edge,
      status: decision,
      evaluationStep: index + 1,
      rejectionReason: decision === 'rejected' ? reason : undefined,
    };

    steps.push({
      stepNumber: index + 1,
      totalSteps: sortedEdges.length,
      currentEdge: evaluatedCurrent,
      decision,
      reason,
      selectedEdgeIds: new Set(selectedEdgeIds),
      rejectedEdgeIds: new Set(rejectedEdgeIds),
      disjointSets: ds.getGroups(),
      runningCost,
      runningEffectiveCost,
      connectedNodeIds: new Set(connectedNodeIds),
      isMstComplete,
    });
  });

  return { sortedEdges, steps, totalCandidateCost };
}

export function computeMetrics(
  nodes: GridNode[],
  allEdges: GridEdge[],
  selectedEdgeIds: Set<string>,
  rejectedEdgeIds: Set<string>,
  connectedNodeIds: Set<string>,
  totalCandidateCost: number
): SimulationMetrics {
  const selectedEdges = allEdges.filter((e) => selectedEdgeIds.has(e.id));
  const totalCost = selectedEdges.reduce((acc, e) => acc + e.cost, 0);

  const overheadCount = selectedEdges.filter((e) => e.cableType === 'overhead').length;
  const undergroundCount = selectedEdges.filter((e) => e.cableType === 'underground').length;

  const totalVillages = nodes.filter((n) => !n.isSubstation).length;
  const villagesConnected = nodes.filter(
    (n) => !n.isSubstation && connectedNodeIds.has(n.id)
  ).length;

  // Reliability Score Model:
  // Base 60%, +4% per underground cable, +2% per overhead cable connected to grid,
  // normalized to 100% when fully connected with high underground ratio.
  let rawScore = 0;
  if (selectedEdges.length > 0) {
    const undergroundRatio = undergroundCount / selectedEdges.length;
    const connectionRatio = villagesConnected / totalVillages;
    // Base score between 68% and 94% depending on underground proportion and connectivity
    rawScore = (68 + undergroundRatio * 26) * connectionRatio;
  }
  const reliabilityScore = Math.min(100, Math.round(rawScore));

  const costSaved = Math.max(0, totalCandidateCost - totalCost);

  return {
    totalCost,
    villagesConnected,
    totalVillages,
    selectedEdgesCount: selectedEdges.length,
    reliabilityScore,
    overheadCount,
    undergroundCount,
    rejectedCount: rejectedEdgeIds.size,
    totalCandidateCost,
    costSaved,
  };
}

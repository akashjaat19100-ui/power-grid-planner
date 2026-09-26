export type CableType = 'overhead' | 'underground';

export interface PriorityInfo {
  type: 'clinic' | 'school';
  title: string;
  facility: string;
  description: string;
}

export interface GridNode {
  id: string;
  name: string;
  shortLabel: string;
  x: number; // coordinate percentage 0-100 or SVG viewBox units
  y: number;
  isSubstation: boolean;
  priority?: PriorityInfo;
}

export interface GridEdge {
  id: string;
  source: string;
  target: string;
  cost: number; // in ₹ Lakhs
  cableType: CableType;
  riskPenalty: number;
  effectiveWeight?: number;
}

export type EdgeStatus = 'pending' | 'evaluating' | 'selected' | 'rejected';

export interface EvaluatedEdge extends GridEdge {
  rank: number;
  status: EdgeStatus;
  effectiveWeight: number;
  rejectionReason?: string;
  evaluationStep?: number;
}

export interface SimulationStep {
  stepNumber: number;
  totalSteps: number;
  currentEdge: EvaluatedEdge;
  decision: 'selected' | 'rejected';
  reason: string;
  selectedEdgeIds: Set<string>;
  rejectedEdgeIds: Set<string>;
  disjointSets: string[][];
  runningCost: number;
  runningEffectiveCost: number;
  connectedNodeIds: Set<string>;
  isMstComplete: boolean;
}

export interface PriorityAuditResult {
  nodeId: string;
  nodeName: string;
  priorityInfo: PriorityInfo;
  mstHops: number;
  mstPath: string[];
  skippedDirectLine?: {
    edgeId: string;
    route: string;
    cost: number;
    cableType: CableType;
    riskPenalty: number;
  };
  directHops: number; // always 1 if direct line exists
  hopDifference: number;
  isFlagged: boolean; // hopDifference > 1
  report: string;
}

export interface SimulationMetrics {
  totalCost: number;
  villagesConnected: number;
  totalVillages: number;
  selectedEdgesCount: number;
  reliabilityScore: number;
  overheadCount: number;
  undergroundCount: number;
  rejectedCount: number;
  totalCandidateCost: number;
  costSaved: number;
}

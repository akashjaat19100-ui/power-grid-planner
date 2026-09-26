import { GridNode, GridEdge, PriorityAuditResult } from '../types/grid';

export class DisjointSet {
  private parent: Map<string, string>;
  private rank: Map<string, number>;

  constructor(elements: string[]) {
    this.parent = new Map();
    this.rank = new Map();
    elements.forEach((el) => {
      this.parent.set(el, el);
      this.rank.set(el, 0);
    });
  }

  find(item: string): string {
    const root = this.parent.get(item);
    if (!root || root === item) {
      return item;
    }
    const compressed = this.find(root);
    this.parent.set(item, compressed);
    return compressed;
  }

  union(itemA: string, itemB: string): boolean {
    const rootA = this.find(itemA);
    const rootB = this.find(itemB);

    if (rootA === rootB) {
      return false; // Already connected -> cycle!
    }

    const rankA = this.rank.get(rootA) || 0;
    const rankB = this.rank.get(rootB) || 0;

    if (rankA < rankB) {
      this.parent.set(rootA, rootB);
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA);
    } else {
      this.parent.set(rootB, rootA);
      this.rank.set(rootA, rankA + 1);
    }

    return true;
  }

  getGroups(): string[][] {
    const groups = new Map<string, string[]>();
    for (const key of this.parent.keys()) {
      const root = this.find(key);
      if (!groups.has(root)) {
        groups.set(root, []);
      }
      groups.get(root)!.push(key);
    }
    return Array.from(groups.values()).map((g) => g.sort());
  }

  clone(): DisjointSet {
    const copy = new DisjointSet([]);
    this.parent.forEach((val, key) => copy.parent.set(key, val));
    this.rank.forEach((val, key) => copy.rank.set(key, val));
    return copy;
  }
}

/**
 * Finds the shortest path in the tree formed by selected edges between two nodes using BFS.
 */
export function findPathInMST(
  startId: string,
  endId: string,
  selectedEdges: GridEdge[]
): string[] | null {
  if (startId === endId) return [startId];

  const adj = new Map<string, string[]>();
  selectedEdges.forEach((edge) => {
    if (!adj.has(edge.source)) adj.set(edge.source, []);
    if (!adj.has(edge.target)) adj.set(edge.target, []);
    adj.get(edge.source)!.push(edge.target);
    adj.get(edge.target)!.push(edge.source);
  });

  const queue: string[] = [startId];
  const visited = new Set<string>([startId]);
  const parent = new Map<string, string>();

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr === endId) {
      // Reconstruct path
      const path: string[] = [];
      let step: string | undefined = endId;
      while (step !== undefined) {
        path.unshift(step);
        step = parent.get(step);
      }
      return path;
    }

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, curr);
        queue.push(neighbor);
      }
    }
  }

  return null; // Not connected
}

/**
 * Audits priority villages for hop distance vs direct line trade-offs.
 */
export function auditPriorityVillages(
  nodes: GridNode[],
  allEdges: GridEdge[],
  selectedEdgeIds: Set<string>,
  rejectedEdgeIds: Set<string>
): PriorityAuditResult[] {
  const substation = nodes.find((n) => n.isSubstation);
  if (!substation) return [];

  const selectedEdges = allEdges.filter((e) => selectedEdgeIds.has(e.id));
  const priorityNodes = nodes.filter((n) => n.priority);

  return priorityNodes.map((node) => {
    const path = findPathInMST(substation.id, node.id, selectedEdges) || [];
    const mstHops = path.length > 1 ? path.length - 1 : 0;

    // Look for candidate direct lines connecting this node to substation
    const directCandidateLines = allEdges.filter(
      (e) =>
        (e.source === substation.id && e.target === node.id) ||
        (e.source === node.id && e.target === substation.id)
    );

    // Look for rejected direct line
    const rejectedDirectLine = directCandidateLines
      .filter((e) => rejectedEdgeIds.has(e.id))
      .sort((a, b) => a.cost - b.cost)[0];

    let skippedDirectLine: PriorityAuditResult['skippedDirectLine'] = undefined;
    let hopDifference = 0;
    let isFlagged = false;
    let report = '';

    if (rejectedDirectLine) {
      const sourceNode = nodes.find((n) => n.id === rejectedDirectLine.source);
      const targetNode = nodes.find((n) => n.id === rejectedDirectLine.target);
      const route = `${sourceNode?.shortLabel || rejectedDirectLine.source} ↔ ${targetNode?.shortLabel || rejectedDirectLine.target}`;

      skippedDirectLine = {
        edgeId: rejectedDirectLine.id,
        route,
        cost: rejectedDirectLine.cost,
        cableType: rejectedDirectLine.cableType,
        riskPenalty: rejectedDirectLine.riskPenalty,
      };

      const directHops = 1;
      hopDifference = mstHops - directHops;
      isFlagged = hopDifference > 1;

      if (isFlagged) {
        report = `⚠️ High Reliability Risk: MST path is ${mstHops} hops (${path.join(' → ')}), which is ${hopDifference} hops longer than the direct candidate line (${route}, cost ₹${rejectedDirectLine.cost} Lakhs). Skipped line saved ₹${rejectedDirectLine.cost}L capital expenditure, but critical ${node.priority?.title} is now vulnerable to cascade outages across ${mstHops} series segments.`;
      } else {
        report = `✓ Acceptable Route: MST path is ${mstHops} hops (${path.join(' → ')}), only ${hopDifference} hop longer than direct candidate line (${route}, cost ₹${rejectedDirectLine.cost} Lakhs). Saved ₹${rejectedDirectLine.cost}L while maintaining acceptable delivery distance.`;
      }
    } else {
      // Direct line might have been accepted or no direct line existed
      const acceptedDirect = directCandidateLines.find((e) => selectedEdgeIds.has(e.id));
      if (acceptedDirect) {
        report = `✓ Direct Feed Secured: MST utilizes direct 1-hop transmission line (${node.shortLabel} ↔ Substation) with maximum reliability for ${node.priority?.title}.`;
      } else {
        report = `MST path is ${mstHops} hops (${path.join(' → ')}). No direct candidate line was planned for this village.`;
      }
    }

    return {
      nodeId: node.id,
      nodeName: node.name,
      priorityInfo: node.priority!,
      mstHops,
      mstPath: path,
      skippedDirectLine,
      directHops: skippedDirectLine ? 1 : mstHops,
      hopDifference,
      isFlagged,
      report,
    };
  });
}

/**
 * Graph data structures for the Relationship Map
 * Wraps timeline data with graph metadata
 */

import { TimelineBuilding, TimelineFigure } from './timelineData';

/**
 * A node in the relationship graph
 * Can represent either a building or a figure
 */
export interface GraphNode {
  id: string;
  label: string;
  type: 'building' | 'figure';
  data: TimelineBuilding | TimelineFigure;
  
  // Rendering metadata
  imageUrl?: string;
  color?: string; // Hex color or CSS class
  movementId?: string; // For color coding by movement
  size?: number; // Node size (default: radius in pixels)
}

/**
 * An edge in the relationship graph
 * Represents a similarity or relationship between two nodes
 */
export interface GraphEdge {
  source: string; // Node ID
  target: string; // Node ID
  similarity: number; // 0-1 score
  width?: number; // Edge width (default: derived from similarity)
}

/**
 * The full graph data structure
 */
export interface RelationshipGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    buildingCount: number;
    figureCount: number;
    edgeCount: number;
    similarityThreshold: number;
    generatedAt: string;
  };
}

/**
 * Convert buildings to graph nodes
 */
export function buildingsToNodes(
  buildings: TimelineBuilding[],
  movementColors: Map<string, string> = new Map()
): GraphNode[] {
  return buildings.map((building) => ({
    id: building.id,
    label: building.name,
    type: 'building' as const,
    data: building,
    imageUrl: building.imageUrl,
    movementId: building.movementId,
    color: building.movementId ? movementColors.get(building.movementId) : undefined,
    size: 12, // Default node size in pixels
  }));
}

/**
 * Convert figures to graph nodes
 */
export function figuresToNodes(
  figures: TimelineFigure[],
  movementColors: Map<string, string> = new Map()
): GraphNode[] {
  return figures.map((figure) => ({
    id: figure.id,
    label: figure.name,
    type: 'figure' as const,
    data: figure,
    imageUrl: figure.imageUrl,
    movementId: figure.movementId,
    color: figure.movementId ? movementColors.get(figure.movementId) : undefined,
    size: 10, // Slightly smaller for figures
  }));
}

/**
 * Create graph edges from similarity scores
 * Only includes edges above the threshold
 */
export function createEdgesFromSimilarities(
  similarities: Map<string, number>,
  threshold: number = 0.4
): GraphEdge[] {
  const edges: GraphEdge[] = [];
  
  similarities.forEach((similarity, key) => {
    if (similarity >= threshold) {
      const [source, target] = key.split('--');
      edges.push({
        source,
        target,
        similarity,
        width: Math.max(0.5, similarity * 3), // Width scales with similarity
      });
    }
  });
  
  return edges;
}

/**
 * Build a complete relationship graph from timeline data
 */
export function buildRelationshipGraph(
  buildings: TimelineBuilding[],
  figures: TimelineFigure[],
  similarities: Map<string, number>,
  similarityThreshold: number = 0.4,
  movementColors: Map<string, string> = new Map(),
  includeFigures: boolean = false
): RelationshipGraph {
  const nodes: GraphNode[] = [
    ...buildingsToNodes(buildings, movementColors),
    ...(includeFigures ? figuresToNodes(figures, movementColors) : []),
  ];

  const edges = createEdgesFromSimilarities(similarities, similarityThreshold);
  
  return {
    nodes,
    edges,
    metadata: {
      buildingCount: buildings.length,
      figureCount: figures.length,
      edgeCount: edges.length,
      similarityThreshold,
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Filter graph nodes based on criteria
 */
export interface NodeFilterCriteria {
  movementIds?: string[];
  macroIds?: string[];
  regionIds?: string[];
  materialIds?: string[];
  functionIds?: string[];
  nodeTypes?: ('building' | 'figure')[];
}

export function filterGraphNodes(
  nodes: GraphNode[],
  criteria: NodeFilterCriteria,
  movementMap: Map<string, any>, // ChildMovement
  macroMap: Map<string, any> // MacroMovement
): GraphNode[] {
  return nodes.filter((node) => {
    // Filter by node type
    if (criteria.nodeTypes && !criteria.nodeTypes.includes(node.type)) {
      return false;
    }
    
    // Filter by movement
    if (criteria.movementIds && node.movementId) {
      if (!criteria.movementIds.includes(node.movementId)) {
        return false;
      }
    }
    
    // Filter by macro era
    if (criteria.macroIds && node.movementId) {
      const movement = movementMap.get(node.movementId);
      if (!movement || !criteria.macroIds.includes(movement.parentMacroId)) {
        return false;
      }
    }
    
    // Filter by region (for buildings)
    if (criteria.regionIds && node.type === 'building') {
      const building = node.data as TimelineBuilding;
      if (!building.regionIds?.some(r => criteria.regionIds!.includes(r))) {
        return false;
      }
    }
    
    // Filter by materials (for buildings)
    if (criteria.materialIds && node.type === 'building') {
      const building = node.data as TimelineBuilding;
      if (!building.materialIds?.some(m => criteria.materialIds!.includes(m))) {
        return false;
      }
    }
    
    // Filter by function (for buildings)
    if (criteria.functionIds && node.type === 'building') {
      const building = node.data as TimelineBuilding;
      if (!building.functionIds?.some(f => criteria.functionIds!.includes(f))) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Filter graph edges: remove edges where source or target is not in nodeIds
 */
export function filterGraphEdges(
  edges: GraphEdge[],
  validNodeIds: Set<string>
): GraphEdge[] {
  return edges.filter(
    (edge) => validNodeIds.has(edge.source) && validNodeIds.has(edge.target)
  );
}

/**
 * Get statistics about the graph
 */
export function getGraphStats(graph: RelationshipGraph) {
  const avgSimilarity = graph.edges.length > 0
    ? graph.edges.reduce((sum, e) => sum + e.similarity, 0) / graph.edges.length
    : 0;
  
  const maxSimilarity = graph.edges.length > 0
    ? Math.max(...graph.edges.map(e => e.similarity))
    : 0;
  
  const nodesWithEdges = new Set<string>();
  graph.edges.forEach((e) => {
    nodesWithEdges.add(e.source);
    nodesWithEdges.add(e.target);
  });
  
  return {
    totalNodes: graph.nodes.length,
    totalEdges: graph.edges.length,
    connectedNodes: nodesWithEdges.size,
    orphanNodes: graph.nodes.length - nodesWithEdges.size,
    avgSimilarity,
    maxSimilarity,
  };
}

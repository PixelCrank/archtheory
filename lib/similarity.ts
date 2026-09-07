/**
 * Similarity scoring for timeline entries
 * Computes a weighted score (0-1) based on shared attributes
 */

import { TimelineBuilding, TimelineFigure, ChildMovement, MacroMovement } from './timelineData';

/**
 * Compute Jaccard similarity between two sets
 * Returns 0 if both sets are empty, 1 if identical, 0 if no overlap
 */
function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0; // No shared attributes to compare
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Compute similarity score between two buildings
 * Weights:
 *   - Same movement: 0.40 (strongest signal)
 *   - Same macro era: 0.15
 *   - Shared region tags: 0.15
 *   - Shared materials: 0.15
 *   - Shared functions: 0.10
 *   - Same architect: 0.05
 * Total weight: 1.0 → score normalized to 0-1
 */
export function computeBuildingSimilarity(
  buildingA: TimelineBuilding,
  buildingB: TimelineBuilding,
  movementMap: Map<string, ChildMovement>,
  macroMap: Map<string, MacroMovement>
): number {
  if (buildingA.id === buildingB.id) return 1; // Identical
  
  let score = 0;
  
  // 1. Same movement (40% weight)
  if (buildingA.movementId && buildingB.movementId && buildingA.movementId === buildingB.movementId) {
    score += 0.4;
  }
  
  // 2. Same macro era (15% weight)
  if (buildingA.movementId && buildingB.movementId) {
    const movementA = movementMap.get(buildingA.movementId);
    const movementB = movementMap.get(buildingB.movementId);
    
    if (movementA?.parentMacroId && movementB?.parentMacroId && movementA.parentMacroId === movementB.parentMacroId) {
      score += 0.15;
    }
  }
  
  // 3. Shared region tags (15% weight, using Jaccard)
  if (buildingA.regionIds && buildingB.regionIds) {
    const regionSimilarity = jaccardSimilarity(
      new Set(buildingA.regionIds),
      new Set(buildingB.regionIds)
    );
    score += regionSimilarity * 0.15;
  }
  
  // 4. Shared materials (15% weight, using Jaccard)
  if (buildingA.materialIds && buildingB.materialIds) {
    const materialSimilarity = jaccardSimilarity(
      new Set(buildingA.materialIds),
      new Set(buildingB.materialIds)
    );
    score += materialSimilarity * 0.15;
  }
  
  // 5. Shared function types (10% weight, using Jaccard)
  if (buildingA.functionIds && buildingB.functionIds) {
    const functionSimilarity = jaccardSimilarity(
      new Set(buildingA.functionIds),
      new Set(buildingB.functionIds)
    );
    score += functionSimilarity * 0.1;
  }
  
  // 6. Same architect (5% weight, exact string match)
  if (buildingA.architects && buildingB.architects && buildingA.architects.toLowerCase() === buildingB.architects.toLowerCase()) {
    score += 0.05;
  }
  
  return Math.min(score, 1.0); // Clamp to [0, 1]
}

/**
 * Compute similarity score between a building and a figure
 * Weights:
 *   - Figure is in building's movement: 0.3
 *   - Architect relationship: 0.2
 *   - Same macro era: 0.2
 *   - Shared major works: 0.15
 *   - Same region: 0.15
 */
export function computeBuildingFigureSimilarity(
  building: TimelineBuilding,
  figure: TimelineFigure,
  movementMap: Map<string, ChildMovement>
): number {
  let score = 0;
  
  // 1. Figure in same movement (30% weight)
  if (building.movementId && figure.movementId && building.movementId === figure.movementId) {
    score += 0.3;
  }
  
  // 2. Architect relationship (20% weight)
  // Check if this building's architect matches the figure's name
  if (building.architects && figure.name) {
    if (building.architects.toLowerCase().includes(figure.name.toLowerCase())) {
      score += 0.2;
    }
  }
  
  // 3. Same macro era (20% weight)
  if (building.movementId && figure.movementId) {
    const movementA = movementMap.get(building.movementId);
    const movementB = movementMap.get(figure.movementId);
    
    if (movementA?.parentMacroId && movementB?.parentMacroId && movementA.parentMacroId === movementB.parentMacroId) {
      score += 0.2;
    }
  }
  
  // 4. Figure has this building in their major works (15% weight)
  if (figure.majorWorkIds && figure.majorWorkIds.includes(building.id)) {
    score += 0.15;
  }
  
  return Math.min(score, 1.0);
}

/**
 * Compute all pairwise similarities for a dataset
 * Returns a Map of "buildingIdA-buildingIdB" → similarity score
 * Only stores scores > 0 to save memory
 */
export function computeAllSimilarities(
  buildings: TimelineBuilding[],
  movementMap: Map<string, ChildMovement>,
  macroMap: Map<string, MacroMovement>
): Map<string, number> {
  const similarities = new Map<string, number>();
  
  for (let i = 0; i < buildings.length; i++) {
    for (let j = i + 1; j < buildings.length; j++) {
      const similarity = computeBuildingSimilarity(
        buildings[i],
        buildings[j],
        movementMap,
        macroMap
      );
      
      if (similarity > 0) {
        const key = [buildings[i].id, buildings[j].id].sort().join('--');
        similarities.set(key, similarity);
      }
    }
  }
  
  return similarities;
}

/**
 * Get all buildings similar to a given building above a threshold
 */
export function getSimilarBuildings(
  buildingId: string,
  buildings: TimelineBuilding[],
  similarities: Map<string, number>,
  threshold: number = 0.4
): Array<{ building: TimelineBuilding; similarity: number }> {
  const similar: Array<{ building: TimelineBuilding; similarity: number }> = [];
  
  const buildingA = buildings.find(b => b.id === buildingId);
  if (!buildingA) return [];
  
  buildings.forEach((buildingB) => {
    if (buildingA.id === buildingB.id) return;
    
    const key = [buildingA.id, buildingB.id].sort().join('--');
    const similarity = similarities.get(key) || 0;
    
    if (similarity >= threshold) {
      similar.push({ building: buildingB, similarity });
    }
  });
  
  // Sort by similarity descending
  return similar.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Get the most similar buildings to a given building
 */
export function getMostSimilarBuildings(
  buildingId: string,
  buildings: TimelineBuilding[],
  similarities: Map<string, number>,
  limit: number = 5
): Array<{ building: TimelineBuilding; similarity: number }> {
  return getSimilarBuildings(buildingId, buildings, similarities, 0)
    .slice(0, limit);
}

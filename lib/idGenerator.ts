/**
 * Deterministic ID generation for timeline entities
 * Produces stable, URL-safe IDs based on entity names and metadata
 */

import crypto from 'crypto';

/**
 * Convert a string to a URL-safe slug
 */
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse consecutive hyphens
    .replace(/^-|-$/g, ''); // Trim leading/trailing hyphens
}

/**
 * Generate a short deterministic hash for collision detection
 */
function hashValue(text: string): string {
  return crypto
    .createHash('md5')
    .update(text)
    .digest('hex')
    .substring(0, 6);
}

/**
 * Generate a stable ID for a macro era
 * Pattern: macro-{slug}-{hash}
 */
export function generateMacroId(name: string, index?: number): string {
  const slug = toSlug(name);
  if (!slug) {
    // Fallback for empty names
    return `macro-${index || 'unknown'}`;
  }
  const hash = hashValue(name);
  return `macro-${slug}-${hash}`;
}

/**
 * Generate a stable ID for a movement
 * Pattern: move-{slug}-{hash}
 * Optionally includes parent macro ID for context
 */
export function generateMovementId(name: string, parentMacroId?: string, index?: number): string {
  const slug = toSlug(name);
  if (!slug) {
    return `move-${index || 'unknown'}`;
  }
  const hash = hashValue(name + (parentMacroId || ''));
  return `move-${slug}-${hash}`;
}

/**
 * Generate a stable ID for a building/signature work
 * Pattern: work-{slug}-{hash}
 * Includes movement ID for context
 */
export function generateBuildingId(name: string, movementId?: string, index?: number): string {
  const slug = toSlug(name);
  if (!slug) {
    return `work-${index || 'unknown'}`;
  }
  const hash = hashValue(name + (movementId || ''));
  return `work-${slug}-${hash}`;
}

/**
 * Generate a stable ID for a figure/theorist
 * Pattern: fig-{slug}-{hash}
 * Includes movement ID for context
 */
export function generateFigureId(name: string, movementId?: string, index?: number): string {
  const slug = toSlug(name);
  if (!slug) {
    return `fig-${index || 'unknown'}`;
  }
  const hash = hashValue(name + (movementId || ''));
  return `fig-${slug}-${hash}`;
}

/**
 * Generate a stable ID for a text/key writing
 * Pattern: text-{slug}-{hash}
 */
export function generateTextId(title: string, authorFigureId?: string, index?: number): string {
  const slug = toSlug(title);
  if (!slug) {
    return `text-${index || 'unknown'}`;
  }
  const hash = hashValue(title + (authorFigureId || ''));
  return `text-${slug}-${hash}`;
}

/**
 * Validate that an ID follows the expected format and patterns
 * Used for debugging/verification
 */
export function validateId(id: string, expectedType: string): boolean {
  if (!id || typeof id !== 'string') return false;
  
  const type = id.split('-')[0];
  return type === expectedType;
}

/**
 * Extract the readable slug portion from an ID
 * Example: "move-ancient-egyptian-a1b2c3" -> "ancient-egyptian"
 */
export function extractSlugFromId(id: string): string {
  if (!id) return '';
  
  const parts = id.split('-');
  if (parts.length < 2) return '';
  
  // Remove first part (type) and last part (hash)
  return parts.slice(1, -1).join('-');
}

/**
 * Extract the hash portion from an ID
 * Example: "move-ancient-egyptian-a1b2c3" -> "a1b2c3"
 */
export function extractHashFromId(id: string): string {
  if (!id) return '';
  
  const parts = id.split('-');
  return parts[parts.length - 1] || '';
}

export const IdGenerator = {
  macro: generateMacroId,
  movement: generateMovementId,
  building: generateBuildingId,
  figure: generateFigureId,
  text: generateTextId,
  validate: validateId,
  extractSlug: extractSlugFromId,
  extractHash: extractHashFromId,
};

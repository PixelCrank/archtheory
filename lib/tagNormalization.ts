/**
 * Tag normalization system for Materials, Function/Type, and Region
 * Converts raw sheet values to controlled vocabulary terms
 * Handles synonyms, typos, and variations
 */

export interface TagVocabulary {
  id: string;
  label: string;
  aliases: string[];
  category: string;
}

// ============================================================================
// MATERIALS VOCABULARY
// ============================================================================
export const MATERIALS_VOCABULARY: TagVocabulary[] = [
  // Stone & Masonry
  { id: 'ashlar-stone', label: 'Ashlar Stone', aliases: ['ashlar', 'cut stone', 'dressed stone'], category: 'stone' },
  { id: 'marble', label: 'Marble', aliases: ['marble stone', 'polished marble'], category: 'stone' },
  { id: 'limestone', label: 'Limestone', aliases: ['local limestone', 'limestone block'], category: 'stone' },
  { id: 'granite', label: 'Granite', aliases: ['granitic stone'], category: 'stone' },
  { id: 'sandstone', label: 'Sandstone', aliases: ['red sandstone', 'yellow sandstone'], category: 'stone' },
  { id: 'slate', label: 'Slate', aliases: ['slate stone'], category: 'stone' },
  { id: 'basalt', label: 'Basalt', aliases: ['basaltic stone'], category: 'stone' },
  { id: 'travertine', label: 'Travertine', aliases: ['travertine stone'], category: 'stone' },
  
  // Brick & Clay
  { id: 'brick', label: 'Brick', aliases: ['clay brick', 'fired brick', 'terracotta brick'], category: 'clay' },
  { id: 'terracotta', label: 'Terracotta', aliases: ['clay tiles', 'terra cotta'], category: 'clay' },
  { id: 'adobe', label: 'Adobe', aliases: ['mud brick', 'clay adobe'], category: 'clay' },
  
  // Concrete & Cement
  { id: 'concrete', label: 'Concrete', aliases: ['reinforced concrete', 'poured concrete', 'concrete structure'], category: 'concrete' },
  { id: 'cement', label: 'Cement', aliases: ['cement mortar'], category: 'concrete' },
  
  // Steel & Iron
  { id: 'steel', label: 'Steel', aliases: ['steel frame', 'steel structure', 'steel beams'], category: 'metal' },
  { id: 'iron', label: 'Iron', aliases: ['cast iron', 'wrought iron', 'iron frame'], category: 'metal' },
  { id: 'steel-glass', label: 'Steel & Glass', aliases: ['exposed steel framework and glass', 'steel and glass curtain'], category: 'metal' },
  
  // Wood
  { id: 'timber', label: 'Timber', aliases: ['wood', 'wooden structure', 'wooden frame'], category: 'wood' },
  { id: 'cedar', label: 'Cedar Wood', aliases: ['cedar', 'cedar wood'], category: 'wood' },
  { id: 'oak', label: 'Oak', aliases: ['oak wood'], category: 'wood' },
  { id: 'glulam', label: 'Glulam', aliases: ['glued laminated timber', 'glulam timber', 'glulam structure'], category: 'wood' },
  { id: 'plywood', label: 'Plywood', aliases: ['plywood panels'], category: 'wood' },
  
  // Glass
  { id: 'glass', label: 'Glass', aliases: ['glass panes', 'glass windows', 'stained glass'], category: 'glass' },
  { id: 'stained-glass', label: 'Stained Glass', aliases: ['stained glass windows'], category: 'glass' },
  
  // Composite & Mixed
  { id: 'stone-wood', label: 'Stone & Wood', aliases: ['stone and timber', 'stone and wood'], category: 'composite' },
  { id: 'stone-steel', label: 'Stone & Steel', aliases: ['stone and steel'], category: 'composite' },
  { id: 'mixed-materials', label: 'Mixed Materials', aliases: ['various materials', 'multiple materials'], category: 'composite' },
  
  // Other
  { id: 'plaster', label: 'Plaster', aliases: ['stucco', 'plaster finish', 'lime plaster'], category: 'finish' },
  { id: 'tiles', label: 'Tiles', aliases: ['ceramic tiles', 'tile cladding'], category: 'finish' },
];

// ============================================================================
// FUNCTION/TYPE VOCABULARY
// ============================================================================
export const FUNCTION_VOCABULARY: TagVocabulary[] = [
  // Religious
  { id: 'cathedral', label: 'Cathedral', aliases: ['cathedral/mosque', 'cathedral church'], category: 'religious' },
  { id: 'church', label: 'Church', aliases: ['chapel', 'parish church'], category: 'religious' },
  { id: 'mosque', label: 'Mosque', aliases: ['islamic mosque'], category: 'religious' },
  { id: 'temple', label: 'Temple', aliases: ['hindu temple', 'buddhist temple'], category: 'religious' },
  { id: 'synagogue', label: 'Synagogue', aliases: ['jewish synagogue'], category: 'religious' },
  { id: 'shrine', label: 'Shrine', aliases: ['sacred shrine'], category: 'religious' },
  
  // Civic & Government
  { id: 'civic-government', label: 'Civic/Government Center', aliases: ['civic government center', 'government building', 'town hall', 'city hall'], category: 'civic' },
  { id: 'parliament', label: 'Parliament', aliases: ['legislative building', 'parliament house'], category: 'civic' },
  { id: 'courthouse', label: 'Courthouse', aliases: ['court building', 'judicial building'], category: 'civic' },
  { id: 'library', label: 'Library', aliases: ['public library', 'national library'], category: 'civic' },
  { id: 'museum', label: 'Museum', aliases: ['art museum', 'museum building', 'art museum / exhibition hall'], category: 'civic' },
  { id: 'gallery', label: 'Gallery', aliases: ['art gallery', 'exhibition gallery'], category: 'civic' },
  
  // Residential
  { id: 'palace', label: 'Palace', aliases: ['royal palace', 'palatial residence'], category: 'residential' },
  { id: 'mansion', label: 'Mansion', aliases: ['large mansion', 'grand mansion'], category: 'residential' },
  { id: 'house', label: 'House', aliases: ['private house', 'residential house'], category: 'residential' },
  { id: 'villa', label: 'Villa', aliases: ['country villa', 'suburban villa'], category: 'residential' },
  { id: 'apartment-building', label: 'Apartment Building', aliases: ['residential apartment', 'apartment complex'], category: 'residential' },
  
  // Commercial & Office
  { id: 'bank', label: 'Bank', aliases: ['banking building', 'financial institution'], category: 'commercial' },
  { id: 'office-building', label: 'Office Building', aliases: ['office tower', 'commercial office'], category: 'commercial' },
  { id: 'skyscraper', label: 'Skyscraper', aliases: ['high-rise', 'tall building'], category: 'commercial' },
  { id: 'department-store', label: 'Department Store', aliases: ['retail store', 'shopping center'], category: 'commercial' },
  { id: 'market', label: 'Market', aliases: ['public market', 'marketplace'], category: 'commercial' },
  
  // Cultural & Entertainment
  { id: 'amphitheatre', label: 'Amphitheatre', aliases: ['amphitheater', 'ancient amphitheatre'], category: 'entertainment' },
  { id: 'theatre', label: 'Theatre', aliases: ['theater', 'performing arts theater', 'opera house'], category: 'entertainment' },
  { id: 'concert-hall', label: 'Concert Hall', aliases: ['music hall', 'concert venue'], category: 'entertainment' },
  { id: 'cinema', label: 'Cinema', aliases: ['movie theater', 'film hall'], category: 'entertainment' },
  
  // Industrial & Functional
  { id: 'factory', label: 'Factory', aliases: ['manufacturing plant', 'industrial factory'], category: 'industrial' },
  { id: 'warehouse', label: 'Warehouse', aliases: ['storage warehouse'], category: 'industrial' },
  { id: 'bridge', label: 'Bridge', aliases: ['viaduct', 'bridge structure'], category: 'industrial' },
  { id: 'tower', label: 'Tower', aliases: ['defensive tower', 'bell tower'], category: 'industrial' },
  { id: 'fortification', label: 'Fortification', aliases: ['fortress', 'fort', 'castle'], category: 'industrial' },
  { id: 'aqueduct', label: 'Aqueduct', aliases: ['water system', 'ancient aqueduct'], category: 'industrial' },
  
  // Educational
  { id: 'school', label: 'School', aliases: ['secondary school', 'educational building'], category: 'educational' },
  { id: 'university', label: 'University', aliases: ['college', 'university building'], category: 'educational' },
  { id: 'academy', label: 'Academy', aliases: ['academic building'], category: 'educational' },
  
  // Health & Hospitality
  { id: 'hospital', label: 'Hospital', aliases: ['medical building'], category: 'health' },
  { id: 'hotel', label: 'Hotel', aliases: ['hospitality building', 'inn'], category: 'health' },
  
  // Commemorative & Public
  { id: 'monument', label: 'Monument', aliases: ['commemorative monument', 'memorial'], category: 'public' },
  { id: 'tomb', label: 'Tomb', aliases: ['mausoleum', 'burial structure'], category: 'public' },
  { id: 'garden', label: 'Garden', aliases: ['public garden', 'botanical garden'], category: 'public' },
  { id: 'pavilion', label: 'Pavilion', aliases: ['exhibition pavilion'], category: 'public' },
];

// ============================================================================
// REGION VOCABULARY
// ============================================================================
export const REGION_VOCABULARY: TagVocabulary[] = [
  // Geographic regions
  { id: 'egypt-nile', label: 'Egypt/Nile', aliases: ['egypt', 'nile river', 'egypt/nile'], category: 'africa' },
  { id: 'middle-east', label: 'Middle East', aliases: ['mesopotamia', 'levant', 'persia'], category: 'asia' },
  { id: 'anatolia-balkans', label: 'Anatolia/Balkans/Levant', aliases: ['anatolia', 'turkey', 'balkans'], category: 'asia' },
  
  { id: 'greece', label: 'Ancient Greece', aliases: ['greece', 'greek', 'classical greece'], category: 'europe' },
  { id: 'rome', label: 'Ancient Rome', aliases: ['rome', 'roman', 'imperial rome'], category: 'europe' },
  
  { id: 'britain-us', label: 'Britain/US', aliases: ['british', 'american', 'british american'], category: 'atlantic' },
  { id: 'france-us-global', label: 'France/US/Global', aliases: ['french american', 'franco-american'], category: 'atlantic' },
  { id: 'europe-us', label: 'Europe/US', aliases: ['transatlantic', 'european american'], category: 'atlantic' },
  
  { id: 'germany-netherlands', label: 'Germany/Netherlands', aliases: ['german dutch', 'benelux'], category: 'europe' },
  { id: 'germany-us-global', label: 'Germany/US/Global', aliases: ['german american international'], category: 'atlantic' },
  
  { id: 'europe-latam', label: 'Europe/LatAm', aliases: ['european latin american', 'iberian american'], category: 'atlantic' },
  { id: 'europe-n-america', label: 'Europe/N. America', aliases: ['north american european'], category: 'atlantic' },
  
  { id: 'china-e-asia', label: 'China/E. Asia', aliases: ['china', 'east asia', 'japanese', 'korea', 'southeast asia'], category: 'asia' },
  { id: 'eastern-mediterranean', label: 'Eastern Mediterranean', aliases: ['mediterranean', 'byzantine'], category: 'mediterranean' },
  { id: 'sub-saharan-africa', label: 'Sub-Saharan Africa', aliases: ['african', 'africa'], category: 'africa' },
  
  // Modern nation/region groupings
  { id: 'scandinavia', label: 'Scandinavia', aliases: ['nordic', 'finnish', 'swedish'], category: 'europe' },
  { id: 'iberian', label: 'Iberian', aliases: ['spanish', 'portuguese', 'spain', 'portugal'], category: 'europe' },
  { id: 'italian', label: 'Italian', aliases: ['italy', 'italian'], category: 'europe' },
  { id: 'central-europe', label: 'Central Europe', aliases: ['austro-hungarian', 'czech', 'polish'], category: 'europe' },
  { id: 'russian', label: 'Russian', aliases: ['soviet', 'ussr', 'russian'], category: 'europe' },
  
  { id: 'americas', label: 'Americas', aliases: ['north america', 'south america', 'latin america', 'canadian'], category: 'atlantic' },
  { id: 'caribbean', label: 'Caribbean', aliases: ['west indies'], category: 'atlantic' },
  
  { id: 'india', label: 'India', aliases: ['indian', 'subcontinent'], category: 'asia' },
  { id: 'islamic-world', label: 'Islamic World', aliases: ['middle eastern', 'north african'], category: 'asia' },
  { id: 'japan', label: 'Japan', aliases: ['japanese'], category: 'asia' },
  { id: 'korea', label: 'Korea', aliases: ['korean'], category: 'asia' },
  
  // Grouped regions for broad categories
  { id: 'global', label: 'Global', aliases: ['international', 'worldwide', 'transnational'], category: 'meta' },
  { id: 'europe', label: 'Europe', aliases: ['european'], category: 'europe' },
  { id: 'asia', label: 'Asia', aliases: ['asian'], category: 'asia' },
  { id: 'africa', label: 'Africa', aliases: ['african'], category: 'africa' },
];

// ============================================================================
// NORMALIZATION FUNCTIONS
// ============================================================================

/**
 * Create a lookup map for fast tag normalization
 * Maps raw values (including aliases) to canonical vocabulary IDs
 */
function createNormalizationMap(vocab: TagVocabulary[]): Map<string, string> {
  const map = new Map<string, string>();
  
  vocab.forEach((tag) => {
    // Map the label itself
    const labelKey = tag.label.toLowerCase().replace(/[^\w\s]/g, '').trim();
    map.set(labelKey, tag.id);
    
    // Map all aliases
    tag.aliases.forEach((alias) => {
      const aliasKey = alias.toLowerCase().replace(/[^\w\s]/g, '').trim();
      map.set(aliasKey, tag.id);
    });
  });
  
  return map;
}

const MATERIALS_MAP = createNormalizationMap(MATERIALS_VOCABULARY);
const FUNCTION_MAP = createNormalizationMap(FUNCTION_VOCABULARY);
const REGION_MAP = createNormalizationMap(REGION_VOCABULARY);

/**
 * Normalize a raw value to a vocabulary term ID
 * Returns null if no match found
 */
function normalizeValue(value: string, map: Map<string, string>): string | null {
  if (!value || typeof value !== 'string') return null;
  
  const normalized = value.toLowerCase().replace(/[^\w\s]/g, '').trim();
  return map.get(normalized) || null;
}

/**
 * Normalize a list of raw values (from comma-separated or array)
 * Returns array of vocabulary IDs, filters out unmapped values
 */
function normalizeList(values: string[], map: Map<string, string>): string[] {
  return values
    .map((v) => normalizeValue(v, map))
    .filter((v): v is string => v !== null);
}

/**
 * Get the canonical label for a vocabulary ID
 */
function getLabel(id: string, vocab: TagVocabulary[]): string | null {
  const term = vocab.find((t) => t.id === id);
  return term?.label || null;
}

// ============================================================================
// PUBLIC API
// ============================================================================

export const TagNormalizer = {
  /**
   * Normalize materials from raw sheet values to vocabulary IDs
   */
  normalizeMaterials(values: string[]): string[] {
    return normalizeList(values, MATERIALS_MAP);
  },

  /**
   * Normalize function/type from raw sheet values to vocabulary IDs
   */
  normalizeFunctions(values: string[]): string[] {
    return normalizeList(values, FUNCTION_MAP);
  },

  /**
   * Normalize regions from raw sheet values to vocabulary IDs
   */
  normalizeRegions(values: string[]): string[] {
    return normalizeList(values, REGION_MAP);
  },

  /**
   * Get canonical label for a material ID
   */
  getMaterialLabel(id: string): string | null {
    return getLabel(id, MATERIALS_VOCABULARY);
  },

  /**
   * Get canonical label for a function ID
   */
  getFunctionLabel(id: string): string | null {
    return getLabel(id, FUNCTION_VOCABULARY);
  },

  /**
   * Get canonical label for a region ID
   */
  getRegionLabel(id: string): string | null {
    return getLabel(id, REGION_VOCABULARY);
  },

  /**
   * Get all vocabulary terms for a category
   */
  getMaterialsVocab(): TagVocabulary[] {
    return MATERIALS_VOCABULARY;
  },

  getFunctionsVocab(): TagVocabulary[] {
    return FUNCTION_VOCABULARY;
  },

  getRegionsVocab(): TagVocabulary[] {
    return REGION_VOCABULARY;
  },
};

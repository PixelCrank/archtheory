import { MacroMovement, ChildMovement, TimelineBuilding, TimelineFigure } from './timelineData';
import { IdGenerator } from './idGenerator';
import { TagNormalizer } from './tagNormalization';

const cleanString = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const splitList = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((entry) => cleanString(entry))
      .filter((entry) => entry.length > 0);
  }
  return cleanString(value)
    .split(/[,;•\n]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};

const pickFirst = (row: Record<string, unknown>, candidates: string[]): string => {
  for (const key of candidates) {
    if (row && row[key] !== undefined && row[key] !== null) {
      const value = cleanString(row[key]);
      if (value) return value;
    }
  }
  return '';
};

const pickMovementRef = (row: Record<string, unknown>): string =>
  pickFirst(row, [
    'Movement ID',
    'Linked Sub-Movement (must match Movements sheet)',
    'Linked Sub-Movement',
    'Sub-Movement',
    'Movement',
  ]);

const pickMacroParent = (row: Record<string, unknown>): string =>
  pickFirst(row, ['Macro Parent', 'Macro Parent (choose)', 'Macro']);

const parseYear = (value: unknown): number | undefined => {
  const cleaned = cleanString(value);
  if (!cleaned) return undefined;
  const numeric = Number(cleaned);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const lower = (value: string): string => cleanString(value).toLowerCase();

const normalizeMovementLabel = (value: string): string =>
  lower(value).replace(/[()]/g, '').replace(/\s+/g, ' ').trim();

const movementAliases: Record<string, string> = {
  'bauhaus': 'bauhaus / international',
  'classical roman': 'ancient roman',
  'early renaissance': 'renaissance',
  'french renaissance': 'renaissance',
  'english baroque': 'baroque',
  'post modernism': 'postmodernism',
  'parametricism': 'parametric / digital',
  'modernist': 'bauhaus / international',
  'modernism': 'bauhaus / international',
  'early modernism': 'bauhaus / international',
  'early modern': 'bauhaus / international',
  'international style': 'bauhaus / international',
  'japonismus': 'art nouveau',
  'art deco': 'bauhaus / international',
  'late modern': 'bauhaus / international',
  'tropical modernism': 'organic architecture',
  'organic modernism': 'organic architecture',
  'prairie school': 'arts & crafts',
  'mission revival': 'arts & crafts',
  'contemporary architecture': 'contemporary vernacular / social',
  'contemporary vernacular': 'contemporary vernacular / social',
  'contemporary cultural modernism': 'contemporary vernacular / social',
  'sustainable hybrid architecture': 'sustainable / decarbonization',
  'biophilic architecture': 'sustainable / decarbonization',
  'contemporary parametric architecture': 'parametric / digital',
  'parametric expressionism': 'parametric / digital',
  'geometric light architecture': 'parametric / digital',
  'high-tech architecture': 'high-tech',
};

const buildTimelineBuilding = (
  row: Record<string, unknown>,
  movementId: string,
  index: number
): TimelineBuilding => {
  const name = pickFirst(row, ['Building Name', 'Name']);
  const city = pickFirst(row, ['City']);
  const country = pickFirst(row, ['Country']);
  const location = [city, country].filter(Boolean).join(', ');

  // Normalize materials and functions
  const materialsText = pickFirst(row, ['Materials & Techniques', 'Materials']);
  const materialsRaw = splitList(materialsText);
  const materialIds = TagNormalizer.normalizeMaterials(materialsRaw);

  const functionTypeText = pickFirst(row, ['Function / Type', 'Function Type', 'Type']);
  const functionTypesRaw = splitList(functionTypeText);
  const functionIds = TagNormalizer.normalizeFunctions(functionTypesRaw);

  const latRaw = pickFirst(row, ['Latitude']);
  const lngRaw = pickFirst(row, ['Longitude']);
  const lat = latRaw ? parseFloat(latRaw) : undefined;
  const lng = lngRaw ? parseFloat(lngRaw) : undefined;

  return {
    id: IdGenerator.building(name, movementId, index),
    name,
    type: 'work',
    movementId,
    description: pickFirst(row, ['Description']),
    extendedDescription: pickFirst(row, ['Description (extended)', 'Description (Extended)', 'Description.1']),
    imageUrl: pickFirst(row, ['Image URL', 'ImageUrl']),
    city,
    country,
    location,
    lat: lat !== undefined && !isNaN(lat) ? lat : undefined,
    lng: lng !== undefined && !isNaN(lng) ? lng : undefined,
    yearsBuilt: pickFirst(row, ['Year(s) Built', 'Years Built', 'Year Built']),
    architects: pickFirst(row, ['Architect(s)', 'Architect']),
    patron: pickFirst(row, ['Patron / Commissioner', 'Patron', 'Commissioner']),
    functionType: functionTypeText,
    functionIds,
    functionTags: functionIds, // Alias for compatibility
    uniqueFeaturesText: pickFirst(row, ['Unique or Salient Features ', 'Unique or Salient Features', 'Unique Features']),
    uniqueFeatures: splitList(pickFirst(row, ['Unique or Salient Features ', 'Unique or Salient Features', 'Unique Features'])),
    materialsText,
    materials: materialsRaw,
    materialIds,
    symbolismText: pickFirst(row, ['Symbolism / Message', 'Symbolism', 'Message']),
    symbolism: splitList(pickFirst(row, ['Symbolism / Message', 'Symbolism', 'Message'])),
    currentStatus: pickFirst(row, ['Current Status', 'Status']),
    sources: pickFirst(row, ['Sources', 'Sources / References', 'References']),
    contributorName: pickFirst(row, ['You Name', 'Your Name', 'Contributor Name']),
    raw: row,
  };
};

const buildTimelineFigure = (
  row: Record<string, unknown>,
  movementId: string,
  index: number
): TimelineFigure => ({
  id: IdGenerator.figure(pickFirst(row, ['Architect', 'Name']), movementId, index),
  name: pickFirst(row, ['Architect', 'Name']),
  type: 'figure',
  movementId,
  description: pickFirst(row, ['Description', 'Philosophy / Design Approach']),
  imageUrl: pickFirst(row, ['Image URL', 'ImageUrl']),
  lifeDates: pickFirst(row, ['Life Dates', 'Dates']),
  nationality: pickFirst(row, ['Nationality / Region', 'Nationality', 'Region']),
  education: pickFirst(row, ['Education / Training', 'Education', 'Training']),
  philosophy: pickFirst(row, ['Philosophy / Design Approach', 'Philosophy', 'Design Approach']),
  aesthetics: pickFirst(row, ['Key Aesthetics or Forms', 'Key aesthetics or forms', 'Aesthetics', 'Key Aesthetics']),
  anecdotes: pickFirst(row, ['Personal Story or Anecdotes', 'Interesting Personal story or Anecdotes', 'Anecdotes', 'Personal Story']),
  majorWorks: splitList(pickFirst(row, ['Major Works', 'Major Works (comma-separated)', 'Works'])),
  keyWritings: splitList(pickFirst(row, ['Key Writings', 'Key Writings (comma-separated)', 'Writings'])),
  influence: pickFirst(row, ['Influence / Legacy', 'Influence', 'Legacy']),
  sources: pickFirst(row, ['Sources', 'Sources / References', 'References']),
  notes: pickFirst(row, ['Notes']),
  contributorName: pickFirst(row, ['Your Name', 'You Name', 'Contributor Name']),
  raw: row,
});

// Converts Google Sheets API data to the app's timeline data structure
export function convertSheetsToTimelineFormat(
  sheetData: Record<string, Record<string, string>[]>
): { macros: MacroMovement[]; children: ChildMovement[] } {
  if (!sheetData || !sheetData.Macros || !sheetData.Movements) {
    return { macros: [], children: [] };
  }

  const movementRows: Record<string, unknown>[] = sheetData.Movements || [];
  const buildingRows: Record<string, unknown>[] = sheetData.Buildings || [];
  const figureRows: Record<string, unknown>[] = sheetData.Figures || [];
  const movementNames = movementRows
    .map((movement) => pickFirst(movement, ['Sub-Movement', 'Movement Name', 'Movement']))
    .filter(Boolean);
  const movementIdLookup = new Map<string, string>();
  movementRows.forEach((movement, movementIndex) => {
    const movementName = pickFirst(movement, ['Sub-Movement', 'Movement Name', 'Movement']);
    const movementId = pickFirst(movement, ['ID', 'Movement ID']) || IdGenerator.movement(movementName, undefined, movementIndex);
    if (movementName) {
      movementIdLookup.set(normalizeMovementLabel(movementName), movementId);
    }
    const movementIdValue = pickFirst(movement, ['ID', 'Movement ID']);
    if (movementIdValue) {
      movementIdLookup.set(lower(movementIdValue), movementId);
    }
  });
  const resolveMovementName = (value: unknown): string | undefined => {
    const normalized = normalizeMovementLabel(cleanString(value));
    if (!normalized || normalized === '?') return undefined;
    const alias = movementAliases[normalized];
    if (alias && movementNames.some((name) => normalizeMovementLabel(name) === alias)) return alias;
    const exact = movementNames.find((name) => normalizeMovementLabel(name) === normalized);
    if (exact) return normalizeMovementLabel(exact);
    const contained = movementNames
      .filter((name) => normalized.includes(normalizeMovementLabel(name)))
      .sort((a, b) => b.length - a.length)[0];
    if (contained) return normalizeMovementLabel(contained);
    const aliasContained = Object.entries(movementAliases)
      .find(([label, target]) => normalized.includes(label) && movementNames.some((name) => normalizeMovementLabel(name) === target));
    return aliasContained?.[1];
  };
  const rowMatchesMovement = (row: Record<string, unknown>, movementKey: string, movementId: string): boolean => {
    const movementIdValue = pickFirst(row, ['Movement ID']);
    if (movementIdValue && movementIdLookup.get(lower(movementIdValue)) === movementId) {
      return true;
    }
    const movementLabel = pickFirst(row, ['Sub-Movement', 'Linked Sub-Movement (must match Movements sheet)', 'Linked Sub-Movement']);
    return movementLabel ? resolveMovementName(movementLabel) === movementKey : false;
  };

  // ========================================================================
  // PHASE 1: Build Child Movements with their Buildings and Figures
  // ========================================================================
  
  const childMovements: ChildMovement[] = movementRows.map((movement, movementIndex) => {
    const movementName = pickFirst(movement, ['Sub-Movement', 'Movement Name', 'Movement']);
    const movementKey = normalizeMovementLabel(movementName);
    const macroParentName = pickMacroParent(movement);

    // Generate stable movement ID
    const movementId = pickFirst(movement, ['ID', 'Movement ID']) || IdGenerator.movement(movementName, undefined, movementIndex);

    // Find buildings linked to this movement
    const works: TimelineBuilding[] = buildingRows
      .filter((building) => rowMatchesMovement(building, movementKey, movementId))
      .map((building, buildingIndex) =>
        buildTimelineBuilding(building, movementId, buildingIndex)
      );

    // Find figures linked to this movement
    const figures: TimelineFigure[] = figureRows
      .filter((figure) => rowMatchesMovement(figure, movementKey, movementId))
      .map((figure, figureIndex) =>
        buildTimelineFigure(figure, movementId, figureIndex)
      );

    // Normalize region tags
    const regionText = pickFirst(movement, ['Geography / Regions', 'Region']);
    const regionRaw = splitList(regionText);
    const regionIds = TagNormalizer.normalizeRegions(regionRaw);

    const startYear = parseYear(pickFirst(movement, ['Start Year', 'Start']));
    const endYear = parseYear(pickFirst(movement, ['End Year', 'End']));
    const startYearLabel = pickFirst(movement, ['Start Year', 'Start']);
    const endYearLabel = pickFirst(movement, ['End Year', 'End']);
    const yearsLabel = [startYearLabel || (startYear !== undefined ? String(startYear) : ''), endYearLabel || (endYear !== undefined ? String(endYear) : '')]
      .filter(Boolean)
      .join(' – ');

    // Parse key figures and works as arrays of names (to be resolved to IDs later)
    const keyFiguresList = splitList(pickFirst(movement, ['Key Figures', 'Key Figures (comma-separated)']));
    const canonicalWorks = splitList(pickFirst(movement, ['Canonical Works', 'Canonical Works (comma-separated)']));
    const keyTexts = splitList(pickFirst(movement, ['Key Texts / Theory', 'Key Texts', 'Key texts']));

    return {
      id: movementId,
      name: movementName,
      parent: macroParentName, // For backward compatibility
      parentMacroId: undefined, // Will be set in Phase 2
      overview: pickFirst(movement, ['Description']),
      description: pickFirst(movement, ['Hallmark Traits', 'Description']),
      start: startYear,
      end: endYear,
      startYearLabel: startYearLabel || undefined,
      endYearLabel: endYearLabel || undefined,
      yearsLabel: yearsLabel || undefined,
      region: regionText,
      regionIds,
      geography: pickFirst(movement, ['Geography / Regions', 'Region']),
      socialPoliticalContext: pickFirst(movement, ['Social / Political Context']),
      philosophicalIdeas: pickFirst(movement, ['Philosophical Ideas']),
      hallmarkTraits: splitList(pickFirst(movement, ['Hallmark Traits', 'Traits'])),
      keyTexts,
      canonicalWorks,
      keyFiguresList,
      notes: pickFirst(movement, ['Notes / Sources', 'Notes', 'Sources']),
      imageUrl: pickFirst(movement, ['Image URL', 'ImageUrl']),
      localImagePath: pickFirst(movement, ['Image File (local path)', 'Local Image Path']),
      works,
      figures,
    };
  });

  // ========================================================================
  // PHASE 2: Build Macros and wire up parent relationships
  // ========================================================================
  
  const macros: MacroMovement[] = (sheetData.Macros || []).map((macro: Record<string, unknown>, macroIndex: number) => {
    const name = pickFirst(macro, ['Name', 'Macro Name', 'Macro']) || `Macro ${macroIndex + 1}`;
    const slug = pickFirst(macro, ['Slug', 'slug']);

    // Generate stable macro ID
    const macroId = pickFirst(macro, ['ID', 'Macro ID']) || IdGenerator.macro(name, macroIndex);

    // Find child movement IDs
    const childIds = childMovements
      .filter((movement) => movement.parent && movement.parent.toLowerCase() === name.toLowerCase())
      .map((movement) => {
        // Update the movement's parent macro ID
        movement.parentMacroId = macroId;
        return movement.id;
      });

    return {
      id: macroId,
      slug: slug || undefined,
      name,
      description: pickFirst(macro, ['Description']),
      start: parseYear(pickFirst(macro, ['Start Year', 'Start'])),
      end: parseYear(pickFirst(macro, ['End Year', 'End'])),
      macroNamesList: splitList(pickFirst(macro, ['MacroNames_List', 'Macro Names', 'Macro Name'])),
      colorClass: pickFirst(macro, ['colorClass', 'Color Class']),
      imageUrl: pickFirst(macro, ['Image URL', 'imageUrl', 'ImageUrl']),
      children: childIds,
    };
  });

  // A building is unassigned only when NEITHER the ID check NOR the label check
  // succeeds — mirroring the exact two-step logic in rowMatchesMovement.
  // Without this, buildings matched by Movement ID would also appear here because
  // resolveMovementName() understands names, not raw IDs.
  const unassignedBuildings = buildingRows.filter((building) => {
    // Step 1: Movement ID match (same as rowMatchesMovement's ID path)
    const movementIdField = pickFirst(building, ['Movement ID']);
    if (movementIdField && movementIdLookup.has(lower(movementIdField))) return false;

    // Step 2: Label match (same as rowMatchesMovement's label path)
    const movementLabel = pickFirst(building, [
      'Linked Sub-Movement (must match Movements sheet)',
      'Linked Sub-Movement',
      'Sub-Movement',
      'Movement',
    ]);
    return !movementLabel || !resolveMovementName(movementLabel);
  });
  if (unassignedBuildings.length > 0) {
    const fallbackMacroId = IdGenerator.macro('Unclassified works', macros.length);
    const fallbackMovementId = IdGenerator.movement('Unclassified works', fallbackMacroId, childMovements.length);
    const fallbackWorks = unassignedBuildings.map((building, index) =>
      buildTimelineBuilding(building, fallbackMovementId, index)
    );
    childMovements.push({
      id: fallbackMovementId,
      name: 'Unclassified works',
      parent: 'Unclassified works',
      parentMacroId: fallbackMacroId,
      overview: 'Works whose source movement label needs classification.',
      start: -3000,
      end: 2025,
      works: fallbackWorks,
      figures: [],
    });
    macros.push({
      id: fallbackMacroId,
      name: 'Unclassified works',
      description: 'Source entries retained while their movement classification is reviewed.',
      start: -3000,
      end: 2025,
      children: [fallbackMovementId],
    });
  }

  // ========================================================================
  // PHASE 3: Build lookup tables and resolve name-based relationships to IDs
  // ========================================================================
  
  // Create lookup maps for name → ID resolution
  const buildingNameToId = new Map<string, string>();
  const figureNameToId = new Map<string, string>();
  
  childMovements.forEach((movement) => {
    movement.works?.forEach((work) => {
      buildingNameToId.set(lower(work.name), work.id);
    });
    movement.figures?.forEach((figure) => {
      figureNameToId.set(lower(figure.name), figure.id);
    });
  });

  // Resolve canonical works to building IDs
  childMovements.forEach((movement) => {
    if (movement.canonicalWorks && movement.canonicalWorks.length > 0) {
      movement.canonicalWorkIds = movement.canonicalWorks
        .map((workName) => buildingNameToId.get(lower(workName)))
        .filter((id): id is string => id !== undefined);
    }

    // Resolve key figures to figure IDs
    if (movement.keyFiguresList && movement.keyFiguresList.length > 0) {
      movement.keyFigureIds = movement.keyFiguresList
        .map((figureName) => figureNameToId.get(lower(figureName)))
        .filter((id): id is string => id !== undefined);
    }
  });

  // Resolve major works (on figures) to building IDs
  childMovements.forEach((movement) => {
    movement.figures?.forEach((figure) => {
      if (figure.majorWorks && figure.majorWorks.length > 0) {
        figure.majorWorkIds = figure.majorWorks
          .map((workName) => buildingNameToId.get(lower(workName)))
          .filter((id): id is string => id !== undefined);
      }
    });
  });

  return { macros, children: childMovements };
}

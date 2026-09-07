
// Timeline data types for the Google Sheets driven architecture timeline

export interface TimelineBuilding {
  id: string;
  name: string;
  type: 'work';
  movementId?: string; // Foreign key to Movement
  description?: string;
  extendedDescription?: string;
  imageUrl?: string;
  city?: string;
  country?: string;
  location?: string;
  lat?: number;
  lng?: number;
  yearsBuilt?: string;
  architects?: string;
  patron?: string;
  functionType?: string; // Raw value from sheet
  functionTags?: string[]; // Normalized vocabulary IDs
  functionIds?: string[]; // Normalized material vocabulary IDs (alias for functionTags)
  uniqueFeaturesText?: string;
  uniqueFeatures?: string[];
  materialsText?: string;
  materials?: string[]; // Raw values from sheet
  materialIds?: string[]; // Normalized material vocabulary IDs
  regionIds?: string[]; // Normalized region vocabulary IDs
  symbolismText?: string;
  symbolism?: string[];
  currentStatus?: string;
  sources?: string;
  contributorName?: string; // Student/contributor name
  submittedAt?: string; // ISO timestamp
  raw?: Record<string, unknown>;
}

export interface TimelineFigure {
  id: string;
  name: string;
  type: 'figure';
  movementId?: string; // Foreign key to Movement
  description?: string;
  imageUrl?: string;
  lifeDates?: string;
  nationality?: string;
  education?: string;
  philosophy?: string;
  aesthetics?: string;
  anecdotes?: string;
  majorWorks?: string[]; // Building IDs once relationships are resolved
  majorWorkIds?: string[]; // Resolved building IDs
  keyWritings?: string[]; // Text titles
  keyWritingIds?: string[]; // Resolved text entity IDs (future)
  influence?: string;
  sources?: string;
  notes?: string;
  contributorName?: string;
  submittedAt?: string;
  raw?: Record<string, unknown>;
}

export interface ChildMovement {
  id: string;
  name: string;
  parent?: string; // Backward compatibility: parent macro name
  parentMacroId?: string; // New: Foreign key to MacroMovement
  overview?: string;
  description?: string;
  start?: number;
  end?: number;
  startYearLabel?: string;
  endYearLabel?: string;
  yearsLabel?: string;
  region?: string;
  regionIds?: string[]; // Normalized region vocabulary IDs
  geography?: string;
  socialPoliticalContext?: string;
  philosophicalIdeas?: string;
  hallmarkTraits?: string[];
  keyTexts?: string[]; // Text titles
  keyTextIds?: string[]; // Resolved text entity IDs (future)
  canonicalWorks?: string[]; // Building names
  canonicalWorkIds?: string[]; // Resolved building IDs
  keyFiguresList?: string[]; // Figure names
  keyFigureIds?: string[]; // Resolved figure IDs
  notes?: string;
  imageUrl?: string;
  localImagePath?: string;
  works?: TimelineBuilding[]; // Related buildings
  figures?: TimelineFigure[]; // Related figures
}

export interface MacroMovement {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  start?: number;
  end?: number;
  macroNamesList?: string[];
  colorClass?: string;
  children?: string[]; // Array of Movement IDs
  imageUrl?: string;
}

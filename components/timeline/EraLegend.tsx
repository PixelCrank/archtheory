"use client";
import { ERA_COLORS } from "./palettes";
import type { MacroMovement } from "@/lib/timelineData";

function formatStartYear(start?: number): string {
  if (start === undefined) return "";
  return start < 0 ? `${Math.abs(start)} BCE` : String(start);
}

export function EraLegend({
  macros,
  selectedId,
  onSelect,
}: {
  macros: MacroMovement[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  const sorted = [...macros]
    .filter((m) => m.name !== "Unclassified works")
    .sort((a, b) => (a.start ?? 0) - (b.start ?? 0));

  return (
    <div className="era-legend" role="group" aria-label="Filter by era">
      {sorted.map((macro, i) => {
        const color = ERA_COLORS[i % ERA_COLORS.length];
        const isSelected = selectedId === macro.id;
        const year = formatStartYear(macro.start);
        return (
          <button
            key={macro.id}
            type="button"
            className={`era-legend-item${isSelected ? " era-legend-item--active" : ""}`}
            style={{ "--era-color": color } as React.CSSProperties}
            onClick={() => onSelect?.(isSelected ? "" : macro.id)}
            aria-pressed={isSelected}
            aria-label={`${isSelected ? "Clear" : "Filter by"} ${macro.name} era${year ? `, from ${year}` : ""}`}
          >
            <span className="era-legend-dot" aria-hidden="true" style={{ background: color }} />
            <span className="era-legend-name">{macro.name}</span>
            {year && <span className="era-legend-year" aria-hidden="true">{year}</span>}
          </button>
        );
      })}
    </div>
  );
}

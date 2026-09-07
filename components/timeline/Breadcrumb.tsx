"use client";

import { ChevronRight } from "lucide-react";
import { useSharedFilters } from "@/hooks/useSharedFilters";
import type { ChildMovement, MacroMovement } from "@/lib/timelineData";

export function Breadcrumb({
  macros,
  movements,
}: {
  macros: MacroMovement[];
  movements: ChildMovement[];
}) {
  const { filters, setFilters } = useSharedFilters();

  const selectedMacro = macros.find((m) => m.id === filters.eraId);
  const selectedMovement = movements.find((m) => m.id === filters.movementId);

  if (!selectedMacro && !selectedMovement) return null;

  return (
    <nav className="filter-breadcrumb" aria-label="Current filter path">
      <button
        type="button"
        onClick={() => setFilters({ eraId: "", movementId: "", selectedId: "" })}
        aria-label="Clear all filters — show all eras"
      >
        All eras
      </button>

      {selectedMacro && (
        <>
          <ChevronRight size={12} aria-hidden="true" className="filter-breadcrumb-sep" />
          <button
            type="button"
            onClick={() => setFilters({ movementId: "", selectedId: "" })}
            aria-label={`Filter by ${selectedMacro.name} — click to clear movement filter`}
            aria-current={!selectedMovement ? "true" : undefined}
          >
            {selectedMacro.name}
          </button>
        </>
      )}

      {selectedMovement && (
        <>
          <ChevronRight size={12} aria-hidden="true" className="filter-breadcrumb-sep" />
          <span aria-current="true">{selectedMovement.name}</span>
        </>
      )}
    </nav>
  );
}
